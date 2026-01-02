const axios = require("axios");
const { calculateRakeback } = require("../../utils/general/rakeback");
const User = require("../../database/models/User");
const SlotGame = require("../../database/models/SlotGame");
const { updateAffiliate, updateReports } = require("../../utils/games/games");
const { generalUserGetFormated } = require("../../utils/general/user");
const { generalAddBetsList } = require("../general/bets");
const {
  growbitTokenToUsd,
  usdToGrowbitToken,
} = require("../cashier/growtopia/currency_service");
const { getSlotName, increasePopularity, getRtp } = require("./slot_data");
const { getRateUsdBase } = require("../cashier/fiat_exchange_rates");
const { logger } = require("../../utils/logger");
const { tryToClaim } = require("../challenges");
const {
  socketCheckAntiSpam,
  socketRemoveAntiSpam,
} = require("../../utils/socket");

async function getUrl(provider_code, game_code, user, demo, currency = "USD") {
  const requestBody = {
    api_login:
      process.env.WWG_API_LOGIN ||
      "7e30050a-3d06-463b-82a8-afb6e5202df6-364214",
    api_password: process.env.WWG_API_PASSWORD || "O5Dsq9VhXTxa",
    method: "getGame",
    lang: "en",
    user_username: user.username,
    user_password: user._id.toString(),
    gameid: game_code,
    homeurl:
      process.env.SERVER_FRONTEND_URL || "https://mmobit.democasino.click",
    cashierurl:
      process.env.SERVER_FRONTEND_CASHIER_URL ||
      "https://mmobit.democasino.click/?modal=cashier",
    play_for_fun: demo ? 1 : 0,
    currency: currency,
  };
  const apiUrl =
    process.env.WWG_API_URL || "https://gs.aggregtr.com/api/system/operator";
  const response = await axios.post(apiUrl, requestBody);

  if (response.data.error == 0) {
    increasePopularity(game_code);
    return response.data.response;
  } else {
    throw new Error(response.data.message);
  }
}

async function createPlayer(user, currency = "USD") {
  try {
    const requestBody = {
      api_login:
        process.env.WWG_API_LOGIN ||
        "7e30050a-3d06-463b-82a8-afb6e5202df6-364214",
      api_password: process.env.WWG_API_PASSWORD || "O5Dsq9VhXTxa",
      method: "createPlayer",
      user_username: user.username,
      user_password: user._id.toString(),
      currency: currency,
    };

    const apiUrl =
      process.env.WWG_API_URL || "https://gs.aggregtr.com/api/system/operator";
    const response = await axios.post(apiUrl, requestBody);

    if (response.data.error == 0) return true;
    else return false;
  } catch (e) {
    console.error("Error fetching slots!", e.response?.status);
  }

  return false;
}

async function processTransaction(
  method,
  user_code,
  game_code,
  amount,
  txn_id,
  currency,
  gameplay_final,
  io,
) {
  const user = await User.findOne({
    username: { $regex: `^${user_code}$`, $options: "i" },
  });
  // .select("rank username balance stats limits fair agreed mute ban _id")
  // .lean();

  try {
    // userId = req.user._id.toString();
    await socketCheckAntiSpam(user._id.toString());
  } catch (err) {
    throw new Error("Unknown error");
    // return res.status(500).json({
    //   success: false,
    //   error: { error: 1, balance: 0, msg: err },
    // });
  }

  const exchangeRate = await getRateUsdBase(currency);

  if (method === "balance") {
    const balance = (await growbitTokenToUsd(user.balance)) * exchangeRate;
    socketRemoveAntiSpam(user._id.toString());
    return balance * 100; //cents
  }

  if (!user) {
    throw new Error("INVALID USER");
  }

  const amountCents = +amount / exchangeRate; // cents in $

  if (method === "debit") {
    // await checkBalance(user, amount);
    let user_balance_cents = (await growbitTokenToUsd(user.balance)) * 100;
    const updatedUserBalanceCents = user_balance_cents - amountCents;
    logger.info("Debit --- Updated User Balance:", updatedUserBalanceCents);
    if (updatedUserBalanceCents < 0)
      throw new Error("You have not enough balance for this action.");

    await updateAfterBet(
      user,
      await usdToGrowbitToken(updatedUserBalanceCents / 100),
      txn_id,
      await usdToGrowbitToken(amountCents / 100),
      await getSlotName(game_code),
      game_code,
      io,
    );

    socketRemoveAntiSpam(user._id.toString());
    return updatedUserBalanceCents * exchangeRate;
  } else if (method === "credit") {
    let user_balance_cents = (await growbitTokenToUsd(user.balance)) * 100;
    const updatedUserBalance_cents = user_balance_cents + amountCents;
    logger.info(
      "Credit --- Updated User Balance:",
      updatedUserBalance_cents / 100,
    );

    let slotRes = await SlotGame.findOne({ txid: txn_id });
    // if(slotRes && slotRes.payout > 0) {
    //   const now = new Date();
    //   const ss = now.getSeconds().toString().padStart(2, '0');
    //   const ms = now.getMilliseconds().toString().padStart(3, '0');
    //   txn_id =  `${txn_id}-${ss}:${ms}`;
    //   console.log("same round id, new round is " + txn_id);
    // }

    // Sometimes all bonus rounds have different round_id hence above query won't find the spin that trigered bonus
    if (!slotRes) {
      // logger.info("different round_id : ", txn_id);
      const slotName = await getSlotName(game_code);
      const betAmount = await usdToGrowbitToken(amountCents / 100);
      await SlotGame.create({
        game: slotName,
        gameCode: game_code,
        amount: betAmount,
        payout: 0,
        multiplier: 0,
        txid: txn_id,
        user: user._id,
      });
    }
    // } else if (slotRes.payout > 0) {
    //   return updatedUserBalance_cents * exchangeRate; // Workaround for pragmatic games that always send 2 "credit" callback
    // }

    await updateAfterFinish(
      user,
      await usdToGrowbitToken(updatedUserBalance_cents / 100),
      txn_id,
      slotRes.amount,
      (await usdToGrowbitToken(amountCents / 100)) / slotRes.amount,
      await usdToGrowbitToken(amountCents / 100),
      await getSlotName(game_code),
      game_code,
      gameplay_final,
      io,
    );
    socketRemoveAntiSpam(user._id.toString());
    return updatedUserBalance_cents * exchangeRate;
  }
  // TODO updateati affiliate i ostalo u "debit_credit" i "debit" tipu transakcije
  // }
  else {
    logger.error("Invalid TXN type");
    throw new Error("Invalid TXN type");
  }
}

