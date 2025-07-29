
const Message = require('../models/Message');
let io ; // 
const User = require('../models/User'); 
const Tasker = require('../models/Tasker'); // Assuming you have a Tasker model


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


//  Get chat list for a user (from body)


const getChatList = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required in body' });
  }

  try {
    console.log('MongoDB connected');
    
    // Get all messages involving this user
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ timestamp: -1 });

    console.log(` Found ${messages.length} messages for userId ${userId}`);

    // Group messages by chat partner
    const chatMap = new Map();

    for (let msg of messages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;

      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, []);
      }

      chatMap.get(otherUserId).push({
        _id: msg._id,
        message: msg.message,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        timestamp: msg.timestamp,
        isRead: msg.isRead ?? false,
      });
    }

    console.log(`📦 Grouped into ${chatMap.size} chat partners`);

    // Build the final chat list with names & avatars
    const chatList = await Promise.all(
      Array.from(chatMap.entries()).map(async ([otherUserId, msgs]) => {
        console.log(` Looking for Tasker with ID: ${otherUserId}`);

        const tasker = await Tasker.findById(otherUserId).select('fullName profilePic').lean();

        if (tasker) {
          console.log(`✅ Found tasker: ${tasker.fullName}, avatar: ${tasker.profilePic}`);
        } else {
          console.log(`❌ No tasker found with ID ${otherUserId}`);
        }

        return {
          userId: otherUserId,
          name: tasker?.fullName || 'Unknown',
          avatar: tasker?.profilePic || '',
          messages: msgs
        };
      })
    );

    res.status(200).json(chatList);
  } catch (err) {
    console.error('Chat list error:', err);
    res.status(500).json({ message: 'Failed to fetch chat list' });
  }
};


const markMessagesAsRead = async (req, res) => {
  const { userId, otherUserId } = req.body;

  if (!userId || !otherUserId) {
    return res.status(400).json({ message: 'userId and otherUserId are required' });
  }

  try {
    const result = await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'Messages marked as read', updatedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};


const searchUsersByName = async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === '') {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const results = await Tasker.find({
      fullName: { $regex: query, $options: 'i' } // case-insensitive partial match
    }).select('fullName profilePic');

    res.status(200).json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
};


module.exports = {
  setSocketInstance,
  getMessagesBetweenUsers,
  getMessages,
  editMessage,
  deleteMessage,
  getChatList,
  markMessagesAsRead,
  searchUsersByName
};