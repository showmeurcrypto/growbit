const Challenge = require("../database/models/Challenge");
const { createNotification } = require("../services/notifications");
const BalanceTransaction = require("../database/models/BalanceTransaction");
const { logger } = require("../utils/logger");
const User = require("../database/models/User");
const { validateSlotCode } = require("./slots/slot_data");
const { generalChatAddMessage } = require("./general/chat");

let challengesCache = null;

async function updateCache() {
  const now = new Date(); // Current time
  const twoDaysLater = new Date();
  twoDaysLater.setDate(now.getDate() + 2);
  const challenges = await Challenge.find({
    end: { $gte: now, $lte: twoDaysLater },
  })
    .lean()
    .exec();

  return (challengesCache = challenges);
}

async function syncDatabase(challengeId, userId) {
  try {
    const updatedChallenge = await Challenge.findOneAndUpdate(
      { _id: challengeId },
      {
        $addToSet: { claimedBy: userId },
        $inc: { claims: 1, remainingClaims: -1 },
      },
      { new: true, runValidators: true },
    );

    if (!updatedChallenge) {
      throw new Error("Challenge not found");
    }

    return updatedChallenge;
  } catch (error) {
    logger.error("Error adding user to claimedBy:", error);
    throw error;
  }
}

function getIfCanBeClaimed(bet, game, multiplier, userId) {
  if (!challengesCache) {
    return null;
  }

  for (const challenge of challengesCache) {
    if (
      challenge.minBet <= bet &&
      challenge.game === game &&
      challenge.multiplier <= multiplier &&
      challenge.startTime < new Date() &&
      challenge.endTime > new Date() &&
      challenge.remainingClaims > 0 &&
      !challenge.claimedBy.some((c) => c.toString() === userId.toString())
    ) {
      challenge.remainingClaims--;
      challenge.claimedBy.push(userId);
      return challenge;
    }
  }
  return null;
}

createChallenge = async (dto) => {
  const startTime = new Date(`${dto.date}T00:00:00Z`);
  const endTime = new Date(`${dto.date}T23:59:59Z`);

  const repeat = Math.min(dto.repeat || 1, 10);

  if (endTime < new Date()) {
    throw Error("End date is in the past!");
  }

  const challenges = [];

  const originals = new Set([
    "crash",
    "slide",
    "mines",
    "plinko",
    "dice",
    "keno",
  ]);

  if (!originals.has(dto.game)) {
    if (!validateSlotCode(dto.game)) {
      throw new Error("Invalid slot code!");
    }
  }

  for (let i = 0; i < repeat; i++) {
    const start = new Date(startTime);
    start.setDate(start.getDate() + i);
    const end = new Date(start);
    end.setHours(23, 59, 59);
    challenges.push({
      game: dto.game,
      name: dto.name,
      multiplier: dto.multiplier,
      startTime: start,
      endTime: end,
      reward: dto.reward,
      minBet: dto.minBet,
      claims: dto.claims,
      remainingClaims: dto.claims,
      description: dto.description,
      colour: dto.colour,
    });
  }

  let createdChallenges = await Challenge.insertMany(challenges);

  await updateCache();

  return createdChallenges;
};

async function tryToClaim(user, amount, game, multiplier, io) {
  try {
    const challenge = await getIfCanBeClaimed(
      amount,
      game,
      multiplier,
      user._id,
    );

    if (!challenge) {
      return;
    }

    //TODO: transaction

    await syncDatabase(challenge._id, user._id);
    //TODO: handle sync failure

    const prize = challenge.reward;

    await BalanceTransaction.create({
      amount: prize,
      type: "challengePayout",
      user: user._id,
      state: "completed",
    });

    let updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $inc: {
          balance: prize,
        },
      },
      { returnDocument: "after" },
    )
      .select("balance username anonymous")
      .lean();

    io.of("/general")
      .to(user._id.toString())
      .emit("user", { user: updatedUser });

    io.of("/general").emit("challengeClaim", {
      challengeId: challenge._id,
      userId: user._id,
    });

    generalChatAddMessage(io, {
      room: "en",
      message: `${updatedUser.anonymous ? "Hidden user" : updatedUser.username} has claimed ${challenge.name} challenge and won ${prize} DLS`,
      type: "challenge",
    });

    await createNotification(
      user._id,
      `You have claimed ${challenge.name} challenge and won ${prize} DLS`,
      io,
      "challenge",
    );
  } catch (error) {
    logger.error("Error in tryToClaim:", error);
  }
}

function initChallenges() {
  updateCache();
}

setInterval(
  () => {
    //Update cache daily in order to include challenges for the next day
    updateCache();
  },
  1000 * 60 * 60 * 12,
);

module.exports = {
  tryToClaim,
  createChallenge,
  initChallenges,
};
