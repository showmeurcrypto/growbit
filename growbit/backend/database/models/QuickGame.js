const mongoose = require("mongoose");

const quickGameSchema = new mongoose.Schema(
  {
    game: { type: String },
    amount: { type: Number },
    payout: { type: Number },
    multiplier: { type: Number },
    data: { type: Object },
    fair: {
      nonce: { type: Number },
      seed: { type: mongoose.Schema.ObjectId, ref: "UserSeed" },
    },
    user: { type: mongoose.Schema.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

quickGameSchema.path("createdAt").index({ expires: 60 * 60 * 24 * 30 });

module.exports = mongoose.model("QuickGame", quickGameSchema);
