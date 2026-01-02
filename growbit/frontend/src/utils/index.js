export function getPlinkoPayoutForEdge(edge) {
  let PayoutLists = {
    low: {
      8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
      9: [5.6, 2, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6],
      10: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
      11: [8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1, 1.3, 1.9, 3, 8.4],
      12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
      13: [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1],
      14: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
      15: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15],
      16: [
        16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16,
      ],
    },
    medium: {
      8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
      9: [18, 4, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4, 18],
      10: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
      11: [24, 6, 3, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3, 6, 24],
      12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
      13: [43, 13, 6, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 6, 13, 43],
      14: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
      15: [88, 18, 11, 5, 3, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3, 5, 11, 18, 88],
      16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    },
    high: {
      8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
      9: [43, 7, 2, 0.6, 0.2, 0.2, 0.6, 2, 7, 43],
      10: [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76],
      11: [120, 14, 5.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 5.2, 14, 120],
      12: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
      13: [260, 37, 11, 4, 1, 0.2, 0.2, 0.2, 0.2, 1, 4, 11, 37, 260],
      14: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
      15: [620, 83, 27, 8, 3, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3, 8, 27, 83, 620],
      16: [
        1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000,
      ],
    },
  };

  if (edge === 1) {
    return PayoutLists;
  }

  const original_edge = 1;
  const one_minus_new_edge = 1 - edge / 100;
  const one_minus_edge_old = 1 - original_edge / 100;
  const edge_adjustment_multiplier = one_minus_edge_old / one_minus_new_edge;

  return {
    low: {
      8: PayoutLists.low[8].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      9: PayoutLists.low[9].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      10: PayoutLists.low[10].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      11: PayoutLists.low[11].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      12: PayoutLists.low[12].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      13: PayoutLists.low[13].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      14: PayoutLists.low[14].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      15: PayoutLists.low[15].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      16: PayoutLists.low[16].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
    },
    medium: {
      8: PayoutLists.medium[8].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      9: PayoutLists.medium[9].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      10: PayoutLists.medium[10].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      11: PayoutLists.medium[11].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      12: PayoutLists.medium[12].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      13: PayoutLists.medium[13].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      14: PayoutLists.medium[14].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      15: PayoutLists.medium[15].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      16: PayoutLists.medium[16].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
    },
    high: {
      8: PayoutLists.high[8].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      9: PayoutLists.high[9].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      10: PayoutLists.high[10].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      11: PayoutLists.high[11].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      12: PayoutLists.high[12].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      13: PayoutLists.high[13].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      14: PayoutLists.high[14].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      15: PayoutLists.high[15].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
      16: PayoutLists.high[16].map(
        (payout) => payout / edge_adjustment_multiplier
      ),
    },
  };
}

export const rewardBoxes = [
  "bronze",
  "silver",
  "gold",
  "sapphire",
  "emerald",
  "ruby",
  "diamond",
  "onyx",
  "opal",
];

export function kenoMultipliers(edge) {
  function applyHouseEdge(values) {
    return values.map((value) => (value * (100 - edge)) / 100);
  }
  return {
    1: applyHouseEdge([0.405, 2.784]),
    2: applyHouseEdge([0, 1.825, 5.172]),
    3: applyHouseEdge([0, 0, 2.835, 50.63]),
    4: applyHouseEdge([0, 0, 1.74, 10.23, 102.35]),
    5: applyHouseEdge([0, 0, 1.41, 4.05, 14.18, 395.12]),
    6: applyHouseEdge([0, 0, 0, 3.04, 9.13, 182.71, 720.7]),
    7: applyHouseEdge([0, 0, 0, 2.02, 7.08, 30.34, 404.64, 809.29]),
    8: applyHouseEdge([0, 0, 0, 2.02, 4.04, 11.13, 67.81, 404.85, 910.92]),
    9: applyHouseEdge([
      0, 0, 0, 2.02, 2.52, 5.05, 15.17, 101.19, 505.98, 1011.96,
    ]),
    10: applyHouseEdge([
      0, 0, 0, 1.61, 2.02, 4.04, 7.07, 26.28, 101.08, 505.42, 1010.84,
    ]),
  };
}

export const getWinningColour = (number) => {
  if (number === 0) {
    return { winningColour: "yellow", winningMultiplier: 14 };
  } else if (number % 2 === 0) {
    return { winningColour: "red", winningMultiplier: 2 };
  } else {
    return { winningColour: "purple", winningMultiplier: 2 };
  }
};

