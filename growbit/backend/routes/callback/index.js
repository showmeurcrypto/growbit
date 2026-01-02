const express = require("express");
const router = express.Router();

// Load database models
const User = require("../../database/models/User");
const CryptoAddress = require("../../database/models/CryptoAddress");
const CryptoTransaction = require("../../database/models/CryptoTransaction");
const Report = require("../../database/models/Report");

// Load middleware
const { rateLimiterMiddleware } = require("../../middleware/rateLimiter");

// Load utils
const {
  validateDepositCallback,
  callbackCheckTransaction,
} = require("../../utils/callback");
const { createNotification } = require("../../services/notifications");
const {
  dollarToToken,
} = require("../../services/cashier/exchange_rates_service");

const { processTransaction } = require("../../services/slots/spinac");
const { logger } = require("../../utils/logger");
const CryptoJS = require("crypto-js");

const {
  // socketCheckAntiSpam,
  socketRemoveAntiSpam,
} = require("../../utils/socket");

// Callback variables
let callbackBlockTransactionCrypto = [];
let adminCashierBlockPayoutCrypto = [];

module.exports = (io) => {
  router.post("/oxapay-deposit", rateLimiterMiddleware, async (req, res) => {
    try {
      // Validate sent data
      //console.log("oxapay deposit");
      //console.log(req.headers);
      //console.log(req.body);
      logger.info("oxapay deposit callback :", req.headers, req.body);
      validateDepositCallback(req);

      const transactionId = req.body.track_id;
      const currency = req.body.currency;
      const cryptoAmount = req.body.txs?.[0]?.received_amount;
      const txhash = req.body.txs?.[0]?.tx_hash;
      const address = req.body.txs?.[0]?.address;
      //const senderAddress = req.body.txs?.[0]?.sender_address;
      const amountDollar = req.body.txs?.[0]?.value;
      callbackCheckTransaction(txhash, callbackBlockTransactionCrypto);

      try {
        // Add transactions id to crypto block array
        callbackBlockTransactionCrypto.push(txhash.toString());

        // Get crypto address and crypto transaction from database
        const [cryptoAddress, transaction] = await Promise.all([
          CryptoAddress.findOne({ name: currency, address: address })
            .select("address user")
            .populate({ path: "user", select: "rank" })
            .lean(),
          CryptoTransaction.findOne({ "data.providerId": txhash })
            .select("amount data type user state")
            .lean(),
        ]);

        console.log(cryptoAddress);
        console.log(transaction);
        console.log(req.body.type);
        console.log(req.body.status);

        if (
          req.body.type === "static_address" &&
          req.body.status?.toLowerCase() === "paid" &&
          cryptoAddress !== null &&
          transaction === null
        ) {
          logger.info("Oxa callback");

          logger.info(req.body);

          let promises = [];

          const amountToken = await dollarToToken(amountDollar);
          // Add update user and create crypto transaction queries to promises array

          const updateQuery = {
            $inc: {
              balance: amountToken,
              "stats.deposit": amountToken,
              "stats.depositCount": 1,
              "limits.betToWithdraw": amountToken,
            },
          };

          // if (senderAddress) {
          //   updateQuery.$addToSet = { cryptoAddresses: senderAddress };
          // }

          promises = [
            User.findByIdAndUpdate(cryptoAddress.user._id, updateQuery, {
              new: true,
            })
              .select("balance xp stats rakeback mute ban verifiedAt updatedAt")
              .lean(),
            CryptoTransaction.create({
              amount: amountToken,
              data: {
                providerId: txhash,
                transaction: txhash,
                currency: currency,
                cryptoAmount: cryptoAmount,
                fee: req.body.fee_paid_by_payer || 0,
              },
              type: "deposit",
              user: cryptoAddress.user,
              state: "completed",
            }),
          ];

          // Execute promises array queries
          let [updatedUser, completedTransaction] = await Promise.all(promises);

          // Convert transaction object to javascript object
          const trObject = completedTransaction.toObject();

          const userId = updatedUser._id.toString();

          // Send updated user to frontend
          io.of("/general").to(userId).emit("user", { user: updatedUser });

          await createNotification(
            userId,
            `You have deposited ${amountToken.toFixed(2)} DLS`,
            io,
            "deposit",
          );

          // Send crypto transaction to frontend
          io.of("/cashier")
            .to(userId)
            .emit("cryptoTransaction", { transaction: trObject });

          if (cryptoAddress.user?.rank !== "admin") {
            await Report.findOneAndUpdate(
              { createdAt: new Date().toISOString().slice(0, 10) },
              {
                $inc: {
                  "stats.total.deposit": amountToken,
                  "stats.total.newDepositors":
                    updatedUser.stats.depositCount === 1 ? 1 : 0,
                  "stats.crypto.deposit": amountToken,
                },
              },
              { upsert: true },
            ).exec();
          }
        }

        // Remove transaction id from crypto block array
        callbackBlockTransactionCrypto.splice(
          callbackBlockTransactionCrypto.indexOf(txhash.toString()),
          1,
        );

        res.status(200).json({ success: true });
      } catch (err) {
        logger.error(err);
        callbackBlockTransactionCrypto.splice(
          callbackBlockTransactionCrypto.indexOf(txhash.toString()),
          1,
        );
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    } catch (err) {
      logger.error("deposit callback err : ", err);
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  router.post("/oxapay-withdraw", rateLimiterMiddleware, async (req, res) => {
    try {
      logger.info("oxapay-withdraw callback");
      logger.info(req.body);

      // Get transaction id and currency
      const transactionId = req.body.trackId; // req.body.ipn_type === 'deposit' ? req.body.deposit_id : req.body.id;
      const currency = req.body.currency; // req.body.currency === 'USDT.ERC20' ? 'usdt' : req.body.currency.toLowerCase();

      // Validate crypto transaction
      callbackCheckTransaction(transactionId, adminCashierBlockPayoutCrypto);

      try {
        // Add transactions id to crypto block array
        adminCashierBlockPayoutCrypto.push(transactionId.toString());

        // Get crypto address and crypto transaction from database
        const pendingTransaction = await CryptoTransaction.findOne({
          type: "withdraw",
          "data.receiver": req.body.address,
          state: { $ne: "completed" },
        })
          .select("amount data type user state")
          .lean();

        logger.info("pending ", pendingTransaction);

        if (
          req.body.type === "payout" &&
          req.body.status === "Complete" &&
          pendingTransaction !== null
        ) {
          // Add update crypto transaction query to promises array
          const transaction = await CryptoTransaction.findByIdAndUpdate(
            pendingTransaction._id,
            {
              "data.transaction": req.body.txID,
              state: "completed",
            },
            { new: true },
          )
            .select("user state type data")
            .populate({ path: "data", select: "currency" })
            .lean();

          const userId = transaction.user.toString();
          io.of("/cashier")
            .to(userId)
            .emit("cryptoTransaction", { transaction: transaction });

          await createNotification(
            userId,
            `You have withdrawn ${currency}`,
            io,
            "withdraw",
          );
        }

        // Remove transaction id from crypto block array
        adminCashierBlockPayoutCrypto.splice(
          adminCashierBlockPayoutCrypto.indexOf(transactionId.toString()),
          1,
        );

        res.status(200).json({ success: true });
      } catch (err) {
        logger.info(err);
        adminCashierBlockPayoutCrypto.splice(
          adminCashierBlockPayoutCrypto.indexOf(transactionId.toString()),
          1,
        );
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    } catch (err) {
      logger.error("withdraw callback err : ", err);
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  router.get("/spinac", async (req, res) => {
    const {
      amount,
      username,
      currency,
      action,
      gameplay_final,
      type,
      round_id,
      game_id,
      call_id,
      timestamp,
      key,
    } = req.query;
    try {
      // let userId;
      // try {
      //   userId = req.user._id.toString();
      //   await socketCheckAntiSpam(userId);
      // } catch (err) {
      //   return res.status(500).json({
      //     success: false,
      //     error: { error: 1, balance: 0, msg: err },
      //   });
      // }

      if (key != CryptoJS.MD5(timestamp + process.env.WWG_API_SALTKEY)) {
        throw new Error("Invalid signature!");
      }

      if (action === "credit") {
        logger.info("slot callback : ", req.query);
      }

      const response = await processTransaction(
        action,
        username,
        game_id,
        amount,
        round_id,
        currency,
        gameplay_final,
        io,
      );

      // socketRemoveAntiSpam(userId);
      res.status(200).json({ error: 0, balance: response });
    } catch (err) {
      //  socketRemoveAntiSpam(userId);
      logger.error("Error processing WWG callback: ", err);
      const user = await User.findOne({
        username: { $regex: `^${username}$`, $options: "i" },
      });
      socketRemoveAntiSpam(user._id.toString());
      res.status(500).json({
        success: false,
        error: { error: 1, balance: 0, msg: err },
      });
    }
  });

  return router;
};
