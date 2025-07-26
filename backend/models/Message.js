const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: String, // e.g. user3_tasker4
  senderId: String,
  receiverId: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
