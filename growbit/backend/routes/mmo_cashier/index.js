const express = require("express");
const router = express.Router();

const { authorizeUser } = require("../../middleware/auth");
const { rateLimiterMiddleware } = require("../../middleware/rateLimiter");
const Ticket = require("../../database/models/Ticket");
const {
  getExchangeRates,
} = require("../../services/cashier/mmo/exchange_rates_service");

module.exports = () => {
  router.get(
    "/getActiveTickets",
    [rateLimiterMiddleware, authorizeUser(true)],
    async (req, res) => {
      try {
        const activeTickets = await Ticket.find({
          userId: req.user._id,
          state: "pending",
        });
        res.status(200).json({ success: true, tickets: activeTickets });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    },
  );

  router.get(
    "/exchangeRates",
    [rateLimiterMiddleware, authorizeUser(true)],
    async (req, res) => {
      try {
        const exchangeRates = await getExchangeRates();
        res.status(200).json({ success: true, exchangeRates });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    },
  );

  return router;
};
