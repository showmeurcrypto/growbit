const validator = require("validator");

const { getKeysEarned } = require("./../general/user");

const unboxCheckGetBoxDataData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.boxId === undefined ||
    data.boxId === null ||
    typeof data.boxId !== "string"
  ) {
    throw new Error("You’ve entered an invalid box id.");
  }
};

const unboxCheckGetBoxDataBox = (boxDatabase) => {
  if (boxDatabase === null) {
    throw new Error("Your entered box is not available.");
  }
};

const unboxCheckSendBetData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.boxId === undefined ||
    data.boxId === null ||
    typeof data.boxId !== "string"
    //validator.isMongoId(data.boxId) !== true
  ) {
    throw new Error("You’ve entered an invalid box id.");
  } else if (
    data.unboxCount === undefined ||
    data.unboxCount === null ||
    isNaN(data.unboxCount) === true ||
    Math.floor(data.unboxCount) < 1 ||
    Math.floor(data.unboxCount) > 4
  ) {
    throw new Error("You’ve entered an invalid unbox count.");
  }
};

const validateKeyUnlockReq = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (!data.level && !data.daily) {
    throw new Error("You’ve entered an invalid key level.");
  }
};

const validateKeyUnlock = (level, user) => {
  const keys = getKeysEarned(user, level);

  if (!keys) {
    throw new Error("You must reach a higher level to unlock this key.");
  }

  let timesClaimed = user.claimedKeys?.filter((num) => num === level).length;

  if (timesClaimed >= keys) {
    throw new Error("Key for this level has already been claimed.");
  }
};

const unboxCheckSendBetBox = (boxDatabase) => {
  // if (boxDatabase === null || boxDatabase.state !== "active") {
  //   throw new Error("Your requested box is not available.");
  // }
};

const unboxCheckSendBetUser = (user, amountBetTotal) => {
  if (user.balance < amountBetTotal) {
    throw new Error("You don’t have enough balance for this action.");
  }
};

const unboxCheckSendBetSeed = (seedDatabase) => {
  if (seedDatabase === null) {
    throw new Error("You need to generate a server seed first.");
  }
};

const unboxGetOutcomeItem = (boxDatabase, outcome) => {
  let pos = 0;
  let outcomeItem = null;

  for (const item of boxDatabase.items) {
    pos += item.frequency * 100000; // Convert frequency to range scale
    if (outcome < pos) {
      // Use '<' to properly fit within 0 - 100000 range
      outcomeItem = item;
      break;
    }
  }

  return outcomeItem;
};

module.exports = {
  unboxCheckGetBoxDataData,
  unboxCheckGetBoxDataBox,
  unboxCheckSendBetData,
  unboxCheckSendBetBox,
  unboxCheckSendBetUser,
  unboxCheckSendBetSeed,
  unboxGetOutcomeItem,
  validateKeyUnlockReq,
  validateKeyUnlock,
};
