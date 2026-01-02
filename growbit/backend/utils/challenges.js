const CHALLENGE_COLOURS = ["purple", "green", "blue", "yellow"];

const CHALLENGES_MIN_MIN_MULTIPLIER =
  +process.env.CHALLENGES_MIN_MIN_MULTIPLIER || 2;
const CHALLENGES_MIN_MIN_BET = +process.env.CHALLENGES_MIN_MIN_BET || 1;
const CHALLENGES_MAX_CLAIMS = +process.env.CHALLENGES_MAX_CLAIMS || 20;

const validateRequest = (req) => {
  if (!req.body.game) {
    throw new Error("The 'game' field is required.");
  }

  if (!req.body.multiplier) {
    throw new Error("The 'multiplier' field is required.");
  }

  if (req.body.multiplier < CHALLENGES_MIN_MIN_MULTIPLIER) {
    throw new Error(
      `The 'multiplier' must be at least ${CHALLENGES_MIN_MIN_MULTIPLIER}.`,
    );
  }

  if (!req.body.date) {
    throw new Error("The 'date' field is required.");
  }

  if (!req.body.reward) {
    throw new Error("The 'reward' field is required.");
  }

  if (!req.body.claims) {
    throw new Error("The 'claims' field is required.");
  }

  if (req.body.claims > CHALLENGES_MAX_CLAIMS) {
    throw new Error(`The 'claims' cannot exceed ${CHALLENGES_MAX_CLAIMS}.`);
  }

  if (!req.body.name) {
    throw new Error("The 'name' field is required.");
  }

  if (!req.body.minBet) {
    throw new Error("The 'minBet' field is required.");
  }

  if (req.body.minBet < CHALLENGES_MIN_MIN_BET) {
    throw new Error(`The 'minBet' must be at least ${CHALLENGES_MIN_MIN_BET}.`);
  }

  if (!CHALLENGE_COLOURS.includes(req.body.colour)) {
    throw new Error(
      "The 'colour' field must be one of the valid challenge colours.",
    );
  }
};

module.exports = {
  validateRequest,
};
