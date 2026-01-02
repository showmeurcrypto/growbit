const express = require("express");
const router = express.Router();

const Challenge = require("../../database/models/Challenge");

const { authorizeUser, authorizeAdmin } = require("../../middleware/auth");
const { rateLimiterMiddleware } = require("../../middleware/rateLimiter");
const { validateRequest } = require("../../utils/challenges");
const { createChallenge } = require("../../services/challenges");
const { logger } = require("../../utils/logger");

module.exports = () => {
  router.get("/active", [rateLimiterMiddleware], async (req, res) => {
    try {
      const challenges = await Challenge.find({
        startTime: { $lte: new Date() },
        endTime: { $gte: new Date() },
      })
        .lean()
        .exec();
      res.status(200).json({ success: true, challenges: challenges });
    } catch (err) {
      logger.error(err);
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  router.get("/", [rateLimiterMiddleware], async (req, res) => {
    try {
      const challenges = await Challenge.find().lean().exec();
      res.status(200).json({ success: true, challenges: challenges });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  router.get("/ended", [rateLimiterMiddleware], async (req, res) => {
    try {
      const challenges = await Challenge.find({
        endTime: { $lte: new Date() },
      }).limit(10);
      res.status(200).json({ success: true, challenges: challenges });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  router.get(
    "/upcoming",
    [rateLimiterMiddleware, authorizeUser(true), authorizeAdmin],
    async (req, res) => {
      try {
        const challenges = await Challenge.find({
          endTime: { $gte: new Date() },
        }).sort({ startTime: 1 });
        res.status(200).json({ success: true, challenges: challenges });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    },
  );

  router.post(
    "/create",
    [rateLimiterMiddleware, authorizeUser(true), authorizeAdmin],
    async (req, res) => {
      try {
        validateRequest(req);

        await createChallenge(req.body);

        res.status(200).json({ success: true });
      } catch (err) {
        logger.error(err);
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    },
  );

  router.delete(
    "/:id",
    [rateLimiterMiddleware, authorizeUser(true), authorizeAdmin],
    async (req, res) => {
      try {
        const id = req.params.id;

        await Challenge.deleteOne({ _id: id }).exec();

        res.status(200).json({ success: true });
      } catch (err) {
        logger.error(err);
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    },
  );

  return router;
};
