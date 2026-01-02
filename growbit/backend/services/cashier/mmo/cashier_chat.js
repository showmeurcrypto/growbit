const Ticket = require("../../../database/models/Ticket");
const { toDollar, toMmoCurrency } = require("./exchange_rates_service");
const axios = require("axios");

const DISCORD_WEBHOOK_URL = process.env.MMO_CASHIER_DISCORD_WEBHOOK_URL;
const notifyDiscord = async (username, content) => {
  if (DISCORD_WEBHOOK_URL) {
    try {
      await axios.post(DISCORD_WEBHOOK_URL, { username, content });
    } catch (error) {
      console.error("Error sending webhook:", error);
    }
  }
};

async function sendMessage(data, sender) {
  await Ticket.findOneAndUpdate(
    { _id: data.ticketId },
    {
      $push: {
        messages: {
          message: data.message,
          sender: sender,
        },
      },
    },
    { new: true },
  );
}

async function getAllTickets() {
  return Ticket.find({ state: "pending" }).limit(20);
}

const cancelTicket = async (data, user) => {
  await Ticket.deleteOne({
    userId: user._id,
    ticketId: data.ticketId,
    state: "pending",
  });
};

async function createTicket(data, user) {
  const transactionType = data.transactionType;

  notifyDiscord(
    transactionType + " request",
    `User Id : ${user.username}\nCurrency: ${data.currency}`,
  );

  if (transactionType === "deposit") {
    const currencyAmount = +data.currencyAmount;

    const dollars = await toDollar(currencyAmount, data.currency);

    return await Ticket.create({
      transactionType: user.transactionType,
      user: user._id,
      state: "pending",
      name: user.username,
      currency: data.currency,
      currencyAmount: currencyAmount,
      tokenAmount: dollars,
    });
  } else {
    const dollars = +data.tokenAmount;
    const gold = toMmoCurrency(dollars, data.currency);
    return await Ticket.create({
      transactionType: user.transactionType,
      user: user._id,
      state: "pending",
      name: user.username,
      currency: data.currency,
      currencyAmount: gold,
      tokenAmount: dollars,
    });
  }
}

module.exports = {
  sendMessage,
  getAllTickets,
  cancelTicket,
  createTicket,
};
