import React, { useEffect, useState } from "react";
import RoomList from "./RoomList";
import RoomForm from "./RoomForm";
import Room from "./Room";
import Chat from "../Chat/Chat";
import earthImg from "../../assets/giphy.gif";
import SinglePlayer from "../Game/SinglePlayer";

function Rooms({ socket, username }) {
  const [onlinePlayersCount, setOnlinePlayersCount] = useState(0);
  const [currentRoomid, setCurrentRoomid] = useState(null);
  const [globalChatLogs, setGlobalChatLogs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [singleplayer, setSinglePlayer] = useState(false);

  useEffect(() => {
    socket.emit("getRooms");
    socket.on("rooms", (data) => {
      !currentRoomid && setRooms(data);
    });

    return () => {
      socket.off("rooms");
    };
  }, [socket, currentRoomid]);

  useEffect(() => {
    socket.emit("getPlayerCount");
    socket.on("playerCount", (count) => {
      !currentRoomid && setOnlinePlayersCount(count);
    });
    socket.on("disconnect", () => {
      window.location.reload();
    });
    socket.on("GlobalChat", (newMsg) => {
      !currentRoomid && setGlobalChatLogs((prevLogs) => [...prevLogs, newMsg]);
    });

    if (!currentRoomid) {
      socket.emit("getLatestMessages");
      socket.on("latestMessages", (latestMessages) => {
        setGlobalChatLogs(latestMessages);
      });
    }

    return () => {
      socket.off();
    };
  }, [socket, currentRoomid, setCurrentRoomid]);

  if (singleplayer)
    return (
      <>
        <header className="bg-slate-700 py-4 flex items-center justify-between text-white">
          <span className="text-xl font-bold ml-5">
            {username} <span className="italic">(You)</span>
          </span>
          <p className="hidden md:flex self-center items-center text-lg font-bold right mr-16">
            Single Player Mode
            <img className="size-10 ml-1" src={earthImg} alt="earthImg" />
          </p>
          <button
            className="mr-5 text-sm font-semibold bg-red-900 hover:bg-red-700 py-2 px-4 rounded-md cursor-pointer text-white transition ease-in-out duration-150  ring-1 ring-slate-900/10"
            onClick={() => setSinglePlayer(false)}
          >
            Exit ❌
          </button>
        </header>
        <div className="flex h-full">
          <div className="w-full h-full md:w-5/6 flex-1 flex ">
            <SinglePlayer
              socket={socket}
              setSignlePlayer={setSinglePlayer}
              playerUsername={username}
            />
          </div>
          <Chat
            socket={socket}
            chatTitle="Global Chat"
            sender={username}
            recieverIsRoom={false}
            roomid={null}
            chatLogs={globalChatLogs}
          />
        </div>
      </>
    );

  return (
    <>
      {currentRoomid && (
        <Room
          roomid={currentRoomid}
          username={username}
          socket={socket}
          setCurrentRoomid={setCurrentRoomid}
        />
      )}
      {!currentRoomid && (
        <div className="flex h-full">
          <div className="w-full md:w-1/2 mx-auto my-8 p-1 md:p-6 bg-gradient-to-r from-gray-500 to-gray-600 rounded-md shadow-md">
            <h1 className="flex mb-2 text-md md:text-3xl font-bold text-gray-900 ">
              <span className="">Welcome {username}</span>
              <img
                className="size-8 md:size-10 ml-1"
                src={earthImg}
                alt="earthImg"
              />
              <span className="ml-auto">
                {onlinePlayersCount} Players Online.
              </span>
            </h1>
            <RoomForm
              username={username}
              socket={socket}
              setCurrentRoomid={setCurrentRoomid}
              setSinglePlayer={setSinglePlayer}
            />
            <br />
            <RoomList
              username={username}
              rooms={rooms}
              setRooms={setRooms}
              socket={socket}
              setCurrentRoomid={setCurrentRoomid}
            />
          </div>
          <Chat
            socket={socket}
            chatTitle="Global Chat"
            sender={username}
            recieverIsRoom={false}
            roomid={null}
            chatLogs={globalChatLogs}
          />
        </div>
      )}
    </>
  );
}

export default Rooms;
