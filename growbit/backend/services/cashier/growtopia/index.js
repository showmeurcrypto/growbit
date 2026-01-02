const User = require("../../../database/models/User");
const GrowtopiaTransaction = require("../../../database/models/GrowtopiaTransaction");

const { socketRemoveAntiSpam } = require("../../../utils/socket");
const mongoose = require("mongoose");
const Report = require("../../../database/models/Report");
const { createNotification } = require("../../notifications");
const { logger } = require("../../../utils/logger");
const API_BASE_URL =
  process.env.GROWTOPIA_BOT_BASE_URL || "http://37.27.240.146:80/proxy.php";
const API_SECRET = process.env.GROWTOPIA_BOT_API_SECRET || "ilovebots";
const G_BOT_ERROR_CODES = {
  100: "Success: Transaction completed successfully",
  200: "Something went wrong! Please try again in 60 seconds.",
  300: "Player Timeout: Player didn't arrive or complete transaction",
  400: "Invalid Parameters: Invalid amount or parameter validation failed",
  500: "Internal Server Error: Server-side processing error",
  600: "Authentication Failed: Invalid API key or security validation failed",
};

const ACTIVE_REQ_ERR = "You already have an active request.";

const FREEZE_DURATION_MS = 1000 * 60 * 60 * 12;

const DISCORD_WEBHOOK_URL =
  process.env.NOTIFICATIONS_DISCORD_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1328668440357244928/sTCC1fQDgoCkNPhXIr76sSyoA60aBBsEFixCnWrlfGKAaoL-Jv-2Zrbmz-FIWO3H5x5X";

const NodeCache = require("node-cache");
const axios = require("axios");
const { checkWithdrawAntiFraud } = require("../../antifraud");

const activeTransactionData = new NodeCache({
  stdTTL: 60 * 5,
  checkperiod: 60 * 5,
});

const failCounter = new NodeCache({
  stdTTL: 60 * 60 * 12,
  checkperiod: 60 * 60,
});

const withdrawCounter = new NodeCache({
  stdTTL: 60 * 60 * 12,
  checkperiod: 60 * 60,
});

const bannedUsers = new NodeCache({
  stdTTL: 60 * 60 * 12,
  checkperiod: 60 * 60,
});

//TODO: check ban expiration

const getActiveTransactions = async (io, socket, user, callback) => {
  try {
    const data = activeTransactionData.get(user.username);
    socketRemoveAntiSpam(socket.decoded._id);
    callback({ success: true, data: data });
  } catch (err) {
    logger.error("getActiveTransactions", err);
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const cashierSendGrowtopiaDepositSocket = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  let session = null;
  let activeTransactionSet = false;

  let userId = user._id.toString();

  try {
    const username = user.username;

    checkGrowtopiaBotSpam(username);

    const growId = data.growId;

    if (!growId) {
      throw new Error("Please enter a valid GrowID.");
    }

    let banned = checkIfBanned(userId);
    if (banned > 0) {
      const hoursLeft = Math.ceil(banned / (60 * 60 * 1000));

      throw new Error(
        `You didn't complete the transaction 3 times in a row. Try again in ${hoursLeft} hour(s).`,
      );
    }

    activeTransactionData.set(username, {
      botName: "Loading...",
      world: "Loading...",
      type: "deposit",
    });

    activeTransactionSet = true;

    logger.info("Growtopia deposit request : ", username);

    const { botName, world } = await startTransaction("deposit");

    logger.info(
      "Starting growtopia deposit transaction : ",
      username,
      growId,
      botName,
      world,
    );

    io.of("/cashier").to(userId).emit("growtopiaTransactionInProgress", {
      botName,
      world,
      type: "deposit",
    });

    activeTransactionData.set(username, {
      botName,
      world,
      type: "deposit",
    });

    const { DLSAmount, transactionId, tokenAmount } = await processDeposit(
      botName,
      world,
      growId,
      user,
    );

    session = await mongoose.startSession();
    session.startTransaction();

    // token amount is equal to DLSAmount because DSL is the main currency

    await GrowtopiaTransaction.create({
      type: "deposit",
      DLSAmount: DLSAmount,
      tokenAmount: tokenAmount,
      transactionId,
      growId,
      user: user,
    });

    let updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $inc: {
          balance: tokenAmount,
          "stats.deposit": tokenAmount,
          "stats.depositCount": 1,
          "limits.betToWithdraw": tokenAmount,
        },
        $addToSet: {
          growIds: growId,
        },
      },
      {
        new: true,
      },
    );

    if (user.rank !== "admin") {
      await Report.findOneAndUpdate(
        { createdAt: new Date().toISOString().slice(0, 10) },
        {
          $inc: {
            [`stats.total.deposit`]: tokenAmount,
            [`stats.total.newDepositors`]:
              updatedUser.stats.depositCount === 1 ? 1 : 0,
            [`stats.growtopia.deposit`]: tokenAmount,
          },
        },
        { upsert: true },
      );
    }

    await session.commitTransaction();
    await session.endSession();
    await createNotification(
      user._id,
      `You have deposited ${tokenAmount} DLS`,
      io,
      "deposit",
    );
    removeGrowtopiaBotSpamCheck(username);
    failCounter.del(userId);

    io.of("/cashier")
      .to(userId)
      .emit("growtopiaDepositResponse", { success: true, user: updatedUser });
  } catch (err) {
    logger.error("growtopia deposit error : ", err);
    if (session) {
      await session.abortTransaction();
    }

    if (err.message === G_BOT_ERROR_CODES[300]) {
      let cnt = (failCounter.get(userId) || 0) + 1;
      failCounter.set(userId, cnt);
      if (cnt > 2) {
        const expiration = new Date().getTime() + FREEZE_DURATION_MS;
        bannedUsers.set(userId, expiration);
        failCounter.del(userId);
        notifyDiscord(user.username);
      }
    }

    if (activeTransactionSet) {
      removeGrowtopiaBotSpamCheck(user.username);
    }

    io.of("/cashier")
      .to(userId)
      .emit("growtopiaDepositResponse", {
        success: false,
        error: { type: "error", message: err.message },
      });
  }
};

