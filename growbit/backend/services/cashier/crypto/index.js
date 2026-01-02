const User = require("../../../database/models/User");
const CryptoPrice = require("../../../database/models/CryptoPrice");
const CryptoAddress = require("../../../database/models/CryptoAddress");
const CryptoTransaction = require("../../../database/models/CryptoTransaction");
const axios = require("axios");

// Load utils
const { socketRemoveAntiSpam } = require("../../../utils/socket");
const {
  cashierCheckSendCryptoWithdrawData,
  cashierCheckSendCryptoWithdrawUser,
  cashierCheckSendCryptoWithdrawTransactions,
  getWalletAddress,
  cashierCryptoGetPricesByOxapay,
  SUPPORTED_CURRENCIES,
  getCurrencies,
} = require("./crypto");
const { dollarToToken } = require("../exchange_rates_service");

const { logger } = require("../../../utils/logger");
const { checkWithdrawAntiFraud } = require("../../antifraud");

const DISCORD_WEBHOOK_URL =
  process.env.CRYPTO_CASHIER_DISCORD_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1328658437474619472/Iuf5mkPqdtLiK58Hcx-qe2J-R_Ye3LOcRybl_BaOp5MsRuWoSpp6FSP8P8e4xRdLEM_q";
const notifyDiscord = async (username, currency, amount) => {
  if (DISCORD_WEBHOOK_URL) {
    try {
      const embed = {
        username: "Cashier",
        embeds: [
          {
            title: "New Withdraw Request",
            description: `Username : **${username}**\nCurrency: **${currency}**\nAmount: **${amount}**`,
            color: 3066993,
            timestamp: new Date(),
          },
        ],
      };

      await axios.post(DISCORD_WEBHOOK_URL, embed);
    } catch (error) {
      logger.error("Error sending webhook:", error.message);
    }
  }
};

const getCryptoAddressesAndPrices = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  try {
    let [cryptoAddresses, cryptoPrices] = await Promise.all([
      CryptoAddress.find({ user: user._id })
        .select("name network address user")
        .lean(),
      CryptoPrice.find({}).select("name price info").lean(),
    ]);

    const inDb = new Set(
      cryptoAddresses.map((cp) => cp.name + "-" + cp.network),
    );

    const supported = new Set(
      SUPPORTED_CURRENCIES.map((cp) => cp.name + "-" + cp.network),
    );

    cryptoAddresses = cryptoAddresses.filter((c) =>
      supported.has(c.name + "-" + c.network),
    );

    const NOT_CREATED = SUPPORTED_CURRENCIES.filter(
      (c) => !inDb.has(c.name + "-" + c.network),
    );

    if (NOT_CREATED.length > 0) {
      const createdAddresses = (
        await Promise.all(
          NOT_CREATED.map((currency) =>
            getWalletAddress(currency.name, currency.network, user._id),
          ),
        )
      ).filter(Boolean);

      cryptoAddresses = [...cryptoAddresses, ...createdAddresses];
    }

    const formattedPrices = cryptoPrices.reduce((acc, currency) => {
      acc[currency.name] = { price: currency.price, info: currency.info };
      return acc;
    }, {});

    callback({
      success: true,
      addresses: cryptoAddresses,
      prices: formattedPrices,
    });
  } catch (err) {
    logger.error(err);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

function getFee(cryptoPrice) {
  let data = Object.values(cryptoPrice.info?.networkList)?.[0];
  return data?.withdrawFee || 0;
}

function getMinWithdraw(cryptoPrice) {
  let data = Object.values(cryptoPrice.info?.networkList)?.[0];
  return data?.withdrawMin || 0;
}

const createCryptoWithdrawRequest = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  try {
    // Validate sent data
    cashierCheckSendCryptoWithdrawData(data);

    // Validate withdraw user
    cashierCheckSendCryptoWithdrawUser(data, user);

    await checkWithdrawAntiFraud(user, null, data.address);

    // Get crypto prices and user active crypto transactions from database
    const [cryptoPrice, pendingTransaction] = await Promise.all([
      CryptoPrice.findOne({ name: data.currency })
        .select("name price info")
        .lean(),
      CryptoTransaction.find({ user: user._id, state: "pending" })
        .select("user state amount type data")
        .lean(),
    ]);

    // Validate withdraw transactions
    cashierCheckSendCryptoWithdrawTransactions(pendingTransaction);

    // Get sent amount
    const tokenAmount = data.amount;

    const fee = getFee(cryptoPrice);

    const minWithdraw = getMinWithdraw(cryptoPrice);

    // Get currency amount
    const amountCurrency = tokenAmount / cryptoPrice.price - fee;

    if (amountCurrency < minWithdraw) {
      socketRemoveAntiSpam(user._id);
      return callback({
        success: false,
        error: { type: "error", message: "Amount too low" },
      });
    }

    // Update user and create crypto transaction in database
    const [updatedUser, newTransaction] = await Promise.all([
      User.findByIdAndUpdate(
        user._id,
        {
          $inc: {
            balance: -tokenAmount,
            "stats.withdraw": tokenAmount,
          },
          $addToSet: {
            cryptoAddresses: data.address,
          },
        },
        { new: true },
      )
        .select("balance xp stats rakeback mute ban verifiedAt updatedAt")
        .lean(),
      CryptoTransaction.create({
        amount: tokenAmount,
        data: {
          receiver: data.address,
          currency: data.currency,
          cryptoAmount: amountCurrency,
          fee: fee,
        },
        type: "withdraw",
        user: user._id,
        state: "pending",
      }),
    ]);

    const newTransactionObject = newTransaction.toObject();

    notifyDiscord(user.username, data.currency, amountCurrency);

    callback({
      success: true,
      user: updatedUser,
      transaction: newTransactionObject,
    });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const cashierCryptoCheckPricesByOxapay = async () => {
  try {
    const dataPrices = await cashierCryptoGetPricesByOxapay();

    const currencies = await getCurrencies();

    const priceUsdt = 1 / dataPrices.USDT;

    const cryptoPrices = await CryptoPrice.find({})
      .select("name price info")
      .lean();

    const inDb = new Set(cryptoPrices.map((cp) => cp.name));

    const NOT_CREATED = Array.from(
      new Set(
        SUPPORTED_CURRENCIES.map((c) => c.name).filter((c) => !inDb.has(c)),
      ),
    ).map((name) => ({ name: name }));
    //Price is the same for all networks

    if (NOT_CREATED.length) {
      await Promise.all(
        NOT_CREATED.map((currency) =>
          CryptoPrice.create({ name: currency.name, price: 0, info: null }),
        ),
      );
    }

    const updates = [];

    for (const curr of SUPPORTED_CURRENCIES) {
      updates.push({
        name: curr.name,
        price: await dollarToToken(priceUsdt * dataPrices[curr.name]),
        info: currencies[curr.name],
      });
    }

    await Promise.all(
      updates.map(({ name, price, info }) =>
        CryptoPrice.findOneAndUpdate(
          { name },
          { price, info },
          { upsert: true },
        ),
      ),
    );

    setTimeout(
      () => {
        cashierCryptoCheckPricesByOxapay();
      },
      1000 * 60 * 30,
    );
  } catch (err) {
    console.error(err);
    logger.error(err);
    setTimeout(
      () => {
        cashierCryptoCheckPricesByOxapay();
      },
      1000 * 60 * 5,
    );
  }
};

cashierCryptoCheckPricesByOxapay();

module.exports = {
  getCryptoAddressesAndPrices,
  createCryptoWithdrawRequest,
};
