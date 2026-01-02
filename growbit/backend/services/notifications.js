const Notification = require("../database/models/Notification");

async function createNotification(
  userId,
  message,
  io,
  type = "misc",
  meta = {},
) {
  const toInsert = {
    message,
    user: userId,
    type,
    meta,
  };
  const newNotification = await Notification.create(toInsert);
  io?.of("/general")
    .to(userId.toString())
    .emit("newNotification", newNotification.toObject());
}

async function markAllNotificationsRead(userId) {
  await Notification.deleteMany({ user: userId }).exec();
}

async function markRead(_id, userId) {
  await Notification.deleteOne({ _id, user: userId }).exec();
}

async function getNotificationsForUserId(userId) {
  return await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
}

module.exports = {
  createNotification,
  markAllNotificationsRead,
  markRead,
  getNotificationsForUserId,
};