const cashierSendGrowtopiaWithdrawSocket = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  let session = null;
  let userUpdated = false;
  let withdrawStarted = false;
  let activeTransactionSet = false;
  let tokenAmount = 0;

  try {
    tokenAmount = data.amount;
    const username = user.username;

    checkGrowtopiaBotSpam(username);

    const growId = data.growId.trim();
    if (!growId) {
      throw new Error("Please enter a valid GrowID.");
    }

    const userId = user._id.toString();
    let withdrawCnt = withdrawCounter.get(userId) || 0;

    if (withdrawCnt > 3) {
      throw new Error("Too many withdraws in last 12h, wait for few hours.");
    }

    await checkWithdrawAntiFraud(user, growId, null);

    activeTransactionData.set(username, {
      botName: "Loading...",
      world: "Loading...",
      type: "withdraw",
    });

    activeTransactionSet = true;

    logger.info("Growtopia withdraw request : ", username);

    let updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $inc: {
          balance: -tokenAmount,
          [`stats.withdraw`]: tokenAmount,
        },
        $addToSet: {
          growIds: growId,
        },
      },
      {
        returnNewDocument: true,
        returnDocument: "after",
      },
    );

    userUpdated = true;
    logger.info("Growtopia withdraw balance deducted : ", username);

    socketRemoveAntiSpam(user._id.toString());

    io.of("/general")
      .to(user._id.toString())
      .emit("user", { user: updatedUser });

    const { botName, world } = await startTransaction("withdraw", tokenAmount);

    withdrawStarted = true;

    session = await mongoose.startSession();
    session.startTransaction();

    logger.info(
      "Starting growtopia withdraw transaction : ",
      username,
      growId,
      botName,
      world,
    );

    io.of("/cashier")
      .to(user._id.toString())
      .emit("growtopiaTransactionInProgress", {
        botName,
        world,
        type: "withdraw",
      });

    activeTransactionData.set(username, {
      botName,
      world,
      type: "withdraw",
    });

    const { amount, transactionId, DLSAmount } = await processWithdrawal(
      botName,
      world,
      growId,
      tokenAmount,
      user,
    );

    logger.info("Growtopia withdraw ended : ", username);

    await GrowtopiaTransaction.create(
      [
        {
          type: "withdraw",
          DLSAmount: DLSAmount,
          tokenAmount: tokenAmount,
          transactionId,
          growId,
          user: user,
        },
      ],
      { session: session },
    );

    if (user.rank !== "admin") {
      await Report.findOneAndUpdate(
        { createdAt: new Date().toISOString().slice(0, 10) },
        {
          $inc: {
            [`stats.total.withdraw`]: tokenAmount,
            [`stats.growtopia.withdraw`]: tokenAmount,
          },
        },
        { session: session },
      );
    }

    await session.commitTransaction();
    await session.endSession();
    removeGrowtopiaBotSpamCheck(username);
    await createNotification(
      user._id,
      `You have withdrawn ${DLSAmount?.toFixed(2)} DLS`,
      io,
      "withdraw",
    );

    withdrawCounter.set(userId, (withdrawCounter.get(userId) || 0) + 1);

    io.of("/cashier")
      .to(user._id.toString())
      .emit("growtopiaWithdrawResponse", { success: true, user: updatedUser });
  } catch (err) {
    logger.error("Growtopia withdraw err", err);
    socketRemoveAntiSpam(user._id.toString());

    if (session) {
      await session.abortTransaction();
    }

    if (
      userUpdated &&
      (!withdrawStarted ||
        err.message === G_BOT_ERROR_CODES[200] ||
        err.message === G_BOT_ERROR_CODES[300] ||
        err.message === G_BOT_ERROR_CODES[400])
    ) {
      logger.error(`Reverting balance update user:${user.username}`);

      let update = await User.findByIdAndUpdate(user._id, {
        $inc: {
          balance: tokenAmount,
          [`stats.withdraw`]: -tokenAmount,
        },
      });
    }

    let updatedUser = await User.findById(user._id);
    io.of("/general")
      .to(user._id.toString())
      .emit("user", { user: updatedUser });

    // TODO handle case when initial mongo db session fails ie. when amount wasn't even deducted from user's balance in the first place

    if (activeTransactionSet) {
      removeGrowtopiaBotSpamCheck(user.username);
    }

    io.of("/cashier")
      .to(user._id.toString())
      .emit("growtopiaWithdrawResponse", {
        success: false,
        error: { type: "error", message: err.message },
      });
  }
};

