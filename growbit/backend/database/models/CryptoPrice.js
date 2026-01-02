const mongoose = require("mongoose");

const cryptoPriceSchema = new mongoose.Schema({
  name: { type: String },
  price: { type: Number },
  info: { type: Object },
});

module.exports = mongoose.model("CryptoPrice", cryptoPriceSchema);
