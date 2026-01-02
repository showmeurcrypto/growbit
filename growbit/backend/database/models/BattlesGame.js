const mongoose = require("mongoose");

const battlesGameSchema = new mongoose.Schema(
  {
    amount: { type: Number },
    playerCount: { type: Number },
    mode: { type: String },
    boxes: [
      {
        box: { type: Object },
        count: { type: Number },
      },
    ],
    options: {
      cursed: { type: Boolean },
      terminal: { type: Boolean },
      private: { type: Boolean },
      affiliateOnly: { type: Boolean },
    },
    fair: {
      seedServer: { type: String },
      hash: { type: String },
      seedPublic: { type: String },
      blockId: { type: String },
    },
    state: { type: String },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

    timestamps: true,
  },
);

// Reverse populate with virtuals
battlesGameSchema.virtual("bets", {
  ref: "BattlesBet",
  localField: "_id",
  foreignField: "game",
  justOne: false,
});

module.exports = mongoose.model("BattlesGame", battlesGameSchema);