async function startTransaction(type, tokenAmount = 0) {
  let worldLockAmount = tokenAmount * 100;
  let response;
  try {
    response = await axios.get(
      `${API_BASE_URL}/api/v1/growtopia/start_transaction `,
      {
        timeout: 90000,
        params: {
          secret: API_SECRET,
          type,
          amount: worldLockAmount,
        },
      },
    );
  } catch (e) {
    throw Error("Start transaction Error.");
  }

  if (!response?.data?.code) {
    throw Error("Start transaction Invalid response!");
  }

  if (response.data.code === 100) {
    const botName = response.data.botName;
    const world = response.data.world;

    if (!botName || !world) {
      throw Error("Start transaction Invalid response!");
    }

    return {
      botName,
      world,
    };
  } else {
    throw Error(G_BOT_ERROR_CODES[response.data.code]);
  }
}

async function processDeposit(botName, worldName, playerName, user) {
  let response;

  try {
    response = await axios.post(
      `${API_BASE_URL}/api/v1/growtopia/bot/deposit_request`,
      null,
      {
        params: {
          secret: API_SECRET,
          botName,
          worldName,
          playerName,
          userId: user?._id,
          growbitUser: user?.username,
        },
      },
    );
  } catch (e) {
    throw Error("Process deposit Error");
  }

  if (!response?.data?.code) {
    throw Error("Process deposit invalid code!");
  }

  logger.info("Deposit Response:", response.data);

  const { code, amount, transactionId } = response.data;

  const tokenAmount = amount / 100;
  //worldlock to DLS

  if (code === 100) {
    if (!amount || !transactionId) {
      throw Error(
        `Process deposit invalid response! amount: ${amount} trId : ${transactionId}`,
      );
    }

    return {
      DLSAmount: amount,
      transactionId,
      tokenAmount,
    };
  } else {
    throw Error(G_BOT_ERROR_CODES[code]);
  }
}

async function processWithdrawal(
  botName,
  worldName,
  playerName,
  tokenAmount,
  user,
) {
  let response;
  try {
    const DLSAmount = tokenAmount * 1;
    //Growbit -> DLS is the main unit
    const worldLockAmount = Math.round(DLSAmount * 100);

    response = await axios.post(
      `${API_BASE_URL}/api/v1/growtopia/bot/withdraw_request`,
      null,
      {
        params: {
          secret: API_SECRET,
          botName,
          worldName,
          playerName,
          amount: worldLockAmount,
          userId: user?._id,
          growbitUser: user?.username,
        },
      },
    );
  } catch (e) {
    throw Error("Process withdraw Error");
  }

  if (!response?.data?.code) {
    throw Error("Process withdraw invalid code!");
  }

  logger.info("Withdraw Response:", response.data);

  const { code, amount, transactionId } = response.data;

  if (code === 100) {
    if (!amount || !transactionId) {
      throw Error(
        `Process withdraw invalid response! amount: ${amount} trId : ${transactionId}`,
      );
    }

    return {
      DLSAmount: amount / 100,
      transactionId,
      tokenAmount,
    };
  } else {
    throw Error(G_BOT_ERROR_CODES[code]);
  }
}

function checkGrowtopiaBotSpam(username) {
  if (activeTransactionData.has(username)) {
    throw new Error(ACTIVE_REQ_ERR);
  }
}

function removeGrowtopiaBotSpamCheck(username) {
  activeTransactionData.del(username);
}

const notifyDiscord = async (username) => {
  if (DISCORD_WEBHOOK_URL) {
    try {
      const embed = {
        username: "Deposit freeze report",
        embeds: [
          {
            title: "Deposit freeze",
            description: `User **${username}** didn't complete transaction 3 times in a row`,
            color: 16711680,
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

function unfreeze(userId) {
  bannedUsers.del(userId);
  withdrawCounter.del(userId);
}

function checkIfBanned(userId) {
  let expiration = bannedUsers.get(userId);

  if (!expiration) return 0;

  let left = expiration - new Date().getTime();
  if (left > 0) {
    return left;
  }

  bannedUsers.del(userId);

  return 0;
}
module.exports = {
  cashierSendGrowtopiaDepositSocket,
  cashierSendGrowtopiaWithdrawSocket,
  getActiveTransactions,
  unfreeze,
};
