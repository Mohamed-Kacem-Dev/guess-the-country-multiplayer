import React from "react";

function RoomList({ username, rooms, setRooms, socket, setCurrentRoomid }) {
  const handleJoinRoomButton = (roomToJoin) => {
    // Emit a "joinRoom" event to the server
    socket.emit("joinRoom", { playersocketid: socket.id, roomid: roomToJoin });
    socket.on("joinedRoom", ({ success, reason }) => {
      if (success) {
        // Set the current room ID in the state
        setCurrentRoomid(roomToJoin);
      } else {
        console.log("Failed to join the room, Reason: " + reason);
      }
    });
  };

  return (
    <div className="flex flex-col w-auto">
      <h2 className="text-xl font-bold text-gray-900 mx-auto text-glow">
        Available Rooms
      </h2>
      <div className="flex flex-wrap">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex flex-col m-2 p-4 w-56 bg-gray-500 border border-gray-950 rounded-lg shadow-sm shadow-gray-950"
          >
            <p className="font-semibold underline self-center">
              {room.roomName}
            </p>
            <p>Host: {room.hostUsername}</p>
            <p>
              Players: {room.players.length}/{room.size}
            </p>
            <p className="italic">
              Created {calculateTimeDifference(room.createdAt)}
            </p>
            {room.isFull && room.state === "waiting" && (
              <p className="italic font-semibold">Full</p>
            )}
            {room.state === "playing" && (
              <p className="italic font-semibold">Playing</p>
            )}
            {room.state === "waiting" && !room.isFull && (
              <p className="italic font-semibold">Waiting</p>
            )}
            <button
              type="button"
              disabled={room.isFull}
              onClick={() => handleJoinRoomButton(room.id)}
              className="mt-2 w-20 self-center disabled:bg-gray-900 disabled:cursor-not-allowed enabled:bg-sky-900 disabled:opacity-75 enabled:hover:bg-sky-700 py-2 px-4 rounded-md cursor-pointer text-sm font-semibold text-white transition ease-in-out duration-150  ring-1 ring-slate-900/10"
            >
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomList;

// Helper function to calculate time difference
const calculateTimeDifference = (createdAt) => {
  const now = new Date();
  const createdTime = new Date(createdAt);
  const timeDifference = Math.floor((now - createdTime) / (60 * 1000)); // Difference in minutes

  if (timeDifference < 1) {
    return "Just now";
  } else if (timeDifference < 60) {
    return `${timeDifference} ${timeDifference === 1 ? "min" : "mins"} ago`;
  } else {
    const hours = Math.floor(timeDifference / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
};
