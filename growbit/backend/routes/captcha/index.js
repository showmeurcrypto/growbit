const express = require("express");
const router = express.Router();

module.exports = () => {
  // @desc    Handle discord auth callback
  // @route   GET /captcha/iframe
  // @access  Public
  router.get("/iframe", async (req, res) => {
    try {
      res.render("captcha", {
        frontendUrl: process.env.SERVER_FRONTEND_URL.split(",")[0],
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  return router;
};
