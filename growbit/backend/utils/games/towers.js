const crypto = require("crypto");
const ChanceJs = require("chance");

const TOWERS_HOUSE_EDGE = process.env.TOWERS_HOUSE_EDGE || 4;
const TOWERS_MAX_AMOUNT = process.env.TOWERS_MAX_AMOUNT || 500;
const TOWERS_MIN_AMOUNT = process.env.TOWERS_MIN_AMOUNT || 0.01;

const { limitMultiplier } = require("./games");

const towersCheckSendBetData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.amount === undefined ||
    isNaN(data.amount) === true ||
    data.amount <= 0
  ) {
    throw new Error("You’ve entered an invalid bet amount.");
  } else if (
    data.risk === undefined ||
    typeof data.risk !== "string" ||
    !Object.keys(difficultyMapper).includes(data.risk)
  ) {
    throw new Error("You’ve entered an invalid risk.");
  } else if (data.amount < TOWERS_MIN_AMOUNT) {
    throw new Error(
      `You can only bet a min amount of ${parseFloat(TOWERS_MIN_AMOUNT)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DL per game.`,
    );
  } else if (data.amount > TOWERS_MAX_AMOUNT) {
    throw new Error(
      `You can only bet a max amount of ${parseFloat(TOWERS_MAX_AMOUNT)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DL per game.`,
    );
  }
};

const towersCheckSendBetUser = (data, user) => {
  if (user.balance < data.amount) {
    throw new Error("You don’t have enough balance for this action.");
  }
};

const towersCheckSendBetGame = (towersGame) => {
  if (towersGame !== undefined) {
    throw new Error("You need to complete your running towers game first.");
  }
};

const towersCheckSendBetSeed = (seedDatabase) => {
  if (seedDatabase === null) {
    throw new Error("You need to generate a server seed first.");
  }
};

const towersCheckSendRevealGame = (data, towersGame) => {
  if (!towersGame) {
    throw new Error("You’ve no running towers game at the moment.");
  }

  const maxTileValue = difficultyMapper[towersGame.risk].cols - 1;

  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.tile === undefined ||
    data.tile === null ||
    isNaN(data.tile) === true ||
    Math.floor(data.tile) < 0 ||
    Math.floor(data.tile) > maxTileValue
  ) {
    throw new Error("You’ve entered an invalid tile.");
  }
};

const towersCheckSendCashoutGame = (towersGame) => {
  if (towersGame === null) {
    throw new Error("You’ve no running towers game at the moment.");
  } else if (towersGame.revealed.length === 0) {
    throw new Error("You’ve to reveal at least one row.");
  }
};

function getPayoutMultiplier(towersGame) {
  const config = difficultyMapper[towersGame.risk];
  const columns = config.cols;
  const currentRow = towersGame.revealed.length;
  const bombsPerRow = config.bombs;
  const houseEdge = TOWERS_HOUSE_EDGE / 100;
  const denominator = columns - bombsPerRow;
  const edgeMultiplier = 1 - houseEdge;
  const rowMultiplier = columns / denominator;
  const payoutMultiplier = edgeMultiplier * Math.pow(rowMultiplier, currentRow);
  return payoutMultiplier;
}

const towersGetGamePayout = (towersGame, limited = false) => {
  let multiplier = getPayoutMultiplier(towersGame);

  multiplier = limited
    ? limitMultiplier(towersGame.amount, multiplier, "mines")
    : multiplier;

  return towersGame.amount * multiplier;
};

const towersValidateAutobet = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Invalid request!");
  } else if (
    data.amount === undefined ||
    isNaN(data.amount) === true ||
    data.amount <= 0
  ) {
    throw new Error("You’ve entered an invalid bet amount.");
  } else if (
    data.risk === undefined ||
    typeof data.risk !== "string" ||
    !Object.keys(difficultyMapper).includes(data.risk)
  ) {
    throw new Error("You’ve entered an invalid risk.");
  } else if (data.amount < TOWERS_MIN_AMOUNT) {
    throw new Error(
      `You can only bet a min amount of ${parseFloat(TOWERS_MIN_AMOUNT)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DL per game.`,
    );
  } else if (data.amount > TOWERS_MAX_AMOUNT) {
    throw new Error(
      `You can only bet a max amount of ${parseFloat(TOWERS_MAX_AMOUNT)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DL per game.`,
    );
  }

  if (
    !Array.isArray(data.tiles) ||
    data.tiles.length < 1 ||
    data.tiles.length > 10
  ) {
    throw new Error("Tiles must be an array with 1 to 10 items.");
  }

  const maxTileValue = difficultyMapper[data.risk].cols - 1;

  if (
    !data.tiles.every(
      (tile) => Number.isInteger(tile) && tile >= 0 && tile <= maxTileValue,
    )
  ) {
    throw new Error(
      `All tiles must be integers between 0 and ${maxTileValue} for risk level '${data.risk}'.`,
    );
  }
};

const difficultyMapper = {
  easy: { cols: 4, bombs: 1 },
  med: { cols: 3, bombs: 1 },
  hard: { cols: 2, bombs: 1 },
  insane: { cols: 3, bombs: 2 },
  ultraInsane: { cols: 4, bombs: 3 },
};

const towersGenerateDeck = (risk) => {
  const config = difficultyMapper[risk];

  let deck = [];

  for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
    const tilesPerRow = config.cols;
    const losePerRow = config.bombs;

    deck[rowIndex] = [];
    for (let tileIndex = 0; tileIndex < tilesPerRow; tileIndex++) {
      if (tileIndex < losePerRow) {
        deck[rowIndex].push("lose");
      } else {
        deck[rowIndex].push("coin");
      }
    }
  }

  return deck;
};

const towersShuffleDeck = (deck, combined) => {
  let shuffled = [];

  for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
    const hash = crypto
      .createHash("sha256")
      .update(`${combined}-${rowIndex}`)
      .digest("hex");

    const chance = new ChanceJs(hash);
    const shuffledRow = chance.shuffle(deck[rowIndex]);
    shuffled.push(shuffledRow);
  }

  return shuffled;
};

const towersSanitizeGame = (towersGame) => {
  let sanitized = JSON.parse(JSON.stringify(towersGame));

  if (sanitized.state !== "completed") {
    delete sanitized.deck;
    delete sanitized.fair;
  }

  return sanitized;
};

module.exports = {
  towersCheckSendBetData,
  towersCheckSendBetUser,
  towersCheckSendBetGame,
  towersCheckSendBetSeed,
  checkIfGameInProgress: towersCheckSendBetGame,
  towersCheckSendRevealGame,
  towersCheckSendCashoutGame,
  towersGetGamePayout,
  towersGenerateDeck,
  towersShuffleDeck,
  towersSanitizeGame,
  towersValidateAutobet,
  getPayoutMultiplier,
  TOWERS_HOUSE_EDGE,
};
