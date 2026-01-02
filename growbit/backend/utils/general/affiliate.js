const validator = require("validator");

const generalCheckSetAffiliateCodeData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong! Please try again in a few seconds.");
  } else if (
    data.code === undefined ||
    data.code === null ||
    typeof data.code !== "string" ||
    data.code.trim() === "" ||
    data.code.length < 2 ||
    data.code.length > 20 ||
    validator.isAlphanumeric(data.code, "en-US", { ignore: "-_" }) !== true
  ) {
    throw new Error("Your entered affiliate code is invalid.");
  }
};

const generalCheckSetAffiliateCodeCode = (checkCode) => {
  if (checkCode !== undefined && checkCode !== null) {
    throw new Error(
      "You’ve entered an affiliate code that is already used by another user.",
    );
  }
};

const generalCheckSendAffiliateClaimCodeCode = (user, codeDatabase) => {
  if (codeDatabase === null) {
    throw new Error("Your provided affiliate code is invalid.");
  } else if (user._id.toString() === codeDatabase._id.toString()) {
    throw new Error("You are not allowed to redeem your own affiliate code.");
  }
};

const generalCheckSendAffiliateClaimEarningsUser = (user) => {
  if (user === undefined) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (user.affiliates.available < process.env.AFFILIATE_MIN_CLAIM) {
    throw new Error(
      `You’ll need a minimum of ${process.env.AFFILIATE_MIN_CLAIM} DL in earnings to claim.`,
    );
  } else if (user.affiliates.lastClaimed) {
    if (
      new Date().getTime() - user.affiliates.lastClaimed.getTime() <
      24 * 60 * 60 * 1000
    ) {
      throw new Error("You can claim once every 24h");
    }
  }
};

module.exports = {
  generalCheckSetAffiliateCodeData,
  generalCheckSetAffiliateCodeCode,
  generalCheckSendAffiliateClaimCodeCode,
  generalCheckSendAffiliateClaimEarningsUser,
};
