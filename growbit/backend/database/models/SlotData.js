const mongoose = require("mongoose");

const slotDataSchema = new mongoose.Schema({
  data: { type: Object },
  disabledProviders: { type: Object },
});

module.exports = mongoose.model("SlotData", slotDataSchema);
