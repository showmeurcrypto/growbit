const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  stats: {
    total: {
      user: { type: Number, default: 0 },
      deposit: { type: Number, default: 0 },
      newDepositors: { type: Number, default: 0 },
      withdraw: { type: Number, default: 0 },
      bet: { type: Number, default: 0 },
      won: { type: Number, default: 0 },
    },
    games: {
      crash: {
        bet: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
      },
      mines: {
        bet: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
      },
      plinko: {
        bet: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
      },
      slide: {
        bet: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
      },
      dice: {
        bet: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
      },
      keno: {
        bet: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
      },
      coinflip: {
        bet: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
      },
      slots: {
        bet: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
      },
      cases: {
        bet: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
      },
      reme: {
        bet: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
      },
      towers: {
        bet: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
      },
    },
    crypto: {
      deposit: { type: Number, default: 0 },
      withdraw: { type: Number, default: 0 },
    },
    // mmo: {
    //   deposit: { type: Number, default: 0 },
    //   withdraw: { type: Number, default: 0 },
    // },
    growtopia: {
      deposit: { type: Number, default: 0 },
      withdraw: { type: Number, default: 0 },
    },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);
