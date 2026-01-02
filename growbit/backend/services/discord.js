const axios = require("axios");

const DISCORD_WEBHOOK_URL =
  process.env.NOTIFICATIONS_DISCORD_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1328668440357244928/sTCC1fQDgoCkNPhXIr76sSyoA60aBBsEFixCnWrlfGKAaoL-Jv-2Zrbmz-FIWO3H5x5X";

const notifyDiscordAboutDivineIntervention = async (seedId, nonce) => {
  // if (DISCORD_WEBHOOK_URL) {
  //   try {
  //     const embed = {
  //       username: "Info Bot",
  //       embeds: [
  //         {
  //           title: "Divine intervention",
  //           description: `${seedId}\n${nonce}`,
  //           color: 3066993,
  //           timestamp: new Date(),
  //         },
  //       ],
  //     };
  //     await axios.post(DISCORD_WEBHOOK_URL, embed);
  //   } catch (error) {
  //     logger.error("Error sending webhook:", error.message);
  //   }
  // }
};

module.exports = {
  notifyDiscordAboutDivineIntervention,
};
