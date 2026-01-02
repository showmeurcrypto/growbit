const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String },
    reward: { type: Number },
    minWager: { type: Number },
    redeemers: [
      {
        user: { type: mongoose.Schema.ObjectId, ref: "User" },
      },
    ],
    ips: [{ type: String }],
    redeemptionsTotal: { type: Number, default: 0 },
    redeemptionsMax: { type: Number },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PromoCode", promoCodeSchema);
