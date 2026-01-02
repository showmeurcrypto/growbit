// Load database models
const User = require("../../../database/models/User");
const Leaderboard = require("../../../database/models/Leaderboard");

// Load utils
const { socketRemoveAntiSpam } = require("../../../utils/socket");
const {
  adminCheckGetLeaderboardListData,
  adminCheckSendLeaderboardCreateData,
  adminCheckSendLeaderboardStopData,
  adminCheckSendLeaderboardStopLeaderboard,
} = require("../../../utils/admin/leaderboard");

const {
  getRaceRewards,
  getNextSundayMidnight,
} = require("../../../utils/general/leaderboard");
const {
  startRaceTimer,
  clearRaceTimer,
  invalidateRaceCache,
} = require("../../general/leaderboard");
const { logger } = require("../../../utils/logger");

const getRaces = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    adminCheckGetLeaderboardListData(data);

    // Calculating database query offset
    const offset = (data.page - 1) * 12;

    // Get leaderboards and leaderboards count from database
    const dataDatabase = await Promise.all([
      Leaderboard.countDocuments({
        type: { $regex: data.search, $options: "i" },
      }),
      Leaderboard.find({
        type: { $regex: data.search, $options: "i" },
      })
        .sort({ createdAt: -1 })
        .limit(12)
        .skip(offset)
        .select("name winners state createdAt")
        .lean(),
    ]);

    callback({
      success: true,
      count: dataDatabase[0],
      leaderboards: dataDatabase[1],
    });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const createRace = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    adminCheckSendLeaderboardCreateData(data);

    // Get active leaderboard from database
    const activeRace = await Leaderboard.findOne({ state: "running" })
      .select("state")
      .lean();

    const startNewRace = activeRace === null;

    const winners = getRaceRewards(data.rewards);

    let promises = [
      Leaderboard.create({
        description: data.rewards,
        name: data.name || "Weekly Race",
        rewards: data.rewards,
        winners: winners,
        type: "wager",
        endsAt: startNewRace ? getNextSundayMidnight() : null,
        state: startNewRace ? "running" : "created",
      }),
    ];

    // Add update users leaderboard points if new leaderboard is running
    if (startNewRace) {
      promises.push(User.updateMany({}, { "leaderboard.points": 0 }, {}));
    }

    // Execute database queries in promises array
    let dataDatabase = await Promise.all(promises);

    let createdRace = dataDatabase[0].toObject();

    // Call leaderboard start function if created leaderboard is running
    if (startNewRace) {
      startRaceTimer(io, createdRace);
    }

    callback({ success: true, leaderboard: createdRace });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(user._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const stopRace = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    adminCheckSendLeaderboardStopData(data);

    // Validate if the leaderboard code is in database and is active
    let race = await Leaderboard.findById(data.leaderboardId)
      .select("state")
      .lean();

    adminCheckSendLeaderboardStopLeaderboard(race);

    if (race.state === "created") {
      // Remove leaderboard from database
      race = await Leaderboard.findByIdAndDelete(data.leaderboardId);
    } else {
      logger.info("Cancelling race.");
      clearRaceTimer();
      invalidateRaceCache();
      race = await Leaderboard.findByIdAndUpdate(
        data.leaderboardId,
        { state: "canceled" },
        { new: true },
      );
    }

    callback({ success: true, leaderboard: race });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(user._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

module.exports = {
  getRaces,
  createRace,
  stopRace,
};
