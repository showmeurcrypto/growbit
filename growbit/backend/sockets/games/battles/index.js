const jwt = require("jsonwebtoken");

// Load database models
const User = require("../../../database/models/User");

// Load middleware
const { rateLimiter } = require("../../../middleware/rateLimiter");

// Load utils
const {
  socketCheckUserData,
  socketCheckConnectionLimit,
  socketAddConnectionLimit,
  socketRemoveConnectionLimit,
  socketCheckAntiSpam,
  getIdentifier,
  socketRemoveAntiSpam,
} = require("../../../utils/socket");
const { settingCheck } = require("../../../utils/setting");

// Load controllers
const {
  battlesGetData,
  battlesGetGameDataSocket,
  battlesSendCreateSocket,
  battlesSendBotSocket,
  battlesSendJoinSocket,
  battlesSendCancelSocket,
  battlesInit,
} = require("../../../services/battles");
const { boxes } = require("../../../services/boxLoader");

module.exports = (io) => {
  io.of("/battles").use(async (socket, next) => {
    try {
      const identifier = getIdentifier(socket);
      await socketCheckConnectionLimit("battles", identifier);

      if (
        socket.handshake.auth !== undefined &&
        socket.handshake.auth.token !== undefined
      ) {
        try {
          const decoded = await jwt.verify(
            socket.handshake.auth.token,
            process.env.TOKEN_SECRET,
          );
          socket.decoded = decoded;

          if (
            socket.decoded !== undefined &&
            socket.decoded !== null &&
            socket.decoded._id !== undefined
          ) {
            socket.join(socket.decoded._id.toString());
          }
        } catch (err) {
          return next(new Error("You need to sign in to perform this action."));
        }
      }

      // Get battles data
      const battlesData = await battlesGetData(socket.decoded);

      // console.log("battles init finished");
      // console.log(battlesData);

      socket.emit("init", {
        boxes: battlesData.boxes,
        games: battlesData.games,
        history: battlesData.history,
      });
      next();
    } catch (err) {
      console.error(err);
      return next({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  io.of("/battles").on("connection", (socket) => {
    const identifier = getIdentifier(socket);
    socketAddConnectionLimit("battles", identifier);

    socket.on("getGameData", async (data, callback) => {
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
          console.log("socket get case data");
          socketCheckUserData(user, false);
          settingCheck(user);
          console.log("socket user checked");
          battlesGetGameDataSocket(io, socket, user, data, callback);
          console.log("socket returning case data");
        } catch (err) {
          console.error(err);

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
            message:
              err.message !== undefined
                ? err.message
                : "You need to slow down, you have send to many request. Try again in a minute.",
          },
        });
      }
    });

    socket.on("create", async (data, callback) => {
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
                "username avatar rank balance xp stats limits affiliates anonymous mute ban createdAt",
              )
              .lean();
            socketCheckUserData(user, true);
            //settingCheck(user, "games.battles.enabled");
            battlesSendCreateSocket(io, socket, user, data, callback);
          } catch (err) {
            socketRemoveAntiSpam(socket.decoded._id);
            callback({
              success: false,
              error: { type: "error", message: err.message },
            });
          }
        } catch (err) {
          console.error(err);

          callback({
            success: false,
            error: {
              type: "error",
              message:
                err.message !== undefined
                  ? err.message
                  : "You need to slow down, you have send to many request. Try again in a minute.",
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

    socket.on("callBot", async (data, callback) => {
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
                "username avatar rank balance xp stats limits affiliates anonymous mute ban createdAt",
              )
              .lean();
            socketCheckUserData(user, true);
            settingCheck(user, "games.battles.enabled");
            battlesSendBotSocket(io, socket, user, data, callback);
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
              message:
                err.message !== undefined
                  ? err.message
                  : "You need to slow down, you have send to many request. Try again in a minute.",
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

    socket.on("join", async (data, callback) => {
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
                "username avatar rank balance xp stats limits affiliates anonymous mute ban createdAt",
              )
              .lean();
            socketCheckUserData(user, true);
            settingCheck(user, "games.battles.enabled");
            battlesSendJoinSocket(io, socket, user, data, callback);
          } catch (err) {
            socketRemoveAntiSpam(socket.decoded._id);
            callback({
              success: false,
              error: { type: "error", message: err.message },
            });
          }
        } catch (err) {
          console.error(err);

          callback({
            success: false,
            error: {
              type: "error",
              message:
                err.message !== undefined
                  ? err.message
                  : "You need to slow down, you have send to many request. Try again in a minute.",
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

    socket.on("disconnect", async () => {
      const identifier = getIdentifier(socket);
      socketRemoveConnectionLimit("battles", identifier);
    });
  });

  // Init battles game
  battlesInit(io);
};
