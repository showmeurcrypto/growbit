const crypto = require("crypto");

// Load database models
const User = require("../../../database/models/User");
const UserSeed = require("../../../database/models/UserSeed");
const CryptoTransaction = require("../../../database/models/CryptoTransaction");
const TipTransaction = require("../../../database/models/TipTransaction"); //
const GrowtopiaTransactions = require("../../../database/models/GrowtopiaTransaction");
const BalanceTransaction = require("../../../database/models/BalanceTransaction");
const MinesGame = require("../../../database/models/MinesGame");

// Load utils
const { socketRemoveAntiSpam } = require("../../../utils/socket");
const {
  generalCheckGetUserTransactionsData,
  generalCheckSendUserAnonymousData,
  generalCheckSendUserSeedData,
  checkActiveGames,
  generalCheckSendUserTipData,
  generalCheckSendUserTipReceiver,
  generalSanitizeUserSeed,
  generalCheckSendUserTipUser,
} = require("../../../utils/general/user");
const { generalChatAddMessage } = require("../chat");

const generalGetUserTransactionsSocket = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  try {
    // Validate sent data
    generalCheckGetUserTransactionsData(data);

    // Get all transactions from database
    const dataDatabase = await Promise.all([
      CryptoTransaction.countDocuments({ user: user._id, state: "completed" }),
      TipTransaction.countDocuments({
        $or: [{ "sender.user": user._id }, { "receiver.user": user._id }],
        state: "completed",
      }),
      BalanceTransaction.countDocuments({ user: user._id, state: "completed" }),
      //MmmoTransactions.countDocuments({ userId: user._id, state: "approved" }),
      GrowtopiaTransactions.countDocuments({ user: user._id }),
      CryptoTransaction.find({ user: user._id, state: "completed" })
        .sort({ createdAt: -1 })
        .limit(data.page * 8)
        .select("amount data type user state createdAt")
        .lean(),
      TipTransaction.find({
        $or: [{ "sender.user": user._id }, { "receiver.user": user._id }],
        state: "completed",
      })
        .sort({ createdAt: -1 })
        .limit(data.page * 8)
        .select("amount sender receiver state createdAt")
        .lean(),
      BalanceTransaction.find({ user: user._id, state: "completed" })
        .sort({ createdAt: -1 })
        .limit(data.page * 8)
        .select("amount type user state createdAt")
        .lean(),
      GrowtopiaTransactions.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(data.page * 8)
        .select("tokenAmount user createdAt type")
        .lean(),
    ]);

    // Get total transaction count
    const count = dataDatabase.slice(0, 4).reduce((a, b) => a + b, 0);

    // Format transactions
    let transactions = [
      ...dataDatabase[4].map((transaction) => ({
        ...transaction,
        method: "crypto",
      })),
      ...dataDatabase[5].map((transaction) => ({
        ...transaction,
        method: "tip",
      })),
      ...dataDatabase[6].map((transaction) => ({
        ...transaction,
        method: transaction.type,
      })),
      ...dataDatabase[7].map((transaction) => ({
        ...transaction,
        method: "growtopia",
      })),
    ];

    // Sort transactions by date
    transactions.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Short transactions array to 8 elements
    const offset = (data.page - 1) * 8;
    const limit = data.page * 8;
    transactions = transactions.slice(offset, limit);

    callback({ success: true, count: count, transactions: transactions });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const generalGetUserSeedSocket = async (io, socket, user, data, callback) => {
  try {
    const [currentSeed, nextSeed] = await Promise.all([
      UserSeed.findOne({ user: user._id, state: "active" })
        .select("seedClient seedServer hash nonce user state")
        .lean(),
      UserSeed.findOne({ user: user._id, state: "created" })
        .select("seedClient seedServer hash nonce user state")
        .lean(),
    ]);

    callback({
      success: true,
      seed: generalSanitizeUserSeed(currentSeed),
      seedNext: generalSanitizeUserSeed(nextSeed),
    });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const generalSendUserAnonymousSocket = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  try {
    // Validate sent data
    generalCheckSendUserAnonymousData(data);

    // Update user in the database
    await User.findByIdAndUpdate(user._id, { anonymous: data.anonymous });

    callback({ success: true, anonymous: data.anonymous });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const generalUserRotateSeedSocket = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  try {
    // Validate sent data
    generalCheckSendUserSeedData(data);

    let [seeds, activeMine] = await Promise.all([
      UserSeed.find({
        user: user._id,
        state: { $in: ["created", "active"] },
      })
        .select("user state")
        .lean(),
      MinesGame.find({ user: user._id, state: { $ne: "completed" } })
        .select("state")
        .lean(),
    ]);

    if (seeds.length !== 2) {
      throw new Error("Unexpected seed error");
    }

    const nextSeed = seeds.find((s) => s.state === "created");
    const activeSeed = seeds.find((s) => s.state === "active");

    if (seeds.length !== 2 || !nextSeed || !activeSeed) {
      throw new Error("Unexpected seed error");
    }

    checkActiveGames([...activeMine]);

    let seedClient = data.seedClient.trim();

    if (!seedClient) {
      seedClient = crypto.randomBytes(8).toString("hex");
    }

    // Generate new user server seed
    const seedServer = crypto.randomBytes(24).toString("hex");

    // Hash new generated user server seed
    const hash = crypto.createHash("sha256").update(seedServer).digest("hex");

    // Create new user seed and update old user seed in database
    const [newNextSeed, newActiveSeed, oldSeed] = await Promise.all([
      UserSeed.create({
        seedClient: null,
        seedServer: seedServer,
        hash: hash,
        nonce: 1,
        user: user._id,
        state: "created",
      }),
      UserSeed.findByIdAndUpdate(
        nextSeed._id,
        {
          seedClient: seedClient,
          state: "active",
          updatedAt: new Date(),
        },
        { new: true },
      )
        .select("seedClient hash nonce")
        .lean(),
      UserSeed.findByIdAndUpdate(
        activeSeed._id,
        {
          state: "completed",
          updatedAt: new Date(),
        },
        { returnDocument: "after" },
      )
        .select("seedServer seedClient hash nonce state")
        .lean(),
    ]);

    const newNextSeedObject = newNextSeed.toObject();

    callback({
      success: true,
      oldSeed: generalSanitizeUserSeed(oldSeed),
      seed: generalSanitizeUserSeed(newActiveSeed),
      seedNext: generalSanitizeUserSeed(newNextSeedObject),
    });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const generalSendUserTipSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    generalCheckSendUserTipData(data);

    // Validate user balance and if allowed to tip
    generalCheckSendUserTipUser(data, user);

    let receiverDatabase;
    if (data.receiverId) {
      receiverDatabase = await User.findById(data.receiverId).select(
        "balance ban username",
      );
    } else {
      receiverDatabase = await User.findOne({
        username: { $regex: `^${data.receiverUsername}$`, $options: "i" },
      }).select("balance ban username");
    }

    generalCheckSendUserTipReceiver(user, receiverDatabase);

    // Get tip amount
    const amount = data.amount;

    // Update sending user, receiving user and create balance transactions in database
    let dataDatabase = await Promise.all([
      User.findByIdAndUpdate(
        user._id,
        {
          $inc: {
            balance: -amount,
            "limits.limitTip":
              user.limits.limitTip > amount ? -amount : -user.limits.limitTip,
          },
          updatedAt: new Date().getTime(),
        },
        { new: true },
      )
        .select("balance xp stats rakeback mute ban verifiedAt updatedAt")
        .lean(),
      User.findByIdAndUpdate(
        receiverDatabase._id,
        {
          $inc: {
            balance: amount,
            "limits.betToWithdraw": amount,
          },
        },
        { new: true },
      )
        .select("balance xp stats rakeback mute ban verifiedAt updatedAt")
        .lean(),
      TipTransaction.create({
        amount: amount,
        sender: {
          user: user._id,
        },
        receiver: {
          user: receiverDatabase._id,
        },
        user: user._id,
        state: "completed",
      }),
    ]);

    // Convert transaction objects to js object
    dataDatabase[2] = dataDatabase[2].toObject();

    // Sent updated sending user to frontend
    io.of("/general")
      .to(user._id.toString())
      .emit("user", { user: dataDatabase[0] });

    // Sent updated received user and tip transaction to frontend
    io.of("/general")
      .to(dataDatabase[1]._id.toString())
      .emit("user", { user: dataDatabase[1] });
    io.of("/general")
      .to(dataDatabase[1]._id.toString())
      .emit("userTip", { transaction: dataDatabase[2] });

    generalChatAddMessage(io, {
      room: "en",
      message: `@${user.username} has tipped @${receiverDatabase.username} ${amount?.toFixed(2)} DLS.`,
      type: "tip",
    });

    callback({ success: true, transaction: dataDatabase[2] });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const toggleFavouriteSlot = async (user, slot, io) => {
  if (!user.favouriteSlots) {
    user.favouriteSlots = [];
  }

  const index = user.favouriteSlots.indexOf(slot);

  if (index < 0) {
    user.favouriteSlots.push(slot);
    if (user.favouriteSlots.length > 20) {
      user.favouriteSlots.shift();
    }
  } else {
    user.favouriteSlots.splice(index, 1);
  }
  await user.save();

  io.of("/general").to(user._id.toString()).emit("user", { user: user });
};

module.exports = {
  generalGetUserTransactionsSocket,
  generalGetUserSeedSocket,
  generalSendUserAnonymousSocket,
  generalUserRotateSeedSocket,
  generalSendUserTipSocket,
  toggleFavouriteSlot,
};
