const express = require("express");
const router = express.Router();

const { authorizeUser } = require("../../middleware/auth");
const { rateLimiterMiddleware } = require("../../middleware/rateLimiter");
const {
  getFiatRatesDlsBase,
} = require("../../services/cashier/fiat_exchange_rates");

module.exports = () => {
  router.get(
    "/",
    [rateLimiterMiddleware, authorizeUser(true)],
    async (req, res) => {
      try {
        const exchangeRates = await getFiatRatesDlsBase();
        res.status(200).json({ ...exchangeRates });
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
