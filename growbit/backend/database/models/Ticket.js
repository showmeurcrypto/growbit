const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User" },
    state: String,
    name: String,
    userRead: Boolean,
    supportRead: Boolean,
    currency: String,
    approvedBy: String,
    tokenAmount: Number,
    transactionType: String,
    currencyAmount: Number,
    messages: [
      {
        sender: String,
        message: String,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ticket", ticketSchema);
