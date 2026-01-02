const express = require("express");
const router = express.Router();

const CryptoTransaction = require("../../database/models/CryptoTransaction");
const GrowtopiaTransaction = require("../../database/models/GrowtopiaTransaction");
const User = require("../../database/models/User");

const { authorizeUser, authorizeAdmin } = require("../../middleware/auth");
const { rateLimiterMiddleware } = require("../../middleware/rateLimiter");
const { validateRequest } = require("../../utils/challenges");
const { createChallenge } = require("../../services/challenges");
const { getFilesFromDisk, readLogFile } = require("../../services/logReader");

const { logger } = require("../../utils/logger");

module.exports = () => {
  // router.put(
  //   "/createTransaction",
  //   [rateLimiterMiddleware, authorizeUser(true), authorizeAdmin],
  //   async (req, res) => {
  //     try {
  //       const { type, userId, transactionData } = req.body;

  //       let dlsAmount = +transactionData.DLSAmount;

  //       if (!type || !userId || !transactionData || !dlsAmount) {
  //         return res
  //           .status(400)
  //           .json({ success: false, message: "Missing required fields" });
  //       }

  //       if (type !== "crypto" && type !== "growtopia") {
  //         return res
  //           .status(400)
  //           .json({ success: false, message: "Invalid transaction type" });
  //       }

  //       const user = await User.findById(userId);
  //       if (!user) {
  //         return res
  //           .status(400)
  //           .json({ success: false, message: "User not found" });
  //       }

  //       let transaction;

  //       if (type === "crypto") {
  //         transaction = new CryptoTransaction({
  //           amount: dlsAmount,
  //           data: {
  //             providerId: transactionData.providerId,
  //             transaction: transactionData.transaction,
  //             sender: transactionData.sender,
  //             receiver: transactionData.receiver,
  //             currency: transactionData.currency,
  //             cryptoAmount: transactionData.cryptoAmount,
  //             fee: transactionData.fee,
  //           },
  //           type: transactionData.type,
  //           user: userId,
  //           state: "pending",
  //         });
  //       } else if (type === "growtopia") {
  //         transaction = new GrowtopiaTransaction({
  //           DLSAmount: dlsAmount,
  //           tokenAmount: dlsAmount,
  //           transactionId: transactionData.transactionId,
  //           type: transactionData.type,
  //           growId: transactionData.growId,
  //           user: userId,
  //         });
  //       } else {
  //         return res
  //           .status(400)
  //           .json({ success: false, message: "Invalid transaction type" });
  //       }

  //       await transaction.save();

  //       if (transactionData.type == "deposit") {
  //         await User.findByIdAndUpdate(user._id, {
  //           $inc: {
  //             balance: amount,
  //             "limits.betToWithdraw": amount,
  //           },
  //         });
  //       } else if (transactionData.type == "withdraw") {
  //         await User.findByIdAndUpdate(user._id, {
  //           $inc: {
  //             balance: -amount,
  //           },
  //         });
  //       }

  //       res.status(200).json({ success: true });
  //     } catch (error) {
  //       res.status(500).json({
  //         success: false,
  //         error: { type: "error", message: err.message },
  //       });
  //     }
  //   },
  // );

  router.get(
    "/logs",
    [rateLimiterMiddleware, authorizeUser(true), authorizeAdmin],
    async (req, res) => {
      try {
        const files = await getFilesFromDisk();
        res.json({ files });
      } catch (error) {
        res.status(500).json({ error: "Error fetching file list: " + error });
      }
    },
  );

  // API Endpoint to tail and search a log file
  router.get(
    "/logs/read",
    [rateLimiterMiddleware, authorizeUser(true), authorizeAdmin],
    async (req, res) => {
      const { fileName, limit, search } = req.query;

      if (!fileName) {
        return res
          .status(400)
          .json({ error: "fileName query parameter is required" });
      }

      try {
        const logs = (await readLogFile(fileName, limit, search)) || [];
        res.json({ logs });
      } catch (error) {
        res.status(500).json({ error: "Error reading log file: " + error });
      }
    },
  );

  return router;
};
