const express = require("express");
const router = express.Router();
const { settingCheck } = require("../../utils/setting");

const { authorizeUser } = require("../../middleware/auth");
const { gameRateLimiterMiddleware } = require("../../middleware/rateLimiter");
const { play } = require("../../services/reme");
const User = require("../../database/models/User");
const {
  socketCheckAntiSpam,
  socketRemoveAntiSpam,
  checkVerified,
} = require("../../utils/socket");

const REME_MIN_AMOUNT = process.env.REME_MIN_AMOUNT || 0.01;

module.exports = (io) => {
  router.post(
    "/roll",
    [gameRateLimiterMiddleware, authorizeUser(true)],
    async (req, res) => {
      let userId;

      try {
        userId = req.user._id.toString();
        await socketCheckAntiSpam(userId);
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }

      try {
        settingCheck(req.user, "games.reme.enabled");

        const betAmount = +req.body.amount;
        const autobet = req.body.autobet;

        validateParams(betAmount);

        const user = await User.findById(req.user._id)
          .select(
            "rank balance local.emailVerified stats limits fair username mute ban affiliates",
          )
          .lean();

        checkVerified(user);

        checkBalance(user, betAmount);

        const { rolls, multiplier } = await play(user, betAmount, io, autobet);

        socketRemoveAntiSpam(userId);
        res
          .status(200)
          .json({ success: true, rolls: rolls, multiplier: multiplier });
      } catch (err) {
        console.error(err);
        socketRemoveAntiSpam(userId);
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    },
  );

  return router;
};

function validateParams(amount) {
  if (!amount || isNaN(amount)) {
    throw new Error("Invalid Amount");
  }

  if (amount < REME_MIN_AMOUNT) {
    throw new Error(
      `You need to bet at least ${parseFloat(REME_MIN_AMOUNT).toFixed(2)} DLS.`,
    );
  }
}

function checkBalance(user, betAmount) {
  if (!user) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (user.balance < betAmount) {
    throw new Error("You have not enough balance for this action.");
  }
}
