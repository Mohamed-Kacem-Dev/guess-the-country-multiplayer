let { connectedPlayers, rooms, games, countryCount } = require("./state");
const { saveChatMessage } = require("./chatHandlers");
const fs = require("fs");

function handleGetPlayerCount(io) {
  io.emit("playerCount", Object.keys(connectedPlayers).length);
}

function handleGetRooms(io, socket) {
  socket.emit("rooms", Object.values(rooms));
}

function handleCreateRoom(io, socket, { username, roomName, size }) {
  if (rooms[socket.id]) {
    return;
  }

  const newRoom = {
    id: socket.id,
    roomName: roomName,
    host: socket.id,
    hostUsername: username,
    players: [{ playerid: socket.id, playerName: username, isReady: true }],
    createdAt: new Date(),
    size: size,
    isFull: false,
    state: "waiting",
    lastResult: null,
  };

  const newGame = { isReady: false };

  rooms[socket.id] = newRoom;
  games[socket.id] = newGame;

  io.emit("rooms", Object.values(rooms));
  io.emit(
    "RoomChat",
    { sender: "Server", message: `Room Created`, date: new Date() },
    socket.id
  );
}

function handleGetRoomDetails(socket, { roomid }) {
  const roomDetails = rooms[roomid];
  socket.emit("roomDetails", roomDetails);
}

function handleJoinRoom(io, socket, playersocketid, roomid) {
  if (rooms[roomid].players.length < rooms[roomid].size) {
    socket.emit("joinedRoom", { success: true, roomid });
    // Update the players array for the specified room
    let updatedRooms = {
      ...rooms,
      [roomid]: {
        ...rooms[roomid],
        players: [
          ...rooms[roomid].players,
          {
            playerid: playersocketid,
            playerName: connectedPlayers[playersocketid],
            isReady: false,
          },
        ],
      },
    };

    // Assign the result to the original rooms object
    rooms = updatedRooms;

    updateRoomIsFull(roomid, rooms);
    const roomDetails = rooms[roomid];
    console.log(roomDetails);
    // Emit the roomDetails back to the client

    io.emit("roomDetails", roomDetails);
    io.emit("rooms", Object.values(rooms));
    io.emit(
      "RoomChat",
      {
        sender: "Server",
        message: `${connectedPlayers[playersocketid]} Joined`,
        date: new Date(),
      },
      roomid
    );
  } else {
    socket.emit("joinedRoom", { success: false, reason: "full" });
  }
}

function handlequitRoom(io, socket, playersocketid, roomid) {
  //if the player who quit is host delete room
  if (rooms[playersocketid]) {
    delete rooms[playersocketid];
    //kick rest of players from room
    io.emit("kickFromRoom", roomid);
    // delete game if it exists
    if (games && games[roomid]) {
      delete games[roomid];
    }
  }
  //if player who is not host quits
  if (rooms[roomid]) {
    // Find the index of the player in the players array
    const playerIndex = rooms[roomid].players.findIndex(
      (player) => player.playerid === playersocketid
    );
    if (playerIndex !== -1) {
      // Remove the player from the players array
      rooms[roomid].players.splice(playerIndex, 1);
    }
    updateRoomIsFull(roomid, rooms);
    rooms[roomid].state === "waiting" &&
      io.emit(
        "RoomChat",
        {
          sender: "Server",
          message: `${connectedPlayers[playersocketid]} Left`,
          date: new Date(),
        },
        roomid
      );
    if (rooms[roomid].state === "playing") {
      io.emit(
        "RoomChat",
        {
          sender: "Server",
          message: `Game Interrupted, Reason: ${connectedPlayers[playersocketid]} Left`,
          date: new Date(),
        },
        roomid
      );
      rooms[roomid].state = "waiting";
      if (games && games[roomid]) {
        delete games[roomid];
      }
    }
    io.emit("roomDetails", rooms[roomid]);
  }

  // Emit the roomDetails back to the clients
  io.emit("rooms", Object.values(rooms));
}

function handleDisconnect(io, socket) {
  if (connectedPlayers[socket.id]) {
    const disconnectedUsername = connectedPlayers[socket.id];
    delete connectedPlayers[socket.id];

    console.log(`Player ${disconnectedUsername} disconnected`);
    const srvrmsg = {
      sender: "Server",
      message: `${disconnectedUsername} Went Offline`,
      date: new Date(),
    };
    io.emit("GlobalChat", srvrmsg);
    saveChatMessage(srvrmsg, socket);

    // Broadcast the updated count and the connected players to other connected clients
    io.emit("connectedPlayers", Object.values(connectedPlayers));
    io.emit("playerCount", Object.keys(connectedPlayers).length);
  }
  //if the a host disconnected
  if (rooms[socket.id]) {
    delete rooms[socket.id];
    io.emit("kickFromRoom", socket.id);
    // delete game if it exists
    if (games && games[socket.id]) {
      delete games[socket.id];
    }
  }
  // not host disconnected , Loop through each room
  for (const roomId in rooms) {
    if (rooms.hasOwnProperty(roomId)) {
      // Remove the player from the players array
      const removedPlayer = rooms[roomId].players.find(
        (player) => player.playerid === socket.id
      );
      rooms[roomId].players = rooms[roomId].players.filter(
        (player) => player.playerid !== socket.id
      );
      if (removedPlayer) {
        // Emit a "RoomChat" event when a player leaves
        rooms[roomId].state === "waiting" &&
          io.emit(
            "RoomChat",
            {
              sender: "Server",
              message: `${removedPlayer.playerName} disconnected`,
              date: new Date(),
            },
            roomId
          );
        if (rooms[roomId].state === "playing") {
          io.emit(
            "RoomChat",
            {
              sender: "Server",
              message: `Game Interrupted, Reason: ${removedPlayer.playerName} disconnected`,
              date: new Date(),
            },
            roomId
          );
          rooms[roomId].state = "waiting";
          if (games[roomId]) {
            delete games[roomId];
          }
        }
      }
    }

    // Emit the roomDetails back to the client
    updateRoomIsFull(roomId, rooms);
    io.emit("roomDetails", rooms[roomId]);
  }
  // Broadcast the updated list of rooms to all clients
  io.emit("rooms", Object.values(rooms));
}

