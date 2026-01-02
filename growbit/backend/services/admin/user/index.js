const validator = require("validator");

const User = require("../../../database/models/User");
const CryptoTransaction = require("../../../database/models/CryptoTransaction");
const CryptoAddress = require("../../../database/models/CryptoAddress");
const TipTransaction = require("../../../database/models/TipTransaction");
const BalanceTransaction = require("../../../database/models/BalanceTransaction");
const CrashBet = require("../../../database/models/CrashBet");
const SlideBet = require("../../../database/models/SlideBet");
const MinesGame = require("../../../database/models/MinesGame");
const QuickGame = require("../../../database/models/QuickGame");
const GrowtopiaTransactions = require("../../../database/models/GrowtopiaTransaction");

const { socketRemoveAntiSpam } = require("../../../utils/socket");

const { unfreeze } = require("../../cashier/growtopia");

const { normalizeGmail } = require("../../../utils/email");

const {
  adminCheckGetUserListData,
  adminCheckGetUserDataData,
  adminCheckGetUserDataUser,
  adminCheckGetUserTransactionsData,
  adminCheckGetUserGamesData,
  adminCheckSendUserValueData,
  adminCheckSendUserBalanceData,
  adminCheckSendUserBalanceUser,
  adminCheckSendUserMuteData,
  adminCheckSendUserBanData,
  adminFormatUserSort,
  adminCheckGetTransactionsData,
} = require("../../../utils/admin/user");
const { createNotification } = require("../../notifications");
const { logger } = require("../../../utils/logger");
const axios = require("axios");

const DISCORD_WEBHOOK_URL =
  process.env.NOTIFICATIONS_DISCORD_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1328668440357244928/sTCC1fQDgoCkNPhXIr76sSyoA60aBBsEFixCnWrlfGKAaoL-Jv-2Zrbmz-FIWO3H5x5X";

const adminGetUserListSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    adminCheckGetUserListData(data);

    // Calculating database query offset
    const offset = (data.page - 1) * 12;

    // Get database sort query
    const sort = adminFormatUserSort(data.sort);

    let select = {
      $or: [
        { username: { $regex: data.search, $options: "i" } },
        { "ips.address": { $regex: data.search, $options: "i" } },
      ],
    };

    // Add id query to database select object
    if (validator.isMongoId(data.search) === true) {
      select.$or = [...select.$or, { _id: data.search }];
    }

    // Get users and users count from database
    const dataDatabase = await Promise.all([
      User.countDocuments(select),
      User.find(select)
        .sort(sort)
        .limit(12)
        .skip(offset)
        .select(
          "local.email local.emailVerified  whitelist username avatar balance xp vault rank stats leaderboard limits ips mute ban updatedAt createdAt",
        )
        .populate("affiliates.referrer", "username")
        .lean(),
    ]);

    callback({ success: true, count: dataDatabase[0], users: dataDatabase[1] });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const adminGetUserDataSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    adminCheckGetUserDataData(data);

    // Get user from database
    const userDatabase = await User.findById(data.userId)
      .select(
        "local.email local.emailVerified  whitelist username avatar balance xp vault rank stats leaderboard limits ips mute ban updatedAt createdAt",
      )
      .lean();

    // Validate user
    adminCheckGetUserDataUser(userDatabase);

    callback({ success: true, data: userDatabase });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const adminGetTransactionListSocket = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  try {
    // Validate sent data
    adminCheckGetTransactionsData(data);

    // Get all transactions from database
    const dataDatabase = await Promise.all([
      CryptoTransaction.countDocuments({
        state: { $in: ["completed", "approved"] },
      }),
      GrowtopiaTransactions.countDocuments({}),
      CryptoTransaction.find({ state: { $in: ["completed", "approved"] } })
        .sort({ createdAt: -1 })
        .limit(data.page * 14)
        .select("amount data type user state createdAt")
        .populate({ path: "user", select: "username" })
        .lean(),

      GrowtopiaTransactions.find({})
        .sort({ createdAt: -1 })
        .limit(data.page * 14)
        .select("tokenAmount user createdAt type growId")
        .populate({ path: "user", select: "username" })
        .lean(),
    ]);

    // Get total transaction count
    const count = dataDatabase.slice(0, 2).reduce((a, b) => a + b, 0);

    // Format transactions
    let transactions = [
      ...dataDatabase[2].map((transaction) => ({
        ...transaction,
        method: "crypto",
      })),
      ...dataDatabase[3].map((transaction) => ({
        ...transaction,
        method: "growtopia",
      })),
    ];

    // Sort transactions by date
    transactions.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Short transactions array to 14 elements
    const offset = (data.page - 1) * 14;
    const limit = data.page * 14;
    transactions = transactions.slice(offset, limit);

    callback({ success: true, count: count, transactions: transactions });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const adminGetUserTransactionListSocket = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  try {
    // Validate sent data
    adminCheckGetUserTransactionsData(data);

    // Get all transactions from database
    const dataDatabase = await Promise.all([
      CryptoTransaction.countDocuments({
        user: data.userId,
        state: "completed",
      }),
      TipTransaction.countDocuments({
        $or: [{ "sender.user": data.userId }, { "receiver.user": data.userId }],
        state: "completed",
      }),
      BalanceTransaction.countDocuments({
        user: data.userId,
        state: "completed",
      }),
      GrowtopiaTransactions.countDocuments({ user: data.userId }),
      CryptoTransaction.find({ user: data.userId, state: "completed" })
        .sort({ createdAt: -1 })
        .limit(data.page * 14)
        .select("amount data type user state createdAt")
        .lean(),
      TipTransaction.find({
        $or: [{ "sender.user": data.userId }, { "receiver.user": data.userId }],
        state: "completed",
      })
        .sort({ createdAt: -1 })
        .limit(data.page * 14)
        .select("amount sender receiver state createdAt")
        .populate({ path: "sender.user", select: "username" })
        .populate({ path: "receiver.user", select: "username" })
        .lean(),
      BalanceTransaction.find({ user: data.userId, state: "completed" })
        .sort({ createdAt: -1 })
        .limit(data.page * 14)
        .select("amount type user state createdAt")
        .lean(),
      GrowtopiaTransactions.find({ user: data.userId })
        .sort({ createdAt: -1 })
        .limit(data.page * 14)
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
        method: transaction.type | "balance",
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

    // Short transactions array to 14 elements
    const offset = (data.page - 1) * 14;
    const limit = data.page * 14;
    transactions = transactions.slice(offset, limit);

    callback({ success: true, count: count, transactions: transactions });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const adminGetUserGameListSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    adminCheckGetUserGamesData(data);

    // Get all bets from database
    const dataDatabase = await Promise.all([
      CrashBet.countDocuments({
        payout: { $exists: true, $ne: null },
        user: data.userId,
      }),
      SlideBet.countDocuments({
        payout: { $exists: true, $ne: null },
        user: data.userId,
      }),
      MinesGame.countDocuments({
        payout: { $exists: true, $ne: null },
        user: data.userId,
      }),
      QuickGame.countDocuments({
        payout: { $exists: true, $ne: null },
        user: data.userId,
      }),
      CrashBet.find({ payout: { $exists: true, $ne: null }, user: data.userId })
        .sort({ createdAt: -1 })
        .limit(data.page * 14)
        .select("amount payout user createdAt")
        .lean(),
      SlideBet.find({ payout: { $exists: true, $ne: null }, user: data.userId })
        .sort({ createdAt: -1 })
        .limit(data.page * 14)
        .select("amount payout user createdAt")
        .lean(),
      MinesGame.find({
        payout: { $exists: true, $ne: null },
        user: data.userId,
      })
        .sort({ createdAt: -1 })
        .limit(data.page * 14)
        .select("amount payout user createdAt")
        .lean(),
      QuickGame.find({
        payout: { $exists: true, $ne: null },
        user: data.userId,
      })
        .sort({ createdAt: -1 })
        .limit(data.page * 14)
        .select("game amount payout user createdAt")
        .lean(),
    ]);

    // Get total games count
    const count = dataDatabase.slice(0, 4).reduce((a, b) => a + b, 0);

    // Format games
    let games = [
      ...dataDatabase[4].map((game) => ({ ...game, method: "crash" })),
      ...dataDatabase[5].map((game) => ({ ...game, method: "slide" })),
      ...dataDatabase[6].map((game) => ({ ...game, method: "mines" })),
      ...dataDatabase[7].map((game) => ({ ...game, method: game.game })),
    ];

    // Sort games by date
    games.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Short games array to 14 elements
    const offset = (data.page - 1) * 14;
    const limit = data.page * 14;
    games = games.slice(offset, limit);

    callback({ success: true, count: count, games: games });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const adminSendUserValueSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    adminCheckSendUserValueData(data);

    // Update user rain block in database
    const userDatabase = await User.findByIdAndUpdate(
      data.userId,
      {
        [data.setting]: data.value,
      },
      { new: true },
    )
      .select(
        "local.email local.emailVerified  whitelist username avatar balance xp vault rank stats leaderboard limits ips mute ban updatedAt createdAt",
      )
      .lean();

    callback({ success: true, user: userDatabase });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(user._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const adminSendUserBalanceSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    adminCheckSendUserBalanceData(data);

    // Validate sent user
    const userDatabase = await User.findById(data.userId)
      .select("balance")
      .lean();
    adminCheckSendUserBalanceUser(userDatabase);

    // Get balance amount
    const balance = data.balance;

    // Update user balance and create balance transaction in database
    let dataDatabase = await Promise.all([
      User.findByIdAndUpdate(
        userDatabase._id,
        {
          balance: balance,
        },
        { new: true },
      )
        .select(
          "local.email local.emailVerified  whitelist username avatar balance xp vault rank stats leaderboard limits ips mute ban updatedAt createdAt",
        )
        .lean(),
      BalanceTransaction.create({
        amount: balance - userDatabase.balance,
        type: "adminAdjust",
        user: userDatabase._id,
        state: "completed",
      }),
    ]);

    const userId = userDatabase._id.toString();

    createNotification(
      userId,
      `Your balance has been changed by Admin. Your new balance is ${balance}`,
      io,
      "balance",
    );

    // Send updatetd user to frontend
    io.of("/general").to(userId).emit("user", { user: dataDatabase[0] });

    callback({ success: true, user: dataDatabase[0] });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(user._id);
    logger.error("Failed to add balance: " + err.message);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const adminSetUserEmail = async (io, socket, user, data, callback) => {
  try {
    const email = data.email?.trim();

    const normalizedEmail = normalizeGmail(email);

    const exists = await User.findOne({
      "local.normalizedEmail": normalizedEmail,
    })
      .select("local username")
      .lean();

    if (exists) {
      throw new Error("Email taken!");
    }

    const userDatabase = await User.findByIdAndUpdate(
      data.userId,
      {
        local: { email: email, normalizedEmail: normalizedEmail },
      },
      { new: true },
    )
      .select(
        "local.email local.emailVerified  whitelist username avatar balance stats leaderboard limits ips updatedAt createdAt",
      )
      .lean();

    callback({ success: true, user: userDatabase });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const adminSendUserMuteSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    adminCheckSendUserMuteData(data);

    // Get mute expire
    const muteExpire = new Date().getTime() + Math.floor(data.time || 0) * 1000;

    // Update user mute in database
    const userDatabase = await User.findByIdAndUpdate(
      data.userId,
      {
        mute: { expire: muteExpire, reason: data.reason },
      },
      { new: true },
    )
      .select(
        "local.email local.emailVerified  whitelist username avatar balance xp rank stats leaderboard limits ips mute ban updatedAt createdAt",
      )
      .lean();

    if (data.time) {
      notifyDiscordAboutBanMute(
        userDatabase.username,
        "mute",
        data.reason,
        muteExpire,
        user.username,
      );
    }

    callback({ success: true, user: userDatabase });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const banUsersOnIp = async (io, ip, user, callback) => {
  try {
    ip = ip?.trim();

    if (!ip || ip.length < 7) {
      throw Error("Invalid ip!");
    }

    const banExpire = Date.now() + 60 * 1000 * 60 * 24 * 365 * 100;

    const result = await User.updateMany(
      { "ips.address": ip },
      { ban: { expire: banExpire, reason: "cheating" } },
    );

    if (result.modifiedCount > 0) {
      // Fetch banned users
      const bannedUsers = await User.find({ "ips.address": ip })
        .select("username _id")
        .lean()
        .exec();

      const bannedUserIds = bannedUsers.map((user) => user._id);
      const usernames = bannedUsers.map((user) => user.username).join(", ");

      // Nullify CryptoAddress for banned users
      await CryptoAddress.updateMany(
        { user: { $in: bannedUserIds } },
        { user: null },
      ).exec();

      await ipBanNotify(usernames, ip, user.username);
    }

    callback({ success: true, banned: result.modifiedCount });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const growtopiaTransactionUnfreeze = async (io, socket, data, callback) => {
  try {
    unfreeze(data.userId);

    callback({
      success: true,
    });

    socketRemoveAntiSpam(socket.decoded._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const adminSendUserBanSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    adminCheckSendUserBanData(data);

    // Get ban expire
    const banExpire = new Date().getTime() + Math.floor(data.time || 0) * 1000;

    // Update user ban in database
    const userDatabase = await User.findByIdAndUpdate(
      data.userId,
      {
        ban: { expire: banExpire, reason: data.reason },
      },
      { new: true },
    )
      .select(
        "local.email local.emailVerified  username avatar balance whitelist rank stats leaderboard limits ips mute ban updatedAt createdAt",
      )
      .lean();

    if (data.time) {
      notifyDiscordAboutBanMute(
        userDatabase.username,
        "ban",
        data.reason,
        banExpire,
        user.username,
      );
    }

    await CryptoAddress.updateMany(
      { user: data.userId },
      { user: null },
    ).exec();

    callback({ success: true, user: userDatabase });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const aggregateDuplicateIPs = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const result = await User.aggregate([
    { $match: { updatedAt: { $gte: sevenDaysAgo } } }, // Ignore users not updated in 7 days
    { $unwind: "$ips" },
    { $match: { "ips.address": { $not: /^127\.0\.0\.1$/ } } }, // Ignore localhost IP 127.0.0.1
    {
      $group: {
        _id: "$ips.address",
        users: { $addToSet: "$username" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
    {
      $project: {
        ip: "$_id",
        users: 1,
        count: 1,
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]).exec();

  return result;
};

module.exports = {
  adminGetUserListSocket,
  adminGetUserDataSocket,
  adminGetUserTransactionListSocket,
  adminGetTransactionListSocket,
  adminGetUserGameListSocket,
  adminSendUserValueSocket,
  adminSendUserBalanceSocket,
  adminSendUserMuteSocket,
  adminSendUserBanSocket,
  aggregateDuplicateIPs,
  banUsersOnIp,
  growtopiaTransactionUnfreeze,
  adminSetUserEmail,
};

const notifyDiscordAboutBanMute = async (
  username,
  type,
  reason,
  expire,
  admin,
) => {
  if (DISCORD_WEBHOOK_URL) {
    try {
      const embed = {
        username: `User ${type}`,
        embeds: [
          {
            title: `User ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            description: `User **${username}** has been ${type === "mute" ? "muted" : "banned"} by ${admin} until ${new Date(expire).toUTCString()}`,
            fields: [
              {
                name: "Reason",
                value: `${reason}`,
              },
            ],
            color: type === "mute" ? 0xf6be2c : 0xa83232,
            timestamp: new Date(),
          },
        ],
      };

      await axios.post(DISCORD_WEBHOOK_URL, embed);
    } catch (error) {
      logger.error("Error sending webhook:", error.message);
    }
  }
};

const ipBanNotify = async (usernames, ip, admin) => {
  if (DISCORD_WEBHOOK_URL) {
    try {
      const embed = {
        username: `IP ban`,
        embeds: [
          {
            title: `Users banned by ip`,
            description: `Users **${usernames}** have been banned by ${admin}. IP : ${ip}`,
            color: 0xa83232,
            timestamp: new Date(),
          },
        ],
      };

      await axios.post(DISCORD_WEBHOOK_URL, embed);
    } catch (error) {
      logger.error("Error sending webhook:", error.message);
    }
  }
};
