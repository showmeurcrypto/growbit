const { RateLimiterMemory } = require("rate-limiter-flexible");
const { getIpFromReq } = require("../utils/req");

const rateLimiterGames = new RateLimiterMemory({
  points: 180,
  duration: 60,
});

const rateLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60,
});

const rateLimiterStrict = new RateLimiterMemory({
  points: 8,
  duration: 60,
});

const rateLimiterChat = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

const gameRateLimiterMiddleware = async (req, res, next) => {
  try {
    const userIp = getIpFromReq(req);
    await rateLimiterGames.consume(userIp);

    next();
  } catch (err) {
    res.status(429).json({
      success: false,
      error: {
        type: "error",
        message:
          "You need to slow down, you have send to many request. Try again in a minute.",
      },
    });
  }
};
const rateLimiterMiddleware = async (req, res, next) => {
  try {
    const userIp = getIpFromReq(req);
    await rateLimiter.consume(userIp);

    next();
  } catch (err) {
    res.status(429).json({
      success: false,
      error: {
        type: "error",
        message:
          "You need to slow down, you have send to many request. Try again in a minute.",
      },
    });
  }
};

const rateLimiterStrictMiddleware = async (req, res, next) => {
  try {
    const userIp = getIpFromReq(req);
    await rateLimiterStrict.consume(userIp);

    next();
  } catch (err) {
    res.status(429).json({
      success: false,
      error: {
        type: "error",
        message:
          "You need to slow down, you have send to many request. Try again in a minute.",
      },
    });
  }
};

module.exports = {
  rateLimiter,
  rateLimiterStrict,
  rateLimiterGames,
  rateLimiterChat,
  gameRateLimiterMiddleware,
  rateLimiterMiddleware,
  rateLimiterStrictMiddleware,
};
