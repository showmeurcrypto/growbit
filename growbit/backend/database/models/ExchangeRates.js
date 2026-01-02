const mongoose = require("mongoose");

const exchangeRatesSchema = new mongoose.Schema(
  {
    rates: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ExchangeRate", exchangeRatesSchema);
