const UserSeed = require("../../database/models/UserSeed");
const MinesGame = require("../../database/models/MinesGame");
const { socketRemoveAntiSpam } = require("../../utils/socket");
const {
  minesValidateGameStart,
  minesCheckSendBetUser,
  checkIfGameInProgress,
  minesCheckSendRevealData,
  minesCheckSendRevealGame,
  minesCheckSendCashoutGame,
  minesGetGamePayout,
  minesSanitizeGame,
  MINES_HOUSE_EDGE,
  minesGenerate,
} = require("../../utils/games/mines");
const {
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

// Mines variables
let minesGames = [];

const minesGetGame = (user) => {
  // Get users mines game index
  const index = minesGames.findIndex(
    (element) => element.user.toString() === user._id.toString(),
  );

  // Get users mines game
  const minesGame = index !== -1 ? minesSanitizeGame(minesGames[index]) : null;

  // Return users mines game
  return minesGame;
};

const minesSendBetSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    minesValidateGameStart(data);

    // Validate user
    minesCheckSendBetUser(data, user);

    // Get users mines game
    const minesGame = minesGames.find(
      (element) => element.user._id.toString() === user._id.toString(),
    );

    // Validate user mines game
    checkIfGameInProgress(minesGame);

    // Get user seed from database and check if available
    const seedDatabase = await UserSeed.findOne({
      user: user._id,
      state: "active",
    }).select("seedClient seedServer nonce user state");

    // Get user bet amount and game mines count
    const amount = data.amount;
    const minesCount = Math.floor(data.minesCount);
    const minesGridSize = Math.floor(data.minesGridSize);

    const deck = minesGenerate(seedDatabase, minesCount, minesGridSize);
    // Create database query promises array
    let promises = [];

    // Add update users data, rain, referred user and create roll bet queries to promises array
    promises = [
      updateUser(0, -amount, amount, MINES_HOUSE_EDGE, user),
      updateNonce(seedDatabase._id),
      MinesGame.create({
        amount: amount,
        minesCount: minesCount,
        gridSize: minesGridSize,
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

    // Add mines game to mines games array
    minesGames.push(dataDatabase[2]);

    callback({
      success: true,
      user: dataDatabase[0],
      game: minesSanitizeGame(dataDatabase[2]),
    });

    updateAffiliate(user, amount, MINES_HOUSE_EDGE);

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const minesAutobet = async (io, socket, user, data, callback) => {
  try {
    minesCheckSendBetUser(data, user);

    const existingGame = minesGames.find(
      (element) => element.user._id.toString() === user._id.toString(),
    );

    checkIfGameInProgress(existingGame);

    // Get user seed from database and check if available
    const seedDatabase = await UserSeed.findOne({
      user: user._id,
      state: "active",
    }).select("seedClient seedServer hash nonce user state");

    const amount = data.amount;
    const minesCount = Math.floor(data.minesCount);
    const minesGridSize = Math.floor(data.minesGridSize);

    const deck = minesGenerate(seedDatabase, minesCount, minesGridSize);

    let promises = [];

    const revealed = [];

    let lost = false;

    for (let tile of data.tiles) {
      revealed.push({ tile: tile, value: deck[tile] });
      if (deck[tile] === "mine") {
        lost = true;
        break;
      }
    }

    const amountPayout = !lost
      ? minesGetGamePayout(
          {
            revealed,
            amount,
            minesCount,
            gridSize: minesGridSize,
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
        MINES_HOUSE_EDGE,
        user,
      ),
      updateNonce(seedDatabase._id),
      MinesGame.create({
        amount: amount,
        gridSize: minesGridSize,
        minesCount: minesCount,
        deck: deck,
        revealed: revealed,
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
    let [updatedUser, nonce, minesGame] = await Promise.all(promises);

    // Convert game object to javascript object
    let gameObject = minesGame.toObject();

    gameObject.fair = {
      seed: generalSanitizeUserSeed(seedDatabase),
      nonce: seedDatabase.nonce,
    };

    // Send updated game to frontend
    generalAddBetsList(
      io,
      {
        ...gameObject,
        method: "mines",
      },
      user,
    );

    tryToClaim(user, amount, "mines", multiplier, io);

    updateAffiliate(user, amount, MINES_HOUSE_EDGE);

    updateReports(user, minesGame.amount, amountPayout, "mines");

    socketRemoveAntiSpam(socket.decoded._id);

    callback({
      success: true,
      user: updatedUser,
      game: minesSanitizeGame(gameObject),
    });
  } catch (err) {
    //console.log(err)
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const minesSendRevealSocket = async (io, socket, user, data, callback) => {
  try {
    // Get users mines game
    let minesGame = minesGames.find(
      (element) => element.user._id.toString() === user._id.toString(),
    );

    // Validate user mines game
    minesCheckSendRevealGame(minesGame, data);

    // Validate sent data
    minesCheckSendRevealData(data, minesGame.gridSize);

    // Get mines tile
    const tile = Math.floor(data.tile);

    // Add revealed tile to game object
    minesGame.revealed.push({ tile: tile, value: minesGame.deck[tile] });

    const amountPayout =
      minesGame.deck[tile] !== "mine" ? minesGetGamePayout(minesGame) : 0;

    if (
      minesGame.deck[tile] === "mine" ||
      minesGame.gridSize - minesGame.minesCount <= minesGame.revealed.length ||
      amountPayout >= process.env.MAX_WIN
    ) {
      // Get payout amount
      const amountPayout =
        minesGame.deck[tile] !== "mine"
          ? minesGetGamePayout(minesGame, true)
          : 0;

      // Get payout multiplier
      const multiplier = amountPayout / minesGame.amount;

      // Create promises database query array
      let promises = [];

      // Add update users data and mines game to promises array
      promises = [
        updateUser(amountPayout, amountPayout, 0, null, user),
        MinesGame.findByIdAndUpdate(
          minesGame._id,
          {
            payout: amountPayout,
            multiplier: multiplier,
            revealed: minesGame.revealed,
            state: "completed",
            updatedAt: new Date().getTime(),
          },
          { new: true },
        )
          .select(
            "amount payout multiplier minesCount gridSize fair deck revealed user state updatedAt",
          )
          .populate({
            path: "fair.seed",
            select: "seedServer seedClient hash nonce",
          })
          .lean(),
      ];

      updateReports(user, minesGame.amount, amountPayout, "mines");

      if (amountPayout > 0) {
        tryToClaim(user, minesGame.amount, "mines", multiplier, io);
      }

      // Execute promises array querys in database
      let dataDatabase = await Promise.all(promises);

      // Remove mines game from mines games array
      minesGames.splice(
        minesGames.findIndex(
          (element) =>
            element._id.toString() === dataDatabase[1]._id.toString(),
        ),
        1,
      );

      dataDatabase[1].fair = {
        seed: generalSanitizeUserSeed(dataDatabase[1].fair.seed),
      };

      // Send updated user to frontend
      io.of("/general")
        .to(user._id.toString())
        .emit("user", { user: dataDatabase[0] });

      // Send updated game to frontend
      generalAddBetsList(
        io,
        {
          ...dataDatabase[1],
          method: "mines",
        },
        user,
      );

      // Set updated mines game to the mines game variable
      minesGame = dataDatabase[1];
    } else {
      // Update mines game in database
      minesGame = await MinesGame.findByIdAndUpdate(
        minesGame._id,
        {
          revealed: minesGame.revealed,
          updatedAt: new Date().getTime(),
        },
        { new: true },
      )
        .select("amount minesCount gridSize deck revealed user state")
        .lean();

      // Update mines game in mines games array
      minesGames.splice(
        minesGames.findIndex(
          (element) => element._id.toString() === minesGame._id.toString(),
        ),
        1,
        minesGame,
      );
    }

    callback({ success: true, game: minesSanitizeGame(minesGame) });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const minesSendCashoutSocket = async (io, socket, user, data, callback) => {
  try {
    // Get users mines game
    let minesGame = minesGames.find(
      (element) => element.user._id.toString() === user._id.toString(),
    );

    // Validate user mines game
    minesCheckSendCashoutGame(minesGame);

    // Get payout amount
    const amountPayout = minesGetGamePayout(minesGame);

    // Get payout multiplier
    const multiplier = amountPayout / minesGame.amount;

    let dataDatabase = await Promise.all([
      updateUser(amountPayout, amountPayout, 0, 0, user),
      MinesGame.findByIdAndUpdate(
        minesGame._id,
        {
          payout: amountPayout,
          multiplier: multiplier,
          state: "completed",
          updatedAt: new Date().getTime(),
        },
        { new: true },
      )
        .select(
          "amount payout multiplier minesCount gridSize deck revealed user state updatedAt fair",
        )
        .populate({ path: "fair.seed", select: "seedClient hash nonce" })

        .lean(),
    ]);

    updateReports(user, minesGame.amount, amountPayout, "mines");

    // Remove mines game from mines games array
    minesGames.splice(
      minesGames.findIndex(
        (element) => element._id.toString() === dataDatabase[1]._id.toString(),
      ),
      1,
    );

    dataDatabase[1].fair = {
      seed: generalSanitizeUserSeed(dataDatabase[1].fair.seed),
    };

    // Send updated game to frontend
    generalAddBetsList(
      io,
      {
        ...dataDatabase[1],
        method: "mines",
      },
      user,
    );

    tryToClaim(user, minesGame.amount, "mines", multiplier, io);

    callback({
      success: true,
      user: dataDatabase[0],
      game: minesSanitizeGame(dataDatabase[1]),
    });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const minesInit = async (io) => {
  try {
    // Get towers games and add to towers game array
    minesGames = await MinesGame.find({ state: "created" })
      .select("amount minesCount gridSize deck revealed user state")
      .lean();
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  minesGetGame,
  minesSendBetSocket,
  minesSendRevealSocket,
  minesSendCashoutSocket,
  minesInit,
  minesAutobet,
};
