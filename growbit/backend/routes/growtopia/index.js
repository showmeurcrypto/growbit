const express = require("express");
const router = express.Router();
const { rateLimiterMiddleware } = require("../../middleware/rateLimiter");
const GrowtopiaTransaction = require("../../database/models/GrowtopiaTransaction");
const User = require("../../database/models/User");
const Report = require("../../database/models/Report");

const { authorizeUser, authorizeAdmin } = require("../../middleware/auth");
const InGameCurrencyExchangeRate = require("../../database/models/InGameCurrencyExchangeRate");
const {
  GROWTOPIA_CURRENCY,
  invalidateCache,
} = require("../../services/cashier/growtopia/currency_service");
const {
  getFiatRatesDlsBase,
} = require("../../services/cashier/fiat_exchange_rates");

API_KEY = "FMUD18zMPG3mmd71tM1B6EHv6RHImvlCbkHaf604AF1PMQTWRBQsQfPptUlKTNO6";

module.exports = (io) => {
  router.get("/balance", [rateLimiterMiddleware], async (req, res) => {
    try {
      const key = req.query?.key;

      if (!key || key !== API_KEY) {
        return res.status(403).json({
          success: false,
          error: { type: "error", message: "Forbidden!" },
        });
      }

      const result = await User.aggregate([
        {
          $match: {
            rank: { $nin: ["admin", "streamer"] },
          },
        },
        {
          $group: {
            _id: null,
            totalBalance: { $sum: "$balance" },
          },
        },
      ]);

      const totalBalance = result[0]?.totalBalance || 0;

      res.status(200).json({ success: true, totalBalance });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  router.get(
    "/rates",
    [rateLimiterMiddleware, authorizeUser(true)],
    async (req, res) => {
      try {
        const rate = await InGameCurrencyExchangeRate.findOne({
          currency: GROWTOPIA_CURRENCY,
        }).lean();
        res.status(200).json({ success: true, rate: rate });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    },
  );

  router.post(
    "/rates",
    [rateLimiterMiddleware, authorizeUser(true), authorizeAdmin],
    async (req, res) => {
      //const currencyToDollar = req.body.currencyToDollar;
      const dollarToCurrency = req.body.dollarToCurrency;

      if (typeof dollarToCurrency !== "number" || dollarToCurrency <= 0) {
        return res.status(400).json({
          error: "Invalid input: dollarToCurrency must be positive numbers.",
        });
      }

      try {
        const currentRates = await InGameCurrencyExchangeRate.findOne({
          currency: GROWTOPIA_CURRENCY,
        });

        if (!currentRates) {
          return res.status(404).json({
            error: "Current rates not found.",
          });
        }

        const currencyToDollar = 1 / dollarToCurrency;

        const currentDollarToCurrency = currentRates.dollarToCurrency;

        const dollarToCurrencyChange =
          Math.abs(dollarToCurrency - currentDollarToCurrency) /
          currentDollarToCurrency;

        if (dollarToCurrencyChange > 0.15) {
          return res.status(400).json({
            success: false,
            error: {
              type: "error",
              message:
                "Invalid input: Change in exchange rates exceeds the allowed 15%.",
            },
          });
        }

        await InGameCurrencyExchangeRate.findOneAndUpdate(
          { currency: GROWTOPIA_CURRENCY },
          {
            currencyToDollar: currencyToDollar,
            dollarToCurrency: dollarToCurrency,
          },
        );

        invalidateCache();

        const exchangeRates = await getFiatRatesDlsBase();

        io.of("/general").emit("updateExchangeRates", { rates: exchangeRates });

        res.status(200).json({ success: true });
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
