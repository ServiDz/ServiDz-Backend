const Message = require('../models/Message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);

    socket.on('joinRoom', ({ userId, otherUserId }) => {
      const roomId = [userId, otherUserId].sort().join('_');
      socket.join(roomId);
      console.log(`👥 ${userId} joined room ${roomId}`);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
      const roomId = [senderId, receiverId].sort().join('_');

      // Debug log to check incoming payload
      console.log('📩 Incoming message:', { senderId, receiverId, message });

      try {
        const newMessage = new Message({
          roomId,
          senderId,
          receiverId,
          message
        });

        await newMessage.save(); // ✅ Save to DB
        console.log('💾 Message saved to MongoDB:', newMessage);

        // Send to room
        io.to(roomId).emit('receiveMessage', {
          senderId,
          message,
          timestamp: newMessage.timestamp
        });
      } catch (err) {
        console.error('❌ Error saving message:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
    });
  });
};
