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
  getAllTickets,
} = require("../../../services/cashier/mmo/cashier_chat");

module.exports = (io, socket) => {
  socket.on("sendCashierChatMessage", async (data, callback) => {
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
        await sendMessage(data, "admin");
        const mmoCashierNamespace = io.of("/mmo_cashier_chat");
        mmoCashierNamespace.to(data.receiverId).emit("cashierMessage", {
          message: data.message,
          sender: "admin",
          ticketId: data.ticketId,
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
          message: err.message | "Error.",
        },
      });
    }
  });

  socket.on("getCashierChats", async (data, callback) => {
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
        const tickets = await getAllTickets();
        callback({ success: true, tickets: tickets });
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
          message: err.message | "Error.",
        },
      });
    }
  });
};
