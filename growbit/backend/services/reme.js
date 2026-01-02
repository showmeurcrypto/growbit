const UserSeed = require("../database/models/UserSeed");
const crypto = require("crypto");
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
const REME_HOUSE_EDGE = 2.7;
const { buildRandomFloats } = require("../utils/games/provability_fair");

function getRolls(seed) {
  if (!seed) {
    throw new Error("Invalid seed");
  }

  const combined = `${seed.seedServer}-${seed.nonce}-${seed.seedClient}`;
  const hash = crypto.createHash("sha256").update(combined).digest("hex");
  console.log(seed);
  console.log(hash);
  let numbers = buildRandomFloats(2, hash).map((num) => Math.floor(num * 37));
  return numbers;
}

function convert(num) {
  if (num > 36 || num < 0) {
    throw new Error("Invalid Roulette outocome");
  }

  let sm = 0;
  while (num > 0) {
    sm += num % 10;
    num = Math.floor(num / 10);
  }

  return sm % 10;
}

function getMultiplier(rolls) {
  const [playerRaw, hostRaw] = rolls;

  const player1 = convert(playerRaw);
  const host1 = convert(hostRaw);

  if (host1 === 0) {
    return 0;
  } else if (player1 === 0) {
    //3x
    return 3;
  } else if (host1 >= player1) {
    return 0;
    //Host wins
  } else if (player1 > host1) {
    //Player wins
    return 2;
  }
}

/**
 * @param {any} user - user
 * @param {number} betAmount - betAmount
 * @param io
 */
const play = async (user, betAmount, io, autobet) => {
  let seed = await UserSeed.findOne({
    user: user._id,
    state: "active",
  }).select("seedClient seedServer nonce hash user state");

  const wageredUser = {
    ...user,
    balance: user.balance - betAmount,
    updatedAt: new Date().toISOString(),
  };

  io.of("/general").to(user._id.toString()).emit("user", { user: wageredUser });

  let rolls = getRolls(seed);

  let untouchedMultiplier = getMultiplier(rolls);

  const multiplier = limitMultiplier(betAmount, untouchedMultiplier, "reme");

  const payout = betAmount * multiplier;

  const promises = [
    updateUser(
      payout,
      (multiplier - 1) * betAmount,
      betAmount,
      REME_HOUSE_EDGE,
      user,
    ),
    updateNonce(seed._id),
    QuickGame.create({
      game: "reme",
      amount: betAmount,
      payout: payout,
      multiplier: multiplier,
      data: { rolls },
      fair: {
        nonce: seed.nonce,
        seed: seed._id,
      },
      user: user._id,
    }),
  ];

  const [updatedUser, nonce, game] = await Promise.all(promises);

  updateAffiliate(user, betAmount, REME_HOUSE_EDGE);
  updateReports(user, betAmount, payout, "reme");
  if (multiplier > 0) {
    tryToClaim(user, betAmount, "reme", multiplier, io);
  }

  setTimeout(
    () => {
      if (multiplier > 0) {
        io.of("/general")
          .to(user._id.toString())
          .emit("user", { user: updatedUser });
      }

      let bet = {
        ...game.toObject(),
        fair: { seed: generalSanitizeUserSeed(seed) },
        method: "reme",
      };

      generalAddBetsList(io, bet, updatedUser);
    },
    autobet ? 600 : 3000,
  );

  return {
    rolls,
    multiplier,
  };
};

module.exports = { play };