const minesGetGameFactorial = (number) => {
  const cachedValue = localStorage.getItem(`factorial_${number}`);
  if (cachedValue !== null) {
    //return parseInt(cachedValue, 10); // Return the cached value
    return cachedValue;
  }

  let value = number;
  for (let i = number; i > 1; i--) {
    value = value * (i - 1);
  }

  localStorage.setItem(`factorial_${number}`, value);

  return value;
};

export const minesGetGamePayout = (minesGame, edge = 0) => {
  return minesGame.amount * minesGetCurrentMultiplier(minesGame, edge);
};

export const minesGetCurrentMultiplier = (minesGame, edge = 0) => {
  let multiplier = 0;
  // console.log(minesGame);

  if (minesGame.revealed.length >= 1) {
    const first =
      minesGame.gridSize === minesGame.revealed.length
        ? 1
        : minesGetGameFactorial(minesGame.gridSize) /
          (minesGetGameFactorial(minesGame.revealed.length) *
            minesGetGameFactorial(
              minesGame.gridSize - minesGame.revealed.length
            ));
    const second =
      minesGame.gridSize - minesGame.minesCount === minesGame.revealed.length
        ? 1
        : minesGetGameFactorial(minesGame.gridSize - minesGame.minesCount) /
          (minesGetGameFactorial(minesGame.revealed.length) *
            minesGetGameFactorial(
              minesGame.gridSize -
                minesGame.minesCount -
                minesGame.revealed.length
            ));

    multiplier = ((100 - edge) / 100) * (first / second);
    multiplier = Math.max(multiplier, 1);
    // console.log("multiplier is: " + multiplier);
  }
  return parseFloat(multiplier);
};

export const towersGetGamePayout = (towersGame, edge = 0) => {
  return towersGame.amount * towersGetCurrentMultiplier(towersGame, edge);
};

export const towersGetCurrentMultiplier = (towersGame, edge = 0) => {
  // console.log("house edge is: " + edge);
  const config = difficultyMapper[towersGame.risk];
  const columns = config.cols;
  const currentRow = towersGame.revealed.length;

  const bombsPerRow = config.bombs;
  const houseEdge = edge / 100;
  const denominator = columns - bombsPerRow;

  const edgeMultiplier = 1 - houseEdge;
  const rowMultiplier = columns / denominator;
  return edgeMultiplier * Math.pow(rowMultiplier, currentRow);
};

export const difficultyMapper = {
  easy: { cols: 4, bombs: 1 },
  med: { cols: 3, bombs: 1 },
  hard: { cols: 2, bombs: 1 },
  insane: { cols: 3, bombs: 2 },
  ultraInsane: { cols: 4, bombs: 3 },
};

const CURRENCY_MAP = {
  BCH: "Bitcoin Cash",
  BNB: "Binance Coin",
  BTC: "Bitcoin",
  DOGE: "Dogecoin",
  DOGS: "Dogs",
  LTC: "Litecoin",
  NOT: "Not Coin",
  POL: "Polygon",
  SHIB: "Shiba Inu",
  SOL: "Solana",
  TON: "Toncoin",
  TRX: "TRON",
  USDT: "Tether",
  USDC: "USD Coin",
  XMR: "Monero",
};

export const getCryptoName = (short) => {
  short = short.toUpperCase();
  let name = short;
  return CURRENCY_MAP[name] || short;
};

export const GAMING_PROVIDERS = {
  "4theplayer": "4ThePlayer",
  apparat: "Apparat Gaming",
  avatarux: "AvatarUX Studios",
  backseatgaming: "Backseat Gaming",
  bgaming: "BGaming",
  bigtimegaming: "Big Time Gaming",
  booming: "Booming Games",
  bullsharkgames: "Bullshark Games",
  bulletproof: "Bulletproof Games",
  caleta: "Caleta Gaming",
  endorphina: "Endorphina",
  evolution: "Evolution",
  evoplay: "Evoplay Entertainment",
  gamebeat: "Gamebeat Studio",
  hacksaw: "Hacksaw Gaming",
  jelly: "Jelly Entertainment",
  mascot: "Mascot Gaming",
  netent: "NetEnt",
  nolimit: "Nolimit City",
  onlyplay: "OnlyPlay",
  petersons: "Petersons Gaming",
  pgsoft: "PG Soft",
  platipus: "Platipus Gaming",
  popiplay: "Popiplay",
  pragmatic: "Pragmatic Play",
  pragmaticslots: "Pragmatic Play",
  pragmaticplaylive: "Pragmatic Play Live",
  readyplay: "ReadyPlay Gaming",
  reflexgaming: "Reflex Gaming",
  retrogaming: "Retro Gaming",
  spinomenal: "Spinomenal",
  spribe: "Spribe",
  wizard: "Wizard Gaming",
  yggdrasil: "Yggdrasil Gaming",
};