function handleReadyUp(io, socket, roomid) {
  const room = rooms[roomid];
  if (room) {
    // Find the player by playerid
    const player = room.players.find((player) => player.playerid === socket.id);
    // Check if the player exists
    if (player) {
      // Set the isReady state of the player to true
      player.isReady = true;
      io.emit(
        "RoomChat",
        {
          sender: "Server",
          message: `${player.playerName} is READY`,
          date: new Date(),
        },
        roomid
      );
    }
  }
  io.emit("roomDetails", rooms[roomid]);
}

function handleRematch(io, socket, roomid) {
  const room = rooms[roomid];
  if (room) {
    // Find the player by playerid
    const player = room.players.find((player) => player.playerid === socket.id);
    // Check if the player exists
    if (player) {
      // Set the isReady state of the player to true
      player.isReady = true;
      io.emit(
        "RoomChat",
        {
          sender: "Server",
          message: `${player.playerName} wants a Rematch!`,
          date: new Date(),
        },
        roomid
      );
    }
  }
  io.emit("roomDetails", rooms[roomid]);
}

function handleStartGame(io, socket, roomid) {
  const room = rooms[roomid];
  if (room && room.host === socket.id) {
    room.state = "playing";
    io.emit(
      "RoomChat",
      {
        sender: "Server",
        message: `${room.hostUsername} Started the game`,
        date: new Date(),
      },
      roomid
    );
    games[roomid] = {
      countries: getCountriesData(),
      gameInProgress: true,
      gameState: {
        currentCountryIndex: 0,
        scores: {},
      },
      isTimeoutProcessing: false,
    };
    for (let player of room.players) {
      games[roomid].gameState.scores[player.playerid] = 0; // Initialize scores to zero
    }
    console.log("*****Game Object******");
    console.dir(games[roomid], { depth: null, colors: true });
  }
  io.emit("roomDetails", rooms[roomid]);
  io.emit("rooms", Object.values(rooms));
}

function handleSinglePlayer(socket) {
  socket.emit("SinglePlayer", getCountriesData());
}

function handleGameState(socket, roomid) {
  const gameState = games[roomid];
  socket.emit("gameState", gameState);
}

function handleCorrectGuess(io, socket, roomid, bonus) {
  const gameState = games[roomid];
  console.log(gameState);
  console.log("**********************************");
  gameState.gameState.scores[socket.id] += 50 + bonus;
  const gameStateScores = gameState.gameState.scores;
  const playerIds = Object.keys(gameStateScores);
  handleNextIndexLogic(
    io,
    gameState,
    playerIds,
    roomid,
    socket,
    gameStateScores
  );
}

function handleTimeout(io, socket, roomid) {
  const gameState = games[roomid];
  console.log("++++TIMEOUT REQUEST++++");
  console.log(rooms);
  console.log(games);
  gameState && console.log(gameState.isTimeoutProcessing);
  if (gameState && !gameState.isTimeoutProcessing) {
    gameState.isTimeoutProcessing = true;
    const gameStateScores = gameState.gameState.scores;
    const playerIds = Object.keys(gameStateScores);
    handleNextIndexLogic(
      io,
      gameState,
      playerIds,
      roomid,
      socket,
      gameStateScores
    );
    // Release the lock after handling the timeout
    setTimeout(() => {
      gameState.isTimeoutProcessing = false;
    }, 1000);
  }
}

