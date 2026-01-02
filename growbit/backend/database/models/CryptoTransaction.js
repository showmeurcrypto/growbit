const mongoose = require("mongoose");

const cryptoTransactionSchema = new mongoose.Schema(
  {
    amount: { type: Number },
    data: {
      providerId: { type: String },
      transaction: { type: String },
      sender: { type: String },
      receiver: { type: String },
      currency: { type: String },
      cryptoAmount: { type: Number },
      fee: { type: Number },
    },
    type: { type: String },
    user: { type: mongoose.Schema.ObjectId, ref: "User" },
    state: { type: String },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("CryptoTransaction", cryptoTransactionSchema);
