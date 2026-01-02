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
const DICE_HOUSE_EDGE = process.env.DICE_HOUSE_EDGE || 4;

const { notifyDiscordAboutDivineIntervention } = require("./discord");

const FAIR_LIMIT = 250;

const cache = new NodeCache({ stdTTL: 60 * 5, checkperiod: 120 });

function rollNumber(seed) {
  if (!seed) {
    throw new Error("Invalid seed");
  }

  const combined = `${seed.seedServer}-${seed.nonce}-${seed.seedClient}`;
  const hash = crypto.createHash("sha256").update(combined).digest("hex");
  return parseInt(hash.substr(0, 52 / 4), 16) % 100;
}

function getMultiplier(mode, targetNumber, targetNumberEnd) {
  let winningChance = 0;

  switch (mode) {
    case "over":
      winningChance = 99 - targetNumber;
      break;
    case "under":
      winningChance = targetNumber;
      break;
    case "between":
      winningChance = targetNumberEnd - targetNumber - 1;
      break;
    case "outside":
      winningChance = 99 - (targetNumberEnd - targetNumber);
      break;
    default:
      throw new Error("Invalid dice mode: " + mode);
  }

  return (100 - DICE_HOUSE_EDGE) / winningChance;
}

function determineRollSuccess(roll, mode, targetNumber, targetNumberEnd) {
  switch (mode) {
    case "over":
      return roll > targetNumber;
    case "under":
      return roll < targetNumber;
    case "between":
      return roll > targetNumber && roll < targetNumberEnd;
    case "outside":
      return roll < targetNumber || roll > targetNumberEnd;
    default:
      throw new Error("Invalid dice mode: " + mode);
  }
}

/**
 * @param {any} user - user
 * @param {number} target - target
 * @param {number} betAmount - betAmount
 * @param io
 */
const play = async (user, target, target2, mode, betAmount, io) => {
  let seed = await UserSeed.findOne({
    user: user._id,
    state: "active",
  }).select("seedClient seedServer nonce hash user state");

  let roll = rollNumber(seed);

  let win = determineRollSuccess(roll, mode, target, target2);

  let untouchedMultiplier = !win ? 0 : getMultiplier(mode, target, target2);

  if (untouchedMultiplier * betAmount > FAIR_LIMIT) {
    let userId = user._id.toString();
    let adjustCount = cache.get(userId) || 0;
    let revert = true;
    let initialNonce = seed.nonce;
    if (
      adjustCount < 2 &&
      (untouchedMultiplier * betAmount > 1000 || Math.random() < 0.5)
    ) {
      for (let i = 0; i < 10; i++) {
        seed.nonce++;
        let newRoll = rollNumber(seed);
        let newWin = determineRollSuccess(newRoll, mode, target, target2);

        if (!newWin) {
          //Skip nonce
          logger.info(
            `Dice result adjusted : seed : ${seed._id.toString()} nonce : ${seed.nonce}`,
          );

          notifyDiscordAboutDivineIntervention(seed._id.toString(), seed.nonce);

          roll = newRoll;

          untouchedMultiplier = 0;
          await updateNonce(seed._id, i + 1);
          cache.set(userId, adjustCount + 1);
          revert = false;
          break;
        }
      }
      if (revert) {
        seed.nonce = initialNonce;
      }
    }
  }

  const multiplier = limitMultiplier(betAmount, untouchedMultiplier, "dice");

  const payout = betAmount * multiplier;

  const promises = [
    updateUser(
      payout,
      (multiplier - 1) * betAmount,
      betAmount,
      DICE_HOUSE_EDGE,
      user,
    ),
    updateNonce(seed._id),
    QuickGame.create({
      game: "dice",
      amount: betAmount,
      payout: payout,
      multiplier: multiplier,
      data: { roll, target, target2, mode },
      fair: {
        nonce: seed.nonce,
        seed: seed._id,
      },
      user: user._id,
    }),
  ];

  const [updatedUser, nonce, game] = await Promise.all(promises);

  updateAffiliate(user, betAmount, DICE_HOUSE_EDGE);
  updateReports(user, betAmount, payout, "dice");
  if (win) {
    tryToClaim(user, betAmount, "dice", multiplier, io);
  }

  io.of("/general").to(user._id.toString()).emit("user", { user: updatedUser });

  let bet = {
    ...game.toObject(),
    fair: { seed: generalSanitizeUserSeed(seed) },
    method: "dice",
  };

  generalAddBetsList(io, bet, updatedUser);

  return {
    roll,
    win: multiplier > 0,
  };
};

module.exports = { play, DICE_HOUSE_EDGE };
