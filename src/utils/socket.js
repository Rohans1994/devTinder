const socket = require("socket.io");
const Chat = require("../models/chat");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173", // Replace with your frontend URL
      credentials: true, // Allow cookies to be sent
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ senderId, firstName, targetUserId }) => {
      const roomId = [senderId, targetUserId].sort().join("_");
      console.log(`${firstName} joined room: ${roomId}`);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({
        senderId,
        firstName,
        targetUserId,
        targetFirstName,
        message,
      }) => {
        try {
          const roomId = [senderId, targetUserId].sort().join("_");
          console.log(
            `Message from ${firstName} to ${targetFirstName}: ${message}`
          );

          let chat = await Chat.findOne({
            $and: [
              { participants: { $elemMatch: { userId: senderId } } },
              { participants: { $elemMatch: { userId: targetUserId } } },
            ],
          });
          if (!chat) {
            chat = new Chat({
              participants: [
                { userId: senderId, firstName },
                { userId: targetUserId, firstName: targetFirstName },
              ],
              messages: [],
            });
          }

          chat.messages.push({ senderId, firstName, text: message });
          await chat.save();

          io.to(roomId).emit("receiveMessage", {
            senderId,
            firstName,
            targetUserId,
            message,
          });
        } catch (error) {}
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
