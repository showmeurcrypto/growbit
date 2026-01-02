// Load database models
const Setting = require("../database/models/Setting");

// Setting variables
let settings = null;

const settingInitDatabase = async () => {
  try {
    settings = await Setting.findOne({})
      .select("general chat games limited steam crypto gift credit growtopia")
      .lean();
    if (settings === undefined || settings === null) {
      settings = await Setting.create({
        general: {
          "maintenance.enabled": false,
          "rain.enabled": false,
          "leaderboard.enabled": false,
          "tip.enabled": false,
          "affiliate.enabled": false,
          "reward.multiplier": 1,
        },
        chat: {
          mode: "normal",
          enabled: true,
          rooms: {
            "en.enabled": true,
            "tr.enabled": true,
            "de.enabled": true,
            "es.enabled": true,
            "beg.enabled": true,
            "whale.enabled": true,
          },
        },
        games: {
          "crash.enabled": true,
          "dice.enabled": true,
          "mines.enabled": true,
          "keno.enabled": true,
          "plinko.enabled": true,
          "slide.enabled": true,
          "coinflip.enabled": true,
          "cases.enabled": true,
          "reme.enabled": true,
          "towers.enabled": true,
          "battles.enabled": true,
        },
        growtopia: {
          "deposit.enabled": true,
          "withdraw.enabled": true,
        },
        mmo: {
          "deposit.enabled": false,
          "withdraw.enabled": false,
        },
        crypto: {
          "deposit.enabled": false,
          "withdraw.enabled": false,
        },
      });
      settings = settings.toObject();
    }
    delete settings._id;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

const settingCheck = (user, value) => {
  if (
    settings.general.maintenance.enabled === true &&
    (user === null || user.rank !== "admin")
  ) {
    throw new Error("Site is in maintenance! Please try again later.");
  } else if (
    value !== undefined &&
    value.split(".").reduce((o, i) => o[i], settings) === false &&
    (user === null || user.rank !== "admin")
  ) {
    throw new Error("The action you’ve requested is currently unavailable.");
  }
};

const settingGet = () => {
  return settings;
};

const settingSetValue = async (setting, value) => {
  settings = await Setting.findOneAndUpdate(
    {},
    {
      [setting]: value,
    },
    { new: true },
  )
    .select("general chat games growtopia limited steam crypto gift credit")
    .lean();
  delete settings._id;

  return settings;
};

module.exports = {
  settingInitDatabase,
  settingCheck,
  settingGet,
  settingSetValue,
};
