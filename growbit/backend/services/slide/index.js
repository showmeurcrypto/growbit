const crypto = require("crypto");
const User = require("../../database/models/User");
const SlideGame = require("../../database/models/SlideGame");
const SlideBet = require("../../database/models/SlideBet");
const SlideSeed = require("../../database/models/SlideSeed");

const { socketRemoveAntiSpam } = require("../../utils/socket");
const { fairGetData, fairGetBlockData } = require("../../utils/fair");
const { generalUserGetFormated } = require("../../utils/general/user");
const {
  slideCheckSendBetData,
  slideCheckSendBetUser,
  slideCheckSendBetGame,
  slideSanitizeGame,
  slideSanitizeBets,
  slideSanitizeBet,
  SLIDE_HOUSE_EDGE,
  getWinningColour,
} = require("../../utils/games/slide");

// Load controllers
const { generalAddBetsList } = require("../general/bets");
const {
  updateAffiliate,
  updateUser,
  updateReports,
  limitMultiplier,
} = require("../../utils/games/games");
const { tryToClaim } = require("../challenges");
const { logger } = require("../../utils/logger");

const NUMBER_OF_SLIDE_SEEDS = 1000000;
// Game slide variables
let slideGame = null;
let slideBets = [];
let slideHistory = [];
let slideBetPendingCount = 0;

const slideGetDataSocket = async (io, socket, user, data, callback) => {
  return {
    game: slideSanitizeGame(slideGame),
    bets: slideSanitizeBets(slideBets),
    history: slideHistory,
  };
};

const slideSendBetSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    slideCheckSendBetData(data);

    // Validate if user has enougth balance
    slideCheckSendBetUser(data, user, slideBets);

    // Validate if betting is allowed for current game
    slideCheckSendBetGame(slideGame);

    try {
      // Increase slide bet pending count by 1
      slideBetPendingCount = slideBetPendingCount + 1;

      // Get user bet amount
      const amount = data.amount;

      // Create database query promises array
      let promises = [];

      // Add update users data, report, site rain and referred user if available and create roll bet queries to promises array
      promises = [
        updateUser(0, -amount, amount, 0, user),
        SlideBet.create({
          amount: amount,
          color: data.color,
          game: slideGame._id,
          user: user._id,
        }),
      ];

      // Execute promise queries in database
      let dataDatabase = await Promise.all(promises);

      // Convert bet object to json object
      dataDatabase[1] = dataDatabase[1].toObject();

      // Add user properties to bet object
      dataDatabase[1].user = {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        rank: user.rank,
        limits: user.limits,
        affiliates: user.affiliates,
        anonymous: user.anonymous,
      };

      // Add slide bet to slide bets array
      slideBets.push(dataDatabase[1]);

      // Send slide bet to frontend
      io.of("/slide").emit("bet", {
        bet: slideSanitizeBet(dataDatabase[1]),
      });

      callback({ success: true, user: dataDatabase[0] });

      // Decrease slide bet pending count by 1
      slideBetPendingCount = slideBetPendingCount - 1;

      socketRemoveAntiSpam(user._id);
    } catch (err) {
      slideBetPendingCount = slideBetPendingCount - 1;
      socketRemoveAntiSpam(user._id);
      callback({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  } catch (err) {
    socketRemoveAntiSpam(user._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const slideGameStart = async (io) => {
  try {
    // Generate new slide game
    slideGame = await slideGenerateGame();

    // Clear slide bets array
    slideBets = [];

    // Send sanitized slide game object to frontend
    io.of("/slide").emit("game", {
      game: slideSanitizeGame(slideGame),
    });

    setTimeout(
      () => {
        slideGamePending(io);
      },
      1000 * 13 -
        (new Date().getTime() - new Date(slideGame.createdAt).getTime()),
    );
  } catch (err) {
    setTimeout(() => slideInit(io), 2000);
    logger.error(err);
  }
};

const slideGamePending = async (io) => {
  try {
    if (slideGame.state !== "pending") {
      // Update slide game state
      slideGame.state = "pending";

      // Send sanitized slide game object to frontend
      io.of("/slide").emit("game", {
        game: slideSanitizeGame(slideGame),
      });
    }

    // Check for pending bets
    if (slideBetPendingCount <= 0) {
      slideGameFairness(io);
    } else {
      setTimeout(() => {
        slideGamePending(io);
      }, 1000);
    }
  } catch (err) {
    logger.error(err);
  }
};

const slideGameFairness = async (io) => {
  try {
    // Update slide game state
    slideGame.state = "fairness";

    if (!slideGame.fair.blockNum) {
      // Get fair data from eos provider
      const fairData = await fairGetData();

      // Add block num to slide game object
      slideGame.fair.blockNum = fairData.data.head_block_num + 1;

      // Send sanitized slide game object to frontend
      io.of("/slide").emit("game", {
        game: slideSanitizeGame(slideGame),
      });
    }

    // Get fair block data from eos provider
    const fairBlockData = await fairGetBlockData(slideGame.fair.blockNum);

    // Add public seed to slide game object
    slideGame.fair.seedPublic = fairBlockData.data.id;

    // Get slide outcome for this game
    slideGame.outcome = slideGetOutcome(slideGame);

    // Set slide game state to rolling
    slideGame.state = "rolling";
    slideGame.updatedAt = new Date().getTime();

    // Send slide game to frontend
    io.of("/slide").emit("game", {
      game: slideSanitizeGame(slideGame),
    });

    setTimeout(() => {
      slideGameComplete(io);
    }, 5500);
  } catch (err) {
    setTimeout(() => {
      slideGameFairness(io);
    }, 1000 * 2);
  }
};

const slideGameComplete = async (io) => {
  try {
    // Update slide game state
    slideGame.state = "completed";

    // Create promises arrays
    let promisesUsers = [];
    let promisesBets = [];

    // Create reports stats variables
    let amountBetTotal = 0;
    let amountPayoutTotal = 0;

    const { winningColour, winningMultiplier } = getWinningColour(
      slideGame.outcome,
    );
    for (let bet of slideBets) {
      // Create bet payout variable
      let amountPayout = 0;

      // Set bet payout amount
      if (winningColour === bet.color) {
        let multiplier = limitMultiplier(
          bet.amount,
          winningMultiplier,
          "slide",
        );
        amountPayout = bet.amount * multiplier;
        bet.multiplier = multiplier;
      }

      if (bet.user.rank !== "admin") {
        amountBetTotal = amountBetTotal + bet.amount;
        amountPayoutTotal = amountPayoutTotal + amountPayout;
      }

      updateAffiliate(bet.user, bet.amount, SLIDE_HOUSE_EDGE);
      if (amountPayout > 0) {
        tryToClaim(bet.user, bet.amount, "slide", bet.multiplier, io);
      }

      promisesUsers.push(
        updateUser(
          amountPayout,
          amountPayout,
          bet.amount,
          SLIDE_HOUSE_EDGE,
          bet.user,
        ),
      );

      promisesBets.push(
        SlideBet.findByIdAndUpdate(
          bet._id,
          {
            multiplier: bet.multiplier || 0,
            payout: amountPayout,
            updatedAt: new Date().getTime(),
          },
          { new: true },
        )
          .select("amount payout user updatedAt createdAt multiplier")
          .populate({
            path: "user",
            select:
              " username avatar rank xp stats rakeback anonymous createdAt",
          })
          .lean(),
      );
    }

    updateReports({ rank: "user" }, amountBetTotal, amountPayoutTotal, "slide");
    // Execute update game, user and bet queries
    const dataDatabase = await Promise.all([
      SlideGame.findByIdAndUpdate(
        slideGame._id,
        {
          outcome: slideGame.outcome,
          fair: slideGame.fair,
          state: "completed",
          updatedAt: new Date().getTime(),
        },
        { new: true },
      )
        .select("outcome state createdAt")
        .lean(),
      ...promisesUsers,
      ...promisesBets,
    ]);

    // Add updated slide game object to slide history and remove last element from slide history if its longer then 100
    slideHistory.unshift(dataDatabase[0]);
    if (slideHistory.length > 100) {
      slideHistory.pop();
    }

    dataDatabase[0].fair = slideGame.fair; //Add fairness to object
    // Send full slide game object to frontend
    io.of("/slide").emit("game", { game: slideSanitizeGame(dataDatabase[0]) });

    // Send updated users to frontend
    for (const user of dataDatabase.slice(1, promisesUsers.length + 1)) {
      io.of("/general").to(user._id.toString()).emit("user", { user: user });
    }

    // Add updated bets to bet list
    for (const bet of dataDatabase.slice(promisesUsers.length + 1)) {
      bet.game = dataDatabase[0];
      bet.game.fair = slideGame.fair;

      generalAddBetsList(
        io,
        {
          ...bet,
          method: "slide",
        },
        bet.user,
      );
    }

    // Start slide game after 3s cooldown
    setTimeout(() => {
      slideGameStart(io);
    }, 1000 * 3);
  } catch (err) {
    setTimeout(() => slideInit(io), 2000);
    logger.error(err);
  }
};

const slideInit = async (io) => {
  try {
    // Get last slide game and last 100 completed slide games from database
    let [lastGame, completedGames] = await Promise.all([
      SlideGame.findOne({})
        .sort({ createdAt: -1 })
        .select("fair state createdAt")
        .populate({
          path: "fair.seed",
          select: "seedServer index previousHash",
        })
        .populate({ path: "bets", select: "amount payout game user" })
        .lean(),
      SlideGame.find({ state: "completed" })
        .sort({ createdAt: -1 })
        .limit(100)
        .select("outcome fair state createdAt")
        .lean(),
    ]);

    // Add history games to slide history variable
    slideHistory = completedGames;

    // Handle last game if uncompleted
    if (lastGame && lastGame?.state !== "completed") {
      // Create promise array
      let promises = [];

      // Add roll bet update querys and user update querys to promise array
      for (const bet of lastGame.bets) {
        if (bet.payout === undefined) {
          promises = [
            ...promises,
            SlideBet.findByIdAndUpdate(bet._id, {
              payout: bet.amount,
              updatedAt: new Date().getTime(),
            }),
            User.findByIdAndUpdate(bet.user, {
              $inc: {
                balance: bet.amount,
                "stats.total.bet": -bet.amount,
                "stats.slide.bet": -bet.amount,
              },
              updatedAt: new Date().getTime(),
            }),
          ];
        }
      }

      // Get slide outcome for this game
      lastGame.outcome = slideGetOutcome(lastGame);

      // Execute update roll game query, roll bet querys and user querys in database
      let dataDatabase = await Promise.all([
        SlideGame.findByIdAndUpdate(
          lastGame._id,
          {
            outcome: lastGame.outcome,
            state: "completed",
            updatedAt: new Date().getTime(),
          },
          { new: true },
        )
          .select("outcome fair.nonce state createdAt")
          .lean(),
        ...promises,
      ]);

      // Add updated slide game object to slide history and remove last element from slide history if its longer then 100
      slideHistory.unshift(dataDatabase[0]);
      if (slideHistory.length > 100) {
        slideHistory.pop();
      }
    }

    // Start slide game
    slideGameStart(io);
  } catch (err) {
    setTimeout(() => slideInit(io), 2000);
    logger.error(err);
  }
};

const slideGetOutcome = (slideGame) => {
  const combined = `${slideGame.fair.seed.seedServer}-${slideGame.fair.seedPublic}`;
  const hash = crypto.createHash("sha256").update(combined).digest("hex");
  return Math.abs(parseInt(hash.substr(0, 8), 16)) % 15;
};

const slideGenerateGame = async () => {
  const prevGame = slideGame;

  let gameIndex;
  if (prevGame?.gameIndex === 0) {
    gameIndex = 1;
  } else if (!prevGame?.gameIndex) {
    gameIndex = 0;
  } else {
    gameIndex = prevGame?.gameIndex + 1;
  }

  const seedIndex = NUMBER_OF_SLIDE_SEEDS - 1 - gameIndex;

  let seed = await SlideSeed.findOne({ index: seedIndex }).lean();

  if (!seed) {
    logger.error("Slide seed error!");
    throw new Error("Slide seed error!");
  }

  // Create slide game in database
  let gameDatabase = await SlideGame.create({
    gameIndex: gameIndex,
    fair: {
      seed: seed._id,
    },
    state: "created",
  });

  // Convert game object to json object
  const gameObject = gameDatabase.toObject();

  gameObject.fair = { seed: seed };

  return gameObject;
};

module.exports = {
  slideGetDataSocket,
  slideSendBetSocket,
  slideInit,
};
