const express = require("express");
const { authorizeUser, authorizeAdmin } = require("../../middleware/auth");
const router = express.Router();
const User = require("../../database/models/User");

const { rateLimiterMiddleware } = require("../../middleware/rateLimiter");
const { getUrl, createPlayer } = require("../../services/slots/spinac");

const { socketCheckUserData, checkVerified } = require("../../utils/socket");
const {
  SUPPORTED_FIAT,
} = require("../../services/cashier/fiat_exchange_rates");
const {
  toggleProviderDisable,
  getProviders,
} = require("../../services/slots/slot_data");
const { logger } = require("../../utils/logger");

module.exports = (io) => {
  router.post(
    "/launch",
    [rateLimiterMiddleware, authorizeUser(true)],
    async (req, res) => {
      try {
        const { provider_code, game_code, game_type, user_code, demo } =
          req.body;

        const user = await User.findOne({ _id: req.user._id });

        socketCheckUserData(user, true);
        checkVerified(user);

        let currency = req.body.currency || "USD";
        if (!SUPPORTED_FIAT.includes(currency)) {
          throw Error("Unsupported currency" + currency);
        }

        if (user.username === user_code) {
          const valid = await createPlayer(user, currency);
          if (valid) {
            const url = await getUrl(
              provider_code,
              game_code,
              user,
              demo,
              currency,
            );
            res.status(200).json({ success: true, url: url });
          }
        }
      } catch (err) {
        logger.error(err);
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    },
  );

  router.get(
    "/disabled-providers",
    [rateLimiterMiddleware, authorizeUser(true), authorizeAdmin],
    async (req, res) => {
      try {
        let providers = getProviders();

        res.status(200).json({
          success: true,
          disabledProviders: providers.disabledProviders,
          allProviders: providers.allProviders,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    },
  );

  router.post(
    "/toggle-provider",
    [rateLimiterMiddleware, authorizeUser(true), authorizeAdmin],
    async (req, res) => {
      try {
        const { provider } = req.body;

        let newState = toggleProviderDisable(provider);

        res.status(200).json({ success: true, disabledProviders: newState });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    },
  );

  router.post(
    "/notify",
    [rateLimiterMiddleware, authorizeUser(true), authorizeAdmin],
    async (req, res) => {
      try {
        io.of("general").emit("slotProvidersChange", {});

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
