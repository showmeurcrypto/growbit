const express = require("express");
const router = express.Router();

const { authorizeUser } = require("../../middleware/auth");
const { gameRateLimiterMiddleware } = require("../../middleware/rateLimiter");
const { play } = require("../../services/dice");
const User = require("../../database/models/User");
const {
  socketCheckAntiSpam,
  socketRemoveAntiSpam,
  checkVerified,
} = require("../../utils/socket");

const DICE_MIN_AMOUNT = process.env.DICE_MIN_AMOUNT || 0.01;

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
        let mode = req.body.mode || "under";
        const target = Math.floor(+req.body.target);
        const target2 = Math.floor(+req.body.target2);
        const betAmount = +req.body.amount;

        validateParams(betAmount, mode, target, target2);

        const user = await User.findById(req.user._id)
          .select(
            "rank balance local.emailVerified stats limits fair username mute ban affiliates",
          )
          .lean();

        checkVerified(user);

        checkBalance(user, betAmount);

        const { roll, win } = await play(
          user,
          target,
          target2,
          mode,
          betAmount,
          io,
        );

        socketRemoveAntiSpam(userId);
        res.status(200).json({ success: true, roll: roll, win: win });
      } catch (err) {
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

function validateParams(amount, mode, target, target2) {
  if (!amount || isNaN(amount)) {
    throw new Error("Invalid Amount");
  }

  if (amount < DICE_MIN_AMOUNT) {
    throw new Error(
      `You need to bet at least ${parseFloat(DICE_MIN_AMOUNT).toFixed(2)} DLS.`,
    );
  }

  if (!target || isNaN(target)) {
    throw new Error("Invalid Target");
  }
  if (target < 2 || target > 98) {
    throw new Error("Invalid Target");
  }

  if (mode === "between" || mode === "outside") {
    if (!target2 || isNaN(target2)) {
      throw new Error("Invalid Target");
    }

    if (target < 4 || target2 > 98) {
      throw new Error("Invalid Target");
    }

    // Number range must be greater than 1
    if (target2 - target <= 1) {
      throw new Error("Invalid Range");
    }
  }
}

function checkBalance(user, betAmount) {
  if (!user) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (user.balance < betAmount) {
    throw new Error("You have not enough balance for this action.");
  }
}
