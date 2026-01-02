// Load database models
const User = require("../../../database/models/User");

// Load middleware
const { rateLimiter } = require("../../../middleware/rateLimiter");

// Load utils
const {
  socketCheckUserData,
  socketCheckUserRank,
  socketCheckAntiSpam,
  socketRemoveAntiSpam,
  getIdentifier,
  checkVerified,
} = require("../../../utils/socket");
const { settingCheck } = require("../../../utils/setting");

// Load controllers
const {
  generalGetUserTransactionsSocket,
  generalGetUserSeedSocket,
  generalSendUserAnonymousSocket,
  generalSendUserTipSocket,
  generalUserRotateSeedSocket,
  toggleFavouriteSlot,
} = require("../../../services/general/user");

module.exports = (io, socket) => {
  socket.on("toggleFavouriteSlot", async (data, callback) => {
    if (callback === undefined || typeof callback !== "function") {
      return;
    }
    try {
      const identifier = getIdentifier(socket);
      await rateLimiter.consume(identifier);

      if (!data.slot) {
        throw new Error("Slot name missing!");
      }
      try {
        let user = null;
        if (socket.decoded !== undefined && socket.decoded !== null) {
          user = await User.findById(socket.decoded._id).select(
            "username avatar rank agreed mute ban",
          );
        }
        socketCheckUserData(user, true);
        settingCheck(user);
        await toggleFavouriteSlot(user, data.slot, io);
        callback({
          success: true,
          error: { type: "success", message: "Favorite slot toggled" },
        });
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

  socket.on("getUserTransactions", async (data, callback) => {
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
            .select("username avatar rank agreed mute ban")
            .lean();
        }
        socketCheckUserData(user, true);
        settingCheck(user);
        generalGetUserTransactionsSocket(io, socket, user, data, callback);
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

  socket.on("getUserSeed", async (data, callback) => {
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
            .select("username avatar rank agreed mute ban")
            .lean();
        }
        socketCheckUserData(user, true);
        settingCheck(user);
        generalGetUserSeedSocket(io, socket, user, data, callback);
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

  socket.on("sendUserAnonymous", async (data, callback) => {
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
            .select("username avatar rank mute ban")
            .lean();
          socketCheckUserData(user, true);
          settingCheck(user);
          generalSendUserAnonymousSocket(io, socket, user, data, callback);
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

  socket.on("sendUserClientSeed", async (data, callback) => {
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
            .select("username avatar rank mute ban")
            .lean();
          socketCheckUserData(user, true);
          settingCheck(user);
          generalUserRotateSeedSocket(io, socket, user, data, callback);
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

  socket.on("sendUserTip", async (data, callback) => {
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
              "username avatar local.emailVerified rank balance stats limits mute ban",
            )
            .lean();
          socketCheckUserData(user, true);
          checkVerified(user);
          settingCheck(user, "general.tip.enabled");
          generalSendUserTipSocket(io, socket, user, data, callback);
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
