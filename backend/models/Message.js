const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: String, // e.g. user3_tasker4
  senderId: String,
  receiverId: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  messageType: {
    type: String,
    enum: ['text', 'image'], // You can add more later (audio, video, etc.)
    default: 'text'
  }
});

module.exports = mongoose.model('Message', messageSchema);
