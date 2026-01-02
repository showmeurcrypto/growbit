const CRASH_HOUSE_EDGE = 4;
const CRASH_MAX_AMOUNT = process.env.CRASH_MAX_AMOUNT || 500;
const CRASH_PUBLIC_SEED = process.env.CRASH_PUBLIC_SEED;

const crashCheckSendBetData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.amount === undefined ||
    data.amount === null ||
    isNaN(data.amount) === true ||
    data.amount <= 0
  ) {
    throw new Error("You’ve entered an invalid bet amount.");
  } else if (
    data.autoCashout === undefined ||
    data.autoCashout === null ||
    isNaN(data.autoCashout) === true ||
    Math.floor(data.autoCashout) < 0
  ) {
    throw new Error("Your entered auto cashout is invalid.");
  } else if (data.amount < process.env.CRASH_MIN_AMOUNT) {
    throw new Error(
      `You can only bet a min amount of ${parseFloat(
        process.env.CRASH_MIN_AMOUNT,
      )
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} units per game.`,
    );
  } else if (data.amount > CRASH_MAX_AMOUNT) {
    throw new Error(
      `You can only bet a max amount of ${parseFloat(
        process.env.CRASH_MAX_AMOUNT,
      )
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} units per game.`,
    );
  }
};

const crashCheckSendBetUser = (data, user, crashBets) => {
  if (user.balance < data.amount) {
    throw new Error("You don’t have enough balance for this action.");
  } else if (
    crashBets.some(
      (element) => element.user._id.toString() === user._id.toString(),
    ) === true
  ) {
    throw new Error("You can only bet one time per round.");
  }
};

const crashCheckSendBetGame = (crashGame) => {
  if (crashGame === undefined || crashGame === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (crashGame.state !== "created") {
    throw new Error("You need to wait for the next round before you can bet.");
  }
};

const crashCheckSendCashoutGame = (crashGame, gameMultiplier) => {
  if (crashGame === undefined || crashGame === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (crashGame.state !== "rolling" || gameMultiplier <= 1) {
    throw new Error(
      "You need to wait for the start of the round before you can cashout.",
    );
  }
};

const crashCheckSendCashoutBet = (crashGame, gameMultiplier, userBet) => {
  if (crashGame === undefined || userBet === undefined) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  }
  if (
    userBet === null ||
    userBet.multiplier !== undefined ||
    (userBet.autoCashout >= 1.01 && userBet.autoCashout <= gameMultiplier)
  ) {
    throw new Error("Your bet is not available or was already cashed out.");
  } else if (crashGame.outcome < gameMultiplier) {
    throw new Error(
      "Your are not allowed to cashout your bet because the game already completed.",
    );
  }
};

const crashGetGameMultiplier = (elapsed) => {
  return Math.pow(Math.E, 0.00006 * elapsed);
};

const crashGetOutcome = (combined) => {
  const mod = Math.floor(100 / CRASH_HOUSE_EDGE);

  if (crashIsHashDivisible(combined, mod)) {
    return 1;
  }

  const h = parseInt(combined.slice(0, 52 / 4), 16);
  const e = Math.pow(2, 52);

  return Math.floor((100 * e - h) / (e - h)) / 100.0;
};

const crashIsHashDivisible = (combined, mod) => {
  let val = 0;

  let o = combined.length % 4;
  for (let i = o > 0 ? o - 4 : 0; i < combined.length; i += 4) {
    val = ((val << 16) + parseInt(combined.substring(i, i + 4), 16)) % mod;
  }

  return val === 0;
};

const crashSanitizeGame = (game) => {
  let sanitized = JSON.parse(JSON.stringify(game));

  if (sanitized.state !== "completed") {
    delete sanitized.outcome;
    delete sanitized.fair;
  }
  if (sanitized.fair) {
    sanitized.fair.seedPublic = CRASH_PUBLIC_SEED;
  } else {
    sanitized.fair = {
      seedPublic: CRASH_PUBLIC_SEED,
    };
  }
  return sanitized;
};

const crashSanitizeBets = (bets) => {
  let sanitized = [];

  for (const bet of bets) {
    sanitized.push({
      ...bet,
      user: {
        _id: bet.user._id,
        username: bet.user.anonymous ? "Hidden" : bet.user.username,
        avatar: bet.user.avatar,
        rank: bet.user.rank,
        level: bet.user.level,
        rakeback: bet.user.rakeback,
        stats: bet.user.stats,
        createdAt: bet.user.createdAt,
      },
    });
  }

  return sanitized;
};

const crashSanitizeBet = (bet) => {
  let sanitized = JSON.parse(JSON.stringify(bet));

  sanitized.user = {
    _id: sanitized.user._id,
    username: bet.user.anonymous ? "Hidden" : bet.user.username,
    avatar: sanitized.user.avatar,
    rank: sanitized.user.rank,
    level: sanitized.user.level,
    rakeback: sanitized.user.rakeback,
    stats: sanitized.user.stats,
    createdAt: sanitized.user.createdAt,
  };

  return sanitized;
};

const growthFunction = (result) => {
  const c = 16666.666667;
  return c * Math.log(0.01 * result);
};

module.exports = {
  crashCheckSendBetData,
  crashCheckSendBetUser,
  crashCheckSendBetGame,
  crashCheckSendCashoutGame,
  crashCheckSendCashoutBet,
  crashGetGameMultiplier,
  crashGetOutcome,
  crashSanitizeGame,
  crashSanitizeBets,
  crashSanitizeBet,
  growthFunction,
  CRASH_HOUSE_EDGE,
  CRASH_MAX_AMOUNT,
};
