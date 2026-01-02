const mongoose = require("mongoose");

const coinflipGameSchema = new mongoose.Schema({
  amount: { type: Number },
  payout: { type: Number },
  multiplier: { type: Number },
  fair: {
    seedServer: { type: String },
    seedPublic: { type: String },
    blockNum: { type: String },
    hash: { type: String },
  },
  side: { type: String },
  pick: { type: String },
  winner: { type: mongoose.Schema.ObjectId, ref: "User" },
  author: { type: mongoose.Schema.ObjectId, ref: "User" },
  secondPlayer: { type: mongoose.Schema.ObjectId, ref: "User" },
  bot: { type: Boolean },
  state: { type: String },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CoinflipGame", coinflipGameSchema);
