const crypto = require("crypto");

// Load database models
const User = require("../../database/models/User");
const UserSeed = require("../../database/models/UserSeed");
const TowersGame = require("../../database/models/TowersGame");
const { logger } = require("../../utils/logger");

// Load utils
const { socketRemoveAntiSpam } = require("../../utils/socket");
const { settingGet } = require("../../utils/setting");
const {
  towersCheckSendBetData,
  towersCheckSendBetUser,
  towersCheckSendBetGame,
  towersCheckSendBetSeed,
  towersCheckSendRevealGame,
  towersCheckSendCashoutGame,
  towersGetGamePayout,
  towersGenerateDeck,
  towersShuffleDeck,
  towersSanitizeGame,
  checkIfGameInProgress,
} = require("../../utils/games/towers");
const {
  generalUserGetRakeback,
  generalUserGetFormated,
  generalSanitizeUserSeed,
} = require("../../utils/general/user");

const { generalAddBetsList } = require("../general/bets");
const {
  updateAffiliate,
  updateUser,
  updateNonce,
  updateReports,
} = require("../../utils/games/games");
const { tryToClaim } = require("../challenges");

const TOWERS_HOUSE_EDGE = 4;

// Towers variables
let towersGames = [];

const towersGetGame = (user) => {
  // Get users towers game index
  const index = towersGames.findIndex(
    (element) => element.user.toString() === user._id.toString(),
  );

  // Get users towers game
  const towersGame =
    index !== -1 ? towersSanitizeGame(towersGames[index]) : null;

  // Return users mines game
  return towersGame;
};

const towersSendBetSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    towersCheckSendBetData(data);

    // Validate user
    towersCheckSendBetUser(data, user);

    // Get users towers game
    const towersGame = towersGames.find(
      (element) => element.user._id.toString() === user._id.toString(),
    );

    // Validate user towers game
    towersCheckSendBetGame(towersGame);

    // Get user seed from database and check if available
    const seedDatabase = await UserSeed.findOne({
      user: user._id,
      state: "active",
    }).select("seedClient seedServer nonce user state");
    towersCheckSendBetSeed(seedDatabase);

    // Get running leaderboard from database if available
    // const leaderboardDatabase = await Leaderboard.findOne({ state: 'running' }).select('state').lean();

    // Get user bet amount
    const amount = data.amount;

    // Combine nonce, server seed and client seed to one string
    const combined = `${seedDatabase.seedServer}-${seedDatabase.nonce}-${seedDatabase.seedClient}`;

    // Generate towers game deck
    let deck = towersGenerateDeck(data.risk);

    // Shuffle towers game deck
    deck = towersShuffleDeck(deck, combined);

    // Create database query promises array
    let promises = [];

    // Add update users data, rain, referred user and create roll bet queries to promises array
    promises = [
      updateUser(0, -amount, amount, TOWERS_HOUSE_EDGE, user),
      updateNonce(seedDatabase._id),
      TowersGame.create({
        amount: amount,
        risk: data.risk,
        deck: deck,
        fair: {
          seed: seedDatabase._id,
          nonce: seedDatabase.nonce,
        },
        user: user._id,
        state: "created",
      }),
    ];

    // Execute promise queries in database
    let dataDatabase = await Promise.all(promises);

    // Convert game object to javascript object
    dataDatabase[2] = dataDatabase[2].toObject();

    // Add towers game to towers games array
    towersGames.push(dataDatabase[2]);

    callback({
      success: true,
      user: dataDatabase[0],
      game: towersSanitizeGame(dataDatabase[2]),
    });

    updateAffiliate(user, amount, TOWERS_HOUSE_EDGE);

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    logger.error(err);
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const towersAutobet = async (io, socket, user, data, callback) => {
  try {
    towersCheckSendBetUser(data, user);

    const existingGame = towersGames.find(
      (element) => element.user._id.toString() === user._id.toString(),
    );

    checkIfGameInProgress(existingGame);

    // Get user seed from database and check if available
    const seedDatabase = await UserSeed.findOne({
      user: user._id,
      state: "active",
    }).select("seedClient seedServer hash nonce user state");

    const amount = data.amount;
    //const towersRisk = Math.floor(data.risk);

    // Combine nonce, server seed and client seed to one string
    const combined = `${seedDatabase.seedServer}-${seedDatabase.nonce}-${seedDatabase.seedClient}`;

    // Generate towers game deck
    let deck = towersGenerateDeck(data.risk);

    // Shuffle towers game deck
    deck = towersShuffleDeck(deck, combined);

    let promises = [];

    const revealed = [];

    let lost = false;

    for (let tile of data.tiles) {
      const current = Math.floor(tile);

      if (current >= deck[0].length) {
        throw new Error("Invalid cell!");
      }

      revealed.push({
        tile: current,
        row: deck[revealed.length],
      });

      if (revealed[revealed.length - 1].row[tile] === "lose") {
        lost = true;
        break;
      }
    }

    const amountPayout = !lost
      ? towersGetGamePayout(
          {
            revealed,
            amount,
            risk: data.risk,
          },
          true,
        )
      : 0;

    const multiplier = amountPayout / amount;

    promises = [
      updateUser(
        amountPayout,
        amountPayout - amount,
        amount,
        TOWERS_HOUSE_EDGE,
        user,
      ),
      updateNonce(seedDatabase._id),
      TowersGame.create({
        amount: amount,
        deck: deck,
        revealed: revealed,
        risk: data.risk,
        fair: {
          seed: seedDatabase._id,
          nonce: seedDatabase.nonce,
        },
        user: user._id,
        state: "completed",
        payout: amountPayout,
        multiplier: multiplier,
      }),
    ];

    // Execute promise queries in database
    let [updatedUser, nonce, towersGame] = await Promise.all(promises);

    // Convert game object to javascript object
    let gameObject = towersGame.toObject();

    gameObject.fair = {
      seed: generalSanitizeUserSeed(seedDatabase),
      nonce: seedDatabase.nonce,
    };

    // Send updated game to frontend
    generalAddBetsList(
      io,
      {
        ...gameObject,
        method: "towers",
      },
      user,
    );

    tryToClaim(user, amount, "towers", multiplier, io);

    updateAffiliate(user, amount, TOWERS_HOUSE_EDGE);

    updateReports(user, towersGame.amount, amountPayout, "towers");

    socketRemoveAntiSpam(socket.decoded._id);

    callback({
      success: true,
      user: updatedUser,
      game: towersSanitizeGame(gameObject),
    });
  } catch (err) {
    logger.error(err);
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const towersSendRevealSocket = async (io, socket, user, data, callback) => {
  try {
    let towersGame = towersGames.find(
      (element) => element.user._id.toString() === user._id.toString(),
    );

    towersCheckSendRevealGame(data, towersGame);

    const tile = Math.floor(data.tile);

    if (tile >= towersGame.deck[0].length) {
      throw new Error("Invalid cell!");
    }

    towersGame.revealed.push({
      tile: tile,
      row: towersGame.deck[towersGame.revealed.length],
    });

    const amountPayout =
      towersGame.revealed[towersGame.revealed.length - 1].row[tile] !== "lose"
        ? towersGetGamePayout(towersGame)
        : 0;

    if (
      towersGame.revealed[towersGame.revealed.length - 1].row[tile] ===
        "lose" ||
      towersGame.revealed.length >= 10 ||
      amountPayout >= process.env.MAX_WIN
    ) {
      // Get payout amount for towers game
      const amountPayout =
        towersGame.revealed[towersGame.revealed.length - 1].row[tile] !== "lose"
          ? towersGetGamePayout(towersGame, true)
          : 0;

      // Get payout multiplier
      const multiplier = amountPayout / towersGame.amount;

      const [updatedUser, updatedGame] = await Promise.all([
        updateUser(amountPayout, amountPayout, 0, null, user),
        TowersGame.findByIdAndUpdate(
          towersGame._id,
          {
            payout: amountPayout,
            multiplier: multiplier,
            revealed: towersGame.revealed,
            state: "completed",
            updatedAt: new Date().getTime(),
          },
          { new: true },
        )
          .select(
            "amount payout multiplier risk deck revealed user state updatedAt fair.nonce",
          )
          .populate({
            path: "fair.seed",
            select: "seedServer seedClient hash nonce",
          })
          .lean(),
      ]);

      updateReports(user, towersGame.amount, amountPayout, "towers");

      if (amountPayout > 0) {
        tryToClaim(user, towersGame.amount, "towers", multiplier, io);
      }

      //Remove the game from the list
      towersGames = towersGames.filter(
        (g) => g._id.toString() !== towersGame._id.toString(),
      );

      updatedGame.fair.seed = generalSanitizeUserSeed(updatedGame.fair.seed);

      // Send updated user to frontend
      io.of("/general")
        .to(user._id.toString())
        .emit("user", { user: updatedUser });

      // Send updated game to frontend
      generalAddBetsList(
        io,
        {
          ...updatedGame,
          method: "towers",
        },
        user,
      );

      towersGame = updatedGame;
    } else {
      towersGame = await TowersGame.findByIdAndUpdate(
        towersGame._id,
        {
          revealed: towersGame.revealed,
          updatedAt: new Date().getTime(),
        },
        { new: true },
      )
        .select(
          "amount payout multiplier risk deck revealed user state updatedAt",
        )
        .lean();

      const index = towersGames.findIndex(
        (element) => element._id.toString() === towersGame._id.toString(),
      );

      towersGames[index] = towersGame;
    }

    callback({ success: true, game: towersSanitizeGame(towersGame) });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    logger.error(err);
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const towersSendCashoutSocket = async (io, socket, user, data, callback) => {
  try {
    // Get users towers game
    let towersGame = towersGames.find(
      (element) => element.user._id.toString() === user._id.toString(),
    );

    // Validate user towers game
    towersCheckSendCashoutGame(towersGame);

    // Get payout amount
    const amountPayout = towersGetGamePayout(towersGame);

    // Get payout multiplier
    const multiplier = amountPayout / towersGame.amount;

    let dataDatabase = await Promise.all([
      updateUser(amountPayout, amountPayout, 0, 0, user),
      TowersGame.findByIdAndUpdate(
        towersGame._id,
        {
          payout: amountPayout,
          multiplier: multiplier,
          state: "completed",
          updatedAt: new Date().getTime(),
        },
        { new: true },
      )
        .select(
          "amount payout multiplier risk deck revealed user state updatedAt fair.nonce",
        )
        .populate({ path: "fair.seed", select: "seedClient hash nonce" })

        .lean(),
    ]);

    updateReports(user, towersGame.amount, amountPayout, "towers");

    // Remove towers game from towers games array
    towersGames.splice(
      towersGames.findIndex(
        (element) => element._id.toString() === dataDatabase[1]._id.toString(),
      ),
      1,
    );

    // Send updated rain to frontend
    //  io.of('/general').emit('rain', { rain: dataDatabase[2] });

    // dataDatabase[1].fair = {
    //   seed: generalSanitizeUserSeed(dataDatabase[1].fair.seed),
    // };

    dataDatabase[1].fair.seed = generalSanitizeUserSeed(
      dataDatabase[1].fair.seed,
    );

    // Send updated game to frontend
    generalAddBetsList(
      io,
      {
        ...dataDatabase[1],
        method: "towers",
      },
      user,
    );

    tryToClaim(user, towersGame.amount, "towers", multiplier, io);

    callback({
      success: true,
      user: dataDatabase[0],
      game: towersSanitizeGame(dataDatabase[1]),
    });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    logger.error(err);
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const towersInit = async (io) => {
  try {
    // Get towers games and add to towers game array
    towersGames = await TowersGame.find({ state: "created" })
      .select("amount risk deck revealed user state")
      .lean();
  } catch (err) {
    logger.error(err);
  }
};

module.exports = {
  towersGetGame,
  towersSendBetSocket,
  towersSendRevealSocket,
  towersSendCashoutSocket,
  towersInit,
  towersAutobet,
};
