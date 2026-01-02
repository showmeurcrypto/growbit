const jwt = require("jsonwebtoken");

// Load database models
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

// Load controllers
const {
  minesGetGame,
  minesSendBetSocket,
  minesSendRevealSocket,
  minesSendCashoutSocket,
  minesInit,
  minesAutobet,
} = require("../../../services/mines");
const { minesValidateAutobet } = require("../../../utils/games/mines");

module.exports = (io) => {
  io.of("/mines").use(async (socket, next) => {
    try {
      const identifier = getIdentifier(socket);
      await socketCheckConnectionLimit("mines", identifier);

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

        // Send mines game to the frontend
        socket.emit("init", { game: minesGetGame(socket.decoded) });

        next();
      } else {
        next(new Error("You need to sign in to perform this action."));
      }
    } catch (err) {
      return next({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  io.of("/mines").on("connection", (socket) => {
    const identifier = getIdentifier(socket);
    socketAddConnectionLimit("mines", identifier);

    socket.on("sendBet", async (data, callback) => {
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
                "username avatar rank  local.emailVerified balance xp stats limits affiliates anonymous mute ban createdAt",
              )
              .lean();
            checkVerified(user);

            socketCheckUserData(user, true);
            settingCheck(user, "games.mines.enabled");
            minesSendBetSocket(io, socket, user, data, callback);
          } catch (err) {
            socketRemoveAntiSpam(socket.decoded._id);
            sendError(err, callback);
          }
        } catch (err) {
          sendError(err, callback);
        }
      } else {
        pleaseLogIn(callback);
      }
    });

    socket.on("autobet", async (data, callback) => {
      if (callback === undefined || typeof callback !== "function") {
        return;
      }
      if (!socket.decoded) {
        return pleaseLogIn(callback);
      }
      try {
        const identifier = getIdentifier(socket);
        await rateLimiterGames.consume(identifier);
        await socketCheckAntiSpam(socket.decoded._id);
        try {
          minesValidateAutobet(data);
          const user = await User.findById(socket.decoded._id)
            .select(
              "username avatar rank  local.emailVerified balance xp stats limits affiliates anonymous mute ban createdAt",
            )
            .lean();

          checkVerified(user);
          socketCheckUserData(user, true);
          settingCheck(user, "games.mines.enabled");
          minesAutobet(io, socket, user, data, callback);
        } catch (err) {
          socketRemoveAntiSpam(socket.decoded._id);
          sendError(err, callback);
        }
      } catch (err) {
        sendError(err, callback);
      }
    });

    socket.on("sendReveal", async (data, callback) => {
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
                " username avatar rank balance xp stats limits rakeback affiliates anonymous mute ban createdAt",
              )
              .lean();
            socketCheckUserData(user, true);
            settingCheck(user);
            minesSendRevealSocket(io, socket, user, data, callback);
          } catch (err) {
            socketRemoveAntiSpam(socket.decoded._id);
            sendError(err, callback);
          }
        } catch (err) {
          sendError(err, callback);
        }
      } else {
        pleaseLogIn(callback);
      }
    });

    socket.on("sendCashout", async (data, callback) => {
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
                " username avatar rank balance xp stats limits rakeback affiliates anonymous mute ban createdAt",
              )
              .lean();
            socketCheckUserData(user, true);
            settingCheck(user);
            minesSendCashoutSocket(io, socket, user, data, callback);
          } catch (err) {
            socketRemoveAntiSpam(socket.decoded._id);
            sendError(err, callback);
          }
        } catch (err) {
          sendError(err, callback);
        }
      } else {
        pleaseLogIn(callback);
      }
    });

    socket.on("disconnect", async () => {
      const identifier = getIdentifier(socket);
      socketRemoveConnectionLimit("mines", identifier);
    });
  });

  // Init mines game
  minesInit(io);
};

function sendError(err, callback) {
  callback({
    success: false,
    error: {
      type: "error",
      message: err.message,
    },
  });
}

function pleaseLogIn(callback) {
  callback({
    success: false,
    error: {
      type: "error",
      message: "You need to sign in to perform this action.",
    },
  });
}
