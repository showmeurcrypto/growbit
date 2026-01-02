const crypto = require("crypto");

// Load database models
const User = require("../../database/models/User");
const BattlesGame = require("../../database/models/BattlesGame");
const BattlesBet = require("../../database/models/BattlesBet");

// Load utils
const { socketRemoveAntiSpam } = require("../../utils/socket");

const { fairGetData } = require("../../utils/fair");
const {
  battlesCheckGetGameDataData,
  battlesCheckGetGameDataGame,
  battlesCheckSendCreateData,
  battlesCheckSendCreateBoxes,
  battlesCheckSendCreateUser,
  battlesCheckSendBotData,
  battlesCheckSendBotGame,
  battlesCheckSendJoinData,
  battlesCheckSendJoinGame,
  battlesCheckSendJoinUser,
  battlesCheckSendCancelData,
  battlesCheckSendCancelGame,
  battlesGenerateGame,
  battlesGetGameIndex,
  battlesGetAmountGame,
  battlesGetAmountWin,
  battlesGetRounds,
  battlesGetOutcomeItem,
  battlesGetWinnerBets,
  battlesSanitizeGames,
  battlesSanitizeGame,
} = require("../../utils/games/battles");
const {
  generalUserGetLevel,
  generalUserGetRakeback,
  generalUserGetFormated,
} = require("../../utils/general/user");

const {
  updateUser,
  updateAffiliate,
  updateReports,
} = require("../../utils/games/games");
const { logger } = require("../../utils/logger");
const { tryToClaim } = require("../challenges");

// Load controllers
const { generalAddBetsList } = require("../general/bets");

// Battles variables
let battlesGames = [];
let battlesHistory = [];
let battlesBlockGame = [];
let battlesBlockJoin = [];

const BATTLES_RAKE = 4;

const { boxes } = require("../boxLoader");

const battlesGetData = async (user) => {
  const games = battlesGames.filter(
    (game) =>
      game.options.private === false ||
      (user &&
        game.bets.some(
          (bet) => !bet.bot && bet.user._id.toString() === user._id.toString(),
        )),
  );

  return {
    boxes: boxes,
    games: battlesSanitizeGames(games),
    history: battlesHistory,
  };
};