function handleNextIndexLogic(
  io,
  gameState,
  playerIds,
  roomid,
  socket,
  gameStateScores
) {
  if (gameState.gameState.currentCountryIndex < countryCount) {
    gameState.gameState.currentCountryIndex++;
    for (const socketId of playerIds) {
      io.to(socketId).emit("gameState", gameState);
    }
  } else {
    // Find the player with the highest score
    const highestScore = Math.max(
      ...playerIds.map((playerId) => gameStateScores[playerId] || 0)
    );
    // Find all players with the highest score (could be multiple in case of a draw)
    const winners = playerIds.filter(
      (playerId) => gameStateScores[playerId] === highestScore
    );
    console.log("********Winners*****");
    console.log(winners);
    let result = "No Result";
    if (winners.length === 1) {
      // Single winner
      result = {
        type: "win",
        winnerid: winners[0],
        winner: connectedPlayers[winners[0]],
        scores: playerIds
          .sort((a, b) => gameStateScores[b] - gameStateScores[a])
          .map((playerId) => ({
            playerName: connectedPlayers[playerId],
            score: gameStateScores[playerId] || 0,
          })),
      };
    } else {
      // Draw
      result = {
        type: "draw",
        winners: winners.map((playerId) => connectedPlayers[playerId]),
        scores: playerIds
          .sort((a, b) => gameStateScores[b] - gameStateScores[a])
          .map((playerId) => ({
            playerName: connectedPlayers[playerId],
            score: gameStateScores[playerId] || 0,
          })),
      };
    }
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log(result);
    gameState.gameInProgress = false;
    if (result.type === "win") {
      if (playerIds.length === 2) {
        for (const socketId of playerIds) {
          io.to(socketId).emit(
            "RoomChat",
            {
              sender: "Server",
              message: `${result.winner} WON vs ${result.scores[1].playerName}!🎉 `,
              date: new Date(),
            },
            roomid
          );
        }
        const srvrmsg = {
          sender: "Server",
          message: `${result.winner} WON vs ${result.scores[1].playerName}!🎉`,
          date: new Date(),
        };
        io.emit("GlobalChat", srvrmsg);
        saveChatMessage(srvrmsg, socket);
      } else {
        for (const socketId of playerIds) {
          io.to(socketId).emit(
            "RoomChat",
            {
              sender: "Server",
              message: `${result.winner} WON!🎉 `,
              date: new Date(),
            },
            roomid
          );
        }
        if (socket.id === roomid) {
          const srvrmsg = {
            sender: "Server",
            message: `${result.winner} WON!🎉`,
            date: new Date(),
          };
          io.emit("GlobalChat", srvrmsg);
          saveChatMessage(srvrmsg, socket);
        }
      }
    }
    //after game ends unready all players
    //room.state=wainting
    if (games && games[roomid]) {
      delete games[roomid];
    }
    if (rooms && rooms[roomid]) {
      rooms[roomid].players.forEach((player) => {
        player.isReady = false;
      });
      rooms[roomid].state = "waiting";
      for (const socketId of playerIds) {
        io.to(socketId).emit("roomDetails", rooms[roomid]);
        io.to(socketId).emit("gameResult", result);
      }
      io.emit("rooms", Object.values(rooms));
    }
  }
}

function updateRoomIsFull(roomId, rooms) {
  const originalRoom = rooms[roomId];
  if (originalRoom) {
    // Create a shallow copy of the room object
    const room = { ...originalRoom };
    // Modify the copied room object
    room.isFull = room.players.length >= room.size;
    // Update the original room in the rooms collection
    rooms[roomId] = room;
  } else {
    console.error("Room not found!");
  }
}

// A helper function to get a random integer between 0 and max (exclusive)
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// A helper function to check if an array contains a value
function contains(array, value) {
  return array.indexOf(value) !== -1;
}

// A helper function to get a random hint from an array of hints
function getRandomHint(hints) {
  // Filter out the show flag hints
  const filteredHints = hints.filter((hint) => hint.type !== "show flag");
  // Get a random index
  const index = getRandomInt(filteredHints.length);
  // Return the hint at that index
  return filteredHints[index];
}

// The main function to get 10 countries and 5 hints for each country
function getCountriesData() {
  const data = JSON.parse(fs.readFileSync("./data/data.json", "utf8"));
  // An array to store the selected countries data
  const countriesData = [];
  // A loop to select 10 countries
  for (let i = 0; i < countryCount + 1; i++) {
    // Get a random index
    let index = getRandomInt(data.length);
    // Check if the country at that index is already selected
    while (contains(countriesData, data[index])) {
      // If yes, get another random index
      index = getRandomInt(data.length);
    }
    // An array to store the hints for this country
    const countryHints = [];
    let hint = getRandomHint(data[index].hints);
    while (hint.type === "reveal letter") {
      // If yes, get another random hint
      hint = getRandomHint(data[index].hints);
    }
    countryHints.push(hint);
    // A loop to select 3 hints for this country
    for (let j = 1; j < 4; j++) {
      // Get a random hint
      let hint = getRandomHint(data[index].hints);
      // Check if the hint is already selected
      while (contains(countryHints, hint)) {
        // If yes, get another random hint
        hint = getRandomHint(data[index].hints);
      }
      // Add the hint to the countryHints array
      countryHints.push(hint);
    }
    // Add the show flag hint as the last hint
    countryHints.push(
      data[index].hints.find((hint) => hint.type === "show flag")
    );
    // Create an object with the country and hints keys
    const countryData = {
      country: data[index].country,
      hints: countryHints,
    };
    // Add the countryData object to the countriesData array
    countriesData.push(countryData);
  }
  // Return the countriesData array
  return countriesData;
}

module.exports = {
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
};
