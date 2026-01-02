const mongoose = require("mongoose");

const slideBetSchema = new mongoose.Schema({
  amount: { type: Number },
  payout: { type: Number },
  multiplier: { type: Number },
  color: { type: String },
  game: { type: mongoose.Schema.ObjectId, ref: "SlideGame" },
  user: { type: mongoose.Schema.ObjectId, ref: "User", index: true },
  stats: {
    balanceBefore: { type: Number, default: 0 },
  },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SlideBet", slideBetSchema);
