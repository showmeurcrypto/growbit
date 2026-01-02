const User = require("../../../database/models/User");

const { rateLimiter } = require("../../../middleware/rateLimiter");

const {
  socketCheckUserData,
  socketCheckAntiSpam,
  socketRemoveAntiSpam,
  getIdentifier,
} = require("../../../utils/socket");
const { settingCheck } = require("../../../utils/setting");

const {
  generalSendRakebackClaimSocket,
} = require("../../../services/general/rewards");

module.exports = (io, socket) => {
  socket.on("getRakebackData", async (data, callback) => {
    if (callback === undefined || typeof callback !== "function") {
      return;
    }
    try {
      const identifier = getIdentifier(socket);
      await rateLimiter.consume(identifier);
      try {
        let user = null;
        if (socket.decoded !== undefined && socket.decoded !== null) {
          user = await User.findById(socket.decoded._id)
            .select("username avatar rank mute ban rakeback")
            .lean();
        }
        socketCheckUserData(user, false);
        settingCheck(user);

        callback({ success: true, rakeback: user.rakeback });
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

  socket.on("sendRakebackClaim", async (data, callback) => {
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
            .select("username avatar rank limits rakeback mute ban")
            .lean();
          socketCheckUserData(user, true);
          settingCheck(user);
          generalSendRakebackClaimSocket(io, socket, user, data, callback);
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
