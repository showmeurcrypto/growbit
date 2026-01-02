const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  winners: [
    {
      prize: { type: Number },
      points: { type: Number },
      user: { type: mongoose.Schema.ObjectId, ref: "User" },
    },
  ],
  duration: { type: Number },
  rewards: { type: Number },
  name: { type: String },
  description: { type: String },
  type: { type: String },
  state: { type: String },
  updatedAt: { type: Date, default: Date.now },
  endsAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
