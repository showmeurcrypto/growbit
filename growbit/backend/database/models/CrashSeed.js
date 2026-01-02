const mongoose = require("mongoose");

const crashSeedSchema = new mongoose.Schema({
  seedServer: { type: String },
  previousHash: { type: String },
  index: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CrashSeed", crashSeedSchema);
