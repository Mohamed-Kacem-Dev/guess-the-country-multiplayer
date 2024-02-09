import React, { useState, useEffect } from "react";
import GamePlay from "./GamePlay";

function Game({ room, username, socket, setCurrentRoomid }) {
  const [gameState, setgameState] = useState(null);
  const [result, setResult] = useState(null);

  const isGamePlaying = room.state === "playing";

  useEffect(() => {
    socket.on("gameResult", (data) => {
      setResult(data);
    });
    return () => {
      socket.off("gameResult");
    };
  }, [socket, setResult]);

  const startGame = (id) => {
    socket.emit("startGame", { roomid: id });
  };
  const readyUp = (id) => {
    socket.emit("readyUp", { roomid: id });
  };
  const rematch = (id) => {
    socket.emit("rematch", { roomid: id });
  };
  const findPlayerById = (id) =>
    room.players.find((player) => player.playerid === id);
  function canStart(room) {
    const areAllPlayersReady = room.players.every((player) => player.isReady);
    return room.isFull && areAllPlayersReady;
  }

  function backToLobby() {
    socket.emit("quitRoom", { playersocketid: socket.id, roomid: room.id });
    setCurrentRoomid(null);
    socket.emit("getPlayerCount");
    socket.emit("getRooms");
  }

  function readyPlayersCount() {
    if (room && room.players) {
      const readyPlayers = room.players.filter((player) => player.isReady);
      return readyPlayers.length;
    } else {
      return 0;
    }
  }

  return (
    <div className="w-full h-full md:w-5/6 flex-1 flex ">
      {isGamePlaying && (
        <GamePlay
          socket={socket}
          room={room}
          gameState={gameState}
          setgameState={setgameState}
          setCurrentRoomid={setCurrentRoomid}
        />
      )}
      {!isGamePlaying && result === null && (
        <div className="bg-gray-500 m-auto p-4 md:w-1/4 h-1/3 flex rounded">
          <div className="flex flex-col m-auto items-center">
            {room.players.map((player, index) =>
              room.host === player.playerid ? (
                <span key={index} className="mt-1 font-semibold">
                  <span className="mr-1"> {player.playerName} (Host)</span>
                </span>
              ) : (
                <span key={index} className="mt-1 font-semibold">
                  {player.playerName}{" "}
                  {player.isReady ? "is Ready✅" : "isn't Ready Yet!"}
                </span>
              )
            )}

            {socket.id === room.host && canStart(room) && (
              <div className="mt-4 flex items-center justify-center">
                <span className="relative inline-flex">
                  <button
                    type="button"
                    onClick={() => startGame(room.id)}
                    className="bg-orange-700  hover:bg-orange-500 cursor-pointer inline-flex items-center px-4 py-2 font-semibold leading-6 shadow rounded-md text-white transition ease-in-out duration-150  ring-1 ring-slate-900/10 hover:scale-105"
                  >
                    Start Game 🏁
                  </button>
                  <span className="flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                </span>
              </div>
            )}

            {socket.id === room.host && !canStart(room) && (
              <button
                type="button"
                disabled
                className="mt-4 bg-orange-700 cursor-not-allowed opacity-60 px-4 py-2 font-semibold leading-6 shadow rounded-md text-white  ring-1 ring-slate-900/10"
              >
                Waiting...
              </button>
            )}

            {socket.id !== room.host && !findPlayerById(socket.id)?.isReady && (
              <div className="mt-4 flex items-center justify-center">
                <span className="relative inline-flex">
                  <button
                    type="button"
                    onClick={() => readyUp(room.id)}
                    className="bg-green-800  hover:bg-green-600 inline-flex cursor-pointer  items-center px-4 py-2 font-semibold leading-6 shadow rounded-md text-white transition ease-in-out duration-150  ring-1 ring-slate-900/10 hover:scale-105"
                  >
                    Ready?
                  </button>
                  <span className="flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {!isGamePlaying && result && (
        <div className="bg-gray-500 m-auto font-mono flex flex-col p-6 text-xl overflow-hidden rounded items-center font-semibold">
          {result.type === "win" &&
            (result.winnerid === socket.id ? (
              <p className="font-bold">YOU WON! 😎🔥</p>
            ) : (
              <p className="font-bold">YOU LOST 🤕💩</p>
            ))}
          {result.type === "draw" && <p className="font-bold">DRAW 🤝</p>}
          <div className="mt-5">
            <ul>
              {result.scores.map((player) => (
                <li key={player.playerName} className="mb-2">
                  <span className="font-semibold ">
                    <span className="italic"></span> {player.playerName}
                  </span>
                  <span className="ml-4 text-green-400 font-bold">
                    {player.score}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {!findPlayerById(socket.id)?.isReady && (
            <button
              type="button"
              onClick={() => rematch(room.id)}
              className="bg-green-800 hover:bg-green-600 inline-flex cursor-pointer items-center px-4 py-2 my-4 font-semibold leading-6 shadow rounded-md text-white transition ease-in-out duration-150  ring-1 ring-slate-900/10 hover:scale-105"
            >
              Rematch? ({readyPlayersCount()}/{room.size})
            </button>
          )}
          {findPlayerById(socket.id)?.isReady && (
            <span className="my-4 p-4 font-bold text-white bg-green-800 rounded shadow-lg">
              Rematch Requested! 🤼‍♂️ ({readyPlayersCount()}/{room.size})
            </span>
          )}
          {socket.id === room.host && canStart(room) && (
            <div className="my-4 flex items-center justify-center">
              <span className="relative inline-flex">
                <button
                  type="button"
                  onClick={() => startGame(room.id)}
                  className="bg-orange-700  hover:bg-orange-500 cursor-pointer inline-flex items-center px-4 py-2 font-semibold leading-6 shadow rounded-md text-white transition ease-in-out duration-150  ring-1 ring-slate-900/10 hover:scale-105"
                >
                  Remacth 🏁
                </button>
                <span className="flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={backToLobby}
            className="mt-2 text-base bg-sky-900 font-sans  hover:bg-sky-700 px-4 py-2 
            font-semibold leading-6 shadow rounded-md text-white transition
             ease-in-out duration-150  ring-1 ring-slate-900/10"
          >
            Back To Lobby ⬅
          </button>
        </div>
      )}
    </div>
  );
}

export default Game;
