// Load database models
const User = require("../../../database/models/User");

// Load middleware
const { rateLimiter } = require("../../../middleware/rateLimiter");

// Load utils
const { socketCheckUserData, getIdentifier } = require("../../../utils/socket");
const { settingCheck } = require("../../../utils/setting");

// Load controllers
const {
  cashierSendGrowtopiaDepositSocket,
  cashierSendGrowtopiaWithdrawSocket,
  getActiveTransactions,
} = require("../../../services/cashier/growtopia");
const { captchaGetData, captchaCheckData } = require("../../../utils/captcha");
const {
  validateGrowtopiaDepositRequest,
  validateGrowtopiaWithdrawRequest,
  cashierCheckSendDLSWithdrawUser,
} = require("../../../services/cashier/growtopia/request_validation");
const {
  socketCheckAntiSpam,
  socketRemoveAntiSpam,
} = require("../../../utils/socket");

module.exports = (io, socket) => {
  socket.on("getActiveGrowtopiaTransactions", async (data, callback) => {
    if (callback === undefined || typeof callback !== "function") {
      return;
    }

    if (!socket.decoded) {
      return callback({
        success: false,
        error: {
          type: "error",
          message: "You need to sign in to perform this action.",
        },
      });
    }
    const identifier = getIdentifier(socket);
    await rateLimiter.consume(identifier);
    try {
      const user = await User.findById(socket.decoded._id)
        .select("username avatar rank mute ban")
        .lean();

      socketCheckUserData(user, true);
      await getActiveTransactions(io, socket, user, callback);
    } catch (err) {
      callback({
        success: false,
        error: {
          type: "error",
          message: err.message || "Error",
        },
      });
    }
  });

  socket.on("sendGrowtopiaDeposit", async (data, callback) => {
    if (callback === undefined || typeof callback !== "function") {
      return;
    }

    if (!socket.decoded) {
      return callback({
        success: false,
        error: {
          type: "error",
          message: "You need to sign in to perform this action.",
        },
      });
    }
    try {
      const identifier = getIdentifier(socket);
      await rateLimiter.consume(identifier);
      validateGrowtopiaDepositRequest(data);
      const captchaCheck = await captchaGetData(data.captcha);
      captchaCheckData(captchaCheck);

      const user = await User.findById(socket.decoded._id)
        .select("username avatar rank mute ban")
        .lean();
      socketCheckUserData(user, true);
      settingCheck(user, "growtopia.deposit.enabled");

      await cashierSendGrowtopiaDepositSocket(io, socket, user, data, callback);
    } catch (err) {
      callback({
        success: false,
        error: {
          type: "error",
          message: err.message || "Error",
        },
      });
    }
  });

  socket.on("sendGrowtopiaWithdraw", async (data, callback) => {
    if (callback === undefined || typeof callback !== "function") {
      return;
    }

    if (!socket.decoded) {
      return callback({
        success: false,
        error: {
          type: "error",
          message: "You need to sign in to perform this action.",
        },
      });
    }

    let userId;

    try {
      const identifier = getIdentifier(socket);
      await rateLimiter.consume(identifier);
      validateGrowtopiaWithdrawRequest(data);

      const captchaCheck = await captchaGetData(data.captcha);
      captchaCheckData(captchaCheck);

      const user = await User.findById(socket.decoded._id)
        .select(
          "username avatar rank local.emailVerified balance limits mute ban growIds cryptoAddresses ips whitelist",
        )
        .lean();
      socketCheckUserData(user, true);
      settingCheck(user, "growtopia.withdraw.enabled");

      try {
        userId = user._id.toString();
        await socketCheckAntiSpam(userId);
      } catch (err) {
        callback({
          success: false,
          error: {
            type: "error",
            message: err.message || "Error",
          },
        });
      }

      cashierCheckSendDLSWithdrawUser(user, data);

      await cashierSendGrowtopiaWithdrawSocket(
        io,
        socket,
        user,
        data,
        callback,
      );
    } catch (err) {
      if (userId) {
        socketRemoveAntiSpam(userId);
      }
      callback({
        success: false,
        error: {
          type: "error",
          message: err.message || "Error",
        },
      });
    }
  });
};
