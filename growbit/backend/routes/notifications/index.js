const express = require("express");
const router = express.Router();

const { authorizeUser } = require("../../middleware/auth");
const { rateLimiterMiddleware } = require("../../middleware/rateLimiter");

const {
  getNotificationsForUserId,
  markRead,
} = require("../../services/notifications");

module.exports = () => {
  router.get(
    "/",
    [rateLimiterMiddleware, authorizeUser(true)],
    async (req, res) => {
      try {
        const notifications = await getNotificationsForUserId(req.user._id);
        res.status(200).json({ success: true, notifications: notifications });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    },
  );

  router.post(
    "/read",
    [rateLimiterMiddleware, authorizeUser(true)],
    async (req, res) => {
      try {
        await markRead(req.body.messageId, req.user._id);
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
