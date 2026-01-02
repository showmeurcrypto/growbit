const mongoose = require("mongoose");
const validator = require("validator");

// Load database models
const FilterPhrase = require("../../../database/models/FilterPhrase");
const User = require("../../../database/models/User");

// Load utils
const { socketRemoveAntiSpam } = require("../../../utils/socket");
const { settingGet, settingSetValue } = require("../../../utils/setting");
const {
  generalCheckSendChatMessageData,
  generalCheckSendChatMessageRoom,
  generalCheckSendChatMessageUser,
  generalCheckSendChatRemoveData,
  generalCheckSendChatRemoveRoom,
  generalCheckSendChatRemoveMessage,
  generalCheckSendChatClearRoom,
  generalCheckSendChatLockData,
  generalCheckSendChatLockRoom,
  generalFilterMessage,
} = require("../../../utils/general/chat");
const { logger } = require("../../../utils/logger");
const fs = require("fs");
const { ignore } = require("nodemon/lib/rules");
const LRUCache = require("lru-cache");

// General chat variables
let generalChatMessages = {
  en: [],
};
let generalChatUserCooldowns = [];
let generalChatFilter = [];

const userCache = new LRUCache.LRUCache({ max: 200 });

process.on("SIGINT", () => {
  logger.info("App shutdown, saving chat");
  let data = JSON.stringify(generalChatMessages);
  fs.writeFile("./chat.json", data, (err) => {
    if (err) {
      logger.error("Error writing chat data to file:", err);
      process.exit();
    } else {
      logger.info("Chat data saved successfully.");
      process.exit();
    }
  });
});

