const mongoose = require("mongoose");

// Load database models
const User = require("../../../database/models/User");
const CryptoTransaction = require("../../../database/models/CryptoTransaction");
const Report = require("../../../database/models/Report");
const DepositTicket = require("../../../database/models/Ticket");

// Load utils
const { socketRemoveAntiSpam } = require("../../../utils/socket");

const {
  adminCheckGetCashierListData,
  adminCheckSendCashierCryptoActionTransaction,
  adminCheckSendCashierCryptoActionDataByOxapay,
} = require("../../../utils/admin/cashier");
const { createNotification } = require("../../notifications");

// Admin cashier variables
let adminCashierBlockCrypto = [];

const adminGetCashierListSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    adminCheckGetCashierListData(data);

    const [cryptoTransactionsCount, cryptoTransactions] = await Promise.all([
      CryptoTransaction.countDocuments({ type: "withdraw", state: "pending" }),
      CryptoTransaction.find({ type: "withdraw", state: "pending" })
        .sort({ createdAt: 1 })
        .limit(data.page * 12)
        .select("amount data type user state")
        .populate({
          path: "user",
          select: "username avatar rank",
        })
        .lean(),
    ]);

    // Get total transaction count
    const count = cryptoTransactionsCount;

    // Format transactions
    let transactions = [
      ...cryptoTransactions.map((transaction) => ({
        ...transaction,
        method: "crypto",
      })),
    ];

    // Sort transactions by date
    transactions.sort((a, b) => {
      return b.amount - a.amount;
    });

    // Short transactions array to 12 elements
    const offset = (data.page - 1) * 12;
    const limit = data.page * 12;
    transactions = transactions.slice(offset, limit);

    callback({ success: true, count: count, transactions: transactions });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const adminSendCashierMmoActionSocket = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  let session = null;

  try {
    const ticket = await DepositTicket.findById(data.ticketId).lean();

    try {
      const transactionType = ticket.transactionType;
      const tokenAmount = 0;

      if (data.action === "approve") {
        session = await mongoose.startSession();
        session.startTransaction();

        await DepositTicket.findByIdAndUpdate(ticket._id, {
          approvedBy: user._id.toString(),
          state: "approved",
        }).lean();
        await Report.findOneAndUpdate(
          { createdAt: new Date().toISOString().slice(0, 10) },
          {
            $inc: {
              [`stats.total.${transactionType}`]: tokenAmount,
              [`stats.mmo.${transactionType}`]: tokenAmount,
            },
          },
          { upsert: true },
        );

        let updatedUser = await User.findByIdAndUpdate(
          ticket.userId,
          {
            $inc: {
              balance: (transactionType === "deposit" ? 1 : -1) * tokenAmount,
              [`stats.total.${transactionType}`]: tokenAmount,
              [`stats.mmo.${transactionType}`]: tokenAmount,
            },
          },
          { new: true },
        );

        io.of("/general")
          .to(updatedUser._id.toString())
          .emit("user", { user: updatedUser });

        await session.commitTransaction();
        await session.endSession();
      } else if (data.action === "cancel") {
        await DepositTicket.findByIdAndUpdate(ticket._id, {
          state: "canceled",
        });
      }

      callback({ success: true });
      socketRemoveAntiSpam(user._id);
    } catch (err) {
      if (session) {
        await session.abortTransaction();
      }
      socketRemoveAntiSpam(socket.decoded._id);
      adminCashierBlockCrypto.splice(
        adminCashierBlockCrypto.indexOf(ticket._id.toString()),
        1,
      );
      callback({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  } catch (err) {
    socketRemoveAntiSpam(user._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const adminAproveWithdrawCryptoByOxapay = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  try {
    adminCheckSendCashierCryptoActionDataByOxapay(data);

    const transactionDatabase = await CryptoTransaction.findById(
      data.transactionId,
    )
      .select("amount data type user state")
      .populate({ path: "user", select: "rank _id" })
      .lean();

    adminCheckSendCashierCryptoActionTransaction(
      transactionDatabase,
      adminCashierBlockCrypto,
    );

    try {
      adminCashierBlockCrypto.push(transactionDatabase._id.toString());

      let promises = [];

      const APP_URL = process.env.APP_URL;

      if (!APP_URL) {
        throw new Error("APP_URL not set");
      }

      if (data.action === "approve") {
        const body = {
          key: process.env.OXAPAY_PAYOUT_API_KEY,
          address: transactionDatabase.data.receiver,
          amount: transactionDatabase.data.cryptoAmount.toFixed(8),
          currency: transactionDatabase.data.currency.toUpperCase(),
          // network,
          callbackUrl: `${APP_URL}/api/callback/oxapay-withdraw`,
        };

        let payoutResponse = await fetch(`https://api.oxapay.com/api/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: JSON.stringify(body),
        });

        console.log(body);

        payoutResponse = await payoutResponse.json();

        console.log(payoutResponse);

        if (payoutResponse.result === 100) {
          await CryptoTransaction.findByIdAndUpdate(
            transactionDatabase._id,
            {
              state: "approved",
            },
            { new: true },
          );

          const amountDSL = transactionDatabase.amount || 0;

          if (transactionDatabase.user?.rank !== "admin") {
            await Report.findOneAndUpdate(
              { createdAt: new Date().toISOString().slice(0, 10) },
              {
                $inc: {
                  "stats.total.withdraw": amountDSL,
                  "stats.crypto.withdraw": amountDSL,
                },
              },
              { upsert: true },
            ).exec();
          }

          await createNotification(
            transactionDatabase.user?._id?.toString(),
            `You have withdrawn ${transactionDatabase.data.cryptoAmount} ${transactionDatabase.data.currency.toUpperCase()}`,
            io,
            "withdraw",
          );
          callback({ success: true, transaction: transactionDatabase });
        } else {
          callback({
            success: false,
            error: { type: "error", message: payoutResponse.message },
          });
        }
      } else {
        // Add update crypto transaction and user query to promises array
        promises = [
          CryptoTransaction.findByIdAndUpdate(
            transactionDatabase._id,
            {
              state: "canceled",
            },
            { new: true },
          )
            .select("state")
            .lean(),
          User.findByIdAndUpdate(
            transactionDatabase.user._id,
            {
              $inc: {
                balance: transactionDatabase.amount,
                "stats.withdraw": -transactionDatabase.amount,
              },
            },
            { new: true },
          )
            .select("balance xp stats rakeback mute ban verifiedAt updatedAt")
            .lean(),
        ];

        // Execute promises array queries
        const dataDatabase = await Promise.all(promises);

        // Send updated user to frontend
        io.of("/general")
          .to(dataDatabase[1]._id.toString())
          .emit("user", { user: dataDatabase[1] });

        await createNotification(
          dataDatabase[1]._id,
          `Withdrawal has failed`,
          io,
          "withdraw",
        );

        callback({ success: true, transaction: dataDatabase[0] });
      }
      adminCashierBlockCrypto.splice(
        adminCashierBlockCrypto.indexOf(transactionDatabase._id.toString()),
        1,
      );
    } catch (err) {
      adminCashierBlockCrypto.splice(
        adminCashierBlockCrypto.indexOf(transactionDatabase._id.toString()),
        1,
      );
      callback({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

module.exports = {
  adminGetCashierListSocket,
  adminAproveWithdrawCryptoByOxapay,
  adminSendCashierMmoActionSocket,
};