export const removedProviders = [
  "avatarux",
  "caleta",
  "readyplay",
  "retrogaming",
];

export function getSlotPopularity(game) {
  let p = +game.popularity || 0;
  return p;
}

export function getOriginalsConfigAndStoreThem(games) {
  if (!games) {
    return;
  }
  let originals = games.filter((game) => game.type === "Originals");

  if (!originals?.length) {
    return;
  }

  let maxWin = originals[0]?.maxWin || 10000;
  let dice = originals.find((g) => g.id === "dice");
  let plinko = originals.find((g) => g.id === "plinko");
  let mines = originals.find((g) => g.id === "mines");
  let keno = originals.find((g) => g.id === "keno");
  let crash = originals.find((g) => g.id === "crash");
  let slide = originals.find((g) => g.id === "slide");
  let towers = originals.find((g) => g.id === "towers");

  let minesMaxBet = +mines?.maxBet || 500;
  let crashMaxBet = +crash?.maxBet || 500;
  let slideMaxBet = +slide?.maxBet || 500;
  let kenoMaxBet = +keno?.maxBet || 500;
  let towersMaxBet = +towers?.maxBet || 500;
  let diceEdge = +dice?.houseEdge || 4;
  let plinkoEdge = +plinko?.houseEdge || 4;
  let minesEdge = +mines?.houseEdge || 4;
  let kenoEdge = +keno?.houseEdge || 4;
  let towersEdge = +towers?.houseEdge || 4;

  return {
    maxWin,
    diceEdge,
    plinkoEdge,
    minesEdge,
    kenoEdge,
    minesMaxBet,
    crashMaxBet,
    slideMaxBet,
    kenoMaxBet,
    towersEdge,
    towersMaxBet,
  };
}

const originals = new Set([
  "crash",
  "slide",
  "mines",
  "plinko",
  "dice",
  "keno",
  "coinflip",
  "cases",
  "reme",
  "towers",
]);

export function isGameOriginal(name) {
  return originals.has(name);
}

export function getLevels() {
  let levelArr = [];

  for (let i = 1; i < 10; i++) {
    levelArr.push({
      name: levelNames[i],
      start: levels[i],
      end: i + 1 < 10 ? levels[i + 1] : "",
    });
  }
  return levelArr;
}

const levelNames = {
  0: "",
  1: "Bronze",
  2: "Silver",
  3: "Gold",
  4: "Sapphire",
  5: "Emerald",
  6: "Ruby",
  7: "Diamond",
  8: "Onyx",
  9: "Opal",
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
  1000000, // Level 9
];

export function canClaimKey(user, level) {
  const keys = getKeysEarned(user, level);

  if (!keys) {
    return false;
  }

  let timesClaimed =
    user.claimedKeys?.filter((num) => num === level).length || 0;

  return timesClaimed < keys;
}

export function levelProgress(user, level) {
  const wager = user.stats.bet;
  let timesClaimed =
    user.claimedKeys?.filter((num) => num === level).length || 0;
  let levelLimit = levels[level];
  let wagerProgress = Math.min(
    levelLimit,
    wager - timesClaimed * levels[level]
  );
  let percentage = Math.min(1, wagerProgress / levelLimit) * 100;

  return {
    progress: wagerProgress.toFixed(2) + "/" + levelLimit,
    percentage,
  };
}

function getKeysEarned(user, level) {
  if (!user?.stats?.bet) {
    return 0;
  }

  const wager = user.stats.bet;

  return Math.floor(wager / levels[level]);
}

export function getUserLevel(user) {
  if (!user?.stats?.bet) {
    return {
      level: 0,
      progress: 0,
      levelSize: 10000,
      name: "",
    };
  }

  const wager = user.stats.bet;

  let level = 0;
  let needs = 0;
  let progress = 0;
  let levelSize = 10000;

  for (let i = 0; i < levels.length; i++) {
    if (wager >= levels[i]) {
      level = i;
    } else {
      levelSize = levels[i] - (i === 0 ? 0 : levels[i - 1]);
      needs = levels[i] - wager;
      progress = levelSize - needs;
      break;
    }
  }

  return {
    level,
    progress,
    levelSize,
    name: levelNames[level],
  };
}

export function getDiceChance(target, target2, targetMode) {
  let winningChance = 0;

  //console.log(target + " " + target2 + " " + targetMode);

  switch (targetMode) {
    case "over":
      winningChance = 99 - target;
      break;
    case "under":
      winningChance = target;
      break;
    case "between":
      winningChance = target2 - target - 1;
      break;
    case "outside":
      winningChance = 99 - (target2 - target);
      break;
  }

  return winningChance;
}
