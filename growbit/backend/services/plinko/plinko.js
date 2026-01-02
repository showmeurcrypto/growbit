const UserSeed = require("../../database/models/UserSeed");
const crypto = require("crypto");
const { calculateRakeback } = require("../../utils/general/rakeback");
const User = require("../../database/models/User");
const QuickGame = require("../../database/models/QuickGame");
const {
  getPayoutMultiplierForHole,
  PLINKO_HOUSE_EDGE,
} = require("./payout_list");
const { buildRandomBools } = require("../../utils/games/provability_fair");
const {
  updateAffiliate,
  updateReports,
  updateNonce,
  updateUser,
  limitMultiplier,
} = require("../../utils/games/games");
const { generalAddBetsList } = require("../general/bets");
const { generalSanitizeUserSeed } = require("../../utils/general/user");
const { tryToClaim } = require("../challenges");

async function playPlinko(user, amount, rows, risk, io) {
  let wageredUser = await updateUser(0, -amount, 0, 0, user);

  io.of("/general").to(user._id.toString()).emit("user", { user: wageredUser });

  const provabilityFair = await UserSeed.findOne({
    user: user._id,
    state: "active",
  }).select("seedClient seedServer nonce hash user state");

  const combined = `${provabilityFair.seedServer}-${provabilityFair.nonce}-${provabilityFair.seedClient}`;
  const hash = crypto.createHash("sha256").update(combined).digest("hex");

  const shuffledGroup = buildRandomBools(rows, hash);

  const path = calculateBallPath(shuffledGroup, rows);
  const hole = getHoleFromBallPath(path);

  let payoutMultiplier = getPayoutMultiplierForHole(hole, risk, rows);

  payoutMultiplier = limitMultiplier(amount, payoutMultiplier, "plinko");

  const payoutAmount = payoutMultiplier * amount;

  let promises = [];

  promises = [
    updateNonce(provabilityFair._id),
    QuickGame.create({
      game: "plinko",
      amount: amount,
      payout: payoutAmount,
      multiplier: payoutMultiplier,
      data: {
        rows,
        risk: risk,
        path,
      },
      fair: {
        nonce: provabilityFair.nonce,
        seed: provabilityFair._id,
      },
      user: user._id,
      state: "completed",
    }),
  ];

  let [updatedSeed, game] = await Promise.all(promises);

  updateAffiliate(user, amount, PLINKO_HOUSE_EDGE);
  updateReports(user, amount, payoutAmount, "plinko");
  tryToClaim(user, amount, "plinko", payoutMultiplier, io);

  // Execute promises array querys in database
  game = await game.populate({
    path: "user",
    select: "username stats avatar rank anonymous",
  });

  game = game.toObject();

  // Sanitize game user and add game mode to game object
  // if(updateDatabase[2].user.anonymous === true) { updateDatabase[2].user = null; }
  game.method = "plinko";
  game.fair = { seed: generalSanitizeUserSeed(provabilityFair) };

  // TODO: remove balance update from here and do it from function which is called when animation ends
  setTimeout(
    async () => {
      let updatedUser = await updateUser(
        payoutAmount,
        payoutMultiplier * amount,
        amount,
        PLINKO_HOUSE_EDGE,
        user,
      );

      io.of("/general")
        .to(user._id.toString())
        .emit("user", { user: updatedUser });

      generalAddBetsList(
        io,
        {
          ...game,
          method: "plinko",
        },
        game.user,
      );
    },
    game.data.rows * 200 + 700,
  );

  // if (game.user.anonymous) {
  //   setTimeout(
  //     () => {
  //       io.of("/general")
  //         .to(user._id.toString())
  //         .emit("anonbet", {
  //           bet: {
  //             ...game,
  //             user: generalUserGetFormated(game.user, true),
  //             method: "plinko",
  //           },
  //         });
  //     },
  //     game.data.rows * 200 + 700,
  //   );
  // }

  return {
    game,
  };
}

function calculateBallPath(randNumber, numRows) {
  if (randNumber.length < numRows) {
    throw new Error(
      `randNumber array length must at least equal to ${numRows}`,
    );
  }

  const path = [];
  let prev_col = 0;
  for (let i = 0; i < numRows; i++) {
    const row = i + 1;
    const is_left = !!randNumber[i];
    const column = is_left ? prev_col : prev_col + 1;
    path.push({
      row,
      column,
    });
    prev_col = column;
  }

  return path;
}

function getHoleFromBallPath(path) {
  return path[path.length - 1].column;
}

module.exports = {
  playPlinko,
};
