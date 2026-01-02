const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const crypto = require("crypto");
const router = express.Router();

// Load database models
const Token = require("../../../database/models/Token");
const User = require("../../../database/models/User");
const UserSeed = require("../../../database/models/UserSeed");
const Report = require("../../../database/models/Report");

// Load middleware
const { authorizeUser } = require("../../../middleware/auth");
const {
  rateLimiterStrictMiddleware,
} = require("../../../middleware/rateLimiter");

// Load utils
const { captchaCheckData, captchaGetData } = require("../../../utils/captcha");
const { authGenerateJwtToken } = require("../../../utils/auth");
const {
  authCheckLoginData,
  authCheckPostCredentialsUser,
  authCheckPostCredentialsRegisterData,
  authCheckPostCredentialsRegisterUser,
  authCheckResetPasswordData,
  authCheckPostCredentialsRequestData,
  authCheckPostCredentialsRequestUser,
  authCheckPostCredentialsRequestToken,
  authCheckPostCredentialsVerifyData,
  authCheckPostCredentialsVerifyToken,
  authCheckPostCredentialsResetData,
  authCheckPostCredentialsResetToken,
} = require("../../../utils/auth/credentials");
const { logger } = require("../../../utils/logger");
const { getIpFromReq } = require("../../../utils/req");
const {
  sendWelcomeEmail,
  sendResetPassword,
  normalizeGmail,
  emailLimiter,
} = require("../../../utils/email");