const battlesGetGameDataSocket = async (io, socket, user, data, callback) => {
  try {
    battlesCheckGetGameDataData(data);

    console.log(data);

    let battlesGame = battlesGames.find(
      (element) => element._id.toString() === data.gameId.toString(),
    );
    battlesCheckGetGameDataGame(battlesGame);

    console.log("fetching battle game data");
    console.log(battlesGame);

    callback({ success: true, game: battlesSanitizeGame(battlesGame, true) });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const getBoxes = (data, boxes) => {
  const boxMap = new Map(boxes.map((b) => [b._id, b]));
  const resultMap = new Map();

  for (const box of data.boxes) {
    const found = boxMap.get(box._id);
    if (!found) throw new Error("Your entered boxes are invalid.");

    const count = Math.floor(box.count);
    if (resultMap.has(box._id)) {
      resultMap.get(box._id).count += count;
    } else {
      resultMap.set(box._id, { box: found, count });
    }
  }

  return Array.from(resultMap.values());
};

const battlesSendCreateSocket = async (io, socket, user, data, callback) => {
  try {
    battlesCheckSendCreateData(data);

    battlesCheckSendCreateBoxes(data);

    let pickedBoxes = getBoxes(data, boxes);

    const amount = battlesGetAmountGame(pickedBoxes);

    const amountUser = amount;

    battlesCheckSendCreateUser(user, data, amountUser);

    let battlesGame = await battlesGenerateGame(data, amount, pickedBoxes);

    let promises = [];

    promises = [
      User.findByIdAndUpdate(
        user._id,
        {
          $inc: {
            balance: -amountUser,
            "stats.bet": amountUser,
          },
          updatedAt: new Date().getTime(),
        },
        { new: true },
      )
        .select("balance xp stats rakeback mute ban verifiedAt updatedAt")
        .lean(),
      BattlesBet.create({
        amount: amountUser,
        outcomes: [],
        slot: 0,
        game: battlesGame._id,
        user: user._id,
        bot: false,
      }),
    ];

    // Execute promise queries in database
    let dataDatabase = await Promise.all(promises);

    // Convert bet to javascript object
    dataDatabase[1] = dataDatabase[1].toObject();

    // Add user data to bet object
    dataDatabase[1].user = {
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      rank: user.rank,
      stats: user.anonymous === true ? null : user.stats,
      limits: user.limits,
      affiliates: user.affiliates,
      createdAt: user.createdAt,
    };

    // Add bet to game object
    battlesGame.bets = [dataDatabase[1]];

    // Add battles game to battles game array
    battlesGames.push(battlesGame);

    // Send updated user to frontend
    io.of("/general")
      .to(user._id.toString())
      .emit("user", { user: dataDatabase[0] });

    if (battlesGame.options.private === false) {
      io.of("/battles").emit("game", {
        game: battlesSanitizeGame(battlesGame),
      });
    }

    callback({ success: true, game: battlesSanitizeGame(battlesGame) });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    console.log(err);
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const battlesSendBotSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    battlesCheckSendBotData(data);

    // Validate battles game

    let battlesGame = battlesGames.find(
      (element) => element._id.toString() === data.gameId.toString(),
    );

    battlesCheckSendBotGame(
      user,
      battlesGame,
      battlesBlockJoin,
      battlesBlockGame,
    );

    try {
      // Add game id to game block array
      battlesBlockGame.push(battlesGame._id.toString());

      // Get game bet amount
      const amountGameBet = battlesGame.amount;

      // Create database query promises array
      let promises = [];

      // Add create battles bet queries to promises array
      for (let i = 0; i < battlesGame.playerCount; i++) {
        if (!battlesGame.bets.some((element) => element.slot === i)) {
          promises.push(
            BattlesBet.create({
              amount: amountGameBet,
              outcomes: [],
              slot: i,
              game: battlesGame._id,
              bot: true,
            }),
          );
        }
      }

      // Execute promise queries in database
      let betsDatabase = await Promise.all(promises);

      // Convert bet objects to javascript objects
      betsDatabase = betsDatabase.map((bet) => bet.toObject());

      battlesGame.bets = [...battlesGame.bets, ...betsDatabase];

      if (battlesGame.options.private) {
        for (const bet of battlesGame.bets) {
          if (bet.bot === false) {
            io.of("/battles")
              .to(bet.user._id.toString())
              .emit("game", { game: battlesSanitizeGame(battlesGame) });
          }
        }
      } else {
        io.of("/battles").emit("game", {
          game: battlesSanitizeGame(battlesGame),
        });
      }

      // If battles game state is created start rolling game
      if (battlesGame.state === "created") {
        battlesGameCountdown(io, battlesGame);
      }

      callback({ success: true });

      battlesBlockGame = battlesBlockGame.filter(
        (g) => g._id.toString() != data.gameId,
      );

      socketRemoveAntiSpam(user._id);
    } catch (err) {
      socketRemoveAntiSpam(socket.decoded._id);
      battlesBlockGame = battlesBlockGame.filter(
        (g) => g._id.toString() != data.gameId,
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

const battlesSendJoinSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    battlesCheckSendJoinData(data);

    let battlesGame = battlesGames.find(
      (element) => element._id.toString() === data.gameId.toString(),
    );

    // Validate battles game
    battlesCheckSendJoinGame(
      data,
      user,
      battlesGame,
      battlesBlockJoin,
      battlesBlockGame,
    );

    try {
      // Add game id to game block array
      battlesBlockJoin.push(battlesGame._id.toString());

      // Validate if user has enougth balance
      battlesCheckSendJoinUser(user, battlesGame);

      const amountGameBet = battlesGame.amount;

      // Create database query promises array
      let promises = [];

      // Add update users data and create battles bet queries
      promises = [
        User.findByIdAndUpdate(
          user._id,
          {
            $inc: {
              balance: -amountGameBet,
              "stats.bet": amountGameBet,
            },
            updatedAt: new Date().getTime(),
          },
          { new: true },
        )
          .select("balance xp stats rakeback mute ban verifiedAt updatedAt")
          .lean(),
        BattlesBet.create({
          amount: amountGameBet,
          outcomes: [],
          slot: Math.floor(data.slot),
          game: battlesGame._id,
          user: user._id,
          bot: false,
        }),
      ];

      // Execute promise queries in database
      let dataDatabase = await Promise.all(promises);

      // Convert bet to javascript object
      dataDatabase[1] = dataDatabase[1].toObject();

      // Add user data to bet object
      dataDatabase[1].user = {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        rank: user.rank,
        stats: user.anonymous === true ? null : user.stats,
        limits: user.limits,
        affiliates: user.affiliates,
        createdAt: user.createdAt,
      };

      // Add bet to game object
      battlesGame.bets.push(dataDatabase[1]);

      // Send updated user to frontend
      io.of("/general")
        .to(user._id.toString())
        .emit("user", { user: dataDatabase[0] });

      // Send battles game to frontend
      if (battlesGame.options.private) {
        for (const bet of battlesGame.bets) {
          if (!bet.bot) {
            io.of("/battles")
              .to(bet.user._id.toString())
              .emit("game", {
                game: battlesSanitizeGame(battlesGame),
              });
          }
        }
      } else {
        io.of("/battles").emit("game", {
          game: battlesSanitizeGame(battlesGame),
        });
      }

      // If battles game is full and the state is created start rolling game
      if (
        battlesGame.playerCount <= battlesGame.bets.length &&
        battlesGame.state === "created"
      ) {
        battlesGameCountdown(io, battlesGame);
      }

      callback({ success: true });

      battlesBlockJoin = battlesBlockJoin.filter(
        (g) => g._id.toString() != data.gameId,
      );

      socketRemoveAntiSpam(user._id);
    } catch (err) {
      socketRemoveAntiSpam(socket.decoded._id);
      battlesBlockJoin = battlesBlockJoin.filter(
        (g) => g._id.toString() != data.gameId,
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

const battlesGameCountdown = (io, battlesGame) => {
  // Update battles game state to countdown and updated at
  battlesGame.state = "countdown";
  battlesGame.updatedAt = new Date().getTime();

  // Update game object in battles games array
  battlesGames.splice(
    battlesGetGameIndex(battlesGames, battlesGame._id),
    1,
    battlesGame,
  );

  // Send battles game to frontend
  if (battlesGame.options.private === true) {
    for (const bet of battlesGame.bets) {
      if (bet.bot === false) {
        io.of("/battles")
          .to(bet.user._id.toString())
          .emit("game", { game: battlesSanitizeGame(battlesGame) });
      }
    }
  } else {
    io.of("/battles").emit("game", { game: battlesSanitizeGame(battlesGame) });
  }

  setTimeout(() => {
    battlesGameValidate(io, battlesGame);
  }, 4000);
};

const battlesGameValidate = async (io, battlesGame) => {
  try {
    // Update battles game state to pending
    battlesGame.state = "pending";

    if (battlesGame.options.private === true) {
      for (const bet of battlesGame.bets) {
        if (bet.bot === false) {
          io.of("/battles")
            .to(bet.user._id.toString())
            .emit("game", { game: battlesSanitizeGame(battlesGame) });
        }
      }
    } else {
      io.of("/battles").emit("game", {
        game: battlesSanitizeGame(battlesGame),
      });
    }

    // Get public seed data from eos provider
    const dataFair = await fairGetData();

    // Add public seed data to battles game object
    battlesGame.fair.seedPublic = dataFair.data.head_block_id;
    battlesGame.fair.blockId = dataFair.data.head_block_num;

    // Sort game bets by slot
    battlesGame.bets.sort((a, b) => a.slot - b.slot);

    setTimeout(() => {
      battlesGameRoll(io, battlesGame);
    }, 1000);
  } catch (err) {
    setTimeout(() => {
      battlesGameValidate(io, battlesGame);
    }, 1000 * 15);
  }
};

const battlesGameRoll = async (io, battlesGame) => {
  try {
    for (const [index, round] of battlesGetRounds(
      battlesGame.boxes,
    ).entries()) {
      setTimeout(() => {
        console.log("round");
        console.log(round);
        for (let slot = 0; slot < battlesGame.bets.length; slot++) {
          // Combine battles game id, server seed, bet index to one string
          const combined = `${battlesGame._id}-${battlesGame.fair.seedServer}-${battlesGame.fair.seedPublic}-${index}-${slot}`;

          // Sha256 hash combined string
          const hash = crypto
            .createHash("sha256")
            .update(combined)
            .digest("hex");

          // Get outcome for slot bet from combined hash
          const outcome = parseInt(hash.substr(0, 8), 16) % 100000;

          // Add round payout amount to bet
          battlesGame.bets[slot].payout =
            battlesGame.bets[slot].payout +
            battlesGetOutcomeItem(round.box.items, outcome).itemPrice;

          // Add roll outcome to bet
          battlesGame.bets[slot].outcomes.push(outcome);
        }

        // Update battles game state and updated at
        battlesGame.state = "rolling";
        battlesGame.updatedAt = new Date().getTime();

        // Send battles game to frontend
        if (battlesGame.options.private === true) {
          for (const bet of battlesGame.bets) {
            if (bet.bot === false) {
              io.of("/battles")
                .to(bet.user._id.toString())
                .emit("game", { game: battlesSanitizeGame(battlesGame) });
            }
          }
        } else {
          io.of("/battles").emit("game", {
            game: battlesSanitizeGame(battlesGame),
          });
        }
      }, 6500 * index);
    }

    setTimeout(
      () => {
        battlesGameComplete(io, battlesGame);
      },
      6500 * battlesGetRounds(battlesGame.boxes).length,
    );
  } catch (err) {
    console.error(err);
  }
};

const battlesGameComplete = async (io, battlesGame) => {
  try {
    // Update battles game state
    battlesGame.state = "completed";

    // Create promises arrays
    let promisesUsers = [];
    let promisesBets = [];

    let amountBetTotal = 0;

    // Get winner bets
    const winnerBets = battlesGetWinnerBets(battlesGame);

    // Get total win amount
    const amountWinTotal = battlesGetAmountWin(battlesGame);

    // Add update battles bet querys to promise array
    for (const bet of battlesGame.bets) {
      // Get payout amount for user bet
      bet.payout =
        winnerBets.some(
          (element) => element._id.toString() === bet._id.toString(),
        ) === true
          ? amountWinTotal / winnerBets.length
          : 0;

      if (!bet.bot) {
        amountBetTotal = amountBetTotal + bet.amount;
        //TODO: Update user
      }

      if (!bet.bot && bet.payout > 0) {
        promisesUsers.push(
          updateUser(bet.payout, bet.payout, 0, BATTLES_RAKE, bet.user),
        );
      }

      // Add user update query to bets promises array
      promisesBets.push(
        BattlesBet.findByIdAndUpdate(
          bet._id,
          {
            payout: bet.payout,
            multiplier: bet.payout / bet.amount,
            outcomes: bet.outcomes,
            updatedAt: new Date().getTime(),
          },
          { new: true },
        )
          .select("amount payout multiplier user bot updatedAt")
          .populate({
            path: "user",
            select:
              "username avatar rank xp stats rakeback anonymous createdAt",
          })
          .lean(),
      );
    }

    let dataDatabase = await Promise.all([
      BattlesGame.findByIdAndUpdate(
        battlesGame._id,
        {
          fair: battlesGame.fair,
          state: "completed",
          updatedAt: new Date().getTime(),
        },
        {},
      ),
      ...promisesUsers,
      ...promisesBets,
    ]);

    // Add battles game to battles history and remove last element from battles history if its longer then 8
    battlesHistory.unshift(battlesSanitizeGame(battlesGame));
    if (battlesHistory.length > 4) {
      battlesHistory.pop();
    }

    battlesGames = battlesGames.filter(
      (g) => g._id.toString() != battlesGame._id.toString(),
    );

    // Send battles game to frontend
    if (battlesGame.options.private === true) {
      for (const bet of battlesGame.bets) {
        if (bet.bot === false) {
          io.of("/battles")
            .to(bet.user._id.toString())
            .emit("game", { game: battlesSanitizeGame(battlesGame) });
        }
      }
    } else {
      io.of("/battles").emit("game", {
        game: battlesSanitizeGame(battlesGame),
      });
    }

    // Send updated users to frontend
    for (const user of dataDatabase.slice(1, promisesUsers.length + 1)) {
      io.of("/general").to(user._id.toString()).emit("user", { user: user });
    }

    // Send updated bets to frontend
    for (const bet of dataDatabase.slice(
      promisesUsers.length + 1,
      promisesUsers.length + promisesBets.length + 1,
    )) {
      if (bet.bot !== true) {
        generalAddBetsList(io, {
          ...bet,
          user: generalUserGetFormated(bet.user),
          method: "battles",
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
};

const battlesInit = async () => {
  try {
    // Get all uncompleted battles games and last 8 completed battles games from database
    const dataDatabase = await Promise.all([
      BattlesGame.find({
        $or: [{ state: "created" }, { state: "pending" }, { state: "rolling" }],
      })
        .select(
          "amount playerCount mode boxes options fair state updatedAt createdAt",
        )
        .populate({
          path: "bets",
          populate: {
            path: "user",
            select:
              "username avatar rank xp limits stats.total affiliates anonymous createdAt",
          },
        })
        .lean(),
      BattlesGame.find({ "options.private": false, state: "completed" })
        .sort({ createdAt: -1 })
        .limit(4)
        .select(
          "amount playerCount mode boxes options fair state updatedAt createdAt",
        )
        .populate({
          path: "bets",
          populate: {
            path: "user",
            select: "username avatar rank xp stats.total anonymous createdAt",
          },
        })
        .lean(),
    ]);

    // Create promises array
    let promises = [];

    // Handle all uncompleted and last 4 completed battles games
    for (const game of [...dataDatabase[0], ...dataDatabase[1]]) {
      if (
        game.state !== "completed" &&
        Math.floor(game.playerCount) === game.bets.length
      ) {
        // Add update battles game query to promises array
        promises.push(
          BattlesGame.findByIdAndUpdate(
            game._id,
            {
              state: "canceled",
              updatedAt: new Date().getTime(),
            },
            {},
          ),
        );

        // Add update user queries to promises array
        for (const bet of game.bets) {
          promises.push(
            User.findByIdAndUpdate(
              bet.user,
              {
                $inc: {
                  balance: bet.amount,
                  "stats.bet": -bet.amount,
                },
                updatedAt: new Date().getTime(),
              },
              {},
            ),
          );
        }
      } else {
        for (let bet of game.bets) {
          if (!bet.bot) {
            // Update bet user
            bet.user = {
              _id: bet.user._id,
              username: bet.user.username,
              avatar: bet.user.avatar,
              rank: bet.user.rank,
              stats: bet.user.anonymous === true ? null : bet.user.stats,
              createdAt: bet.user.createdAt,
            };
          } else {
            bet.user = {};
          }
        }

        // Add game to battles games or battles history array
        if (game.state !== "completed") {
          battlesGames.push(game);
        } else {
          battlesHistory.unshift(game);
        }
      }
    }

    // Execute database queries
    await Promise.all(promises);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  battlesGetData,
  battlesGetGameDataSocket,
  battlesSendCreateSocket,
  battlesSendBotSocket,
  battlesSendJoinSocket,
  battlesInit,
};
