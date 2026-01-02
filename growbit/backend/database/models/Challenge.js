const mongoose = require("mongoose");
const challengeSchema = new mongoose.Schema(
  {
    startTime: Date,
    endTime: Date,
    reward: Number,
    multiplier: { type: Number, default: 10 },
    minBet: Number,
    game: String,
    description: String,
    colour: String,
    name: String,
    claims: Number,
    remainingClaims: Number,
    claimedBy: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

challengeSchema.path("endTime").index({ expires: 60 * 60 * 24 * 7 });

module.exports = mongoose.model("Challenge", challengeSchema);
