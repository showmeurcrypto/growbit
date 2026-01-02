const axios = require("axios");
const InGameCurrencyExchangeRate = require("../../../database/models/InGameCurrencyExchangeRate");
const WOW_CURRENCY =
  "https://www.eldorado.gg/api/predefinedOffers/game/?gameId=0&category=Currency&pageSize=24&pageIndex=1&tradeEnvironmentValue0=EU";

const RUNESCAPE3_CURRENCY =
  "https://www.eldorado.gg/api/predefinedOffers/augmentedItem/9/topOffer/";

const MMO_DEPOSIT_RATE = process.env.MMO_DEPOSIT_RATE || 0.8;

async function getRunescapeRates() {
  try {
    const response = await axios.get(RUNESCAPE3_CURRENCY, {
      headers: {
        Cookie: "eldoradogg_currencyPreference=USD;",
      },
    });
    const topOffer = response.data;
    const exchangeRate = +topOffer.offer.exchangeRate.exchangeRate;
    const pricePerUnit = +topOffer.offer.pricePerUnit.amount;

    if (exchangeRate && pricePerUnit) {
      await InGameCurrencyExchangeRate.findOneAndUpdate(
        {
          currency: "rs3_gold",
        },
        {
          dollarToCurrency: exchangeRate,
          currencyToDollar: pricePerUnit * MMO_DEPOSIT_RATE,
        },
        {
          upsert: true,
        },
      );
    }
  } catch (error) {
    console.error("Error fetching RS3 exchange rates:", error);
  }
}

async function getWowRates() {
  try {
    const response = await axios.get(WOW_CURRENCY, {
      headers: {
        Cookie: "eldoradogg_currencyPreference=USD;",
      },
    });
    const offers = response.data?.results;

    let dollarToCurrency_sum = 0;
    let currencyToDollar_sum = 0;

    let cnt = 0;
    for (const o of offers) {
      const offer = o?.offer;

      const exchangeRate = +offer?.exchangeRate?.exchangeRate;
      const pricePerUnit = +offer?.pricePerUnit?.amount;

      if (exchangeRate && pricePerUnit) {
        dollarToCurrency_sum += exchangeRate;
        currencyToDollar_sum += pricePerUnit;

        cnt += 1;
      }
    }

    if (cnt > 0) {
      const dollarToCurrency = dollarToCurrency_sum / cnt;
      const currencyToDollar = currencyToDollar_sum / cnt;

      await InGameCurrencyExchangeRate.findOneAndUpdate(
        {
          currency: "wow_gold",
        },
        {
          dollarToCurrency: dollarToCurrency,
          currencyToDollar: currencyToDollar * MMO_DEPOSIT_RATE,
        },
        {
          upsert: true,
        },
      );
    }
  } catch (error) {
    console.error("Error fetching WOW exchange rates:", error);
  }
}

async function toDollar(mmoCurrencyAmount, currency) {
  const rate = await InGameCurrencyExchangeRate.findOne({ currency: currency });

  if (!rate) {
    throw Error("Exchange rate missing");
  }

  return mmoCurrencyAmount * rate.currencyToDollar;
}

async function toMmoCurrency(dollarAmount, currency) {
  const rate = await InGameCurrencyExchangeRate.findOne({ currency: currency });

  if (!rate) {
    throw Error("Exchange rate missing");
  }

  return dollarAmount * rate.dollarToCurrency;
}

function getExchangeRates() {
  return InGameCurrencyExchangeRate.find({}).lean();
}

// getRunescapeRates();
// getWowRates();
//
// setInterval(
//   function () {
//     getRunescapeRates();
//     getWowRates();
//   },
//   1000 * 60 * 60 * 12,
// );

module.exports = {
  toDollar,
  toMmoCurrency,
  getExchangeRates,
};
