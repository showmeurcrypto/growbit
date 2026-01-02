const User = require("../database/models/User");
const axios = require("axios");
const { logger } = require("../utils/logger");

const DISCORD_WEBHOOK_URL =
  process.env.NOTIFICATIONS_DISCORD_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1328668440357244928/sTCC1fQDgoCkNPhXIr76sSyoA60aBBsEFixCnWrlfGKAaoL-Jv-2Zrbmz-FIWO3H5x5X";

async function checkWithdrawAntiFraud(user, growId = null, cryptoAddr = null) {
  if (!user) {
    throw Error("Unexpected Error!");
  }

  if (user.whitelist) {
    return;
  }

  if (!user.local?.emailVerified) {
    throw Error("Your email is not verified!");
  }

  let growIds = user.growIds || [];
  let cryptoAddresses = user.cryptoAddresses || [];
  let ips = user.ips?.map((ip) => ip.address) || [];

  if (growId) {
    growIds.push(growId);
  }

  if (cryptoAddr) {
    cryptoAddresses.push(cryptoAddr);
  }

  const result = await User.updateMany(
    {
      $and: [
        { username: { $ne: user.username } },
        { rank: "user" },
        {
          $or: [
            { growIds: { $in: growIds } },
            { cryptoAddresses: { $in: cryptoAddresses } },
            { ips: { $elemMatch: { address: { $in: ips } } } },
          ],
        },
      ],
    },
    {
      "limits.blockWithdraw": true,
      "limits.blockTip": true,
    },
  ).exec();

  if (result.modifiedCount > 0) {
    logger.info("Multi acc tried to withdraw", user.username);
    await User.updateOne(
      {
        _id: user._id,
      },
      {
        "limits.blockWithdraw": true,
        "limits.blockTip": true,
      },
      {
        new: true,
      },
    ).exec();

    const bannedAccounts = await User.find(
      {
        $or: [
          { growIds: { $in: growIds } },
          { cryptoAddresses: { $in: cryptoAddresses } },
          { ips: { $elemMatch: { address: { $in: ips } } } },
        ],
      },
      { username: 1, _id: 1 },
    ).exec();

    const bannedUsernames = bannedAccounts
      .map((acc) => acc.username)
      .join(", ");

    await notifyDiscord(bannedUsernames);

    throw Error("Something went wrong!");
  }
}

async function findMultisForUser(userId) {
  const user = await User.findById(userId)
    .select("username growIds cryptoAddresses ips")
    .lean();

  let growIds = user.growIds || [];
  let cryptoAddresses = user.cryptoAddresses || [];
  let ips = user.ips?.map((ip) => ip.address) || [];

  return await User.find({
    $and: [
      { username: { $ne: user.username } },
      {
        $or: [
          { growIds: { $in: growIds } },
          { cryptoAddresses: { $in: cryptoAddresses } },
          { ips: { $elemMatch: { address: { $in: ips } } } },
        ],
      },
    ],
  })
    .select("username")
    .lean()
    .exec();
}
const notifyDiscord = async (bannedUsernames) => {
  if (DISCORD_WEBHOOK_URL) {
    try {
      const embed = {
        username: `Antifraud Bot`,
        embeds: [
          {
            title: `Users Locked`,
            description: `Users **${bannedUsernames}** have been locked for multi acc violation`,
            color: 0xa83232,
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

module.exports = {
  checkWithdrawAntiFraud,
  findMultisForUser,
};
