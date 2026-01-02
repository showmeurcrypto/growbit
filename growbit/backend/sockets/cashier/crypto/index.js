// Load database models
const User = require("../../../database/models/User");

// Load middleware
const { rateLimiter } = require("../../../middleware/rateLimiter");

// Load utils
const {
  socketCheckUserData,
  socketCheckAntiSpam,
  socketRemoveAntiSpam,
  getIdentifier,
} = require("../../../utils/socket");
const { settingCheck } = require("../../../utils/setting");

// Load controllers
const {
  createCryptoWithdrawRequest,
  getCryptoAddressesAndPrices,
} = require("../../../services/cashier/crypto");

module.exports = (io, socket) => {
  socket.on("getCryptoData", async (data, callback) => {
    if (callback === undefined || typeof callback !== "function") {
      return;
    }
    try {
      const identifier = getIdentifier(socket);
      await rateLimiter.consume(identifier);
      try {
        let user = null;
        if (socket.decoded !== undefined && socket.decoded !== null) {
          user = await User.findById(socket.decoded._id).select(
            "username avatar rank mute ban",
          );
        }
        socketCheckUserData(user, true);
        settingCheck(user);
        getCryptoAddressesAndPrices(io, socket, user, data, callback);
      } catch (err) {
        callback({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    } catch (err) {
      callback({
        success: false,
        error: {
          type: "error",
          message: err.message,
        },
      });
    }
  });

  socket.on("sendCryptoWithdraw", async (data, callback) => {
    if (callback === undefined || typeof callback !== "function") {
      return;
    }
    if (socket.decoded !== undefined && socket.decoded !== null) {
      try {
        const identifier = getIdentifier(socket);
        await rateLimiter.consume(identifier);
        await socketCheckAntiSpam(socket.decoded._id);
        try {
          const user = await User.findById(socket.decoded._id)
            .select(
              "username local.emailVerified avatar rank balance limits mute ban stats growIds cryptoAddresses ips whitelist",
            )
            .lean();
          socketCheckUserData(user, true);
          settingCheck(user, "crypto.withdraw.enabled");
          createCryptoWithdrawRequest(io, socket, user, data, callback);
        } catch (err) {
          socketRemoveAntiSpam(socket.decoded._id);
          callback({
            success: false,
            error: { type: "error", message: err.message },
          });
        }
      } catch (err) {
        callback({
          success: false,
          error: {
            type: "error",
            message: err.message,
          },
        });
      }
    } else {
      callback({
        success: false,
        error: {
          type: "error",
          message: "You need to sign in to perform this action.",
        },
      });
    }
  });
};
