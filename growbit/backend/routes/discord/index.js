const express = require("express");
const router = express.Router();
const { rateLimiterMiddleware } = require("../../middleware/rateLimiter");
const User = require("../../database/models/User");
const Token = require("../../database/models/Token");

const { authorizeUser, authorizeAdmin } = require("../../middleware/auth");

API_KEY = "FMUD18zMPG3mmd71tM1B6EHv6RHImvlCbkHaf604AF1PMQTWRBQsQfPptUlKTNO6";

module.exports = (io) => {
  router.post("/link", [rateLimiterMiddleware], async (req, res) => {
    try {
      const { key, token, discordId } = req.body;

      if (!key || key !== API_KEY) {
        return res.status(403).json({
          success: false,
          error: { type: "error", message: "Forbidden!" },
        });
      }

      const user = await User.findOne({ discordToken: token }).select(
        "+discordToken discordId",
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { type: "error", message: "Invalid token!" },
        });
      }

      if (user.discordId) {
        return res.status(400).json({
          success: false,
          error: { type: "error", message: "Account already linked!" },
        });
      }

      user.discordId = discordId;
      user.discordToken = null;
      await user.save();

      io.of("/general")
        .to(user._id.toString())
        .emit("user", { user: user.toObject() });

      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  router.get("/user", [rateLimiterMiddleware], async (req, res) => {
    try {
      const key = req.query?.key;
      const username = req.query?.username?.trim();
      if (!username) {
        return res.status(400).json({
          success: false,
          error: { type: "error", message: "Username is required!" },
        });
      }

      if (!key || key !== API_KEY) {
        return res.status(403).json({
          success: false,
          error: { type: "error", message: "Forbidden!" },
        });
      }

      let user = await User.findOne({
        username: { $regex: `^${username}$`, $options: "i" },
      })
        .select(
          "-local.password -local.normalizedEmail -vault -avatar -favouriteSlots -ignoreList",
        )
        .lean();

      res.status(200).json({ success: true, user });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  return router;
};
