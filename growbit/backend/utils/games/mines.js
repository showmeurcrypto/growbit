const ChanceJs = require("chance");

const MINES_HOUSE_EDGE = process.env.MINES_HOUSE_EDGE || 4;
const MINES_MAX_AMOUNT = process.env.MINES_MAX_AMOUNT || 500;
const MINES_MIN_AMOUNT = process.env.MINES_MIN_AMOUNT || 0.01;

const { limitMultiplier } = require("./games");
const crypto = require("crypto");

const factorialCache = {};

const minesValidateGameStart = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.amount === undefined ||
    isNaN(data.amount) === true ||
    data.amount <= 0
  ) {
    throw new Error("You’ve entered an invalid bet amount.");
  } else if (
    data.minesGridSize === undefined ||
    isNaN(data.minesGridSize) === true ||
    ![25, 36, 49, 64].includes(data.minesGridSize)
  ) {
    throw new Error("You’ve entered an invalid grid size.");
  } else if (
    data.minesCount === undefined ||
    isNaN(data.minesCount) === true ||
    Math.floor(data.minesCount) <=
      Math.floor(Math.sqrt(data.minesGridSize)) - 5 ||
    Math.floor(data.minesCount) > data.minesGridSize - 1
  ) {
    throw new Error("You’ve entered an invalid mines count.");
  } else if (data.amount < MINES_MIN_AMOUNT) {
    throw new Error(
      `You can only bet a min amount of ${parseFloat(MINES_MIN_AMOUNT)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DL per game.`,
    );
  } else if (data.amount > MINES_MAX_AMOUNT) {
    throw new Error(
      `You can only bet a max amount of ${parseFloat(MINES_MAX_AMOUNT)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DL per game.`,
    );
  }
};

const minesValidateAutobet = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Invalid request!");
  } else if (
    data.amount === undefined ||
    isNaN(data.amount) === true ||
    data.amount <= 0
  ) {
    throw new Error("You’ve entered an invalid bet amount.");
  } else if (
    data.minesGridSize === undefined ||
    isNaN(data.minesGridSize) === true ||
    ![25, 36, 49, 64].includes(data.minesGridSize)
  ) {
    throw new Error("You’ve entered an invalid grid size.");
  } else if (
    data.minesGridSize === undefined ||
    isNaN(data.minesGridSize) === true ||
    Math.floor(data.minesCount) <=
      Math.floor(Math.sqrt(data.minesGridSize)) - 5 ||
    Math.floor(data.minesCount) > data.minesGridSize - 1
  ) {
    throw new Error("You’ve entered an invalid mines count.");
  } else if (data.amount < MINES_MIN_AMOUNT) {
    throw new Error(
      `You can only bet a min amount of ${parseFloat(MINES_MIN_AMOUNT)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DL per game.`,
    );
  } else if (data.amount > MINES_MAX_AMOUNT) {
    throw new Error(
      `You can only bet a max amount of ${parseFloat(MINES_MAX_AMOUNT)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DL per game.`,
    );
  }

  const tiles = data.tiles;
  if (!tiles?.length) {
    throw new Error("Invalid tiles");
  }

  if (tiles.length + data.minesCount > data.gridSize) {
    throw new Error("You have picked too many tiles!");
  }
};

const minesCheckSendBetUser = (data, user) => {
  if (user.balance < data.amount) {
    throw new Error("You don’t have enough balance for this action.");
  }
};

const minesCheckSendBetGame = (minesGame) => {
  if (minesGame !== undefined) {
    throw new Error("You need to complete your running mines game first.");
  }
};

const minesCheckSendBetSeed = (seedDatabase) => {
  if (seedDatabase === null) {
    throw new Error("You need to generate a server seed first.");
  }
};

const minesCheckSendRevealData = (data, gridSize) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.tile === undefined ||
    isNaN(data.tile) === true ||
    Math.floor(data.tile) < 0 ||
    Math.floor(data.tile) > gridSize - 1
  ) {
    throw new Error("Your entered tile is invalid.");
  }
};

const minesCheckSendRevealGame = (minesGame, data) => {
  if (minesGame === undefined) {
    throw new Error("You have no running mines game at the moment.");
  } else if (
    minesGame.revealed.some(
      (element) => element.tile === Math.floor(data.tile),
    ) === true
  ) {
    throw new Error("Your entered tile is already revealed.");
  }
};

const minesCheckSendCashoutGame = (minesGame) => {
  if (minesGame === undefined) {
    throw new Error("You have no running mines game at the moment.");
  } else if (minesGame.revealed.length === 0) {
    throw new Error("You need to reveal at least one tile.");
  }
};

const minesGetGameFactorial = (number) => {
  if (factorialCache[number] !== undefined) {
    return factorialCache[number];
  }

  let value = number;
  for (let i = number; i > 1; i--) {
    value = value * (i - 1);
  }

  factorialCache[number] = value;

  return value;
};

const minesGetGamePayout = (minesGame, limited = false) => {
  let multiplier = 0;

  if (minesGame.revealed.length >= 1) {
    const first =
      minesGame.gridSize === minesGame.revealed.length
        ? 1
        : minesGetGameFactorial(minesGame.gridSize) /
          (minesGetGameFactorial(minesGame.revealed.length) *
            minesGetGameFactorial(
              minesGame.gridSize - minesGame.revealed.length,
            ));
    const second =
      minesGame.gridSize - minesGame.minesCount === minesGame.revealed.length
        ? 1
        : minesGetGameFactorial(minesGame.gridSize - minesGame.minesCount) /
          (minesGetGameFactorial(minesGame.revealed.length) *
            minesGetGameFactorial(
              minesGame.gridSize -
                minesGame.minesCount -
                minesGame.revealed.length,
            ));

    multiplier = ((100 - MINES_HOUSE_EDGE) / 100) * (first / second);
    multiplier = Math.max(1, multiplier);

    multiplier = limited
      ? limitMultiplier(minesGame.amount, multiplier, "mines")
      : multiplier;
  }

  return minesGame.amount * multiplier;
};

const minesGetGameDeck = (minesCount, gridSize, hash) => {
  const chance = new ChanceJs(hash);
  let deck = [];

  for (let i = 0; i < gridSize; i++) {
    if (i < minesCount) {
      deck.push("mine");
    } else {
      deck.push("coin");
    }
  }

  return chance.shuffle(deck);
};

const minesSanitizeGame = (game) => {
  let sanitized = JSON.parse(JSON.stringify(game));

  if (sanitized.state !== "completed") {
    delete sanitized.deck;
    delete sanitized.fair;
  }

  return sanitized;
};

const minesGenerate = (seedDatabase, minesCount, gridSize) => {
  minesCheckSendBetSeed(seedDatabase);

  const combined = `${seedDatabase.seedServer}-${seedDatabase.nonce}-${seedDatabase.seedClient}`;

  // Sha256 hash combined string
  const hash = crypto.createHash("sha256").update(combined).digest("hex");

  // Generate mines game deck
  return minesGetGameDeck(minesCount, gridSize, hash);
};

module.exports = {
  minesValidateGameStart,
  minesCheckSendBetUser,
  checkIfGameInProgress: minesCheckSendBetGame,
  minesCheckSendRevealData,
  minesCheckSendRevealGame,
  minesCheckSendCashoutGame,
  minesGetGamePayout,
  minesGenerate,
  minesSanitizeGame,
  minesValidateAutobet,
  MINES_HOUSE_EDGE,
  MINES_MAX_AMOUNT,
};
