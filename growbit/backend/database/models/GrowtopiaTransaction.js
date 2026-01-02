const mongoose = require("mongoose");

const growtopiaTransactionSchema = new mongoose.Schema(
  {
    DLSAmount: { type: Number },
    tokenAmount: { type: Number },
    transactionId: { type: String },
    type: { type: String },
    growId: { type: String },
    user: { type: mongoose.Schema.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "GrowtopiaTransaction",
  growtopiaTransactionSchema,
);
