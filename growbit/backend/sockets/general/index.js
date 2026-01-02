const jwt = require("jsonwebtoken");

// Load utils
const {
  socketCheckConnectionLimit,
  socketAddConnectionLimit,
  socketRemoveConnectionLimit,
  getIdentifier,
} = require("../../utils/socket");
const { settingGet } = require("../../utils/setting");
const { generalGetChatOnlineCount } = require("../../utils/general/chat");

// Load controllers
const { generalBetsInit } = require("../../services/general/bets");
const { generalChatInit } = require("../../services/general/chat");

module.exports = (io) => {
  io.of("/general").use(async (socket, next) => {
    try {
      const identifier = getIdentifier(socket);
      await socketCheckConnectionLimit("general", identifier);

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

      socket.emit("init", {
        settings: settingGet(),
        online: 0,
        time: new Date().getTime(),
      });
      next();
    } catch (err) {
      return next({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  io.of("/general").on("connection", (socket) => {
    const identifier = getIdentifier(socket);
    socketAddConnectionLimit("general", identifier);

    require("./bets")(io, socket);
    require("./chat")(io, socket);
    require("./user")(io, socket);
    require("./affiliate")(io, socket);
    require("./rewards")(io, socket);
    require("./promo")(io, socket);
    require("./leaderboard")(io, socket);

    socket.on("disconnect", async () => {
      const identifier = getIdentifier(socket);
      socketRemoveConnectionLimit("general", identifier);
    });
  });

  // Init chat
  setTimeout(() => {
    generalChatInit(io);
  }, 3000);

  // Init bets
  generalBetsInit();
};
