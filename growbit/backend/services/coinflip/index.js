const crypto = require("crypto");

// Load database models
const User = require("../../database/models/User");

const CoinflipGame = require("../../database/models/CoinflipGame");

// Load utils
const { socketRemoveAntiSpam } = require("../../utils/socket");
const { settingGet } = require("../../utils/setting");
const { fairGetData, fairGetBlockData } = require("../../utils/fair");
const {
  coinflipCheckGetGameDataData,
  coinflipCheckGetGameDataGame,
  coinflipValidateCreateReq,
  coinflipCheckSendCreateUser,
  coinflipCheckcallCoinflipBotData,
  coinflipCheckcallCoinflipBotGame,
  coinflipCheckSendJoinData,
  coinflipCheckSendJoinGame,
  coinflipCheckSendJoinUser,
  coinflipCheckSendCancelData,
  coinflipCheckSendCancelGame,
  coinflipGenerateGame,
  coinflipSanitizeGames,
  coinflipSanitizeGame,
  getCoinflipSide,
} = require("../../utils/games/coinflip");
const { generalUserGetFormated } = require("../../utils/general/user");

const {
  updateUser,
  updateAffiliate,
  updateReports,
} = require("../../utils/games/games");
const { logger } = require("../../utils/logger");
const { tryToClaim } = require("../challenges");

// Load controllers
const { generalAddBetsList } = require("../general/bets");

const COINFLIP_RAKE = 4;

let coinflipGames = [];
let coinflipBlockGame = [];

const coinflipGetData = () => {
  return {
    games: coinflipSanitizeGames(coinflipGames.slice(0, 100)),
  };
};

const coinflipSendCreateSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    coinflipValidateCreateReq(data);

    // Get users open coinflip games from coinflip game array
    const userGames = coinflipGames.filter(
      (game) => game.author._id.toString() === user._id.toString(),
    );

    // Validate if user has enougth balance and not more then 5 open games
    coinflipCheckSendCreateUser(data, user, userGames);

    let coinflipGame = await coinflipGenerateGame(
      data.amount,
      data.pick,
      user._id,
    );

    coinflipGame.author = {
      _id: user._id,
      username: user.anonymous ? "Hidden" : user.username,
      avatar: user.avatar,
      rank: user.rank,
      limits: user.limits,
    };

    // Create database query promises array
    let promises = [];

    let updatedUser = await updateUser(
      0,
      -data.amount,
      data.amount,
      COINFLIP_RAKE,
      user,
    );

    coinflipGames.push(coinflipGame);

    io.of("/general")
      .to(user._id.toString())
      .emit("user", { user: updatedUser });

    io.of("/coinflip").emit("game", {
      game: coinflipSanitizeGame(coinflipGame),
    });

    callback({ success: true });

    socketRemoveAntiSpam(socket.decoded._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

function getWinProbability(betAmount) {
  if (betAmount < 10) {
    return 0.48;
  } else if (betAmount < 50) {
    return 0.46;
  } else if (betAmount < 100) {
    return 0.4;
  }
  return 0.3;
}

const getBotResult = (coinflipGame) => {
  let side = getCoinflipSide(
    coinflipGame.fair.seedServer,
    coinflipGame.fair.seedPublic,
  );
  coinflipGame.side = side;
  let playerWins = side === coinflipGame.pick;

  const random = Math.random();
  let changeParity = false;
  //Lowering RTP
  if (random < getWinProbability(coinflipGame.amount)) {
    changeParity = !playerWins;
  } else {
    changeParity = playerWins;
  }

  if (changeParity) {
    let newSeed = null;

    let limit = 10;
    while (limit > 0) {
      newSeed = crypto.randomBytes(32).toString("hex"); // Generate a new random seed
      let newSide = getCoinflipSide(newSeed, coinflipGame.fair.seedPublic);

      if (newSide !== side) {
        // Break loop if the new result is different
        coinflipGame.side = newSide;
        break;
      }
      limit--;
    }

    const hash = crypto.createHash("sha256").update(newSeed).digest("hex");

    coinflipGame.fair = {
      ...coinflipGame.fair,
      seedServer: newSeed,
      hash: hash,
    };
  }
};

const coinflipCallCoinflipBotSocket = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  try {
    // Validate sent data
    coinflipCheckcallCoinflipBotData(data);

    let coinflipGame = coinflipGames.find(
      (g) => g._id.toString() === data.gameId.toString(),
    );

    // Validate coinflip game
    coinflipCheckcallCoinflipBotGame(
      user,
      coinflipGame,
      coinflipBlockGame,
      coinflipBlockGame,
    );

    try {
      // Add game id to game block array
      coinflipBlockGame.push(data.gameId.toString());

      const amountGameBet = coinflipGame.amount;

      coinflipGame.bot = true;

      // Send coinflip game to frontend
      io.of("/coinflip").emit("game", {
        game: coinflipSanitizeGame(coinflipGame),
      });

      coinflipGameFairness(io, coinflipGame);

      callback({ success: true });

      coinflipBlockGame = coinflipBlockGame.filter(
        (g) => g !== data.gameId.toString(),
      );

      socketRemoveAntiSpam(user._id);
    } catch (err) {
      socketRemoveAntiSpam(socket.decoded._id);
      coinflipBlockGame = coinflipBlockGame.filter(
        (g) => g !== data.gameId.toString(),
      );

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

const coinflipSendJoinSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    coinflipCheckSendJoinData(data);

    let coinflipGame = coinflipGames.find(
      (g) => g._id.toString() === data.gameId.toString(),
    );

    // Validate coinflip game
    coinflipCheckSendJoinGame(user, coinflipGame, coinflipBlockGame);

    try {
      // Add game id to join block array
      coinflipBlockGame.push(coinflipGame._id.toString());

      // Validate if user has enougth balance
      coinflipCheckSendJoinUser(user, coinflipGame);

      // Get game bet amount
      const amountGameBet = coinflipGame.amount;

      // Create database query promises array
      let promises = [];

      promises = [
        updateUser(0, -amountGameBet, amountGameBet, COINFLIP_RAKE, user),

        CoinflipGame.findByIdAndUpdate(data.gameId, {
          secondPlayer: user._id,
          bot: false,
        }),
      ];

      // Execute promise queries in database
      let [updateSecondPlayer, gameDb] = await Promise.all(promises);

      coinflipGame.bot = false;
      coinflipGame.secondPlayer = {
        _id: user._id,
        username: user.anonymous ? "Hidden" : user.username,
        avatar: user.avatar,
        rank: user.rank,
        stats: user.anonymous === true ? null : user.stats,
        limits: user.limits,
      };

      io.of("/general")
        .to(user._id.toString())
        .emit("user", { user: updateSecondPlayer });

      // Send coinflip game to frontend
      io.of("/coinflip").emit("game", {
        game: coinflipSanitizeGame(coinflipGame),
      });

      coinflipGameFairness(io, coinflipGame);

      callback({ success: true });

      coinflipBlockGame = coinflipBlockGame.filter(
        (id) => id !== coinflipGame._id.toString(),
      );

      socketRemoveAntiSpam(user._id);
    } catch (err) {
      socketRemoveAntiSpam(socket.decoded._id);
      logger.error(err);
      coinflipBlockGame = coinflipBlockGame.filter(
        (id) => id !== coinflipGame._id.toString(),
      );

      callback({
        success: false,
        error: { type: "error", message: err.message },
      });
    }
  } catch (err) {
    logger.error(err);

    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const coinflipGameFairness = async (io, coinflipGame) => {
  try {
    coinflipGame.state = "fairness";

    if (!coinflipGame.fair.blockNum) {
      // Get fair data from eos provider
      const fairData = await fairGetData();

      // Add block num to slide game object
      coinflipGame.fair.blockNum = fairData.data.head_block_num + 1;

      io.of("/coinflip").emit("game", {
        game: coinflipSanitizeGame(coinflipGame),
      });
    }

    const fairBlockData = await fairGetBlockData(coinflipGame.fair.blockNum);
    coinflipGame.fair.seedPublic = fairBlockData.data.id;

    if (coinflipGame.bot) {
      getBotResult(coinflipGame);
    } else {
      coinflipGame.side = getCoinflipSide(
        coinflipGame.fair.seedServer,
        coinflipGame.fair.seedPublic,
      );
    }

    coinflipGameComplete(io, coinflipGame);
  } catch (err) {
    setTimeout(() => {
      coinflipGameFairness(io, coinflipGame);
    }, 1000 * 2);
  }
};

const coinflipGameComplete = async (io, coinflipGame) => {
  try {
    // console.log("starting coinflip game complete");
    let totalBet = 0;
    let totalPayout = 0;

    coinflipGame.payout =
      (coinflipGame.amount * 2 * (100 - COINFLIP_RAKE)) / 100;
    coinflipGame.multiplier = (2 * (100 - COINFLIP_RAKE)) / 100;
    coinflipGame.state = "completed";
    coinflipGame.winner =
      coinflipGame.pick == coinflipGame.side
        ? coinflipGame.author._id
        : coinflipGame?.secondPlayer?._id;

    let promisesUsers = [];

    //TODO : rakeback & affiliate

    if (
      coinflipGame.winner?.toString() === coinflipGame.author._id.toString()
    ) {
      promisesUsers.push(
        updateUser(
          coinflipGame.payout,
          coinflipGame.payout,
          0,
          COINFLIP_RAKE,
          coinflipGame.author,
        ),
      );
    } else if (!(coinflipGame.bot && !coinflipGame.secondPlayer)) {
      promisesUsers.push(
        updateUser(
          coinflipGame.payout,
          coinflipGame.payout,
          0,
          COINFLIP_RAKE,
          coinflipGame.secondPlayer,
        ),
      );
    }

    let dataDatabase = await Promise.all([
      CoinflipGame.findByIdAndUpdate(
        coinflipGame._id,
        {
          winner: coinflipGame.winner,
          fair: coinflipGame.fair,
          state: "completed",
          side: coinflipGame.side,
          bot: coinflipGame.bot,
          payout: coinflipGame.payout,
          multiplier: coinflipGame.multiplier,
        },
        {},
      ),
      ...promisesUsers,
    ]);

    coinflipBlockGame = coinflipBlockGame.filter(
      (g) => g !== coinflipGame._id.toString(),
    );

    coinflipGames = coinflipGames.filter(
      (g) => g._id.toString() !== coinflipGame._id.toString(),
    );

    io.of("/coinflip").emit("game", {
      game: coinflipSanitizeGame(coinflipGame),
    });

    let updatedWinner = dataDatabase[1];

    if (updatedWinner) {
      setTimeout(() => {
        io.of("/general")
          .to(updatedWinner._id.toString())
          .emit("user", { user: updatedWinner });
      }, 4000);
    }

    let authorWon = coinflipGame.pick == coinflipGame.side;
    let wager = 0;

    if (coinflipGame.author.rank !== "admin") {
      wager += coinflipGame.amount;
    }

    if (!coinflipGame.bot && coinflipGame.secondPlayer?.rank !== "admin") {
      wager += coinflipGame.amount;
    }

    let won = 0;

    if (authorWon) {
      if (coinflipGame.author.rank !== "admin") {
        won += coinflipGame.payout;
      }

      tryToClaim(
        coinflipGame.author,
        coinflipGame.amount,
        "coinflip",
        coinflipGame.multiplier,
        io,
      );
    } else if (!coinflipGame.bot) {
      if (coinflipGame.secondPlayer.rank !== "admin") {
        won += coinflipGame.payout;
      }

      tryToClaim(
        coinflipGame.secondPlayer,
        coinflipGame.amount,
        "coinflip",
        coinflipGame.multiplier,
        io,
      );
    }

    updateAffiliate(coinflipGame.author, "coinflip", COINFLIP_RAKE);
    if (!coinflipGame.bot) {
      updateAffiliate(coinflipGame.secondPlayer, "coinflip", COINFLIP_RAKE);
    }

    updateReports({ rank: "user" }, wager, won, "coinflip");

    if (authorWon || (!authorWon && !coinflipGame.bot)) {
      let betWinner = {
        _id: coinflipGame._id.toString(),
        game: "coinflip",
        amount: coinflipGame.amount,
        payout: coinflipGame.payout,
        multiplier: coinflipGame.multiplier,
        user: authorWon
          ? await User.findById(coinflipGame.author)
          : await User.findById(coinflipGame.secondPlayer),
        fair: coinflipGame.fair,
        createdAt: coinflipGame.createdAt,
        updatedAt: coinflipGame.updatedAt,
        outcome: coinflipGame.side,
        method: "coinflip",
      };
      generalAddBetsList(io, betWinner, betWinner.user);
    }

    if ((authorWon && !coinflipGame.bot) || !authorWon) {
      let betLoser = {
        _id: coinflipGame._id.toString(),
        game: "coinflip",
        amount: coinflipGame.amount,
        payout: 0,
        multiplier: 0.0,
        user: authorWon ? coinflipGame.secondPlayer : coinflipGame.author,
        fair: coinflipGame.fair,
        createdAt: coinflipGame.createdAt,
        updatedAt: coinflipGame.updatedAt,
        outcome: coinflipGame.side,
        method: "coinflip",
      };
      generalAddBetsList(io, betLoser, betLoser.user, true);
    }
  } catch (err) {
    logger.error(err);
  }
};

const coinflipInit = async (io) => {
  try {
    // Get all uncompleted coinflip games and last 25 completed coinflip games from database
    const [unfinished] = await Promise.all([
      CoinflipGame.find({
        $or: [{ state: "created" }],
      })
        .select(
          "amount fair state updatedAt createdAt side author secondPlayer pick",
        )
        .populate({
          path: "author",
          select: "_id username avatar rank anonymous",
        })
        .lean(),
    ]);

    // Create promises array
    let promises = [];

    for (const game of unfinished) {
      coinflipGames.push(game);
      //TODO: complete game if secondPlayer is not null
    }

    // Execute database queries
    await Promise.all(promises);
  } catch (err) {
    logger.error(err);
  }
};

module.exports = {
  coinflipGetData,
  coinflipSendCreateSocket,
  coinflipCallCoinflipBotSocket,
  coinflipSendJoinSocket,
  coinflipInit,
};