const generalGetChatMessagesSocket = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  try {
    socket.join("en");

    callback({ success: true, messages: generalChatMessages["en"] });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const generalSendChatMessageSocket = (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    generalCheckSendChatMessageData(data);

    // Get page settings
    const settings = settingGet();

    // Validate chat room
    let chatRoom = "en";
    generalCheckSendChatMessageRoom(user, settings, chatRoom);

    // Validate sending user
    generalCheckSendChatMessageUser(user, settings, generalChatUserCooldowns);

    // Add time to user cooldown array
    generalChatUserCooldowns[user._id.toString()] = new Date().getTime();

    let message;
    if (
      user.rank === "admin" &&
      data.message.trim().startsWith("/system") === true
    ) {
      // Create system message object
      message = {
        message: validator.escape(data.message.replace("/system", "").trim()),
        type: "system",
      };
    } else {
      // Get user level

      // Create user message object
      message = {
        message: generalFilterMessage(data.message, generalChatFilter),
        room: chatRoom,
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          rank: user.rank,
          stats: user.anonymous === true ? null : user.stats,
          createdAt: user.createdAt,
        },
        type: "user",
      };
    }

    // // Add message to specific chat room/s and send to frontend
    generalChatAddMessage(io, message);

    callback({ success: true });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const generalSendChatRemoveSocket = async (
  io,
  socket,
  user,
  data,
  callback,
) => {
  try {
    // Validate sent data
    generalCheckSendChatRemoveData(data);

    // Validate chat room
    let chatRoom = "en";
    generalCheckSendChatRemoveRoom(chatRoom);

    // Validate chat message
    generalCheckSendChatRemoveMessage(data, generalChatMessages[chatRoom]);

    // Remove message from chat messages array
    const index = generalChatMessages[chatRoom].findIndex(
      (element) => element._id.toString() === data.messageId.toString(),
    );
    generalChatMessages[chatRoom].splice(index, 1);

    // Sent the removed message to the room connected users
    io.of("/general")
      .to(chatRoom)
      .emit("chatRemove", { messageId: data.messageId });

    callback({ success: true });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const generalSendChatClearSocket = async (io, socket, user, data, callback) => {
  try {
    let chatRoom = "en";
    generalCheckSendChatClearRoom(chatRoom);

    // Clear chat room array
    generalChatMessages[chatRoom] = [];

    // Sent the removed message to the room connected users
    io.of("/general").to(chatRoom).emit("chatClear", {});

    // Create system message object
    message = {
      room: chatRoom,
      message: `Chat has been cleared by an admin.`,
      type: "system",
    };

    // Add message to specific chat room/s and send to frontend
    generalChatAddMessage(io, message);

    callback({ success: true });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const generalSendChatLockSocket = async (io, socket, user, data, callback) => {
  try {
    // Validate sent data
    generalCheckSendChatLockData(data);

    // Get app settings
    let settings = settingGet();

    // Validate chat room
    let chatRoom = "en";
    generalCheckSendChatLockRoom(data, settings, chatRoom);

    // Update chat room setting in database
    settings = await settingSetValue(
      `chat.rooms.${chatRoom}.enabled`,
      data.value,
    );

    // Sent the updated settings to all connected users
    io.of("/general").emit("settings", { settings: settings });

    // Create system message object
    message = {
      message: `Chat has been ${data.value === true ? "unlocked" : "locked"} by an admin.`,
      room: chatRoom,
      type: "system",
    };

    // Add message to specific chat room/s and send to frontend
    generalChatAddMessage(io, message);

    callback({ success: true });

    socketRemoveAntiSpam(user._id);
  } catch (err) {
    socketRemoveAntiSpam(socket.decoded._id);
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const MENTION_REGEX = /@([a-zA-Z0-9]+)/g;

async function getUserData(username) {
  let user = userCache.get(username);

  if (user) {
    return user;
  }

  try {
    user = await User.findOne({
      username: { $regex: `^${username}$`, $options: "i" },
    })
      .select("username stats avatar anonymous createdAt")
      .lean();
  } catch (e) {
    return null;
  }

  if (user) {
    userCache.set(username, user);
  }

  return user;
}

async function parseMentions(message, players) {
  let txt = message.message;

  const matches = txt.match(MENTION_REGEX);
  if (!matches) return;

  const mentionedUsernames = matches.slice(0, 3);

  const mentionedUsers = await Promise.all(
    mentionedUsernames.map(async (mention) => {
      const username = mention.slice(1).toLowerCase();
      return await getUserData(username);
    }),
  );

  message.mentioned = mentionedUsers.filter(Boolean);
}

function cacheUser(message) {
  if (message.type === "user") {
    let username = message.user.username.toLowerCase();
    userCache.set(username, message.user);
  }
}

const generalChatAddMessage = async (io, message) => {
  try {
    // Create chat rooms array
    const rooms =
      message.type === "user" || message.room !== undefined
        ? [message.room]
        : Object.keys(generalChatMessages);

    cacheUser(message);

    await parseMentions(message);

    // Create message object
    message = {
      _id: new mongoose.Types.ObjectId(),
      ...message,
    };

    for (const room of rooms) {
      // Remove oldest message specifc each room if there are more then 50 messages
      if (generalChatMessages[room].length > 50) {
        generalChatMessages[room].shift();
      }

      // Add message to the specifc room array
      generalChatMessages[room].push(message);

      // Sent the message to frontend
      io.of("/general").to(room).emit("chatMessage", { message: message });
    }
  } catch (err) {
    console.error(err);
  }
};

const generalChatAddFilter = (phrase) => {
  // Add phrase to chat filter array
  generalChatFilter.push(phrase);
};

const generalChatRemoveFilter = (phrase) => {
  // Get phrase index and remove from chat filter array
  const index = generalChatFilter.indexOf(phrase);
  if (index !== -1) {
    generalChatFilter.splice(index, 1);
  }
};

async function updateUserCache() {
  try {
    let users = await User.find({})
      .sort({ updatedAt: -1 })
      .limit(100)
      .select("username stats avatar anonymous createdAt")
      .lean()
      .exec();

    for (let user of users) {
      let username = user.username.toLowerCase();

      if (user.anonymous) {
        user.stats = null;
      }
      userCache.set(username, user);
    }
  } catch (e) {
    logger.error(e);
  }
}

const generalChatInit = async (io) => {
  try {
    fs.readFile("./chat.json", "utf8", (err, data) => {
      if (err) {
        logger.error("Error reading chat data from file:", err);
      } else {
        try {
          if (!generalChatMessages?.en?.length) {
            generalChatMessages = JSON.parse(data);

            for (let msg of generalChatMessages.en) {
              cacheUser(msg);
            }
            logger.info("Chat data loaded successfully.");
          }
        } catch (parseErr) {
          logger.error("Error parsing chat data:", parseErr);
        }
      }
    });

    // Get filters phrases from database
    const filterDatabase = await FilterPhrase.find({}).select("phrase").lean();

    // Format filter phrases
    generalChatFilter = filterDatabase.map((element) => element.phrase);

    // Get page settings
    const settings = settingGet();

    // Create system message object
    message = {
      message: "Chat has been locked by an administrator.",
      type: "system",
    };

    // Check if chat rooms are locked and if true add info message to room
    for (const room of Object.keys(generalChatMessages)) {
      if (settings.chat.rooms[room].enabled === false) {
        // Add chat room to message object
        message.room = room;

        // Add message to specific chat room/s and send to frontend
        generalChatAddMessage(io, message);
      }
    }
  } catch (err) {
    logger.error(err);
  }
};

const ignoreUser = async (user, userIdToIgnore) => {
  if (user._id.toString() === userIdToIgnore) {
    throw new Error("You can't ignore yourself!");
  }
  //TODO: can't ignore admin
  if (!user.ignoreList) {
    user.ignoreList = [];
  } else if (user.ignoreList.length === 20) {
    throw new Error("You can't ignore more than 20 users!");
  } else {
    let index = user.ignoreList.findIndex(
      (u) => u._id?.toString() === userIdToIgnore.toString(),
    );
    if (index >= 0) {
      user.ignoreList.splice(index, 1);
      await user.save();
      return user.toObject();
    }
  }

  const ignoredUser = await User.findOne({ _id: userIdToIgnore })
    .select("username avatar")
    .lean()
    .exec();

  if (!ignoredUser) {
    throw new Error("User not found!");
  }
  user.ignoreList.push(ignoredUser);

  await user.save();
  return user.toObject();
};

updateUserCache();

setInterval(
  () => {
    updateUserCache();
  },
  1000 * 60 * 10,
);

module.exports = {
  generalGetChatMessagesSocket,
  generalSendChatMessageSocket,
  generalSendChatRemoveSocket,
  generalSendChatClearSocket,
  generalSendChatLockSocket,
  generalChatAddMessage,
  generalChatAddFilter,
  generalChatRemoveFilter,
  generalChatInit,
  ignoreUser,
};
