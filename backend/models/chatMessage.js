const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  sender: String,
  message: String,
  time: { type: Date, default: Date.now },
  senderID: String,
});

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

module.exports = ChatMessage;
