const crypto = require("crypto");
const fs = require("fs");

const User = require("../../database/models/User");
const UserSeed = require("../../database/models/UserSeed");
const QuickGame = require("../../database/models/QuickGame");

const { socketRemoveAntiSpam } = require("../../utils/socket");
const { logger } = require("../../utils/logger");

const { settingGet } = require("../../utils/setting");
const {
  unboxCheckGetBoxDataData,
  unboxCheckGetBoxDataBox,
  unboxCheckSendBetData,
  unboxCheckSendBetBox,
  unboxCheckSendBetUser,
  unboxCheckSendBetSeed,
  unboxGetOutcomeItem,
  validateKeyUnlockReq,
  validateKeyUnlock,
} = require("../../utils/games/unbox");
const {
  generalUserGetRakeback,
  generalUserGetFormated,
  generalSanitizeUserSeed,
} = require("../../utils/general/user");

const { notifyDiscordAboutDivineIntervention } = require("../discord");

const CASES_HOUSE_EDGE = process.env.CASES_HOUSE_EDGE || 7;

const { generalAddBetsList } = require("../general/bets");

const {
  updateNonce,
  updateUser,
  updateAffiliate,
  updateReports,
} = require("../../utils/games/games");
const { tryToClaim } = require("../challenges");
const { generalChatAddMessage } = require("../general/chat");

const { boxes } = require("../boxLoader");

const unboxGetData = () => {
  return { boxes: boxes };
};

