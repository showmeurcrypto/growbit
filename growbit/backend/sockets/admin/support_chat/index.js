// Load database models
const User = require("../../../database/models/User");

// Load middleware
const { rateLimiter } = require("../../../middleware/rateLimiter");

// Load utils
const {
  socketCheckUserData,
  socketCheckUserRank,
  getIdentifier,
} = require("../../../utils/socket");
const {
  sendMessage,
  getAllChats,
  readMessage,
  deleteChat,
} = require("../../../services/support/support_chat");

module.exports = (io, socket) => {
  socket.on("sendSupportChatMessage", async (data, callback) => {
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
        socketCheckUserData(user, true);
        socketCheckUserRank(user, ["admin"]);

        await sendMessage(data.message, "admin", data.userId);
        const supportChatNamespace = io.of("/support_chat");
        supportChatNamespace.to(data.userId).emit("supportChatMessage", {
          message: data.message,
          sender: "admin",
        });
        callback({
          success: true,
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

  socket.on("getSupportChats", async (data, callback) => {
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
        socketCheckUserData(user, true);
        socketCheckUserRank(user, ["admin"]);
        const chats = await getAllChats();
        callback({ success: true, chats: chats });
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

  socket.on("read", async (data, callback) => {
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
        socketCheckUserData(user, true);
        socketCheckUserRank(user, ["admin"]);

        await readMessage("admin", data.userId);

        callback({
          success: true,
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

  socket.on("supportChatDelete", async (data, callback) => {
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
        socketCheckUserData(user, true);
        socketCheckUserRank(user, ["admin"]);

        await deleteChat(data.userId);

        callback({
          success: true,
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
};
