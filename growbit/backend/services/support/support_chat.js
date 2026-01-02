const SupportChat = require("../../database/models/SupportChat");
const axios = require("axios");
const mongoose = require("mongoose");
const { logger } = require("../../utils/logger");

const DISCORD_WEBHOOK_URL =
  process.env.NOTIFICATIONS_DISCORD_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1328668440357244928/sTCC1fQDgoCkNPhXIr76sSyoA60aBBsEFixCnWrlfGKAaoL-Jv-2Zrbmz-FIWO3H5x5X";
const notifyDiscord = async (username, message) => {
  if (DISCORD_WEBHOOK_URL) {
    try {
      const embed = {
        username: "Support Bot",
        embeds: [
          {
            title: "New Support message",
            description: `**${username}**\n${message}`,
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

async function readMessage(reader, userId) {
  if (reader === "admin") {
    await SupportChat.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          supportRead: true,
        },
      },
    );
  }
}

async function deleteChat(userId) {
  await SupportChat.deleteOne({ user: userId });
}

async function sendMessage(message, sender, userId, username = "") {
  if (!username && sender !== "admin") {
    throw new Error("Username is missing!");
  }

  const newObject = await SupportChat.findOneAndUpdate(
    { user: userId },
    {
      $push: {
        messages: {
          message: message,
          sender: sender,
        },
      },
      $setOnInsert: {
        user: new mongoose.Types.ObjectId(userId),
        username: username,
      },
    },
    {
      new: true,
      upsert: sender !== "admin",
      setDefaultsOnInsert: true,
    },
  );

  if (sender !== "admin") {
    if (newObject.messages.length == 1) {
      notifyDiscord(sender, message);
    } else {
      let last = newObject.messages.pop().timestamp;
      let prev = newObject.messages.pop().timestamp;

      if (last - prev > 1000 * 60 * 60) {
        //First message in last hour
        notifyDiscord(sender, message);
      }
    }
  }
}

async function getAllChats() {
  return await SupportChat.find().sort({ updatedAt: -1 }).limit(20).lean();
}

module.exports = {
  sendMessage,
  getAllChats,
  readMessage,
  deleteChat,
};
