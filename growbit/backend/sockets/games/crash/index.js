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
  socketRemoveAntiSpam,
  getIdentifier,
  checkVerified,
} = require("../../../utils/socket");
const { settingCheck } = require("../../../utils/setting");

// Load controllers
const {
  crashGetData,
  crashSendBetSocket,
  crashSendCashoutSocket,
  crashInit,
} = require("../../../services/crash");

module.exports = (io) => {
  io.of("/crash").use(async (socket, next) => {
    try {
      const identifier = getIdentifier(socket);
      await socketCheckConnectionLimit("crash", identifier);

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

      // Get crash data from controller and send data to frontend
      const dataCrash = crashGetData();
      socket.emit("init", dataCrash);

      next();
    } catch (err) {
      return next({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  io.of("/crash").on("connection", (socket) => {
    const identifier = getIdentifier(socket);
    socketAddConnectionLimit("crash", identifier);

    socket.on("sendBet", async (data, callback) => {
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
                "username avatar rank balance local.emailVerified xp stats limits affiliates anonymous mute ban createdAt",
              )
              .lean();
            checkVerified(user);

            socketCheckUserData(user, true);
            settingCheck(user, "games.crash.enabled");
            crashSendBetSocket(io, socket, user, data, callback);
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

    socket.on("sendCashout", async (data, callback) => {
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
            crashSendCashoutSocket(io, socket, user, data, callback);
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

    socket.on("disconnect", async () => {
      const identifier = getIdentifier(socket);
      socketRemoveConnectionLimit("crash", identifier);
    });
  });

  // Init crash game
  crashInit(io);
};
