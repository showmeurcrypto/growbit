const validator = require("validator");

const { logger } = require("../logger");

const generalCheckGetUserInfoData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong! Please try again in a few seconds.");
  } else if (
    data.userId === undefined ||
    typeof data.userId !== "string" ||
    validator.isMongoId(data.userId) !== true
  ) {
    throw new Error("Your entered user id is invalid.");
  }
};

const generalCheckGetUserInfoUser = (userDatabase) => {
  if (userDatabase === null) {
    throw new Error("Your requested user was not found.");
  }
};

const generalCheckGetUserBetsData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.page === undefined ||
    isNaN(data.page) === true ||
    data.page <= 0
  ) {
    throw new Error("Your entered page is invalid.");
  }
};

const generalCheckGetUserTransactionsData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.page === undefined ||
    isNaN(data.page) === true ||
    data.page <= 0
  ) {
    throw new Error("Your entered page is invalid.");
  }
};

const generalCheckSendUserAnonymousData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong! Please try again in a few seconds.");
  } else if (
    data.anonymous === undefined ||
    typeof data.anonymous !== "boolean"
  ) {
    throw new Error("Your entered anonymous value is invalid.");
  }
};

const generalCheckSendUserSeedData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong! Please try again in a few seconds.");
  } else if (
    data.seedClient === undefined ||
    typeof data.seedClient !== "string" ||
    data.seedClient.trim().length <= 0 ||
    data.seedClient.trim().length > 64
  ) {
    throw new Error("Your entered client seed is invalid.");
  }
};

const checkActiveGames = (gamesDatabase) => {
  if (gamesDatabase.length >= 1) {
    throw new Error("You’ve to complete all your open games first.");
  }
};

const generalCheckSendUserTipData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong! Please try again in a few seconds.");
  } else if (
    (data.receiverId === undefined ||
      typeof data.receiverId !== "string" ||
      validator.isMongoId(data.receiverId) !== true) &&
    !data.receiverUsername
  ) {
    throw new Error("Your entered receiver id or username is invalid.");
  } else if (
    typeof data.amount != "number" ||
    isNaN(data.amount) === true ||
    data.amount < 0.1
  ) {
    throw new Error("Your entered tip amount is invalid.");
  }
};

const generalCheckSendUserTipUser = (data, user) => {
  if (user.balance < data.amount) {
    throw new Error("You have not enough balance for this action.");
  } else if (user.stats.deposit < 1) {
    throw new Error("You need to have a total of 1 DLS deposited.");
  } else if (user.limits.blockTip === true && user.limits.limitTip === 0) {
    throw new Error("You are not allowed to tip users.");
  } else if (
    user.limits.blockTip === true &&
    user.limits.limitTip < data.amount
  ) {
    throw new Error(
      `You are not allowed to tip users more then ${user.limits.limitTip.toFixed(2)}.`,
    );
  }
};

const generalCheckSendUserTipReceiver = (user, receiverDatabase) => {
  if (receiverDatabase === null) {
    throw new Error("Your entered receiver id is not available.");
  } else if (user._id.toString() === receiverDatabase._id.toString()) {
    throw new Error("You are not allowed to tip yourself.");
  }
};

const generalUserGetRakeback = (user) => {
  return 0;
};

const generalUserGetFormated = (user, ignore = false) => {
  return user.anonymous === true && ignore === false
    ? null
    : {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        rank: user.rank,
        level: 0,
        stats: user.stats,
        rakeback: 0,
        createdAt: user.createdAt,
      };
};

const generalSanitizeBets = (bets) => {
  let sanitized = [];

  for (let bet of bets) {
    if (
      ["mines", "dice", "plinko", "keno", "cases", "reme", "towers"].includes(
        bet.method,
      )
    ) {
      bet.fair.seed = {
        seedClient: bet.fair.seed.seedClient,
        nonce: bet.fair.nonce,
        hash: bet.fair.seed.hash,
        ...(bet.fair.seed.state === "completed"
          ? { seedServer: bet.fair.seed.seedServer }
          : {}),
      };
    } else if (["crash", "slide"].includes(bet.method)) {
      bet.game.fair.seed = {
        ...bet.game.fair.seed,
        seedServer:
          bet.game.state === "completed"
            ? bet.game.fair.seed.seedServer
            : undefined,
      };
      if (bet.method === "crash") {
        bet.game.fair.seedPublic = process.env.CRASH_PUBLIC_SEED;
      }
    } else if (bet.method === "coinflip") {
      // bet.fair = {
      //   ...bet.fair,
      //   seedServer: bet.state === "completed" ? bet.fair.seedServer : undefined,
      // };
    } else {
      if (bet.fair) {
        delete bet.fair;
      }
      if (bet.game?.fair) {
        delete bet.game.fair;
      }
    }

    sanitized.push(bet);
  }

  return sanitized;
};

const generalSanitizeUserSeed = (seedDatabase) => {
  let sanitized = JSON.parse(JSON.stringify(seedDatabase));

  if (sanitized.state !== "completed") {
    delete sanitized._id;
    delete sanitized.seedServer;
    delete sanitized.user;
    delete sanitized.state;
  }

  return sanitized;
};

const levels = [
  0, // Level 0 (No wager)
  10000, // Level 1
  25000, // Level 2
  50000, // Level 3
  75000, // Level 4
  100000, // Level 5
  250000, // Level 6
  500000, // Level 7
  750000, // Level 8
  100000, // Level 9
];

function getKeysEarned(user, level) {
  if (!user?.stats?.bet) {
    return 0;
  }

  const wager = user.stats.bet;

  return Math.floor(wager / levels[level]);
}

function getUserLevel(user) {
  if (!user?.stats?.bet) {
    return 0;
  }

  const wager = user.stats.bet;

  let level = 0;

  for (let i = 0; i < levels.length; i++) {
    if (wager >= levels[i]) {
      level = i;
    } else {
      break;
    }
  }

  return level;
}

module.exports = {
  generalCheckGetUserInfoData,
  generalCheckGetUserInfoUser,
  generalCheckGetUserBetsData,
  generalCheckGetUserTransactionsData,
  generalCheckSendUserAnonymousData,
  generalCheckSendUserSeedData,
  checkActiveGames,
  generalCheckSendUserTipData,
  generalCheckSendUserTipUser,
  generalCheckSendUserTipReceiver,
  generalUserGetRakeback,
  generalUserGetFormated,
  generalSanitizeBets,
  generalSanitizeUserSeed,
  getUserLevel,
  getKeysEarned,
};
