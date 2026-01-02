const jwt = require("jsonwebtoken");

const User = require("../../../database/models/User");

// Load middleware
const { rateLimiterGames } = require("../../../middleware/rateLimiter");

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
const {
  plinkoValidateRequest,
  plinkoCheckSendCreateUser,
} = require("../../../services/plinko/validation");

const { playPlinko } = require("../../../services/plinko/plinko");

const plinkoSocket = (io) => {
  io.of("/plinko").use(async (socket, next) => {
    try {
      const identifier = getIdentifier(socket);
      await socketCheckConnectionLimit("plinko", identifier);

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
          socket.join(socket.decoded._id.toString());
        } catch (err) {
          return next(new Error("Please sign in to perform this action."));
        }

        next();
      } else {
        next(new Error("Please sign in to perform this action."));
      }
    } catch (err) {
      return next(
        new Error("Something went wrong! Please try again in a few seconds."),
      );
    }
  });

  io.of("/plinko").on("connection", (socket) => {
    const identifier = getIdentifier(socket);
    socketAddConnectionLimit("plinko", identifier);

    socket.on("sendCreate", async (data, callback) => {
      if (callback === undefined || typeof callback !== "function") {
        return;
      }
      if (socket.decoded !== undefined && socket.decoded !== null) {
        try {
          const identifier = getIdentifier(socket);
          await rateLimiterGames.consume(identifier);
          await socketCheckAntiSpam(socket.decoded._id);
          try {
            const user = await User.findById(socket.decoded._id)
              .select(
                "rank balance local.emailVerified stats limits fair agreed mute ban affiliates",
              )
              .lean();
            checkVerified(user);
            socketCheckUserData(user, true, true);
            settingCheck(user, "games.plinko.enabled");

            try {
              plinkoValidateRequest(data);

              plinkoCheckSendCreateUser(data, user);

              // Get user bet amount and game rows
              const amount = data.amount;
              const rows = Math.floor(data.rows);
              const risk = data.risk;

              let { game } = await playPlinko(user, amount, rows, risk, io);

              callback({ success: true, game: game });

              socketRemoveAntiSpam(user._id);
            } catch (err) {
              socketRemoveAntiSpam(user._id);
              callback({
                success: false,
                error: { type: "error", message: err.message },
              });
            }
          } catch (err) {
            socketRemoveAntiSpam(socket.decoded._id);
            callback({
              success: false,
              error: { type: "error", message: err.message },
            });
          }
        } catch (err) {
          let message = err.message;
          if (err.remainingPoints === 0) {
            message = "Slow Down!";
          }

          callback({
            success: false,
            error: {
              type: "error",
              message: message,
            },
          });
        }
      } else {
        callback({
          success: false,
          error: {
            type: "error",
            message: "Please sign in to perform this action.",
          },
        });
      }
    });

    socket.on("disconnect", () => {
      const identifier = getIdentifier(socket);
      socketRemoveConnectionLimit("plinko", identifier);
    });
  });
};

module.exports = plinkoSocket;
