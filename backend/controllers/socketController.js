const { connectedPlayers, rooms } = require("./state");

const {
  handleGetPlayerCount,
  handleGetRooms,
  handleCreateRoom,
  handleGetRoomDetails,
  handleJoinRoom,
  handlequitRoom,
  handleDisconnect,
  handleReadyUp,
  handleRematch,
  handleStartGame,
  handleSinglePlayer,
  handleGameState,
  handleCorrectGuess,
  handleTimeout,
} = require("./gameHandlers");
const {
  handleGlobalChat,
  handleGetLatestMessages,
  handleRoomChat,
  saveChatMessage,
} = require("./chatHandlers");
const { connectToDatabase } = require("../utils/database");

connectToDatabase();

function setupSocket(io) {
  io.on("connection", async (socket) => {
    let username = socket.handshake.query.username;

    // Validate the username
    if (!isValidUsername(username)) {
      console.error(`Invalid username: ${username}`);
      socket.disconnect(true); // Disconnect the socket
      return;
    }
    username = avoidDuplicateUsernames(username);
    socket.emit("setUsername", username);
    console.log(`Player ${username} connected`);
    const srvrmsg = {
      sender: "Server",
      message: `${username} is Online`,
      date: new Date(),
    };
    io.emit("GlobalChat", srvrmsg);
    saveChatMessage(srvrmsg, socket);

    // Add the username and socket.id to the connectedPlayers object
    connectedPlayers[socket.id] = username;
    // Broadcast the updated count and the connected players to other connected clients
    io.emit("playerCount", Object.keys(connectedPlayers).length);
    io.emit("connectedPlayers", Object.values(connectedPlayers));
    console.log(connectedPlayers);
    io.emit("rooms", Object.values(rooms));

    socket.on("getPlayerCount", () => handleGetPlayerCount(io));
    socket.on("getRooms", () => handleGetRooms(io, socket));
    socket.on("createRoom", ({ username, roomName, size }) =>
      handleCreateRoom(io, socket, { username, roomName, size })
    );
    socket.on("getRoomDetails", ({ roomid }) =>
      handleGetRoomDetails(socket, { roomid })
    );
    socket.on("joinRoom", ({ playersocketid, roomid }) =>
      handleJoinRoom(io, socket, playersocketid, roomid)
    );

    socket.on("quitRoom", ({ playersocketid, roomid }) => {
      handlequitRoom(io, socket, playersocketid, roomid);
    });

    socket.on("disconnect", () => {
      handleDisconnect(io, socket);
    });

    //chat related events on chatHandlers.js
    socket.on("GlobalChat", (msg) => handleGlobalChat(io, socket, msg));
    socket.on("getLatestMessages", () => handleGetLatestMessages(socket));
    socket.on("RoomChat", (newMsg, roomid) =>
      handleRoomChat(io, newMsg, roomid)
    );

    socket.on("readyUp", ({ roomid }) => {
      handleReadyUp(io, socket, roomid);
    });

    socket.on("rematch", ({ roomid }) => {
      handleRematch(io, socket, roomid);
    });

    socket.on("startGame", ({ roomid }) => {
      handleStartGame(io, socket, roomid);
    });

    socket.on("SinglePlayer", () => {
      handleSinglePlayer(socket);
    });

    socket.on("gameState", (roomid) => {
      handleGameState(socket, roomid);
    });

    socket.on("correctGuess", (roomid, bonus) => {
      handleCorrectGuess(io, socket, roomid, bonus);
    });

    socket.on("timeout", (roomid) => {
      handleTimeout(io, socket, roomid);
    });
  });
}

// Validate function to check if the username is valid
function isValidUsername(username) {
  return username && username.trim() !== "";
}

function avoidDuplicateUsernames(username) {
  let originalUsername = username;
  // Check if the original username is not a duplicate
  if (!Object.values(connectedPlayers).includes(originalUsername)) {
    return originalUsername;
  }
  // If the original username is a duplicate, keep appending random numbers until it's unique
  while (true) {
    const randomSuffix = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");
    const newUsername = originalUsername + randomSuffix;

    // Check if the new username is unique
    if (!Object.values(connectedPlayers).includes(newUsername)) {
      return newUsername;
    }
  }
}

module.exports = { setupSocket };
