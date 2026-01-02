const CrashBet = require("../../../database/models/CrashBet");
const MinesGame = require("../../../database/models/MinesGame");
const QuickGame = require("../../../database/models/QuickGame");
const SlotGame = require("../../../database/models/SlotGame");
const SlideBet = require("../../../database/models/SlideBet");
const CoinflipGame = require("../../../database/models/CoinflipGame");
const TowersGame = require("../../../database/models/TowersGame");

const {
  generalUserGetFormated,
  generalSanitizeBets,
} = require("../../../utils/general/user");

const NodeCache = require("node-cache");
const { logger } = require("../../../utils/logger");

const WHALE_REQUIREMENT = process.env.WHALE_REQUIREMENT || 1000;
const LUCKY_REQUIREMENT = process.env.LUCKY_REQUIREMENT || 2;

const myBetsCache = new NodeCache({ stdTTL: 60, checkperiod: 60 });

let generalBets = { all: [], whale: [], lucky: [], my: [] };

const generalGetBetsDataSocket = async (io, socket, user, data, callback) => {
  try {
    // Create bets variable
    let bets = generalBets;

    // If the user is logged in add users bets to bets variable
    if (user !== undefined && user !== null) {
      if (myBetsCache.has(user._id.toString())) {
        bets.my = myBetsCache.get(user._id.toString());
      } else {
        let myBetsPromises = [
          CrashBet.find({
            payout: { $exists: true, $ne: null },
            user: user._id,
          })
            .sort({ updatedAt: -1 })
            .limit(15)
            .populate({
              path: "game",
              select: "fair state outcome",
              populate: {
                path: "fair.seed",
                select: "seedServer previousHash",
              },
            })
            .populate({
              path: "user",
              select: "username avatar rank xp stats rakeback anonymous",
            })
            .lean(),
          MinesGame.find({
            payout: { $exists: true, $ne: null },
            user: user._id,
          })
            .sort({ updatedAt: -1 })
            .limit(15)
            .select(
              "amount fair deck revealed payout gridSize multiplier user updatedAt createdAt",
            )
            .populate({
              path: "fair.seed",
              select: "seedClient seedServer hash state nonce",
            })
            .populate({
              path: "user",
              select: "username avatar rank xp stats rakeback anonymous",
            })
            .lean(),
          QuickGame.find({
            payout: { $exists: true, $ne: null },
            user: user._id,
          })
            .sort({ updatedAt: -1 })
            .limit(15)
            .select(
              "game amount fair payout data multiplier user updatedAt createdAt",
            )
            .populate({
              path: "fair.seed",
              select: "seedClient seedServer hash state nonce",
            })
            .populate({
              path: "user",
              select: "username avatar anonymous stats",
            })
            .lean(),
          SlotGame.find({
            payout: { $exists: true, $ne: null },
            user: user._id,
          })
            .sort({ updatedAt: -1 })
            .limit(15)
            .select(
              "game amount payout gameCode multiplier user updatedAt createdAt",
            )
            .populate({
              path: "user",
              select: "username avatar rank anonymous stats",
            })
            .lean(),
          SlideBet.find({
            payout: { $exists: true, $ne: null },
            user: user._id,
          })
            .sort({ updatedAt: -1 })
            .limit(15)
            .select(
              "amount  fair game payout multiplier user updatedAt createdAt",
            )
            .populate({
              path: "user",
              select: "username avatar rank xp stats rakeback anonymous",
            })
            .populate({
              path: "game",
              select: "fair state outcome",
              populate: {
                path: "fair.seed",
                select: "seedServer previousHash",
              },
            })
            .lean(),
          CoinflipGame.find({
            payout: { $exists: true, $ne: null },
            author: user._id,
            state: "completed",
          })
            .sort({ updatedAt: -1 })
            .limit(15)
            .select(
              "amount payout multiplier author updatedAt winner createdAt fair side",
            )
            .populate({
              path: "author",
              select: "username avatar rank anonymous stats",
            })
            .populate({
              path: "winner",
              select: "username stats",
            })
            .lean(),
          CoinflipGame.find({
            payout: { $exists: true, $ne: null },
            secondPlayer: user._id,
            state: "completed",
          })
            .sort({ updatedAt: -1 })
            .limit(15)
            .select(
              "amount payout multiplier secondPlayer updatedAt winner createdAt fair side",
            )
            .populate({
              path: "secondPlayer",
              select: "username avatar rank anonymous stats",
            })
            .populate({
              path: "winner",
              select: "username stats",
            })
            .lean(),
          TowersGame.find({
            payout: { $exists: true, $ne: null },
            user: user._id,
          })
            .sort({ updatedAt: -1 })
            .limit(15)
            .select(
              "amount fair risk deck revealed payout multiplier user updatedAt createdAt state",
            )
            .populate({
              path: "fair.seed",
              select: "seedClient seedServer hash state nonce",
            })
            .populate({
              path: "user",
              select: "username avatar rank xp stats rakeback anonymous",
            })
            .lean(),
        ];

        const dataDatabase = await Promise.all(myBetsPromises);

        dataDatabase[5].forEach((game) => {
          if (game.author.username !== game.winner?.username) {
            game.payout = 0;
            game.multiplier = 0;
          }
        });
        dataDatabase[6].forEach((game) => {
          if (game.secondPlayer.username !== game.winner?.username) {
            game.payout = 0;
            game.multiplier = 0;
          }
        });

        // Add game mode to bet object
        bets.my = [
          ...dataDatabase[0].map((bet) => ({
            ...bet,
            user: generalUserGetFormated(bet.user, true),
            method: "crash",
          })),
          ...dataDatabase[1].map((bet) => ({
            ...bet,
            user: generalUserGetFormated(bet.user, true),
            method: "mines",
          })),
          ...dataDatabase[2].map((bet) => ({
            ...bet,
            user: generalUserGetFormated(bet.user, true),
            method: bet.game,
          })),
          ...dataDatabase[3].map((bet) => ({
            ...bet,
            user: generalUserGetFormated(bet.user, true),
            method: bet.game,
          })),
          ...dataDatabase[4].map((bet) => ({
            ...bet,
            user: generalUserGetFormated(bet.user, true),
            method: "slide",
          })),
          ...dataDatabase[5].map((bet) => ({
            ...bet,
            user: generalUserGetFormated(bet.author, true),
            method: "coinflip",
          })),
          ...dataDatabase[6].map((bet) => ({
            ...bet,
            user: generalUserGetFormated(bet.secondPlayer, true),
            method: "coinflip",
          })),
          ...dataDatabase[7].map((bet) => ({
            ...bet,
            user: generalUserGetFormated(bet.user, true),
            method: "towers",
          })),
        ];

        bets.my.sort((a, b) => {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        bets.my = bets.my.slice(0, 15);

        bets.my = generalSanitizeBets(bets.my);

        myBetsCache.set(user._id.toString(), bets.my);
      }
    }

    callback({ success: true, bets: bets });
  } catch (err) {
    logger.error(err);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const generalAddBetsList = (io, bet, user, toUserOnly = false) => {
  try {
    bet.user = generalUserGetFormated(user);

    if (toUserOnly) {
      io.of("/general").to(user._id.toString()).emit("bet", { bet: bet });
      return;
    }

    // Add bet to all bets, sort all bets and limit to a count of 15 bets
    generalBets.all.unshift(bet);
    generalBets.all.sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    if (generalBets.all.length > 15) {
      generalBets.all.pop();
    }

    // Add bet to whale bets, sort whale bets and limit to a count of 15 bets if payout is >= R$10,000
    if (bet.amount >= process.env.WHALE_REQUIREMENT) {
      generalBets.whale.unshift(bet);
      generalBets.whale.sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      if (generalBets.whale.length > 15) {
        generalBets.whale.pop();
      }
    }

    if (bet.multiplier >= process.env.LUCKY_REQUIREMENT) {
      generalBets.lucky.unshift(bet);
      generalBets.lucky.sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      if (generalBets.lucky.length > 15) {
        generalBets.lucky.pop();
      }
    }

    if (!toUserOnly) {
      io.of("/general").emit("bet", { bet: bet });
    }

    // workaround for pvp coinflip bets where only user receives his lost bet, no need to send it twice is he's anonymous
    if (user.anonymous) {
      let toUserOnly = {
        ...bet,
        user: generalUserGetFormated(user, true),
      };
      io.of("/general").to(user._id.toString()).emit("anonbet", {
        bet: toUserOnly,
      });
    }
  } catch (err) {
    logger.error(err);
  }
};

const generalReplaceBetsList = (io, bet) => {
  generalBets.all.forEach((item, i) => {
    if (item._id?.toString() === bet._id?.toString()) generalBets.all[i] = bet;
  });
  if (bet.amount >= WHALE_REQUIREMENT) {
    generalBets.whale.forEach((item, i) => {
      if (item._id?.toString() === bet._id?.toString())
        generalBets.whale[i] = bet;
    });
  }
  if (bet.multiplier >= LUCKY_REQUIREMENT) {
    generalBets.lucky.forEach((item, i) => {
      if (item._id?.toString() === bet._id?.toString())
        generalBets.lucky[i] = bet;
    });
  }
};

const generalBetsInit = async () => {
  try {
    // Create promises array with get all and high bet querys
    let promises = [
      CrashBet.find({ payout: { $exists: true, $ne: null } })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select("amount game  payout multiplier user updatedAt createdAt")
        .populate({
          path: "game",
          select: "fair state outcome",
          populate: {
            path: "fair.seed",
            select: "seedServer previousHash",
          },
        })
        .populate({
          path: "user",
          select: "username avatar rank stats rakeback anonymous",
        })
        .lean(),

      MinesGame.find({
        payout: {
          $exists: true,
          $ne: null,
        },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select(
          "amount  deck revealed gridSize fair payout multiplier user updatedAt createdAt",
        )
        .populate({
          path: "user",
          select: "username avatar rank stats rakeback anonymous",
        })
        .populate({
          path: "fair.seed",
          select: "seedClient seedServer hash state nonce",
        })
        .lean(),

      QuickGame.find({ payout: { $exists: true, $ne: null } })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select(
          "game amount fair data payout multiplier user updatedAt createdAt",
        )
        .populate({
          path: "user",
          select: "username avatar rank stats rakeback anonymous",
        })
        .populate({
          path: "fair.seed",
          select: "seedClient seedServer hash state nonce",
        })
        .lean(),

      SlideBet.find({ payout: { $exists: true, $ne: null } })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select("amount  game  payout multiplier user updatedAt createdAt")
        .populate({
          path: "game",
          select: "fair state outcome",
          populate: {
            path: "fair.seed",
            select: "seedServer previousHash",
          },
        })
        .populate({
          path: "user",
          select: "username avatar rank stats rakeback anonymous",
        })
        .lean(),

      SlotGame.find({
        multiplier: { $exists: true, $ne: null },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select(
          "game amount payout gameCode multiplier user updatedAt createdAt",
        )
        .populate({
          path: "user",
          select: "username avatar rank anonymous",
        })
        .lean(),

      CoinflipGame.find({
        payout: { $exists: true, $ne: null, $gte: 0 },
        bot: { $exists: true, $ne: true },
        state: "completed",
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select("amount payout multiplier winner updatedAt createdAt fair side")
        .populate({
          path: "winner",
          select: "username avatar rank anonymous",
        })
        .lean(),

      TowersGame.find({
        payout: {
          $exists: true,
          $ne: null,
        },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select(
          "amount fair risk deck revealed payout multiplier user updatedAt createdAt state",
        )
        .populate({
          path: "fair.seed",
          select: "seedClient seedServer hash state nonce",
        })
        .populate({
          path: "user",
          select: "username avatar rank xp stats rakeback anonymous",
        })
        .lean(),

      CrashBet.find({
        amount: { $exists: true, $ne: null, $gte: WHALE_REQUIREMENT },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select("amount game payout multiplier user updatedAt createdAt")
        .populate({
          path: "game",
          select: "fair state outcome",
          populate: {
            path: "fair.seed",
            select: "seedServer previousHash",
          },
        })
        .populate({
          path: "user",
          select: "username avatar rank stats rakeback anonymous",
        })
        .lean(),

      MinesGame.find({
        amount: { $exists: true, $ne: null, $gte: WHALE_REQUIREMENT },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select(
          "amount deck revealed payout gridSize fair multiplier user updatedAt createdAt",
        )
        .populate({
          path: "user",
          select: "username avatar rank stats rakeback anonymous",
        })
        .populate({
          path: "fair.seed",
          select: "seedClient seedServer hash state nonce",
        })
        .lean(),

      QuickGame.find({
        amount: { $exists: true, $ne: null, $gte: WHALE_REQUIREMENT },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select(
          "game amount payout data fair multiplier user updatedAt createdAt",
        )
        .populate({
          path: "user",
          select: "username avatar rank stats rakeback anonymous",
        })
        .populate({
          path: "fair.seed",
          select: "seedClient seedServer hash state nonce",
        })
        .lean(),

      SlideBet.find({
        amount: { $exists: true, $ne: null, $gte: WHALE_REQUIREMENT },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select("amount game payout multiplier user updatedAt createdAt")
        .populate({
          path: "game",
          select: "fair state outcome",
          populate: {
            path: "fair.seed",
            select: "seedServer previousHash",
          },
        })
        .populate({
          path: "user",
          select: "username avatar rank stats rakeback anonymous",
        })
        .lean(),

      CoinflipGame.find({
        amount: { $exists: true, $ne: null, $gte: WHALE_REQUIREMENT },
        payout: { $exists: true, $ne: null, $gte: 0 },
        state: "completed",
        bot: { $exists: true, $ne: true },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select("amount payout multiplier winner updatedAt createdAt fair side")
        .populate({
          path: "winner",
          select: "username avatar rank anonymous",
        })
        .lean(),

      SlotGame.find({
        amount: { $exists: true, $ne: null, $gte: WHALE_REQUIREMENT },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select(
          "game amount payout gameCode multiplier user updatedAt createdAt",
        )
        .populate({
          path: "user",
          select: "username avatar rank anonymous",
        })
        .lean(),

      TowersGame.find({
        amount: { $exists: true, $ne: null, $gte: WHALE_REQUIREMENT },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select(
          "amount fair risk deck revealed payout multiplier user updatedAt createdAt state",
        )
        .populate({
          path: "fair.seed",
          select: "seedClient seedServer hash state nonce",
        })
        .populate({
          path: "user",
          select: "username avatar rank xp stats rakeback anonymous",
        })
        .lean(),

      SlotGame.find({
        multiplier: { $exists: true, $ne: null, $gte: LUCKY_REQUIREMENT },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select(
          "game amount payout gameCode multiplier user updatedAt createdAt",
        )
        .populate({
          path: "user",
          select: "username avatar rank anonymous",
        })
        .lean(),

      CrashBet.find({
        multiplier: { $exists: true, $ne: null, $gte: LUCKY_REQUIREMENT },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select("amount game payout multiplier user updatedAt createdAt")
        .populate({
          path: "game",
          select: "fair state outcome",
          populate: {
            path: "fair.seed",
            select: "seedServer previousHash",
          },
        })
        .populate({
          path: "user",
          select: "username avatar rank stats rakeback anonymous",
        })
        .lean(),

      MinesGame.find({
        multiplier: { $exists: true, $ne: null, $gte: LUCKY_REQUIREMENT },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select(
          "amount deck gridSize revealed payout fair multiplier user updatedAt createdAt",
        )
        .populate({
          path: "user",
          select: "username avatar rank stats rakeback anonymous",
        })
        .populate({
          path: "fair.seed",
          select: "seedClient seedServer hash state nonce",
        })
        .lean(),

      QuickGame.find({
        multiplier: { $exists: true, $ne: null, $gte: LUCKY_REQUIREMENT },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select(
          "game amount payout data fair multiplier user updatedAt createdAt",
        )
        .populate({
          path: "user",
          select: "username avatar rank stats rakeback anonymous",
        })
        .populate({
          path: "fair.seed",
          select: "seedClient seedServer hash state nonce",
        })
        .lean(),

      SlideBet.find({
        multiplier: { $exists: true, $ne: null, $gte: LUCKY_REQUIREMENT },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select("amount game payout multiplier user updatedAt createdAt")
        .populate({
          path: "game",
          select: "fair state outcome",
          populate: {
            path: "fair.seed",
            select: "seedServer previousHash",
          },
        })
        .populate({
          path: "user",
          select: "username avatar rank stats rakeback anonymous",
        })
        .lean(),
      TowersGame.find({
        multiplier: { $exists: true, $ne: null, $gte: LUCKY_REQUIREMENT },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select(
          "amount fair risk deck revealed payout multiplier user updatedAt createdAt state",
        )
        .populate({
          path: "fair.seed",
          select: "seedClient seedServer hash state nonce",
        })
        .populate({
          path: "user",
          select: "username avatar rank xp stats rakeback anonymous",
        })
        .lean(),
    ];

    // Execute the user get querys
    const dataDatabase = await Promise.all(promises);

    // Add game mode to bet object
    let all = [
      ...dataDatabase[0].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: "crash",
      })),
      ...dataDatabase[1].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: "mines",
      })),
      ...dataDatabase[2].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: bet.game,
      })),
      ...dataDatabase[3].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: "slide",
      })),
      ...dataDatabase[4].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: bet.game,
      })),
      ...dataDatabase[5].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.winner),
        method: "coinflip",
      })),
      ...dataDatabase[6].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: "towers",
      })),
    ];
    let whale = [
      ...dataDatabase[7].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: "crash",
      })),
      ...dataDatabase[8].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: "mines",
      })),
      ...dataDatabase[9].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: bet.game,
      })),
      ...dataDatabase[10].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: "slide",
      })),
      ...dataDatabase[11].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.winner),
        method: "coinflip",
      })),
      ...dataDatabase[12].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: bet.game,
      })),
      ...dataDatabase[13].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: "towers",
      })),
    ];

    let lucky = [
      ...dataDatabase[14].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: bet.game,
      })),
      ...dataDatabase[15].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: "crash",
      })),
      ...dataDatabase[16].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: "mines",
      })),
      ...dataDatabase[17].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: bet.game,
      })),
      ...dataDatabase[18].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: "slide",
      })),
      ...dataDatabase[19].map((bet) => ({
        ...bet,
        user: generalUserGetFormated(bet.user),
        method: "towers",
      })),
    ];

    // Sort bets by date
    all.sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    whale.sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    lucky.sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    // generalBets.lucky.sort((a, b) => { return new Date(b.updatedAt) - new Date(a.updatedAt); });

    // Short bets arrays to 15 bets
    all = all.slice(0, 15);
    whale = whale.slice(0, 15);
    lucky = lucky.slice(0, 15);

    // IMPORTANT : sanitize seeds
    generalBets.all = generalSanitizeBets(all);
    generalBets.whale = generalSanitizeBets(whale);
    generalBets.lucky = generalSanitizeBets(lucky);
  } catch (err) {
    logger.error(err);
  }
};

module.exports = {
  generalReplaceBetsList,
  generalGetBetsDataSocket,
  generalAddBetsList,
  generalBetsInit,
};
