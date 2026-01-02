const validator = require("validator");

const adminCheckGetCashierListData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.page === undefined ||
    isNaN(data.page) === true ||
    data.page <= 0
  ) {
    throw new Error("Your entered page is invalid.");
  } else if (data.search === undefined || typeof data.search !== "string") {
    throw new Error("Your entered keyword is invalid.");
  }
};

const adminCheckSendCashierCryptoActionData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.action === undefined ||
    typeof data.action !== "string" ||
    ["approve", "cancel"].includes(data.action) !== true
  ) {
    throw new Error("Your provided action is invalid.");
  } else if (
    data.transactionId === undefined ||
    typeof data.transactionId !== "string" ||
    validator.isMongoId(data.transactionId) !== true
  ) {
    throw new Error("Your provided transaction id is invalid.");
  } else if (
    data.action === "approve" &&
    (data.transactionHash === undefined ||
      data.transactionHash === null ||
      typeof data.transactionHash !== "string")
  ) {
    throw new Error("Your provided transaction hash is invalid.");
  }
};
const adminCheckSendCashierCryptoActionDataByOxapay = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.action === undefined ||
    typeof data.action !== "string" ||
    ["approve", "cancel"].includes(data.action) !== true
  ) {
    throw new Error("Your provided action is invalid.");
  } else if (
    data.transactionId === undefined ||
    typeof data.transactionId !== "string" ||
    validator.isMongoId(data.transactionId) !== true
  ) {
    throw new Error("Your provided transaction id is invalid.");
  }
  // else if(data.action === 'approve' && (data.transactionHash === undefined || data.transactionHash === null || typeof data.transactionHash !== 'string')) {
  //     throw new Error('Your provided transaction hash is invalid.');
  // }
};

const adminCheckSendCashierCryptoActionTransaction = (
  transactionDatababase,
  adminCashierBlockCrypto,
) => {
  if (
    transactionDatababase === null ||
    transactionDatababase.state !== "pending" ||
    adminCashierBlockCrypto.includes(transactionDatababase._id.toString()) ===
      true
  ) {
    throw new Error("Your provided transaction is not available.");
  }
};

const adminCheckSendCashierCreateData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  }
  // else if(data.reward === undefined || isNaN(data.reward) === true || [3000, 5000, 10000, 25000, 50000, 100000, 250000, 500000].includes(data.reward) !== true) {
  //     throw new Error('Your entered reward amount is invalid.');
  // }
  else if (data.reward === undefined || isNaN(data.reward) === true) {
    throw new Error("Your entered reward amount is invalid.");
  } else if (
    data.count === undefined ||
    isNaN(data.count) === true ||
    Math.floor(data.count) <= 0
  ) {
    throw new Error("Your entered card count is invalid.");
  }
};

module.exports = {
  adminCheckGetCashierListData,
  adminCheckSendCashierCryptoActionData,
  adminCheckSendCashierCryptoActionTransaction,
  adminCheckSendCashierCreateData,
  adminCheckSendCashierCryptoActionDataByOxapay,
};
