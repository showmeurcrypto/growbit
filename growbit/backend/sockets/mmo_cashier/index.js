const jwt = require("jsonwebtoken");

const User = require("../../database/models/User");
const Ticket = require("../../database/models/Ticket");

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
const {
  sendMessage,
  cancelTicket,
  createTicket,
} = require("../../services/cashier/mmo/cashier_chat");

const depositSocket = (io) => {
  io.of("/mmo_cashier_chat").use(async (socket, next) => {
    try {
      const identifier = getIdentifier(socket);
      await socketCheckConnectionLimit("mmo_cashier", identifier);

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
        next();
      } else {
        next(new Error("Please sign in to perform this action."));
      }
    } catch (err) {
      console.log(err);
      return next(
        new Error("Something went wrong! Please try again in a few seconds."),
      );
    }
  });

  io.of("/mmo_cashier_chat").on("connection", (socket) => {
    const identifier = getIdentifier(socket);
    socketAddConnectionLimit("mmo_cashier", identifier);

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
            await sendMessage(data, user.username);
            io.of("/admin").emit("cashierMessage", {
              message: data.message,
              sender: user.username,
              ticketId: data.ticketId,
            });
            socketRemoveAntiSpam(socket.decoded._id);
            callback({
              success: true,
            });
          } catch (err) {
            socketRemoveAntiSpam(socket.decoded._id);
            callback({
              success: false,
              error: { type: "error", message: err.message },
            });
          }
        } catch (err) {
          handleError(callback, err);
        }
      } else {
        pleaseSignIn(callback);
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

          //TODO: captcha

          try {
            await socketCheckAntiSpam(socket.decoded._id);

            const user = await User.findById(socket.decoded._id)
              .select("rank balance stats limits fair agreed mute ban username")
              .lean();

            socketCheckUserData(user, true, true);
            await validateTicket(data, socket.decoded._id);
            const ticket = await createTicket(data, user);
            io.of("/admin").emit("newTicket", ticket);
            socketRemoveAntiSpam(socket.decoded._id);
            callback({ success: true, ticket: ticket });
          } catch (err) {
            socketRemoveAntiSpam(socket.decoded._id);
            callback({
              success: false,
              error: { type: "error", message: err.message },
            });
          }
        } catch (err) {
          handleError(callback, err);
        }
      } else {
        pleaseSignIn(callback);
      }
    });

    socket.on("cancel", async (data, callback) => {
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
              .select("rank balance stats limits fair agreed mute ban")
              .lean();
            socketCheckUserData(user, true, true);
            await cancelTicket(socket, user, data, callback);
            socketRemoveAntiSpam(socket.decoded._id);
            callback({ success: true });
          } catch (err) {
            socketRemoveAntiSpam(socket.decoded._id);
            callback({
              success: false,
              error: { type: "error", message: err.message },
            });
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
      socketRemoveConnectionLimit("mmo_cashier", identifier);
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

const SUPPORTED_CURRENCIES = ["rs3_gold", "wow_gold"];

async function validateTicket(data, userId) {
  if (!data.currency || !SUPPORTED_CURRENCIES.includes(data.currency)) {
    throw new Error("Invalid Currency!");
  }

  const alreadyOpened = !!(await Ticket.findOne({
    state: "pending",
    userId: userId,
    currency: data.currency,
  }));

  if (alreadyOpened) {
    throw new Error("Ticket has already been created!");
  }

  if (data.transactionType === "deposit") {
    if (!data.currencyAmount) {
      throw new Error("Invalid Amount!");
    }
  } else if (data.transactionType === "withdraw") {
    if (!data.tokenAmount) {
      throw new Error("Invalid Amount!");
    }
  } else {
    throw new Error("Invalid transaction type!");
  }
}

module.exports = depositSocket;
