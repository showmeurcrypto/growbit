const validator = require("validator");

const adminCheckGetUserListData = (data) => {
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
  } else if (
    data.sort === undefined ||
    data.sort === null ||
    typeof data.sort !== "string" ||
    ["newest", "oldest", "balance", "rank", "wager"].includes(data.sort) ===
      false
  ) {
    throw new Error("Your entered sort value is invalid.");
  }
};

const adminCheckGetUserDataData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.userId === undefined ||
    data.userId === null ||
    typeof data.userId !== "string" ||
    validator.isMongoId(data.userId) !== true
  ) {
    throw new Error("Your entered user id is invalid.");
  }
};

const adminCheckGetUserDataUser = (userDatabase) => {
  if (userDatabase === null) {
    throw new Error("Your entered user id is not available.");
  }
};

const adminCheckGetUserTransactionsData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.userId === undefined ||
    data.userId === null ||
    typeof data.userId !== "string" ||
    validator.isMongoId(data.userId) !== true
  ) {
    throw new Error("Your entered user id is invalid.");
  } else if (
    data.page === undefined ||
    data.page === null ||
    isNaN(data.page) === true ||
    data.page <= 0
  ) {
    throw new Error("Your entered page is invalid.");
  }
};

const adminCheckGetTransactionsData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.page === undefined ||
    data.page === null ||
    isNaN(data.page) === true ||
    data.page <= 0
  ) {
    throw new Error("Your entered page is invalid.");
  }
};

const adminCheckGetUserGamesData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.userId === undefined ||
    data.userId === null ||
    typeof data.userId !== "string" ||
    validator.isMongoId(data.userId) !== true
  ) {
    throw new Error("Your entered user id is invalid.");
  } else if (
    data.page === undefined ||
    data.page === null ||
    isNaN(data.page) === true ||
    data.page <= 0
  ) {
    throw new Error("Your entered page is invalid.");
  }
};

const adminCheckSendUserValueData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.userId === undefined ||
    data.userId === null ||
    typeof data.userId !== "string" ||
    validator.isMongoId(data.userId) !== true
  ) {
    throw new Error("Your entered user id is invalid.");
  } else if (
    data.setting === undefined ||
    typeof data.setting !== "string" ||
    [
      "rank",
      "flags",
      "stats.deposit",
      "vault.amount",
      "stats.withdraw",
      "limits.blockTip",
      "limits.limitTip",
      "limits.blockPromo",
      "limits.blockSponsor",
      "limits.blockLeaderboard",
      "limits.blockWithdraw",
      "leaderboard.points",
      "whitelist",
    ].includes(data.setting) !== true
  ) {
    throw new Error("Your entered setting is invalid.");
  } else if (data.value === undefined) {
    throw new Error("Your entered value is invalid.");
  } else if (
    data.setting === "rank" &&
    !["user", "mod", "partner", "streamer"].includes(data.value)
  ) {
    throw new Error("Invalid rank");
  }
};

const adminCheckSendUserBalanceData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.userId === undefined ||
    data.userId === null ||
    typeof data.userId !== "string" ||
    validator.isMongoId(data.userId) !== true
  ) {
    throw new Error("Your entered user id is invalid.");
  } else if (
    data.balance === undefined ||
    data.balance === null ||
    isNaN(data.balance) === true ||
    data.balance < 0
  ) {
    throw new Error("Your entered balance value is invalid.");
  }
};

const adminCheckSendUserBalanceUser = (userDatabase) => {
  if (userDatabase === null) {
    throw new Error("Your entered user is not available.");
  }
};
const adminCheckSendUserMuteData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  }
  if (
    !data.userId ||
    typeof data.userId !== "string" ||
    !validator.isMongoId(data.userId)
  ) {
    throw new Error("Your entered user id is invalid.");
  }
  if (data.time !== undefined && data.time !== null) {
    if (isNaN(data.time) || Math.floor(data.time) < 0) {
      throw new Error("Your entered mute time is invalid.");
    }
    if (
      !data.reason ||
      typeof data.reason !== "string" ||
      !["insulting", "begging", "self promotion", "other"].includes(data.reason)
    ) {
      throw new Error("Your entered mute reason is invalid.");
    }
  }
};

const adminCheckSendUserBanData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  }
  if (
    !data.userId ||
    typeof data.userId !== "string" ||
    !validator.isMongoId(data.userId)
  ) {
    throw new Error("Your entered user id is invalid.");
  }
  if (data.time !== undefined && data.time !== null) {
    if (isNaN(data.time) || Math.floor(data.time) < 0) {
      throw new Error("Your entered ban time is invalid.");
    }
    if (
      !data.reason ||
      typeof data.reason !== "string" ||
      !["cheating", "scamming", "bug abuse", "self request", "other"].includes(
        data.reason,
      )
    ) {
      throw new Error("Your entered ban reason is invalid.");
    }
  }
};

const adminFormatUserSort = (value) => {
  let sort = { createdAt: -1 };

  if (value === "oldest") {
    sort = { createdAt: 1 };
  } else if (value === "balance") {
    sort = { balance: -1 };
  } else if (value === "rank") {
    sort = { rank: 1 };
  } else if (value === "wager") {
    sort = { "stats.bet": -1 };
  }

  return sort;
};

module.exports = {
  adminCheckGetUserListData,
  adminCheckGetUserDataData,
  adminCheckGetUserDataUser,
  adminCheckGetUserTransactionsData,
  adminCheckGetUserGamesData,
  adminCheckSendUserValueData,
  adminCheckSendUserBalanceData,
  adminCheckSendUserBalanceUser,
  adminCheckSendUserMuteData,
  adminCheckSendUserBanData,
  adminFormatUserSort,
  adminCheckGetTransactionsData,
};
