import React, { useEffect, useState } from "react";
import earthImg from "../../assets/giphy.gif";
import Chat from "../Chat/Chat";
import Game from "../Game/Game";

function Room({ roomid, username, socket, setCurrentRoomid }) {
  const [room, setRoom] = useState(null);
  const [roomChatLogs, setRoomChatLogs] = useState([]);
  useEffect(() => {
    socket.emit("getRoomDetails", { roomid: roomid });
    socket.on("roomDetails", (roomDetails) => {
      if (roomDetails.id === roomid) {
        setRoom(roomDetails);
      }
    });
    socket.on("kickFromRoom", (roomidTokick) => {
      if (roomid === roomidTokick) {
        setCurrentRoomid(null);
        socket.emit("getPlayerCount");
        socket.emit("getRooms");
      }
    });
    socket.on("RoomChat", (newMsg, roomidFromServer) => {
      if (roomidFromServer === roomid) {
        setRoomChatLogs((prevLogs) => [...prevLogs, newMsg]);
      }
    });
    socket.on("disconnect", () => {
      window.location.reload();
    });

    return () => {
      socket.off("disconnect");
      socket.off("RoomChat");
      socket.off("kickFromRoom");
      socket.off("roomDetails");
    };
  }, [socket, roomid, setCurrentRoomid]);

  const handleExitButtonClick = () => {
    socket.emit("quitRoom", { playersocketid: socket.id, roomid: roomid });
    setCurrentRoomid(null);
    socket.emit("getPlayerCount");
    socket.emit("getRooms");
  };

  return (
    <>
      {room && (
        <>
          <header className="bg-slate-700 py-4 flex items-center justify-between text-white">
            <span className="text-xl font-bold ml-5">
              {username} <span className="italic">(You)</span>
            </span>
            <p className="hidden md:flex self-center items-center text-lg font-bold right mr-16">
              {room.roomName} ({room.players.length}/{room.size})
              <img className="size-10 ml-1" src={earthImg} alt="earthImg" />
            </p>
            <button
              className="mr-5 text-sm font-semibold bg-red-900 hover:bg-red-700 py-2 px-4 rounded-md cursor-pointer text-white transition ease-in-out duration-150  ring-1 ring-slate-900/10"
              onClick={handleExitButtonClick}
            >
              {socket.id === room.host ? "Close Room ❌" : "Exit Room ❌"}
            </button>
          </header>
          <div className="flex h-full">
            <Game
              room={room}
              username={username}
              socket={socket}
              setCurrentRoomid={setCurrentRoomid}
            />
            <Chat
              socket={socket}
              chatTitle="Room Chat"
              sender={username}
              recieverIsRoom={true}
              roomid={roomid}
              chatLogs={roomChatLogs}
            />
          </div>
        </>
      )}
    </>
  );
}
export default Room;
