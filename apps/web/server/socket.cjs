const { Server } = require("socket.io");
const http = require("http");

const PORT = process.env.SOCKET_PORT || 4000;

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // Join a room for a specific exchange
  socket.on("join", (exchangeId) => {
    socket.join(`exchange_${exchangeId}`);
  });

  // Handle sending a message
  socket.on("message", ({ exchangeId, message }) => {
    // Broadcast to all users in the exchange room
    io.to(`exchange_${exchangeId}`).emit("message", message);
  });

  socket.on("disconnect", () => {
    // Handle disconnect if needed
  });
});

server.listen(PORT, () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`Socket.IO server running on port ${PORT}`);
  }
});
