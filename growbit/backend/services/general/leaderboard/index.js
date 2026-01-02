// Load database models
const User = require("../../../database/models/User");
const Leaderboard = require("../../../database/models/Leaderboard");
const BalanceTransaction = require("../../../database/models/BalanceTransaction");

// Load utils
const { generalUserGetFormated } = require("../../../utils/general/user");
const {
  generalGetLeaderboardTimeLeft,
  getNextSundayMidnight,
} = require("../../../utils/general/leaderboard");

// General leaderboard variables
let raceTimer = null;
let ioRef = null;

const NodeCache = require("node-cache");
const { createNotification } = require("../../notifications");
const cache = new NodeCache({ stdTTL: 120, checkperiod: 120 });
const { logger } = require("../../../utils/logger");
const { generalChatAddMessage } = require("../chat");

const generalGetLeaderboardDataSocket = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  try {
    let cachedLeaderboard = cache.get("leaderboard");
    let leaderboard;
    if (!cachedLeaderboard) {
      let [race, users] = await Promise.all([
        Leaderboard.findOne({ state: "running" })
          .select("winners duration type state endsAt rewards")
          .lean(),
        User.find({})
          .sort({ "leaderboard.points": -1 })
          .limit(15)
          .select(
            "username avatar leaderboard rakeback anonymous stats createdAt",
          )
          .lean(),
      ]);

      // Format leaderboard data

      if (race) {
        race.winners = race.winners.map((element, index) => ({
          prize: element.prize,
          points: users[index] ? users[index].leaderboard.points : 0,
          user: users[index],
        }));
      }

      cache.set("leaderboard", race);
      leaderboard = race;
    } else {
      leaderboard = cachedLeaderboard;
    }

    if (leaderboard) {
      let includesUser = false;
      //Formats users and hides anon users from everyone except them
      for (let i = 0; i < leaderboard.winners.length; i++) {
        if (leaderboard.winners[i].user) {
          let you = null;
          if (user) {
            you = leaderboard.winners[i].user._id?.equals(user._id);
            if (you) {
              includesUser = true;
            }
          }
          leaderboard.winners[i].user = generalUserGetFormated(
            leaderboard.winners[i].user,
            you,
          );
        }
      }

      if (!includesUser && user) {
        leaderboard.winners.push({
          prize: 0,
          points: user.leaderboard.points,
          user: user,
        });
      }
    }

    callback({ success: true, leaderboard: leaderboard });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const restoreRace = async (race) => {
  try {
    const left = generalGetLeaderboardTimeLeft(race.endsAt);
    if (left > 0) {
      logger.info("Continue active race.");
      clearTimeout(raceTimer);
      raceTimer = setTimeout(() => {
        raceComplete(race);
      }, left);
    } else {
      // Call race complete function if not time is left
      raceComplete(race);
    }
  } catch (err) {
    logger.error("startRaceTimer err : ", err);
  }
};

const startRaceTimer = async (leaderboard) => {
  try {
    logger.info("Starting race timer!");
    const endsAt = getNextSundayMidnight();
    const left = generalGetLeaderboardTimeLeft(endsAt);

    // Set leaderboard timeout and call leaderboard complete function after the left time
    clearTimeout(raceTimer);
    raceTimer = setTimeout(() => {
      raceComplete(leaderboard);
    }, left);
  } catch (err) {
    logger.error("startRaceTimer err : ", err);
  }
};

const clearRaceTimer = () => {
  try {
    // Clear current leaderboard timeout
    logger.info("Clearing race timer.");
    clearTimeout(raceTimer);
  } catch (err) {
    logger.error(err);
  }
};

const invalidateRaceCache = () => {
  cache.del("leaderboard");
};

const raceComplete = async (leaderboard) => {
  logger.info("Complete race.");

  try {
    // Clear current leaderboard timeout
    clearTimeout(raceTimer);
    invalidateRaceCache();

    // Get active leaderboard, new leaderboard if available and top 10 users for current leaderboard from database
    const [endingRace, createdRace, users] = await Promise.all([
      Leaderboard.findById(leaderboard._id)
        .select("winners state updatedAt")
        .lean(),
      Leaderboard.findOne({ state: "created" })
        .sort({ createdAt: 1 })
        .select("state updatedAt")
        .lean(),
      User.find({})
        .sort({ "leaderboard.points": -1 })
        .limit(10)
        .select("leaderboard")
        .lean(),
    ]);

    // Create winners and database query promises arrays
    let winners = [];
    let promises = [];

    for (let i = 0; i < endingRace.winners.length; i++) {
      if (users[i]) {
        // Add formated winner object for the win position to the winners array
        winners.push({
          prize: endingRace.winners[i].prize,
          points: users[i].leaderboard?.points,
          user: users[i]._id,
        });

        // Add user update and balance create querys to promise array
        promises.push(
          User.findByIdAndUpdate(
            users[i]._id,
            {
              $inc: {
                balance: endingRace.winners[i].prize,
              },
              updatedAt: new Date().getTime(),
            },
            { new: true },
          )
            .select("balance updatedAt")
            .lean(),
          BalanceTransaction.create({
            amount: endingRace.winners[i].prize,
            type: "racePayout",
            user: users[i]._id,
            state: "completed",
          }),
          createNotification(
            users[i]._id,
            `You have won ${endingRace.winners[i].prize?.toFixed(2)} DLS`,
            ioRef,
            "race",
          ),
        );
      } else {
        // Add empty winner
        winners.push({ prize: endingRace.winners[i].prize, points: 0 });
      }
    }

    // Update leaderboard and execute querys from promise array in database
    await Promise.all([
      Leaderboard.findByIdAndUpdate(
        leaderboard._id,
        {
          winners: winners,
          state: "completed",
        },
        {},
      ),
      ...promises,
    ]);

    if (createdRace) {
      // Ako u bazi postoji utrka u stanju "created" izračunaj joj endsAt i pribaci je u running
      const endsAt = getNextSundayMidnight();
      const [nextRace, updatedUsers] = await Promise.all([
        Leaderboard.findByIdAndUpdate(
          createdRace._id,
          {
            state: "running",
            endsAt,
            updatedAt: new Date().getTime(),
          },
          { new: true },
        )
          .select("duration state updatedAt")
          .lean(),
        User.updateMany({}, { "leaderboard.points": 0 }, {}),
      ]);

      if (ioRef) {
        generalChatAddMessage(ioRef, {
          room: "en",
          message: `Weekly race has been finished, fastest player has won ${endingRace.winners[0].prize?.toFixed(0)} DLS`,
          type: "race",
        });
      }

      // Call leaderboard start function
      startRaceTimer(nextRace);
    }
  } catch (err) {
    logger.error("RaceComplete err : ", err);
  }
};

const raceOnStartup = async (io) => {
  ioRef = io;
  try {
    // Pogledaj postoju li u bazi aktivna utrka ili utrka na čekanju
    let [active, pending] = await Promise.all([
      Leaderboard.findOne({ state: "running" })
        .select("endsAt duration state updatedAt")
        .lean(),
      Leaderboard.findOne({ state: "created" })
        .sort({ createdAt: 1 })
        .select("duration state updatedAt")
        .lean(),
    ]);

    if (active !== null) {
      logger.info("Active race found in db.");
      restoreRace(active);
    } else if (pending) {
      // Pokreni utrku koja je na čekanju
      const endsAt = getNextSundayMidnight();
      const nextRace = await Promise.all([
        Leaderboard.findByIdAndUpdate(
          pending._id,
          {
            state: "running",
            endsAt,
          },
          { new: true },
        )
          .select("duration state updatedAt")
          .lean(),
        User.updateMany({}, { "leaderboard.points": 0 }, {}),
      ]);

      // Call leaderboard start function
      startRaceTimer(nextRace);
    }
  } catch (err) {
    logger.error("Race on startup init error : ", err);
  }
};

module.exports = {
  generalGetLeaderboardDataSocket,
  startRaceTimer,
  clearRaceTimer,
  raceOnStartup,
  invalidateRaceCache,
};
