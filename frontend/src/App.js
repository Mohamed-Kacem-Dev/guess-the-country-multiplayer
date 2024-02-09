import React, { useState, useEffect } from "react";
import Rooms from "./components/Room/Rooms";
import { io } from "socket.io-client";

function App() {
  const [usernameFromServer, setUsernameFromServer] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameEntered, setIsUsernameEntered] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isUsernameEntered && username.trim() !== "" && username) {
      const socketUrl = process.env.REACT_APP_SOCKET_URL;
      const newSocket = io(socketUrl, {
        query: { username },
      });
      newSocket.on("connect", () => {
        if (newSocket.connected) {
          setSocket(newSocket);
          newSocket.on("setUsername", (usernameFromServer) => {
            setUsernameFromServer(usernameFromServer);
          });

          newSocket.on("disconnect", (reason) => {
            setSocket(null);
            window.location.reload();
          });
        } else {
          setSocket(null);
          setIsUsernameEntered(false);
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isUsernameEntered, username]);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim() !== "") {
      setIsUsernameEntered(true);
    } else {
      return;
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value.toUpperCase());
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      {isUsernameEntered && socket && socket.connected && usernameFromServer ? (
        <Rooms socket={socket} username={usernameFromServer} />
      ) : (
        <div className="max-w-md m-auto min-w-[300px] text-center p-4 bg-gray-500 rounded-md shadow-md">
          <form className="flex flex-col" onSubmit={handleUsernameSubmit}>
            <div>
              <h1 className="text-lg font-bold  mb-4">
                Welcome to Guess the Country! 🗺
              </h1>
              <ul className="font-semibold border p-2 shadow-md rounded bg-gray-400 mb-4">
                <li className="mb-1">
                  🆚 Engage in a thrilling online battle.
                </li>
                <li className="mb-1">
                  🗺️ Guess the name of a country from the hidden letters.
                </li>
                <li className="mb-1">💡 New hint each 10 secs.</li>
                <li className="mb-1">⏱️ Guess before the timer runs out!</li>
                <li className="mb-1">
                  🏅 The quicker your guess, the higher your score!
                </li>
                <li className="mb-1">
                  🎮 Bring your friends and challenge your geography skills!
                </li>
              </ul>
            </div>
            <input
              type="text"
              placeholder="username*"
              value={username}
              onChange={handleUsernameChange}
              className={`w-1/2 mx-auto p-2 mb-4 border placeholder:italic placeholder:text-lg placeholder:capitalize font-semibold uppercase rounded-md text-center`}
            />
            <button
              type="submit"
              className="w-1/2 mx-auto  text-white bg-green-900 hover:bg-green-700 hover:scale-105 py-2 px-4 rounded-md cursor-pointer text-base font-bold transition ease-in-out duration-150  ring-1 ring-slate-900/10"
            >
              JOIN 📍
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
