const crypto = require("crypto");

const User = require("../../database/models/User");
const CrashGame = require("../../database/models/CrashGame");
const CrashBet = require("../../database/models/CrashBet");
const { socketRemoveAntiSpam } = require("../../utils/socket");
const {
  crashCheckSendBetData,
  crashCheckSendBetUser,
  crashCheckSendBetGame,
  crashCheckSendCashoutGame,
  crashCheckSendCashoutBet,
  crashGetGameMultiplier,
  crashGetOutcome,
  crashSanitizeGame,
  crashSanitizeBets,
  crashSanitizeBet,
  CRASH_HOUSE_EDGE,
} = require("../../utils/games/crash");
const { generalUserGetFormated } = require("../../utils/general/user");

const {
  generalAddBetsList,
  generalReplaceBetsList,
} = require("../general/bets");
const {
  updateAffiliate,
  updateUser,
  limitMultiplier,
  MAX_WIN,
  updateReports,
} = require("../../utils/games/games");
const CrashSeed = require("../../database/models/CrashSeed");
const { logger } = require("../../utils/logger");
const { tryToClaim } = require("../challenges");

// Crash variables
let crashGame = null;
let crashBets = [];
let crashHistory = [];
let crashBetPendingCount = 0;

const crashGetData = () => {
  return {
    game: crashSanitizeGame(crashGame),
    bets: crashSanitizeBets(crashBets),
    history: crashHistory,
  };
};

const NUMBER_OF_CRASH_SEEDS = 1000000;

const crashSendBetSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    crashCheckSendBetData(data);

    // Validate if user has enougth balance
    crashCheckSendBetUser(data, user, crashBets);

    // Validate if betting is allowed for current game
    crashCheckSendBetGame(crashGame);

    try {
      // Increase crash bet pending count by 1
      crashBetPendingCount = crashBetPendingCount + 1;

      const amount = data.amount;
      const autoCashout = data.autoCashout <= 1 ? 0 : data.autoCashout;

      let promises = [
        updateUser(0, -amount, amount, CRASH_HOUSE_EDGE, user),
        CrashBet.create({
          amount: amount,
          autoCashout: autoCashout,
          game: crashGame._id,
          user: user._id,
        }),
      ];

      // Execute promise queries in database
      let dataDatabase = await Promise.all(promises);

      // Convert bet object to javascript object
      dataDatabase[1] = dataDatabase[1].toObject();

      // Add user data to bet object
      dataDatabase[1].user = {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        rank: user.rank,
        stats: user.anonymous === true ? null : user.stats,
        limits: user.limits,
        createdAt: user.createdAt,
        anonymous: user.anonymous,
      };

      // Add crash bet to crash bets array
      crashBets.push(dataDatabase[1]);

      // Send crash bet to frontend
      io.of("/crash").emit("bet", { bet: crashSanitizeBet(dataDatabase[1]) });

      callback({ success: true, user: dataDatabase[0] });

      // Decrease crash bet pending count by 1
      crashBetPendingCount = crashBetPendingCount - 1;

      updateAffiliate(user, amount, CRASH_HOUSE_EDGE);

      socketRemoveAntiSpam(user._id);
    } catch (err) {
      socketRemoveAntiSpam(socket.decoded._id);
      crashBetPendingCount = crashBetPendingCount - 1;
      callback({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const crashSendCashoutSocket = async (io, socket, user, data, callback) => {
  try {
    // Get elapsed for current crash game
    const elapsed = new Date().getTime() - crashGame.updatedAt;

    // Get current crash game multiplier
    const gameMultiplier = crashGetGameMultiplier(elapsed);

    // Validate if cashout is allowed for current game
    crashCheckSendCashoutGame(crashGame, gameMultiplier);

    // Get users crash bet from crash bets array if available
    const userBet =
      crashBets[
        crashBets.findIndex(
          (element) => element.user._id.toString() === user._id.toString(),
        )
      ];

    // Validate users crash bet
    crashCheckSendCashoutBet(crashGame, gameMultiplier, userBet);

    // Cashout crash bet
    crashBetCashout(io, gameMultiplier, userBet);

    callback({ success: true });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const crashGameStart = async (io) => {
  try {
    // Clear crash bets array
    crashBets = [];

    // Generate new crash game
    crashGame = await crashGenerateGame();

    // Send sanitized crash game object to frontend
    io.of("/crash").emit("game", { game: crashSanitizeGame(crashGame) });

    setTimeout(
      () => {
        crashGameValidate(io);
      },
      1000 * 6 -
        (new Date().getTime() - new Date(crashGame.createdAt).getTime()),
    );
  } catch (err) {
    logger.error("crash error", err);
    setTimeout(() => {
      crashInit(io);
    }, 2000);
  }
};

const crashGameValidate = async (io) => {
  try {
    // Set crash game state to rolling
    crashGame.state = "pending";

    // Send sanitized crash game object to frontend
    io.of("/crash").emit("game", { game: crashSanitizeGame(crashGame) });

    if (crashBetPendingCount <= 0) {
      const combined = crypto
        .createHash("sha256")
        .update(
          `${process.env.CRASH_PUBLIC_SEED}-${crashGame.fair.seed.seedServer}`,
        )
        .digest("hex");

      // Get crash outcome for this game
      crashGame.outcome = crashGetOutcome(combined);

      // Set crash game state to rolling and updated at
      crashGame.state = "rolling";
      crashGame.updatedAt = new Date().getTime();

      // Send updated and sanitized game object to frontend
      io.of("/crash").emit("game", { game: crashSanitizeGame(crashGame) });

      crashGameTickCall(io, 0);
    } else {
      setTimeout(() => {
        crashGameValidate(io);
      }, 500);
    }
  } catch (err) {
    logger.error(err);
  }
};

const crashGameTickCall = async (io, elapsed) => {
  try {
    const left =
      Math.ceil(16666.666667 * Math.log(0.01 * (crashGame.outcome * 100 + 1))) -
      elapsed;
    const nextTick = Math.max(0, Math.min(left, 150));

    setTimeout(() => {
      crashGameTickRun(io);
    }, nextTick);
  } catch (err) {
    logger.error(err);
  }
};

const crashGameTickRun = async (io) => {
  try {
    // Get elapsed for current crash game
    const elapsed = new Date().getTime() - crashGame.updatedAt;

    // Get current crash game multiplier
    const gameMultiplier = crashGetGameMultiplier(elapsed);

    // Send current crash multiplier to frontend
    io.of("/crash").emit("tick", { multiplier: gameMultiplier });

    // Check bets with auto cashouts
    crashCheckCashouts(io, gameMultiplier);

    if (gameMultiplier > crashGame.outcome) {
      crashGameComplete(io);
    } else {
      crashGameTickCall(io, elapsed);
    }
  } catch (err) {
    logger.error(err);
  }
};

const crashGameComplete = async (io) => {
  try {
    // Set crash game state to completed
    crashGame.state = "completed";

    // Send updated full crash game object to frontend
    io.of("/crash").emit("game", { game: crashGame });
    io.of("/general").emit("crashSeedUpdate", { game: crashGame });

    // Create promises arrays
    let promisesUsers = [];
    let promisesBets = [];

    let totalBet = 0;

    for (const bet of crashBets) {
      if (bet.multiplier === undefined) {
        // Add update bet query to bets promises array

        if (bet.user.rank !== "admin") {
          totalBet += bet.amount;
        }

        promisesUsers.push(
          User.findByIdAndUpdate(
            bet.user._id,
            {
              $inc: {
                "limits.betToWithdraw":
                  bet.user.limits.betToWithdraw - bet.amount <= 0
                    ? -bet.user.limits.betToWithdraw
                    : -bet.amount,
              },
              updatedAt: new Date().getTime(),
            },
            { new: true },
          )
            .select("balance xp stats rakeback mute ban verifiedAt updatedAt")
            .lean(),
        );

        promisesBets.push(
          CrashBet.findByIdAndUpdate(
            bet._id,
            {
              payout: 0,
              updatedAt: new Date().getTime(),
            },
            { new: true },
          )
            .select("amount payout multiplier user updatedAt createdAt")
            .populate({
              path: "user",
              select:
                " username avatar rank xp stats rakeback anonymous createdAt",
            })
            .lean(),
        );
      } else {
        //Update fair.seed in cashed out games
        bet.game = crashSanitizeGame(crashGame);
        let b = {
          ...bet,
          user: generalUserGetFormated(bet.user),
          method: "crash",
        };

        generalReplaceBetsList(io, b);
      }
    }

    updateReports(
      {
        rank: "user",
      },
      totalBet,
      0,
      "crash",
    );

    // Update crash game and crash bets in database
    const dataDatabase = await Promise.all([
      CrashGame.findByIdAndUpdate(
        crashGame._id,
        {
          outcome: crashGame.outcome,
          state: "completed",
          updatedAt: new Date().getTime(),
        },
        { new: true },
      )
        .select("outcome fair state createdAt")
        .populate({ path: "fair.seed", select: "seedServer hash previousHash" })
        .lean(),
      ...promisesUsers,
      ...promisesBets,
    ]);

    // Add updated crash game object to crash history and remove last element from crash history if its longer then 25
    crashHistory.unshift(dataDatabase[0]);
    if (crashHistory.length > 25) {
      crashHistory.pop();
    }

    // Add updated bets to bet list
    for (const bet of dataDatabase.slice(promisesUsers.length + 1)) {
      bet.game = crashSanitizeGame(dataDatabase[0]);

      let b = {
        ...bet,
        method: "crash",
      };

      generalAddBetsList(io, b, bet.user);
    }

    // Start crash game after 5s cooldown
    setTimeout(() => {
      crashGameStart(io);
    }, 1000 * 3);
  } catch (err) {
    logger.error("crash error", err);
    setTimeout(() => {
      crashInit(io);
    }, 2000);
  }
};

const crashCheckCashouts = (io, multiplier) => {
  try {
    for (const bet of crashBets) {
      if (
        !bet.multiplier &&
        bet.autoCashout >= 1.01 &&
        bet.autoCashout <= multiplier &&
        bet.autoCashout <= crashGame.outcome
      ) {
        crashBetCashout(io, bet.autoCashout, bet);
      } else if (
        !bet.multiplier &&
        bet.amount * multiplier >= MAX_WIN &&
        multiplier <= crashGame.outcome
      ) {
        crashBetCashout(io, multiplier, bet);
      }
    }
  } catch (err) {
    logger.error(err);
  }
};

const crashBetCashout = async (io, multiplier, bet) => {
  try {
    // Get crash bet index in crash bets array
    const betIndex = crashBets.findIndex(
      (element) => element._id.toString() === bet._id.toString(),
    );

    // Handle bet cashout if its available
    if (betIndex !== -1) {
      // Get bet payout amount

      multiplier = limitMultiplier(
        crashBets[betIndex].amount,
        multiplier,
        "crash",
      );
      const amountPayout = crashBets[betIndex].amount * multiplier;

      // Update crash bet multiplier
      crashBets[betIndex].payout = amountPayout;
      crashBets[betIndex].multiplier = multiplier;

      // Send updated crash bet to frontend
      io.of("/crash").emit("bet", {
        bet: crashSanitizeBet(crashBets[betIndex]),
      });

      // Update users data and update crash bet in database
      const dataDatabase = await Promise.all([
        updateUser(
          amountPayout,
          amountPayout,
          0,
          CRASH_HOUSE_EDGE,
          crashBets[betIndex].user,
        ),
        CrashBet.findByIdAndUpdate(
          crashBets[betIndex]._id,
          {
            payout: amountPayout,
            multiplier: multiplier,
            updatedAt: new Date().getTime(),
          },
          { new: true },
        )
          .select("amount payout actions user updatedAt createdAt multiplier")
          .lean(),
      ]);

      updateReports(
        crashBets[betIndex].user,
        crashBets[betIndex].amount,
        amountPayout,
        "crash",
      );

      tryToClaim(
        crashBets[betIndex].user,
        crashBets[betIndex].amount,
        "crash",
        multiplier,
        io,
      );

      // Send updated user to frontend
      io.of("/general")
        .to(dataDatabase[0]._id.toString())
        .emit("user", { user: dataDatabase[0] });

      dataDatabase[1].game = crashSanitizeGame(crashGame);

      // Add updated bet to bet list
      // false because we're not updating the frontend with version that has nsanitized seed
      generalAddBetsList(
        io,
        {
          ...dataDatabase[1],
          method: "crash",
        },
        dataDatabase[0],
      );
    }
  } catch (err) {
    logger.error(err);
  }
};

const crashInit = async (io) => {
  try {
    if (!process.env.CRASH_PUBLIC_SEED) {
      throw Error("Crash public seed is missing");
    }
    // Get last crash game and last 25 completed crash games from database
    let [lastGame, completedGames] = await Promise.all([
      CrashGame.findOne({
        gameIndex: { $exists: true },
        "fair.seed": { $exists: true },
      })
        .sort({ createdAt: -1 })
        .select("fair state createdAt")
        .populate({
          path: "fair.seed",
          select: "seedServer index previousHash",
        })
        .populate({
          path: "bets",
          select: "amount payout game user",
        })
        .lean(),
      CrashGame.find({ state: "completed" })
        .sort({ createdAt: -1 })
        .limit(25)
        .select("outcome fair state createdAt")
        .populate({
          path: "fair.seed",
          select: "seedServer previousHash",
        })
        .lean(),
    ]);

    // Add history games to crash history variable
    crashHistory = completedGames;

    // Handle last game if uncompleted
    if (lastGame && lastGame.state !== "completed") {
      // Create promise array
      let promises = [];

      // Add crash bet update querys and user update querys to promise array
      for (const bet of lastGame.bets) {
        if (bet.payout === undefined) {
          promises = [
            ...promises,
            CrashBet.findByIdAndUpdate(bet._id, {
              payout: bet.amount,
              updatedAt: new Date().getTime(),
            }),
            User.findByIdAndUpdate(bet.user, {
              $inc: {
                balance: bet.amount,
                "stats.bet": -bet.amount,
              },
              updatedAt: new Date().getTime(),
            }),
          ];
        }
      }

      // Combine crash game id and server seed and sha256 hash the combined string
      const combined = crypto
        .createHash("sha256")
        .update(
          `${process.env.CRASH_PUBLIC_SEED}-${lastGame.fair.seed.seedServer}`,
        )
        .digest("hex");

      // Get crash outcome for this game
      lastGame.outcome = crashGetOutcome(combined);

      // Execute update crash game query, roll bet querys and user querys in database
      let dataDatabase = await Promise.all([
        CrashGame.findByIdAndUpdate(
          lastGame._id,
          {
            outcome: lastGame.outcome,
            state: "completed",
            updatedAt: new Date().getTime(),
          },
          { new: true },
        )
          .select("outcome fair state createdAt")
          .populate({
            path: "fair.seed",
            select: "seedServer hash previousHash",
          })
          .lean(),
        ...promises,
      ]);

      // Add updated crash game object to crash history and remove last element from roll history if its longer then 25
      crashHistory.unshift(dataDatabase[0]);
      if (crashHistory.length > 25) {
        crashHistory.pop();
      }
    }

    // Start crash game
    crashGameStart(io);
  } catch (err) {
    logger.error("crashInit failure", err);
    setTimeout(() => {
      crashInit(io);
    }, 2000);
    logger.error(err);
  }
};

const crashGenerateGame = async () => {
  const prevGame = crashGame;

  let gameIndex;
  if (prevGame?.gameIndex === 0) {
    gameIndex = 1;
  } else if (!prevGame?.gameIndex) {
    gameIndex = 0;
  } else {
    gameIndex = prevGame?.gameIndex + 1;
  }

  const seedIndex = NUMBER_OF_CRASH_SEEDS - 1 - gameIndex;

  let seed = await CrashSeed.findOne({ index: seedIndex }).lean();

  if (!seed) {
    logger.error("Crash seed error!");
    throw new Error("Crash seed error!");
  }

  const game = await CrashGame.create({
    gameIndex: gameIndex,
    fair: {
      seed: seed._id,
    },
    state: "created",
  });

  let gameObject = game.toObject();
  gameObject.fair = { seed: seed };

  return gameObject;
};

module.exports = {
  crashGetData,
  crashSendBetSocket,
  crashSendCashoutSocket,
  crashInit,
};
