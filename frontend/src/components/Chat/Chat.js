import React, { useRef, useEffect } from "react";

const Chat = ({
  socket,
  chatTitle,
  sender,
  recieverIsRoom,
  roomid,
  chatLogs,
}) => {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom when new messages are received
    scrollToBottom();
  }, [chatLogs]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const handleKeyDown = (e) => {
    const inputMessage = e.target.value.trim();

    if (e.key === "Enter" && inputMessage !== "") {
      // Send input message to server
      const newMsg = {
        sender: sender,
        message: inputMessage,
        time: new Date(),
        senderID: socket.id,
      };
      // Emit the new message to the server
      recieverIsRoom
        ? socket.emit("RoomChat", newMsg, roomid)
        : socket.emit("GlobalChat", newMsg);
      // Clear the input field
      e.target.value = "";
    }
  };

  return (
    <div className="hidden md:flex min-w-52  w-1/6 max-h-[550px] flex-col justify-end  my-8 p-6 bg-gray-500 rounded-md">
      <p className="text-xl font-semibold text-center mb-2 ">{chatTitle} 💬</p>
      <div
        ref={chatContainerRef}
        className="mt-auto border-2 border-dashed text-sm border-gray-950 h-full p-2 overflow-auto"
      >
        {chatLogs.map((log) => (
          <div key={JSON.stringify(log)}>
            {log.sender === "Server" ? (
              <p className="font-bold text-blue-950 italic mt-2 ">
                {log.message}.
              </p>
            ) : (
              <p className="mt-2">
                <span className="italic font-semibold capitalize underline">
                  {log.sender === sender ? "You" : log.sender}:
                </span>{" "}
                {log.message}
              </p>
            )}
          </div>
        ))}
      </div>
      <br />
      <input
        type="text"
        placeholder="Type your message..."
        onKeyDown={handleKeyDown}
        className=" p-2 border rounded focus:outline-none focus:border-blue-500 w-full"
      />
    </div>
  );
};

export default Chat;
