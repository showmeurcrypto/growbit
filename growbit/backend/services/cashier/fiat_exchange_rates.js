const { logger } = require("../../utils/logger");
const axios = require("axios");

const ExchangeRates = require("../../database/models/ExchangeRates");
const { growbitTokenToUsd } = require("./growtopia/currency_service");

const PERIOD = 1000 * 60 * 60 * 24; // 24h

let exchangeRateCache = null;

const SUPPORTED_FIAT = ["USD", "EUR", "GBP", "TRY"];

async function startFiatExchangeRatesWorker() {
  updateRates();

  setInterval(() => {
    updateRates();
  }, PERIOD);
}

async function getFiatRates() {
  if (exchangeRateCache) {
    return exchangeRateCache;
  }

  let rates = await ExchangeRates.findOne().sort({ createdAt: -1 })?.rates;

  if (rates) {
    exchangeRateCache = rates;
  }

  return rates;
}

async function getRateUsdBase(currency) {
  if (currency === "USD") return 1;
  if (!SUPPORTED_FIAT.includes(currency)) {
    throw Error("Unsupported currency " + currency);
  }
  if (exchangeRateCache) {
    return exchangeRateCache[currency];
  }

  let rates = await ExchangeRates.findOne().sort({ createdAt: -1 })?.rates;

  if (rates) {
    exchangeRateCache = rates;
  }

  return rates[currency];
}

async function getFiatRatesDlsBase() {
  const dlsRate = await growbitTokenToUsd(1);

  const ratesToDollar = await getFiatRates();

  let rates = { DLS: 1, USD: dlsRate };
  for (let fiat of SUPPORTED_FIAT) {
    if (fiat !== "USD") {
      rates[fiat] = ratesToDollar[fiat] * dlsRate;
    }
  }

  return rates;
}

async function updateRates() {
  let lastUpdate = await ExchangeRates.findOne().sort({ createdAt: -1 })
    ?.createdAt;

  if (lastUpdate) {
    if (new Date() - lastUpdate < 60 * 60 * 6) {
      return;
    }
  }

  logger.info("Fetching exchange rates");

  try {
    const { data } = await axios.get(
      "https://api.frankfurter.dev/v1/latest?base=USD",
    );

    const rates = data.rates;

    await ExchangeRates.create({ rates });

    //TODO : check for anomalies

    exchangeRateCache = rates;
  } catch (e) {
    logger.error(e);
  }
}

module.exports = {
  startFiatExchangeRatesWorker,
  getFiatRates,
  getFiatRatesDlsBase,
  getRateUsdBase,
  SUPPORTED_FIAT,
};
