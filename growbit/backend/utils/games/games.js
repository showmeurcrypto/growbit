const User = require("../../database/models/User");
const Report = require("../../database/models/Report");
const UserSeed = require("../../database/models/UserSeed");
const { calculateRakeback } = require("../general/rakeback");
const { logger } = require("../logger");

const MAX_WIN = process.env.MAX_WIN || 10000;

const limitMultiplier = (betAmount, multiplier, info = "") => {
  const wonAmount = multiplier * betAmount;
  if (wonAmount > MAX_WIN) {
    logger.info("Max profit exceeded. " + info);
    return MAX_WIN / betAmount;
  }

  return multiplier;
};

async function updateNonce(seedId, k = 1) {
  return UserSeed.findByIdAndUpdate(
    seedId,
    {
      $inc: {
        nonce: k,
      },
    },
    {},
  ).exec();
}

async function updateUser(payoutAmount, balance, wager, houseEdge, user) {
  //When game is extended (not quick) wager is updated in the first call and payout is updated
  // in the second one when game is completed

  const amountRakeback = wager ? calculateRakeback(wager, houseEdge) : null;

  const amountAffiliate =
    user?.affiliates?.referrer && user?.limits?.blockSponsor !== true
      ? (wager * houseEdge) / 100
      : 0;
  // console.log(user);
  return await User.findByIdAndUpdate(
    user._id,
    {
      $inc: {
        balance: balance,
        "stats.bet": wager,
        "stats.won": payoutAmount,
        "stats.played": wager > 0 ? 1 : 0,
        "leaderboard.points":
          user && user.limits && !user.limits.blockLeaderboard
            ? wager * houseEdge
            : 0,
        "affiliates.generated": amountAffiliate,
        "rakeback.daily.earned": amountRakeback?.daily || 0,
        "rakeback.daily.available": amountRakeback?.daily || 0,
        "rakeback.weekly.earned": amountRakeback?.weekly || 0,
        "rakeback.weekly.available": amountRakeback?.weekly || 0,
        "rakeback.monthly.earned": amountRakeback?.monthly || 0,
        "rakeback.monthly.available": amountRakeback?.monthly || 0,
        "limits.betToWithdraw": -wager,
      },
    },
    {
      returnNewDocument: true,
      returnDocument: "after",
    },
  )
    .select("balance username stats rakeback updatedAt anonymous")
    .lean();
}

async function updateAffiliate(user, amount, edge = 0) {
  if (user.affiliates?.referrer && user.rank !== "streamer") {
    await User.findByIdAndUpdate(
      user.affiliates.referrer,
      {
        $inc: {
          "affiliates.wager": amount,
          "affiliates.available": (amount * edge) / 100,
        },
      },
      {},
    ).exec();
  }
}

let reportCache = {};
let flushingCache = null;

function updateReports(user, bet, payout, game) {
  if (user?.rank === "user") {
    const dateKey = new Date().toISOString().slice(0, 10);
    if (!reportCache[dateKey]) {
      reportCache[dateKey] = {
        total: { bet: 0, won: 0 },
        games: {},
      };
    }

    const report = reportCache[dateKey];

    report.total.bet += bet;
    report.total.won += payout;

    if (!report.games[game]) {
      report.games[game] = { bet: 0, won: 0 };
    }

    report.games[game].bet += bet;
    report.games[game].won += payout;
  }
}

const flushReportsToDB = async () => {
  if (flushingCache) return;
  flushingCache = reportCache;
  reportCache = {};

  try {
    const dates = Object.keys(flushingCache);

    for (const dateKey of dates) {
      const data = flushingCache[dateKey];
      const update = {
        $inc: {
          "stats.total.bet": data.total.bet,
          "stats.total.won": data.total.won,
        },
      };

      for (const [game, values] of Object.entries(data.games)) {
        update.$inc[`stats.games.${game}.bet`] = values.bet;
        update.$inc[`stats.games.${game}.won`] = values.won;
      }

      await Report.findOneAndUpdate({ createdAt: dateKey }, update, {
        upsert: true,
      }).exec();

      delete flushingCache[dateKey];
    }
    flushingCache = null;
  } catch (e) {
    logger.error(e);
  }
};

setInterval(flushReportsToDB, 10000);

module.exports = {
  updateAffiliate,
  updateReports,
  updateNonce,
  updateUser,
  limitMultiplier,
  MAX_WIN,
};
