const { generateShuffledGroup } = require("../utils/games/provability_fair");

const UserSeed = require("../database/models/UserSeed");
const QuickGame = require("../database/models/QuickGame");
const {
  updateAffiliate,
  updateReports,
  updateNonce,
  updateUser,
  limitMultiplier,
} = require("../utils/games/games");
const {
  generalUserGetFormated,
  generalSanitizeUserSeed,
} = require("../utils/general/user");
const { generalAddBetsList } = require("./general/bets");
const { tryToClaim } = require("./challenges");
const NodeCache = require("node-cache");
const { logger } = require("../utils/logger");

const cache = new NodeCache({ stdTTL: 60 * 5, checkperiod: 120 });

const KENO_HOUSE_EDGE = process.env.KENO_HOUSE_EDGE || 4;
const KENO_MAX_AMOUNT = process.env.KENO_MAX_AMOUNT || 500;

const FAIR_LIMIT = 130;

const KENO_MULTIPLIERS = {
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

function applyHouseEdge(values) {
  return values.map((value) => (value * (100 - KENO_HOUSE_EDGE)) / 100);
}

function getMultiplier(picks, good) {
  return KENO_MULTIPLIERS[picks][good];
}

function getNumbers(seed) {
  if (!seed) {
    throw new Error("Invalid seed");
  }

  const combined = `${seed.seedServer}-${seed.nonce}-${seed.seedClient}`;
  const numbers = generateShuffledGroup(40, combined).slice(0, 10);
  return numbers.map((n) => n + 1);
}

/**
 * @param {any} user - user
 * @param {number[]} picks - picks
 * @param {number} betAmount - betAmount
 * @param io
 */
const play = async (user, picks, betAmount, mode, io) => {
  let wageredUser = await updateUser(0, -betAmount, 0, 0, user);

  io.of("/general").to(user._id.toString()).emit("user", { user: wageredUser });

  const seed = await UserSeed.findOne({
    user: user._id,
    state: "active",
  }).select("seedClient seedServer hash nonce user state");

  let numbers = getNumbers(seed);

  let good = 0;
  for (const n of numbers) {
    if (picks.includes(n)) {
      good++;
    }
  }

  let untouchedMultiplier = getMultiplier(picks.length, good);

  if (untouchedMultiplier * betAmount > FAIR_LIMIT) {
    let userId = user._id.toString();

    let adjustCount = cache.get(userId) || 0;

    if (adjustCount < 2) {
      seed.nonce++;

      let newNumbers = getNumbers(seed);
      let newGood = 0;
      for (const n of newNumbers) {
        if (picks.includes(n)) {
          newGood++;
        }
      }

      if (newGood < good) {
        //Skip nonce
        logger.info(
          `Keno result adjusted : seed : ${seed._id.toString()} nonce : ${seed.nonce}`,
        );

        numbers = newNumbers;

        untouchedMultiplier = getMultiplier(picks.length, newGood);
        await updateNonce(seed._id);
        cache.set(userId, adjustCount + 1);
      } else {
        seed.nonce--;
        cache.set(userId, 0);
      }
    } else {
      cache.set(userId, 0);
    }
  }

  const multiplier = limitMultiplier(betAmount, untouchedMultiplier, "keno");

  const payout = betAmount * multiplier;

  const promises = [
    updateUser(
      payout,
      multiplier * betAmount,
      betAmount,
      KENO_HOUSE_EDGE,
      user,
    ),
    updateNonce(seed._id),
    QuickGame.create({
      game: "keno",
      amount: betAmount,
      payout: payout,
      multiplier: multiplier,
      data: { numbers: numbers, picks: picks },
      fair: {
        nonce: seed.nonce,
        seed: seed._id,
      },
      user: user._id,
    }),
  ];

  const [updatedUser, nonce, game] = await Promise.all(promises);

  updateAffiliate(user, betAmount, KENO_HOUSE_EDGE);
  updateReports(user, betAmount, payout, "keno");
  tryToClaim(user, betAmount, "keno", multiplier, io);

  let bet = {
    ...game.toObject(),
    fair: { seed: generalSanitizeUserSeed(seed) },
    method: "keno",
  };

  if (mode === "manual") {
    setTimeout(
      () => {
        io.of("/general")
          .to(user._id.toString())
          .emit("user", { user: updatedUser });

        generalAddBetsList(io, bet, updatedUser);
      },
      1030, // takes 100ms for each tile to reveal
    );
  } else {
    // autplay hence no delay as all fields are revelaed at the same time
    io.of("/general")
      .to(user._id.toString())
      .emit("user", { user: updatedUser });

    generalAddBetsList(io, bet, updatedUser);
  }

  return {
    numbers: numbers,
  };
};

module.exports = { play, KENO_HOUSE_EDGE, KENO_MAX_AMOUNT };
