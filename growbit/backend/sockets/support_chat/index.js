const jwt = require("jsonwebtoken");

const User = require("../../database/models/User");
const SupportChat = require("../../database/models/SupportChat");

// Load middleware
const { rateLimiter } = require("../../middleware/rateLimiter");

// Load utils
const {
  socketCheckUserData,
  socketCheckConnectionLimit,
  socketAddConnectionLimit,
  socketRemoveConnectionLimit,
  socketCheckAntiSpam,
  socketRemoveAntiSpam,
  getIdentifier,
} = require("../../utils/socket");
const { sendMessage } = require("../../services/support/support_chat");

const supportChatSocket = (io) => {
  io.of("/support_chat").use(async (socket, next) => {
    try {
      const identifier = getIdentifier(socket);
      await socketCheckConnectionLimit("support_chat", identifier);

      if (
        socket.handshake.auth !== undefined &&
        socket.handshake.auth.token !== undefined
      ) {
        try {
          socket.decoded = await jwt.verify(
            socket.handshake.auth.token,
            process.env.TOKEN_SECRET,
          );
          socket.join(socket.decoded._id.toString());
        } catch (err) {
          return next(new Error("Please sign in to perform this action."));
        }

        const chat = await SupportChat.findOne({
          user: socket.decoded._id,
        }).lean();

        socket.emit("init", {
          messages: chat?.messages || [],
        });

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

  io.of("/support_chat").on("connection", (socket) => {
    const identifier = getIdentifier(socket);
    socketAddConnectionLimit("support_chat", identifier);

    socket.on("send", async (data, callback) => {
      if (callback === undefined || typeof callback !== "function") {
        return;
      }
      if (socket.decoded !== undefined && socket.decoded !== null) {
        try {
          const identifier = getIdentifier(socket);
          await rateLimiter.consume(identifier);
          try {
            await socketCheckAntiSpam(socket.decoded._id);
            const user = await User.findById(socket.decoded._id)
              .select("username rank balance stats limits fair agreed mute ban")
              .lean();
            socketCheckUserData(user, true, true);

            // const ticket = await createTicket(data, user);
            // io.of("/admin").emit("newSupportTicket", ticket);

            await sendMessage(
              data.message,
              user.username,
              user._id,
              user.username,
            );
            io.of("/admin").emit("supportChatMessage", {
              message: data.message,
              sender: user.username,
              user: user._id,
            });
            socketRemoveAntiSpam(socket.decoded._id);
            callback({
              success: true,
            });
          } catch (err) {
            socketRemoveAntiSpam(socket.decoded._id);
            handleError(callback, err);
          }
        } catch (err) {
          handleError(callback, err);
        }
      } else {
        pleaseSignIn(callback);
      }
    });

    socket.on("disconnect", () => {
      const identifier = getIdentifier(socket);
      socketRemoveConnectionLimit("support_chat", identifier);
    });
  });
};

function pleaseSignIn(callback) {
  callback({
    success: false,
    error: {
      type: "error",
      message: "Please sign in to perform this action.",
    },
  });
}

function handleError(callback, err) {
  callback({
    success: false,
    error: {
      type: "error",
      message: err.message || "Unexpected error.",
    },
  });
}

module.exports = supportChatSocket;
