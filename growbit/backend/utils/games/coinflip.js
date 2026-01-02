const validator = require("validator");
const crypto = require("crypto");

// Load database models
const CoinflipGame = require("../../database/models/CoinflipGame");

const COINFLIP_MIN_AMOUNT = process.env.COINFLIP_MIN_AMOUNT || 0.1;
const COINFLIP_MAX_AMOUNT = process.env.COINFLIP_MAX_AMOUNT || 5000;

const coinflipCheckGetGameDataData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.gameId === undefined ||
    data.gameId === null ||
    typeof data.gameId !== "string" ||
    validator.isMongoId(data.gameId) !== true
  ) {
    throw new Error("Your entered game id is invalid.");
  }
};

const coinflipCheckGetGameDataGame = (coinflipGame) => {
  if (coinflipGame === null) {
    throw new Error("Your entered game id is not available.");
  }
};

const coinflipValidateCreateReq = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.amount === undefined ||
    isNaN(data.amount) === true ||
    data.amount <= 0
  ) {
    throw new Error("You’ve entered an invalid bet amount.");
  } else if (!data.pick || !["heads", "tails"].includes(data.pick)) {
    throw new Error("Invalid pick.");
  } else if (data.amount < COINFLIP_MIN_AMOUNT) {
    throw new Error(
      `Min amount is ${parseFloat(COINFLIP_MIN_AMOUNT).toFixed(2)} DLS.`,
    );
  } else if (data.amount > COINFLIP_MAX_AMOUNT) {
    throw new Error(
      `Max amount is ${parseFloat(COINFLIP_MAX_AMOUNT).toFixed(2)} DLS.`,
    );
  }
};

const coinflipCheckSendCreateUser = (data, user, userGames) => {
  if (user.balance < data.amount) {
    throw new Error("You don’t have enough balance.");
  } else if (userGames.length >= 6) {
    throw new Error(
      "You can't have more than 6 open coinflip games at a time.",
    );
  }
};

const coinflipCheckcallCoinflipBotData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.gameId === undefined ||
    typeof data.gameId !== "string" ||
    validator.isMongoId(data.gameId) !== true
  ) {
    throw new Error("Your entered game id is invalid.");
  }
};

const coinflipCheckcallCoinflipBotGame = (
  user,
  coinflipGame,
  coinflipBlockGame,
) => {
  if (
    !coinflipGame ||
    coinflipGame.state !== "created" ||
    coinflipBlockGame.includes(coinflipGame._id.toString()) ||
    coinflipGame.bot ||
    coinflipGame.secondPlayer
  ) {
    throw new Error("Your requested game is not available or completed.");
  } else if (user._id.toString() !== coinflipGame.author._id.toString()) {
    throw new Error("You aren`t allowed to call bots for this game.");
  }
};

const coinflipCheckSendJoinData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.gameId === undefined ||
    typeof data.gameId !== "string" ||
    validator.isMongoId(data.gameId) !== true
  ) {
    throw new Error("Your entered game id is invalid.");
  }
};

const coinflipCheckSendJoinGame = (user, coinflipGame, coinflipBlockGame) => {
  if (
    coinflipGame === undefined ||
    coinflipGame.state !== "created" ||
    coinflipBlockGame.includes(coinflipGame._id.toString())
  ) {
    throw new Error("Your requested game is not available or completed.");
  } else if (coinflipGame.author._id.toString() === user._id.toString()) {
    throw new Error("You are not allowed to play against yourself.");
  }
};

const coinflipCheckSendJoinUser = (user, coinflipGame) => {
  if (user.balance < coinflipGame.amount) {
    throw new Error("You don’t have enough balance for this action.");
  }
};

const coinflipCheckSendCancelData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.gameId === undefined ||
    typeof data.gameId !== "string" ||
    validator.isMongoId(data.gameId) !== true
  ) {
    throw new Error("Your entered game id is invalid.");
  }
};

const coinflipCheckSendCancelGame = (
  user,
  coinflipGame,
  coinflipBlockGame,
) => {};

function getCoinflipSide(seedServer, seedPublic) {
  const seed = `${seedServer}${seedPublic}`;
  const hash = crypto.createHash("sha256").update(seed).digest("hex");
  return parseInt(hash.substr(0, 8), 16) % 2 == 0 ? "heads" : "tails";
}

const coinflipGenerateGame = async (amount, pick, authorId) => {
  const seedServer = crypto.randomBytes(24).toString("hex");
  const hash = crypto.createHash("sha256").update(seedServer).digest("hex");

  let gameDatabase = await CoinflipGame.create({
    pick,
    amount: amount,
    author: authorId,
    fair: {
      seedServer: seedServer,
      seedPublic: null,
      hash: hash,
    },
    state: "created",
  });

  return gameDatabase.toObject();
};

const coinflipSanitizeGames = (games) => {
  let sanitized = [];

  for (let game of games) {
    game = JSON.parse(JSON.stringify(game));

    // Sanitize game fair property
    if (game.state !== "completed") {
      game.fair = { hash: game.fair.hash };
      delete game.side;
    }

    // Sanitize game users
    if (game.author?.anonymous) {
      game.author.username = "Hidden";
    }

    if (game.secondPlayer?.anonymous) {
      game.secondPlayer.username = "Hidden";
    }

    //TODO : check if anon

    // Add sanitized game to sanitized list
    sanitized.push(game);
  }

  return sanitized;
};

const coinflipSanitizeGame = (game) => {
  let sanitized = JSON.parse(JSON.stringify(game));

  // Sanitize game fair property
  if (sanitized.state !== "completed") {
    sanitized.fair = { blockNum: sanitized.fair.blockNum };
  }

  // Sanitize game users
  if (sanitized.author.anonymous) {
    sanitized.author.username = "Hidden";
  }

  if (sanitized.secondPlayer?.anonymous) {
    sanitized.secondPlayer.username = "Hidden";
  }

  //TODO : check if anon

  return sanitized;
};

module.exports = {
  coinflipCheckGetGameDataData,
  coinflipCheckGetGameDataGame,
  coinflipValidateCreateReq,
  coinflipCheckSendCreateUser,
  coinflipCheckcallCoinflipBotData,
  coinflipCheckcallCoinflipBotGame,
  coinflipCheckSendJoinData,
  coinflipCheckSendJoinGame,
  coinflipCheckSendJoinUser,
  coinflipCheckSendCancelData,
  coinflipCheckSendCancelGame,
  coinflipGenerateGame,
  coinflipSanitizeGames,
  coinflipSanitizeGame,
  getCoinflipSide,
};
