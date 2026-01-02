const mongoose = require("mongoose");

const exchangeRatesSchema = new mongoose.Schema(
  {
    currency: String,
    dollarToCurrency: Number,
    currencyToDollar: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "InGameCurrencyExchangeRate",
  exchangeRatesSchema,
);