const unboxGetBoxDataSocket = async (io, socket, user, data, callback) => {
  try {
    unboxCheckGetBoxDataData(data);

    // Get box from database
    const boxDatabase = boxes.find((b) => b._id === data.boxId);
    unboxCheckGetBoxDataBox(boxDatabase);

    callback({ success: true, box: boxDatabase });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const unboxSendBetSocket = async (io, socket, user, data, callback) => {
  try {
    unboxCheckSendBetData(data);

    const boxDatabase = boxes.find((b) => b._id === data.boxId && !b.reward);

    unboxCheckSendBetBox(boxDatabase);

    const unboxCount = Math.floor(data.unboxCount);

    const amountBetTotal = boxDatabase.casePrice * unboxCount;

    unboxCheckSendBetUser(user, amountBetTotal);

    const seedDatabase = await UserSeed.findOne({
      user: user._id,
      state: "active",
    }).select("seedClient seedServer hash nonce user state");

    unboxCheckSendBetSeed(seedDatabase);

    let promises = [];
    let amountPayout = 0;
    let multiplier;
    let wonItems = [];
    let skipped = 0;

    for (let i = 0; i < unboxCount; i++) {
      let combined = null;
      let hash = null;
      let outcome = null;
      let outcomeItem = null;

      while (true) {
        combined = `${seedDatabase.seedServer}-${seedDatabase.nonce + i + skipped}-${seedDatabase.seedClient}`;
        hash = crypto.createHash("sha256").update(combined).digest("hex");
        outcome = parseInt(hash.substr(0, 8), 16) % 100000;
        outcomeItem = unboxGetOutcomeItem(boxDatabase, outcome);
        if (outcomeItem.rarity === 8) {
          skipped++;
          notifyDiscordAboutDivineIntervention(
            seedDatabase._id.toString(),
            seedDatabase.nonce,
          );
        } else {
          break;
        }
      }

      multiplier = outcomeItem.itemPrice / boxDatabase.casePrice;
      amountPayout = amountPayout + outcomeItem.itemPrice;

      wonItems.push(outcomeItem);

      promises.push(
        QuickGame.create({
          game: "cases",
          amount: boxDatabase.casePrice,
          payout: outcomeItem.itemPrice,
          multiplier: outcomeItem.itemPrice / boxDatabase.casePrice,
          data: {
            box: boxDatabase._id,
            itemName: outcomeItem.itemName,
            itemImage: outcomeItem.image,
            outcome: outcome,
          },
          fair: {
            nonce: seedDatabase.nonce + i + skipped,
            seed: seedDatabase._id,
          },
          user: user._id,
        }),
      );
    }

    promises = [
      updateUser(
        amountPayout,
        amountPayout - amountBetTotal,
        amountBetTotal,
        CASES_HOUSE_EDGE,
        user,
      ),
      updateNonce(seedDatabase._id, unboxCount + skipped),
      ...promises,
    ];

    updateAffiliate(user, boxDatabase.casePrice, CASES_HOUSE_EDGE);
    updateReports(
      user,
      boxDatabase.casePrice * unboxCount,
      amountPayout,
      "cases",
    );

    tryToClaim(user, boxDatabase.casePrice, "cases", multiplier, io);

    let dataDatabase = await Promise.all(promises);

    let gamesDatabase = dataDatabase.slice(2);

    gamesDatabase = gamesDatabase.map((game) => game.toObject());

    callback({
      success: true,
      user: {
        ...dataDatabase[0],
        balance: user.balance - amountBetTotal,
      },
      games: gamesDatabase,
    });

    setTimeout(
      async () => {
        // Send updated user to frontend
        io.of("/general")
          .to(user._id.toString())
          .emit("user", { user: dataDatabase[0] });

        // Add updated bets to bet list
        for (const bet of gamesDatabase) {
          generalAddBetsList(
            io,
            {
              ...bet,
              user: generalUserGetFormated(user),
              fair: { seed: generalSanitizeUserSeed(seedDatabase) },
              method: "cases",
            },
            dataDatabase[0],
          );
        }
      },
      data.quick ? 1000 : 1000 * 5,
    );

    for (let i = 0; i < wonItems.length; i++) {
      emitToChat(io, wonItems[i], user, boxDatabase, data.quick);
    }

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const unboxWithTheKey = async (io, socket, user, data, callback) => {
  try {
    validateKeyUnlockReq(data);

    const daily = data.daily;
    let level = null;
    let boxDatabase = null;

    if (daily) {
      boxDatabase = boxes.find((b) => b.reward && b._id === "daily");
    } else {
      level = +data.level;
      boxDatabase = boxes.find((b) => b.reward && b.level === level);
    }

    unboxCheckSendBetBox(boxDatabase);

    if (daily) {
      const lastClaim = user.rewards?.dailyCaseLastClaimed;

      if (lastClaim) {
        const now = new Date();
        const nowGMT = new Date(now.toISOString().split("T")[0]);
        const lastClaimDate = new Date(
          new Date(lastClaim).toISOString().split("T")[0],
        );

        if (lastClaim && lastClaimDate.getTime() === nowGMT.getTime()) {
          throw new Error(
            "You can only claim the daily case once per day (GMT).",
          );
        }
      }
    } else {
      validateKeyUnlock(level, user);
    }

    const seedDatabase = await UserSeed.findOne({
      user: user._id,
      state: "active",
    }).select("seedClient seedServer hash nonce user state");

    unboxCheckSendBetSeed(seedDatabase);

    let promises = [];
    let amountPayout = 0;

    const combined = `${seedDatabase.seedServer}-${seedDatabase.nonce}-${seedDatabase.seedClient}`;
    const hash = crypto.createHash("sha256").update(combined).digest("hex");
    const outcome = parseInt(hash.substr(0, 8), 16) % 100000;
    const outcomeItem = unboxGetOutcomeItem(boxDatabase, outcome);

    const multiplier = 0.0;
    amountPayout = outcomeItem.itemPrice;

    promises.push(
      QuickGame.create({
        game: "cases",
        amount: 0,
        payout: outcomeItem.itemPrice,
        multiplier: 0,
        data: {
          box: boxDatabase._id,
          itemName: outcomeItem.itemName,
          itemImage: outcomeItem.image,
          outcome: outcome,
        },
        fair: {
          nonce: seedDatabase.nonce,
          seed: seedDatabase._id,
        },
        user: user._id,
      }),
    );

    const updateUserQuery = {
      $inc: {
        balance: amountPayout,
      },
    };

    if (daily) {
      updateUserQuery.$set = {
        "rewards.dailyCaseLastClaimed": new Date(),
      };
    } else {
      updateUserQuery.$push = {
        claimedKeys: level,
      };
    }

    promises = [
      User.findByIdAndUpdate(user._id, updateUserQuery, {
        returnNewDocument: true,
        returnDocument: "after",
      })
        .select(
          "balance username stats rakeback updatedAt anonymous claimedKeys rewards rewards",
        )
        .lean(),
      updateNonce(seedDatabase._id, 1),
      ...promises,
    ];

    const dataDatabase = await Promise.all(promises);
    let gamesDatabase = dataDatabase.slice(2).map((game) => game.toObject());

    callback({
      success: true,
      user: {
        ...dataDatabase[0],
      },
      games: gamesDatabase,
      key: level,
    });

    setTimeout(async () => {
      // Send updated user to frontend
      io.of("/general")
        .to(user._id.toString())
        .emit("user", { user: dataDatabase[0] });

      // Add updated bets to bet list
      for (const bet of gamesDatabase) {
        generalAddBetsList(
          io,
          {
            ...bet,
            user: generalUserGetFormated(user),
            fair: { seed: generalSanitizeUserSeed(seedDatabase) },
            method: "cases",
          },
          dataDatabase[0],
        );
      }
    }, 1000 * 5);

    emitToChat(io, outcomeItem, user, boxDatabase, false);

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

function emitToChat(io, item, user, box, quick = false) {
  if (item.rarity === 7 || item.rarity === 8) {
    let username = !user.anonymous ? "@" + user.username : "HIDDEN USER";
    let color = item.rarity === 8 ? "#ffd700" : "#e4ae39";
    setTimeout(
      async () => {
        generalChatAddMessage(io, {
          room: "en",
          message: `${username} has opened ${box.caseName} case and looted #${item.itemName}#`,
          type: "cases",
          color: color,
        });
      },
      quick ? 1000 : 1000 * 5,
    );
  }
}

module.exports = {
  unboxGetData,
  unboxGetBoxDataSocket,
  unboxSendBetSocket,
  boxes,
  unboxWithTheKey,
};
