const PLINKO_MIN_AMOUNT = process.env.PLINKO_MIN_AMOUNT || 0.01;
const plinkoValidateRequest = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.amount === undefined ||
    data.amount === null ||
    isNaN(data.amount) === true ||
    data.amount <= 0
  ) {
    throw new Error("Your entered bet amount is invalid.");
  } else if (
    data.rows === undefined ||
    data.rows === null ||
    isNaN(data.rows) === true ||
    Math.floor(data.rows) < 8 ||
    Math.floor(data.rows) > 16
  ) {
    throw new Error("Your entered rows amount is invalid.");
  } else if (
    data.risk === undefined ||
    data.risk === null ||
    typeof data.risk !== "string" ||
    ["low", "medium", "high"].includes(data.risk) === false
  ) {
    throw new Error("Your entered risk is invalid.");
  } else if (data.amount < PLINKO_MIN_AMOUNT) {
    throw new Error(
      `You need to bet at least ${parseFloat(PLINKO_MIN_AMOUNT).toFixed(2)} DLS.`,
    );
  }
};

const plinkoCheckSendCreateUser = (data, user) => {
  if (data === undefined || user === undefined) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (user.balance < data.amount) {
    throw new Error("You have not enough balance for this action.");
  }
};

const plinkoCheckSendCreateSeed = (checkUserSeed) => {
  if (checkUserSeed === undefined || checkUserSeed === null) {
    throw new Error(
      "You need to generate a personal server seed first at the provably fair page.",
    );
  }
};

module.exports = {
  plinkoValidateRequest,
  plinkoCheckSendCreateUser,
  plinkoCheckSendCreateSeed,
};
