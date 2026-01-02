const validator = require("validator");

const adminCheckGetLeaderboardListData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.page === undefined ||
    data.page === null ||
    isNaN(data.page) === true ||
    data.page <= 0
  ) {
    throw new Error("Your entered page is invalid.");
  } else if (
    data.search === undefined ||
    data.search === null ||
    typeof data.search !== "string"
  ) {
    throw new Error("Your entered keyword is invalid.");
  }
};

const adminCheckSendLeaderboardCreateData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  }
  //TODO : max rewards
  else if (!data.rewards) {
    throw new Error("Your entered Total Reward is invalid.");
  }
};

const adminCheckSendLeaderboardStopData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.leaderboardId === undefined ||
    data.leaderboardId === null ||
    typeof data.leaderboardId !== "string" ||
    validator.isMongoId(data.leaderboardId) !== true
  ) {
    throw new Error("Your entered leaderboard id is invalid.");
  }
};

const adminCheckSendLeaderboardStopLeaderboard = (leaderboardDatabase) => {
  if (leaderboardDatabase === null) {
    throw new Error("Your entered leaderboard was not found.");
  } else if (
    leaderboardDatabase.state === "canceled" ||
    leaderboardDatabase.state === "completed"
  ) {
    throw new Error(
      "Your entered leaderboard is already canceled or completed.",
    );
  }
};

module.exports = {
  adminCheckGetLeaderboardListData,
  adminCheckSendLeaderboardCreateData,
  adminCheckSendLeaderboardStopData,
  adminCheckSendLeaderboardStopLeaderboard,
};
