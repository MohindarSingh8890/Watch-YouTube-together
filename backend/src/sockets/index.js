const { Server } = require("socket.io");
const { registerRoomHandlers } = require("./roomHandlers");

function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(",")
        : "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    registerRoomHandlers(socket, io);
  });

  return io;
}

module.exports = initSockets;