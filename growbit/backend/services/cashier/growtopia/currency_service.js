const NodeCache = require("node-cache");

const GROWTOPIA_CURRENCY = "growtopia_DLS";

const InGameCurrencyExchangeRate = require("../../../database/models/InGameCurrencyExchangeRate");

const cache = new NodeCache({ stdTTL: 120, checkperiod: 120 });

function invalidateCache() {
  cache.del("currencyToDollar");
  cache.del("dollarToCurrency");
}

async function growbitTokenToUsd(tokens) {
  let currencyToDollar = cache.get("currencyToDollar");

  if (currencyToDollar) {
    return tokens * currencyToDollar;
  }
  const exchangeRate = await InGameCurrencyExchangeRate.findOne({
    currency: GROWTOPIA_CURRENCY,
  }).lean();

  if (!exchangeRate?.currencyToDollar) {
    throw new Error("Exchange rate missing!");
  }

  cache.set("currencyToDollar", exchangeRate.currencyToDollar);
  return tokens * exchangeRate.currencyToDollar;
}

async function usdToGrowbitToken(dollars) {
  let dollarToCurrency = cache.get("dollarToCurrency");

  if (dollarToCurrency) {
    return dollars * dollarToCurrency;
  }
  const exchangeRate = await InGameCurrencyExchangeRate.findOne({
    currency: GROWTOPIA_CURRENCY,
  }).lean();

  if (!exchangeRate?.dollarToCurrency) {
    throw new Error("Exchange rate missing!");
  }

  cache.set("dollarToCurrency", exchangeRate.dollarToCurrency);

  return dollars * exchangeRate.dollarToCurrency;
}

// async function getExchangeRate() {
//   return await InGameCurrencyExchangeRate.findOne({ currency: CURRENCY }).lean();
// }

async function init() {
  const exists = await InGameCurrencyExchangeRate.findOne({
    currency: GROWTOPIA_CURRENCY,
  }).lean();
  if (!exists) {
    await InGameCurrencyExchangeRate.create({
      currency: GROWTOPIA_CURRENCY,
      dollarToCurrency: 5.56,
      currencyToDollar: 0.18,
    });
  }
}

init();

module.exports = {
  growbitTokenToUsd,
  usdToGrowbitToken,
  GROWTOPIA_CURRENCY,
  invalidateCache,
};
