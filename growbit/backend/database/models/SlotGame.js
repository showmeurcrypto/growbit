const mongoose = require("mongoose");

const slotGameSchema = new mongoose.Schema(
  {
    game: { type: String },
    gameCode: { type: String },
    amount: { type: Number },
    payout: { type: Number },
    multiplier: { type: Number },
    data: { type: Object },
    txid: { type: String },
    user: { type: mongoose.Schema.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

slotGameSchema.path("createdAt").index({ expires: 60 * 60 * 24 * 10 });

module.exports = mongoose.model("SlotGame", slotGameSchema);