module.exports = () => {
  // @desc    Login user
  // @route   POST /auth/credentials
  // @access  Public
  router.post("/", rateLimiterStrictMiddleware, async (req, res) => {
    try {
      // Validate sent data
      authCheckLoginData(req.body);

      // Validate captcha
      const captchaCheck = await captchaGetData(req.body.captcha);
      captchaCheckData(captchaCheck);

      // Get sent email and password
      const email = req.body.email.trim();
      const password = req.body.password.trim();

      // Get user from database

      let userDatabase = await User.findOne({
        $or: [
          { "local.email": email },
          { username: { $regex: `^${email}$`, $options: "i" } },
        ],
      })
        .select("local.email +local.password ips rank")
        .lean();

      // Compare password
      const isMatch = await bcrypt.compare(
        password,
        userDatabase?.local ? userDatabase.local.password : "",
      );

      // Validate user
      authCheckPostCredentialsUser(userDatabase, isMatch);

      // Get user ip address
      const userIp = getIpFromReq(req);

      if (userDatabase.rank !== "admin") {
        userDatabase.ips = userDatabase.ips || [];
        if (!userDatabase.ips.find((ip) => ip.address === userIp)) {
          userDatabase.ips.unshift({ address: userIp });
          if (userDatabase.ips.length > 5) {
            userDatabase.ips.pop();
          }
        }
      }

      userDatabase = await User.findByIdAndUpdate(userDatabase._id, {
        ips: userDatabase.ips,
        updatedAt: new Date().getTime(),
      })
        .select(
          "local.email local.emailVerified  discord.id username avatar rank balance xp vault stats rakeback fair anonymous mute ban verifiedAt updatedAt createdAt",
        )
        .lean();

      // Generate access token
      const accessToken = authGenerateJwtToken(userDatabase._id);

      res
        .status(200)
        .json({ success: true, token: accessToken, user: userDatabase });
    } catch (err) {
      logger.error(err);
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  // @desc    Register user
  // @route   POST /auth/credentials/register
  // @access  Public
  router.post("/register", rateLimiterStrictMiddleware, async (req, res) => {
    let session = null;
    try {
      // Validate sent data
      authCheckPostCredentialsRegisterData(req.body);

      // Validate captcha
      const captchaCheck = await captchaGetData(req.body.captcha);
      captchaCheckData(captchaCheck);

      // Get sent name, email and password
      const username = req.body.username.trim();
      const email = req.body.email.trim();

      const normalizedEmail = normalizeGmail(email);

      let password = req.body.password.trim();

      const userIp = getIpFromReq(req);

      // Get user from database
      const userDatabase = await User.findOne({
        $or: [
          { "local.normalizedEmail": normalizedEmail },
          { username: { $regex: `^${username}$`, $options: "i" } },
          {
            "ips.address": userIp,
          },
        ],
      })
        .select("local username")
        .lean();

      let blockBonuses = authCheckPostCredentialsRegisterUser(
        userDatabase,
        username,
        normalizedEmail,
        userIp,
      );

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      // Generate random user client seeds
      const seedsClient = [
        crypto.randomBytes(8).toString("hex"),
        crypto.randomBytes(8).toString("hex"),
      ];

      // Generate new user server seeds
      const seedsServer = [
        crypto.randomBytes(24).toString("hex"),
        crypto.randomBytes(24).toString("hex"),
      ];

      // Hash new generated user server seeds
      const hashes = [
        crypto.createHash("sha256").update(seedsServer[0]).digest("hex"),
        crypto.createHash("sha256").update(seedsServer[1]).digest("hex"),
      ];

      // Get user ip address

      const userId = new mongoose.Types.ObjectId();

      let avatarNum = 1 + Math.round(Math.random() * 9);

      let referrer = null;
      let startingBalance = 0;
      let limit = 0;
      if (req.body.code && !blockBonuses) {
        const code = req.body.code.trim();
        if (code) {
          referrer = await User.findOne({
            "affiliates.code": { $regex: `^${code}$`, $options: "i" },
          })
            .select("affiliates rank")
            .exec();

          if (!referrer) {
            logger.error("Invalid affiliate code:", code);

            return res.status(500).json({
              success: false,
              error: { type: "error", message: "Invalid code" },
            });
          } else {
            startingBalance = 0.2;
            limit = startingBalance * 5;
          }
        }
      }

      session = await mongoose.startSession();
      session.startTransaction();

      const discordToken = crypto.randomBytes(16).toString("hex");

      let actions = [
        User.create({
          _id: userId,
          username: username,
          discordToken: discordToken,
          local: {
            email: req.body.email,
            password: password,
            normalizedEmail: normalizedEmail,
          },
          // rakeback: {
          //   daily: {
          //     earned: 0.00,
          //     available: 0.00,
          //     lastClaimed: null
          //   },
          //   weekly: {
          //     earned: 0.00,
          //     available: 0.00,
          //     lastClaimed: null
          //   },
          //   monthly: {
          //     earned: 0.00,
          //     available: 0.00,
          //     lastClaimed: null
          //   }
          // },
          limits: {
            betToWithdraw: limit,
            blockPromo: blockBonuses,
          },
          balance: startingBalance,
          affiliates: {
            referrer: referrer?._id,
          },
          ips: [{ address: userIp }],
          avatar: avatarNum,
          // avatar: `${avatarNum}.png`
        }),
        Report.findOneAndUpdate(
          { createdAt: new Date().toISOString().slice(0, 10) },
          {
            $inc: {
              "stats.total.user": 1,
            },
          },
          { upsert: true },
        ),
        UserSeed.create({
          seedClient: seedsClient[0],
          seedServer: seedsServer[0],
          hash: hashes[0],
          nonce: 1,
          user: userId,
          state: "active",
        }),
        UserSeed.create({
          seedClient: seedsClient[1],
          seedServer: seedsServer[1],
          hash: hashes[1],
          nonce: 1,
          user: userId,
          state: "created",
        }),
      ];

      if (referrer) {
        actions.push(
          User.findByIdAndUpdate(referrer._id, {
            $inc: {
              "affiliates.referred": 1,
            },
          }).exec(),
        );
      }

      let dataDatabase = await Promise.all(actions);

      // Convert user object to javascript object
      let user = dataDatabase[0].toObject();

      // Sanitze user object
      delete user.local.password;

      const verifyToken = crypto.randomBytes(16).toString("hex");
      const token = await Token.create({
        type: "verify",
        user: user._id,
        token: verifyToken,
      });

      try {
        await sendWelcomeEmail(user, verifyToken);
      } catch (e) {}

      // Generate access token
      const accessToken = authGenerateJwtToken(user._id);

      await session.commitTransaction();
      await session.endSession();

      res.status(200).json({ success: true, token: accessToken, user: user });
    } catch (err) {
      logger.error(err);

      if (session) {
        await session.abortTransaction();
      }
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  router.post(
    "/change",
    [rateLimiterStrictMiddleware, authorizeUser(true)],
    async (req, res) => {
      try {
        authCheckResetPasswordData(req.body);

        let password = req.body.password.trim();

        let userId = req.user._id;

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        // Update user in database
        await User.findByIdAndUpdate(
          userId,
          {
            $set: {
              "local.password": password,
            },
          },
          { new: true },
        )
          .select("local.email local.emailVerified")
          .lean();
        res.status(200).json({ success: true });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    },
  );

  router.post("/reset", rateLimiterStrictMiddleware, async (req, res) => {
    try {
      logger.info(`ResetPass user:${req.body.userId} token:${req.body.token} `);

      authCheckPostCredentialsResetData(req.body);

      const captchaCheck = await captchaGetData(req.body.captcha);
      captchaCheckData(captchaCheck);

      const tokenDatabase = await Token.findOne({
        token: req.body.token.trim(),
        type: "reset",
        user: req.body.userId,
      })
        .select("token type user updatedAt")
        .lean();

      authCheckPostCredentialsResetToken(tokenDatabase);

      let password = req.body.password.trim();

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      await Promise.all([
        Token.findByIdAndDelete(tokenDatabase._id),
        User.findByIdAndUpdate(
          tokenDatabase.user,
          { "local.password": password },
          {},
        ),
      ]);

      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  // @desc    Request verify user or reset password email
  // @route   POST /auth/credentials/request
  // @access  Public
  router.post("/request", rateLimiterStrictMiddleware, async (req, res) => {
    try {
      // Validate sent data
      authCheckPostCredentialsRequestData(req.body);

      // Get user from the database
      const userDatabase = await User.findOne({ "local.email": req.body.email })
        .select("local lastEmail username")
        .lean();

      // Validate user
      authCheckPostCredentialsRequestUser(userDatabase, req.body);

      emailLimiter(userDatabase);

      // Get token from the database
      const tokenDatabase = await Token.findOne({
        type: req.body.type,
        user: userDatabase._id,
      })
        .select("type user updatedAt token")
        .lean();

      let token = null;

      if (tokenDatabase) {
        token = tokenDatabase.token;
      } else {
        // Create a new token
        token = crypto.randomBytes(16).toString("hex");

        // Create or update token in the database
        await Token.findOneAndUpdate(
          { type: req.body.type, user: userDatabase._id },
          { token: token, updatedAt: new Date() },
          { upsert: true },
        );
      }

      try {
        if (req.body.type === "verify") {
          await sendWelcomeEmail(userDatabase, token);
        } else {
          await sendResetPassword(userDatabase, token);
        }
      } catch (e) {
        return res.status(500).json({
          success: false,
          error: {
            type: "error",
            message: "Error sending email. Try again in a few minutes!",
          },
        });
      }

      await User.updateOne(
        { "local.email": req.body.email },
        { lastEmail: new Date() },
      ).exec();

      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  // @desc    Verify user email
  // @route   POST /auth/credentials/verify
  // @access  Public
  router.post("/verify", rateLimiterStrictMiddleware, async (req, res) => {
    try {
      // Validate sent data

      logger.info(`Verify user:${req.body.userId} token:${req.body.token} `);

      authCheckPostCredentialsVerifyData(req.body);

      // Get token from database
      const tokenDatabase = await Token.findOne({
        token: req.body.token.trim(),
        type: "verify",
        user: req.body.userId,
      })
        .select("token type user updatedAt")
        .populate("user")
        .lean();

      // Validate token
      authCheckPostCredentialsVerifyToken(tokenDatabase);

      // Delete token and update user in the database
      await Promise.all([
        Token.findByIdAndDelete(tokenDatabase._id),
        User.findByIdAndUpdate(
          tokenDatabase.user._id,
          { "local.emailVerified": true },
          {},
        ),
      ]);

      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  });

  return router;
};
