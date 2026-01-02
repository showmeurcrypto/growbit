const {
  growbitTokenToUsd,
  usdToGrowbitToken,
} = require("./growtopia/currency_service");

async function dollarToToken(dollar) {
  //TODO : Mmo tokens are dollar. For growbit fetch exchange rate
  return await usdToGrowbitToken(dollar);
}

async function tokenToDollar(tokens) {
  //TODO : Mmo tokens are dollar. For growbit fetch exchange rate
  return await growbitTokenToUsd(tokens);
}

module.exports = {
  dollarToToken,
};
