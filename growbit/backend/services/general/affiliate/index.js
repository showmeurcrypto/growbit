const User = require("../../../database/models/User");
const BalanceTransaction = require("../../../database/models/BalanceTransaction");

const { socketRemoveAntiSpam } = require("../../../utils/socket");
const {
  generalCheckSetAffiliateCodeData,
  generalCheckSetAffiliateCodeCode,
  generalCheckSendAffiliateClaimEarningsUser,
} = require("../../../utils/general/affiliate");

const setAffiliateCode = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    generalCheckSetAffiliateCodeData(data);

    // Get affiliate code and transform to lower case
    const code = data.code.toLowerCase();

    // Validate if affiliate already code exists
    let dataDatabase = await User.findOne({ "affiliates.code": code })
      .select("affiliates.code")
      .lean();
    generalCheckSetAffiliateCodeCode(dataDatabase);

    // Update user in database
    dataDatabase = await User.findByIdAndUpdate(
      user._id,
      { "affiliates.code": code },
      { new: true },
    )
      .select("affiliates")
      .lean();

    callback({ success: true, data: dataDatabase.affiliates });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const claimAffiliateEarnings = async (io, socket, user, data, callback) => {
  try {
    // Check if user has enough available affiliate earnings
    generalCheckSendAffiliateClaimEarningsUser(user);

    const factor = getAffiliateLevel(user).commission;
    // Update claiming user and create balance transaction in database
    const dataDatabase = await Promise.all([
      User.findByIdAndUpdate(
        user._id,
        {
          $inc: {
            balance: user.affiliates.available * factor,
            "affiliates.totalClaimed": user.affiliates.available * factor,
          },
          "affiliates.available": 0,
          "affiliates.lastClaimed": new Date(),
        },
        { new: true },
      ).select(
        "balance xp stats rakeback affiliates mute ban verifiedAt updatedAt",
      ),
      BalanceTransaction.create({
        amount: user.affiliates.available * factor,
        type: "affiliateEarningClaim",
        user: user._id,
        state: "completed",
      }),
    ]);

    callback({ success: true, user: dataDatabase[0] });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const AFFILIATE_LV_2 = process.env.AFFILIATE_LV_2 || 10000;
const AFFILIATE_LV_3 = process.env.AFFILIATE_LV_3 || 100000;
const COMMISSIONS = [0.05, 0.1, 0.15];

function getAffiliateLevel(user) {
  const wager = user.affiliates.wager;

  const customCommission = +user.affiliates.customCommission;

  if (customCommission) {
    return { commission: Math.min(customCommission, 0.3), level: "PARTNER" };
  }

  let level = 1;

  if (wager >= AFFILIATE_LV_3) {
    level = 3;
  } else if (wager >= AFFILIATE_LV_2) {
    level = 2;
  }

  return { commission: COMMISSIONS[level - 1], level };
}

async function getAffiliateList(userId) {
  return await User.find({ "affiliates.referrer": userId })
    .select("username affiliates stats createdAt")
    .sort({ "affiliates.generated": -1 })
    .lean()
    .limit(10)
    .exec();
}

module.exports = {
  setAffiliateCode,
  claimAffiliateEarnings,
  getAffiliateLevel,
  getAffiliateList,
};
