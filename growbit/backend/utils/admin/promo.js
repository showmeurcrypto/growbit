const validator = require("validator");

const MAX_PROMO_CODE = process.env.MAX_PROMO_CODE || 10;
const MIN_PROMO_CODE = process.env.MIN_PROMO_CODE || 0.1;

const adminCheckGetPromoListData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.page === undefined ||
    data.page === null ||
    isNaN(data.page) === true ||
    data.page <= 0
  ) {
    throw new Error("Your entered page is invalid.");
  } else if (
    data.search === undefined ||
    data.search === null ||
    typeof data.search !== "string"
  ) {
    throw new Error("Your entered keyword is invalid.");
  }
};

const adminCheckSendPromoCreateData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.code === undefined ||
    data.code === null ||
    typeof data.code !== "string" ||
    data.code.trim() === "" ||
    validator.isAlphanumeric(data.code, "en-US", { ignore: " -#$" }) !== true
  ) {
    throw new Error("Your entered code is invalid.");
  } else if (
    typeof data.reward !== "number" ||
    isNaN(data.reward) === true ||
    data.reward < MIN_PROMO_CODE ||
    data.reward > MAX_PROMO_CODE
  ) {
    throw new Error("Your entered code reward is invalid.");
  } else if (
    data.redeemptions === undefined ||
    data.redeemptions === null ||
    isNaN(data.redeemptions) === true ||
    Math.floor(data.redeemptions) <= 0
  ) {
    throw new Error("Your entered code redeemptions is invalid.");
  } else if (
    data.minWager === undefined ||
    data.minWager === null ||
    isNaN(data.minWager) === true ||
    data.minWager < 0
  ) {
    throw new Error("Your entered min wager is invalid.");
  }
};

const adminCheckSendPromoCreateCode = (promoDatabase) => {
  if (promoDatabase !== null) {
    throw new Error("Your entered code is already existing.");
  }
};

const adminCheckSendPromoRemoveData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.promoId === undefined ||
    data.promoId === null ||
    typeof data.promoId !== "string" ||
    validator.isMongoId(data.promoId) !== true
  ) {
    throw new Error("Your entered promo id is invalid.");
  }
};

const adminCheckSendPromoRemoveCode = (promoDatabase) => {
  if (promoDatabase === null) {
    throw new Error("Your entered code is not existing.");
  }
};

module.exports = {
  adminCheckGetPromoListData,
  adminCheckSendPromoCreateData,
  adminCheckSendPromoCreateCode,
  adminCheckSendPromoRemoveData,
  adminCheckSendPromoRemoveCode,
};
