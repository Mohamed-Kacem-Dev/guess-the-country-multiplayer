import React from "react";

function RoomForm({ username, socket, setCurrentRoomid, setSinglePlayer }) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    let roomName = `${username}'s Room`;
    socket.emit("createRoom", { username, roomName, size: 2 });
    setCurrentRoomid(socket.id);
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit} className="flex">
        <button
          type="submit"
          className="bg-sky-900 hover:bg-sky-700 py-2 px-3 rounded-md cursor-pointer text-xs md:text-sm font-semibold text-white transition ease-in-out duration-150  ring-1 ring-slate-900/10"
        >
          Create Room ➕
        </button>
        <button
          type="submit"
          className="bg-orange-700 ml-auto  hover:bg-orange-500 hover:scale-105 py-2 px-3 rounded-md cursor-pointer text-xs md:text-sm font-semibold text-white transition ease-in-out duration-150  ring-1 ring-slate-900/10"
          onClick={() => setSinglePlayer(true)}
        >
          <p>Single Player 🎮</p>
        </button>
      </form>
    </div>
  );
}

export default RoomForm;