async function updateAfterBet(
  user,
  updatedUserBalance,
  txid,
  betAmount,
  slotName,
  gameCode,
  io,
) {
  const promises = [
    User.findOneAndUpdate(
      { username: { $regex: `^${user.username}$`, $options: "i" } },
      { $set: { balance: updatedUserBalance } },
    ),
    SlotGame.create({
      game: slotName,
      gameCode: gameCode,
      amount: betAmount,
      payout: 0,
      multiplier: 0,
      txid: txid,
      user: user._id,
    }),
  ];

  const [updatedUser] = await Promise.all(promises);

  io.of("/general").to(user._id.toString()).emit("user", { user: updatedUser });
  // io.of("/general").emit("bet", {
  //   bet: {
  //     ...game,
  //     user: generalUserGetFormated(game.user),
  //   },
  // });
}

async function updateAfterFinish(
  user,
  updatedUserBalance,
  txid,
  betAmount,
  multiplier,
  payout,
  slotName,
  game_code,
  gameplay_final,
  io,
) {
  gameplay_final = Number(gameplay_final); //converting from string to a number so that 0 equals false
  const houseEdge = (1 - getRtp(slotName)) * 100;
  const amountRakeback = calculateRakeback(betAmount, houseEdge);

  const amountAffiliate =
    user?.affiliates?.referrer && user.limits.blockSponsor !== true
      ? (betAmount * houseEdge) / 100
      : 0;

  const promises = [
    User.findOneAndUpdate(
      { username: { $regex: `^${user.username}$`, $options: "i" } },
      {
        $set: { balance: updatedUserBalance },
        $inc: {
          //balance: betAmount * (multiplier - 1),
          "stats.bet": gameplay_final ? betAmount : 0,
          "stats.won": payout,
          "stats.played": gameplay_final && betAmount > 0 ? 1 : 0,
          "leaderboard.points":
            gameplay_final && !user.limits.blockLeaderboard
              ? betAmount * houseEdge
              : 0,
          "affiliates.generated": gameplay_final ? amountAffiliate : 0,
          "rakeback.daily.earned": gameplay_final ? amountRakeback.daily : 0,
          "rakeback.daily.available": gameplay_final ? amountRakeback.daily : 0,
          "rakeback.weekly.earned": gameplay_final ? amountRakeback.weekly : 0,
          "rakeback.weekly.available": gameplay_final
            ? amountRakeback.weekly
            : 0,
          "rakeback.monthly.earned": gameplay_final
            ? amountRakeback.monthly
            : 0,
          "rakeback.monthly.available": gameplay_final
            ? amountRakeback.monthly
            : 0,
          "limits.betToWithdraw":
            Math.floor(user.limits.betToWithdraw - betAmount) <= 0
              ? -user.limits.betToWithdraw
              : gameplay_final
                ? -betAmount
                : 0,
        },
        updatedAt: new Date().getTime(),
      },
      { new: true },
    )
      .select("balance xp stats rakeback mute ban updatedAt")
      .lean(),
    SlotGame.findOneAndUpdate(
      { txid: txid },
      {
        $inc: {
          payout: payout,
          multiplier: multiplier,
        },
        game: slotName,
        user: user._id,
      },
      {
        returnNewDocument: true,
        returnDocument: "after",
      },
    ),
  ];

  let [updatedUser, game] = await Promise.all(promises);

  if (gameplay_final) {
    updateAffiliate(user, betAmount, houseEdge);
    updateReports(user, betAmount, game.payout, "slots");
    tryToClaim(user, betAmount, game_code, game.multiplier, io);
  }

  //io.of("/general").to(user._id.toString()).emit("user", { user: updatedUser });

  if (gameplay_final) {
    game = await game.populate({
      path: "user",
      select: "username xp stats avatar rank anonymous",
    });
    game = game.toObject();

    game.method = slotName;
    io.of("/general")
      .to(user._id.toString())
      .emit("user", { user: updatedUser });

    generalAddBetsList(
      io,
      {
        ...game,
        method: slotName,
      },
      game.user,
    );
  }
}

module.exports = {
  getUrl,
  createPlayer,
  processTransaction,
};
