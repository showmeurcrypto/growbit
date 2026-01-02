const express = require("express");
const router = express.Router();
const crypto = require("crypto");

// Load database models
const User = require("../../database/models/User");

// Load middleware
const { authorizeUser } = require("../../middleware/auth");
const { rateLimiterMiddleware } = require("../../middleware/rateLimiter");

module.exports = () => {
  router.get(
    "/me",
    [rateLimiterMiddleware, authorizeUser(true)],
    async (req, res) => {
      try {
        let userDatabase = await User.findById(req.user._id)
          .select(
            "local.email +discordToken discordId local.emailVerified ignoreList favouriteSlots username avatar rank balance claimedKeys rewards stats rakeback fair anonymous mute ban verifiedAt updatedAt createdAt",
          )
          .lean();

        if (!userDatabase.discordToken && !userDatabase.discordId) {
          const newDiscordToken = crypto.randomBytes(16).toString("hex");

          await User.findByIdAndUpdate(req.user._id, {
            discordToken: newDiscordToken,
          });

          userDatabase.discordToken = newDiscordToken;
        }

        res.status(200).json({ success: true, user: userDatabase });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    },
  );

  router.use("/credentials", require("./credentials")());

  return router;
};
