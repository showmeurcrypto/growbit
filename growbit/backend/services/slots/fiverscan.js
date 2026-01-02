const axios = require("axios");
const { calculateRakeback } = require("../../utils/general/rakeback");
const User = require("../../database/models/User");
const SlotGame = require("../../database/models/SlotGame");
const { updateAffiliate, updateReports } = require("../../utils/games/games");
const { generalUserGetFormated } = require("../../utils/general/user");
const { generalAddBetsList } = require("../general/bets");
const { getSlotName } = require("./slot_data");

async function getUrl(provider_code, game_code, user_code) {
  const requestBody = {
    agent_code: process.env.NEXUS_AGENT_CODE || "jimi_DLS",
    agent_token:
      process.env.NEXUS_AGENT_TOKEN || "6df5e0b436d5cadbbdbe13a9cb3c81fd",
    method: "game_launch",
    provider_code: provider_code,
    user_code: user_code,
    game_code: game_code,
    lang: "en",
  };
  const apiUrl = process.env.NEXUS_API_URL || "https://api.shinoapi.com";
  const response = await axios.post(apiUrl, requestBody);
  //console.log(response);

  if (response.status == 200) {
    console.log("Game launched successfully:", response.data);
    return response.data.launch_url;
  } else {
    return response.msg;
  }
}

async function processTransaction(
  method,
  agent_code,
  agent_secret,
  agent_balance,
  user_code,
  user_balance,
  game_type,
  live,
  slot,
  io,
) {
  const user = await User.findOne({ username: user_code });
  // .select("rank username balance stats limits fair agreed mute ban _id")
  // .lean();

  console.log(user);

  if (method === "user_balance") {
    return user.balance;
  }

  const game = game_type === "live" ? live : slot;

  console.log(game);

  const {
    provider_code,
    game_code,
    type,
    bet_money,
    win_money,
    txn_id,
    txn_type,
  } = game;

  //validateParams(bet_money, win_money, user_balance);

  if (!user) {
    // return res.json({
    //     status: 0,
    //     msg: "INVALID_USER",
    // });
    throw new Error("INVALID USER");
  }

  checkBalance(user, bet_money);

  console.log("checking tx type");

  // if(method === "user_balance") {
  // 	return user.balance;
  // }
  // else if(method === "transaction") {
  if (txn_type === "debit_credit") {
    const updatedUserBalance = user.balance + (win_money - bet_money);
    console.log("Updated User Balance:", updatedUserBalance);

    await updateAfterBet(
      user,
      updatedUserBalance,
      txn_id,
      bet_money,
      getSlotName(game_code),
      io,
    );

    let slotRes = await SlotGame.findOne({ txid: txn_id });

    await updateAfterFinish(
      user,
      updatedUserBalance,
      txn_id,
      bet_money,
      win_money / slotRes.amount,
      win_money,
      getSlotName(game_code),
      io,
    );

    // await User.findOneAndUpdate({ username: user_code }, { $set: { balance: updatedUserBalance } });
    return updatedUserBalance;
  } else if (txn_type === "debit") {
    const updatedUserBalance = user.balance + (win_money - bet_money);
    console.log("Updated User Balance:", updatedUserBalance);

    await updateAfterBet(
      user,
      updatedUserBalance,
      txn_id,
      bet_money,
      getSlotName(game_code),
      io,
    );

    //await User.findOneAndUpdate({ username: user_code }, { $set: { balance: updatedUserBalance } });
    return updatedUserBalance;
  } else if (txn_type === "credit") {
    const updatedUserBalance = user.balance + (win_money - bet_money);
    console.log("Updated User Balance:", updatedUserBalance);

    let slotRes = await SlotGame.findOne({ txid: txn_id });

    await updateAfterFinish(
      user,
      updatedUserBalance,
      txn_id,
      slotRes.amount,
      win_money / slotRes.amount,
      win_money,
      getSlotName(game_code),
      io,
    );
    // updateAfterFinish(user, updatedBalance, txid, betAmount, multip, payout, slotName)

    //	await User.findOneAndUpdate({ username: user_code }, { $set: { balance: updatedUserBalance } });
    return updatedUserBalance;
  }
  // TODO updateati affiliate i ostalo u "debit_credit" i "debit" tipu transakcije
  // }
  else throw new Error("Invalid TXN type");
}

async function updateAfterBet(
  user,
  updatedUserBalance,
  txid,
  betAmount,
  slotName,
  io,
) {
  const promises = [
    User.findOneAndUpdate(
      { username: user.username },
      { $set: { balance: updatedUserBalance } },
    ),
    SlotGame.create({
      game: slotName,
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
  io,
) {
  const amountRakeback = calculateRakeback(betAmount, 0);

  const promises = [
    User.findOneAndUpdate(
      { username: user.username },
      {
        $set: { balance: updatedUserBalance },
        $inc: {
          //balance: betAmount * (multiplier - 1),
          "stats.bet": betAmount,
          "stats.won": payout,
          "rakeback.daily.earned": amountRakeback.daily,
          "rakeback.daily.available": amountRakeback.daily,
          "rakeback.weekly.earned": amountRakeback.weekly,
          "rakeback.weekly.available": amountRakeback.weekly,
          "rakeback.monthly.earned": amountRakeback.monthly,
          "rakeback.monthly.available": amountRakeback.monthly,
          "limits.betToWithdraw":
            Math.floor(user.limits.betToWithdraw - betAmount) <= 0
              ? -user.limits.betToWithdraw
              : -betAmount,
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
        game: slotName,
        payout: payout,
        multiplier: multiplier,
        user: user._id,
      },
      {
        returnNewDocument: true,
        returnDocument: "after",
      },
    ),
  ];

  updateAffiliate(user, betAmount);
  updateReports(user, betAmount, payout, slotName);

  let [updatedUser, game] = await Promise.all(promises);

  //io.of("/general").to(user._id.toString()).emit("user", { user: updatedUser });

  game = await game.populate({
    path: "user",
    select: "username xp stats avatar rank anonymous",
  });
  game = game.toObject();

  game.method = slotName;

  console.log(game);

  setTimeout(
    () => {
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
    },
    5000, // Hardcoded, approx time it takes for slot reels animation to finish
  );
}

function validateParams(bet, win, user_balance) {
  if (!bet || isNaN(bet) || bet < 0) {
    throw new Error("Invalid Bet Amount");
  }

  if (!win || isNaN(win) || win < 0) {
    throw new Error("Invalid Win Amount");
  }

  if (!user_balance || isNaN(user_balance) || user_balance <= 0) {
    throw new Error("Invalid User Balance");
  }
}

function checkBalance(user, betAmount) {
  if (!user) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (user.balance < betAmount) {
    throw new Error("You have not enough balance for this action.");
  }
}

module.exports = {
  getUrl,
  processTransaction,
};
