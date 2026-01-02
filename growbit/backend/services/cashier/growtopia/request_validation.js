const MIN_WITHDRAW = process.env.MIN_WITHDRAW || 0.2;
const MAX_WITHDRAW = process.env.MAX_WITHDRAW || 1500;

const validateGrowtopiaWithdrawRequest = (data) => {
  if (!data) {
    throw new Error("Invalid request.");
  } else if (
    typeof data.amount !== "number" ||
    isNaN(data.amount) === true ||
    data.amount <= 0
  ) {
    throw new Error("Your provided withdraw amount is invalid.");
  }

  if (!data.growId) {
    throw new Error("GrowId is missing");
  }

  if (!isValidGrowID(data.growId)) {
    throw new Error("Invalid growId");
  }
};

const validateGrowtopiaDepositRequest = (data) => {
  if (!data) {
    throw new Error("Invalid request.");
  }
  if (!data.growId) {
    throw new Error("GrowId is missing");
  }
  if (!isValidGrowID(data.growId)) {
    throw new Error("Invalid growId");
  }
};

const cashierCheckSendDLSWithdrawUser = (user, data) => {
  if (data.amount < MIN_WITHDRAW) {
    throw new Error(`Min Withdraw amount is ${MIN_WITHDRAW} DLS.`);
  } else if (data.amount > MAX_WITHDRAW) {
    throw new Error(`Max Withdraw amount is ${MAX_WITHDRAW} DLS.`);
  } else if (user.balance < data.amount) {
    throw new Error("You don’t have enough balance for this action.");
  } else if (user.limits.betToWithdraw > 0) {
    throw new Error(
      `You need to wager ${parseFloat(user.limits.betToWithdraw)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} more before you can withdraw.`,
    );
  } else if (user.limits.blockSponsor === true) {
    throw new Error("You aren't allowed to withdraw at the moment.");
  } else if (user.limits.blockWithdraw === true) {
    throw new Error("You aren't allowed to withdraw at the moment.");
  }
};

function isValidGrowID(growID) {
  const regex = /^(?!_)[A-Za-z0-9_]{3,18}$/;
  return regex.test(growID);
}

module.exports = {
  validateGrowtopiaDepositRequest,
  validateGrowtopiaWithdrawRequest,
  cashierCheckSendDLSWithdrawUser,
};
