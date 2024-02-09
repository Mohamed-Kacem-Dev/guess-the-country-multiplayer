const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const { setupSocket } = require("./controllers/socketController");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["*"],
    allowedHeaders: ["*"],
    credentials: true,
  },
});

// useful for debugging
io.engine.on("connection_error", (err) => {
  console.log(err.req);
  console.log(err.code);
  console.log(err.message);
  console.log(err.context);
});
setupSocket(io);
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
