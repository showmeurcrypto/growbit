// Load database models
const User = require("../../../database/models/User");

// Load middleware
const { rateLimiter } = require("../../../middleware/rateLimiter");

// Load utils
const {
  socketCheckUserData,
  socketCheckAntiSpam,
  socketRemoveAntiSpam,
  getIdentifier,
} = require("../../../utils/socket");
const { settingCheck } = require("../../../utils/setting");

// Load controllers
const {
  setAffiliateCode,
  claimAffiliateEarnings,
  getAffiliateLevel,
  getAffiliateList,
} = require("../../../services/general/affiliate");

module.exports = (io, socket) => {
  socket.on("getAffiliateData", async (data, callback) => {
    if (callback === undefined || typeof callback !== "function") {
      return;
    }
    try {
      const identifier = getIdentifier(socket);
      await rateLimiter.consume(identifier);
      try {
        let user = null;
        if (socket.decoded !== undefined && socket.decoded !== null) {
          user = await User.findById(socket.decoded._id)
            .select("username avatar rank affiliates agreed mute ban")
            .lean();
        }
        socketCheckUserData(user, true);
        settingCheck(user);

        const levelInfo = getAffiliateLevel(user);

        const affiliateList = (await getAffiliateList(user._id)).map((u) => ({
          username: u.username,
          joined: u.createdAt,
          wager: u.stats.bet,
          generated: u.affiliates.generated * levelInfo.commission,
        }));

        let canClaim = user.affiliates.available * levelInfo.commission;

        callback({
          success: true,
          data: {
            ...user?.affiliates,
            level: levelInfo.level,
            canClaim,
            affiliateList,
          },
        });
      } catch (err) {
        callback({
          success: false,
          error: { type: "error", message: err.message },
        });
      }
    } catch (err) {
      callback({
        success: false,
        error: {
          type: "error",
          message: err.message,
        },
      });
    }
  });

  socket.on("setAffiliateCode", async (data, callback) => {
    if (callback === undefined || typeof callback !== "function") {
      return;
    }
    if (socket.decoded !== undefined && socket.decoded !== null) {
      try {
        const identifier = getIdentifier(socket);
        await rateLimiter.consume(identifier);
        await socketCheckAntiSpam(socket.decoded._id);
        try {
          const user = await User.findById(socket.decoded._id)
            .select("username avatar rank mute ban")
            .lean();
          socketCheckUserData(user, true);
          settingCheck(user);
          setAffiliateCode(io, socket, user, data, callback);
        } catch (err) {
          socketRemoveAntiSpam(socket.decoded._id);
          callback({
            success: false,
            error: { type: "error", message: err.message },
          });
        }
      } catch (err) {
        callback({
          success: false,
          error: {
            type: "error",
            message: err.message,
          },
        });
      }
    } else {
      callback({
        success: false,
        error: {
          type: "error",
          message: "You need to sign in to perform this action.",
        },
      });
    }
  });

  socket.on("sendAffiliateClaimEarnings", async (data, callback) => {
    if (callback === undefined || typeof callback !== "function") {
      return;
    }
    if (socket.decoded !== undefined && socket.decoded !== null) {
      try {
        const identifier = getIdentifier(socket);
        await rateLimiter.consume(identifier);
        await socketCheckAntiSpam(socket.decoded._id);
        try {
          const user = await User.findById(socket.decoded._id)
            .select("username avatar rank affiliates mute ban")
            .lean();
          socketCheckUserData(user, true);
          settingCheck(user);
          claimAffiliateEarnings(io, socket, user, data, callback);
        } catch (err) {
          socketRemoveAntiSpam(socket.decoded._id);
          callback({
            success: false,
            error: { type: "error", message: err.message },
          });
        }
      } catch (err) {
        callback({
          success: false,
          error: {
            type: "error",
            message: err.message,
          },
        });
      }
    } else {
      callback({
        success: false,
        error: {
          type: "error",
          message: "You need to sign in to perform this action.",
        },
      });
    }
  });
};
