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
} = require("../../../utils/socket");
const { settingCheck } = require("../../../utils/setting");

// Load controllers
const {
  slideGetDataSocket,
  slideSendBetSocket,
  slideInit,
} = require("../../../services/slide");

module.exports = (io) => {
  io.of("/slide").use(async (socket, next) => {
    try {
      const identifier = getIdentifier(socket);
      await socketCheckConnectionLimit("slide", identifier);
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
      // Get slide data from controller and send data to frontend
      const dataSlide = await slideGetDataSocket();
      socket.emit("init", dataSlide);

      next();
    } catch (err) {
      return next({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  io.of("/slide").on("connection", (socket) => {
    const identifier = getIdentifier(socket);
    socketAddConnectionLimit("slide", identifier);

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
                "username avatar rank balance xp stats limits affiliates anonymous mute ban createdAt",
              )
              .lean();
            socketCheckUserData(user, true);
            settingCheck(user, "games.slide.enabled");
            slideSendBetSocket(io, socket, user, data, callback);
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
      socketRemoveConnectionLimit("slide", identifier);
    });
  });

  // Init slide game
  slideInit(io);
};
