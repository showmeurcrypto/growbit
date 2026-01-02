const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User" },
    message: String,
    type: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
