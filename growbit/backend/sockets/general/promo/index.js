// Load database models
const User = require("../../../database/models/User");

// Load middleware
const { rateLimiter } = require("../../../middleware/rateLimiter");

// Load utils
const {
  socketCheckUserData,
  checkVerified,
  socketCheckAntiSpam,
  socketRemoveAntiSpam,
  getIdentifier,
} = require("../../../utils/socket");

const { settingCheck } = require("../../../utils/setting");

// Load controllers
const {
  generalSendPromoClaimSocket,
} = require("../../../services/general/promo");

module.exports = (io, socket) => {
  socket.on("sendPromoClaim", async (data, callback) => {
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
              "username avatar local.emailVerified rank stats limits mute ban",
            )
            .lean();
          socketCheckUserData(user, true);
          settingCheck(user);

          if (!user.local?.emailVerified) {
            throw Error("Your email is not verified!");
          }

          checkVerified(user);

          generalSendPromoClaimSocket(
            io,
            socket,
            user,
            data,
            callback,
            identifier,
          );
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
