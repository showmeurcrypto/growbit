const crypto = require("crypto");

const validateDepositCallback = (req) => {
  const headers = req.headers;
  const data = req.body;
  if (!headers || !data) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (!headers.hmac || typeof headers.hmac !== "string") {
    throw new Error("Invalid callback.");
  }
  const hmac = crypto
    .createHmac("sha512", process.env.OXAPAY_MERCHANT_API_KEY)
    .update(JSON.stringify(data))
    .digest("hex");

  if (hmac.toString() !== headers.hmac.toString()) {
    throw new Error("Invalid callback.");
  }
};

const callbackCheckTransaction = (
  transactionId,
  callbackBlockTransactionCrypto,
) => {
  if (
    callbackBlockTransactionCrypto.includes(transactionId.toString()) === true
  ) {
    throw new Error("Your provided transaction id is currently processed.");
  }
};

module.exports = {
  validateDepositCallback,
  callbackCheckTransaction,
};
