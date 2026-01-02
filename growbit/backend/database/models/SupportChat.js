const mongoose = require("mongoose");

const supportChatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User" },
    username: String,
    userRead: Boolean,
    supportRead: { type: Boolean, default: false },
    messages: [
      {
        sender: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

supportChatSchema.path("updatedAt").index({ expires: 60 * 60 * 24 * 3 });

module.exports = mongoose.model("SupportChat", supportChatSchema);
