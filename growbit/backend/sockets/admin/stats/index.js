const User = require("../../../database/models/User");

const { rateLimiter } = require("../../../middleware/rateLimiter");

const {
  socketCheckUserData,
  socketCheckUserRank,
  getIdentifier,
} = require("../../../utils/socket");

const {
  adminGetStats,
  adminGetReports,
} = require("../../../services/admin/stats");

module.exports = (io, socket) => {
  socket.on("getStatsData", async (data, callback) => {
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
            "username avatar rank agreed mute ban",
          );
        }
        socketCheckUserData(user, true);
        socketCheckUserRank(user, ["admin"]);
        adminGetStats(io, socket, user, data, callback);
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

  socket.on("getStatsList", async (data, callback) => {
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
            "username avatar rank agreed mute ban",
          );
        }
        socketCheckUserData(user, true);
        socketCheckUserRank(user, ["admin"]);
        adminGetReports(io, socket, user, data, callback);
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
};
