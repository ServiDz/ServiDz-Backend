// ✅ chatController.js

const Message = require('../models/Message');
let io ; // <-- store the socket instance

// ✅ Set Socket.IO instance

// ✅ Get all messages between two users (for Socket.IO or real-time usage)
const getMessagesBetweenUsers = async (req, res) => {
  const { user1, user2 } = req.params;
  const roomId = [user1, user2].sort().join('_');

  try {
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ✅ Get messages (used by Flutter via POST body)
const getMessages = async (req, res) => {
  const { userId, taskerId } = req.body;
  const roomId = [userId, taskerId].sort().join('_');

  try {
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to retrieve messages' });
  }
};

// ✅ Edit a message
const editMessage = async (req, res) => {
  const { messageId } = req.params;
  const { newText, userId, taskerId } = req.body;
  const roomId = [userId, taskerId].sort().join('_');

  try {
    const updated = await Message.findByIdAndUpdate(
      messageId,
      { message: newText },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Message not found' });

    // 🟢 Emit socket event to room
    if (io) {
      io.to(roomId).emit('messageEdited', {
        messageId,
        newText,
      });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error('Edit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Delete a message
const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const { userId, taskerId } = req.body;
  const roomId = [userId, taskerId].sort().join('_');

  try {
    const deleted = await Message.findByIdAndDelete(messageId);
    if (!deleted) return res.status(404).json({ error: 'Message not found' });

    // 🟢 Emit socket event to room
    if (io) {
      io.to(roomId).emit('messageDeleted', {
        messageId,
      });
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const setSocketInstance = (ioInstance) => {
  io = ioInstance;
};


module.exports = {
  setSocketInstance,
  getMessagesBetweenUsers,
  getMessages,
  editMessage,
  deleteMessage,
};