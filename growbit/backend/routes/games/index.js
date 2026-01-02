const express = require("express");
const router = express.Router();

const { rateLimiterStrictMiddleware } = require("../../middleware/rateLimiter");
const { getGames, getHomeGames } = require("../../services/games");

module.exports = () => {
  router.get("/", [rateLimiterStrictMiddleware], async (req, res) => {
    try {
      const games = await getGames();
      res.status(200).json({ success: true, games: games });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  router.get("/home", [rateLimiterStrictMiddleware], async (req, res) => {
    try {
      const games = await getHomeGames();
      res.status(200).json({ success: true, games: games });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });
  return router;
};
