const ChatMessage = require("../models/chatMessage");

function handleGlobalChat(io, socket, msg) {
  io.emit("GlobalChat", msg);
  try {
    const newChatMessage = new ChatMessage({
      sender: msg.sender,
      message: msg.message,
      time: new Date(),
      senderID: socket.id,
    });
    newChatMessage.save();
  } catch (e) {
    console.error("Error saving or emitting chat message:", e);
  }
}

async function handleGetLatestMessages(socket) {
  try {
    const messages = await ChatMessage.find().sort({ time: -1 }).limit(30);
    socket.emit("latestMessages", messages.reverse());
  } catch (error) {
    console.error("Error fetching chat messages from MongoDB:", error);
  }
}

function handleRoomChat(io, newMsg, roomid) {
  console.log("Received " + newMsg.message + " in room " + roomid);
  io.emit("RoomChat", newMsg, roomid);
}

const saveChatMessage = async (msg, socket) => {
  try {
    const senderID = msg.sender === "Server" ? "Server" : socket.id;
    const newChatMessage = new ChatMessage({
      sender: msg.sender,
      message: msg.message,
      time: new Date(),
      senderID: senderID,
    });
    const savedMessage = await newChatMessage.save();
    return savedMessage;
  } catch (e) {
    console.error("Error saving chat message:", e);
    // throw e;  Re-throw the error to handle it where the function is called?
  }
};

module.exports = {
  handleGlobalChat,
  handleGetLatestMessages,
  handleRoomChat,
  saveChatMessage,
};
