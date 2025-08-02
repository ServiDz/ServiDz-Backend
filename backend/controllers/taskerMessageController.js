const Message = require('../models/Message');
const User = require('../models/User');
const Tasker = require('../models/Tasker');
let io;

const getMessagesWithUser = async (req, res) => {
  const { taskerId, userId } = req.body;
  const roomId = [taskerId, userId].sort().join('_');

  try {
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to retrieve messages' });
  }
};

const getTaskerChatList = async (req, res) => {
  const { taskerId } = req.body;

  if (!taskerId) return res.status(400).json({ message: 'taskerId is required' });

  try {
    const messages = await Message.find({
      $or: [{ senderId: taskerId }, { receiverId: taskerId }]
    }).sort({ timestamp: -1 });

    const chatMap = new Map();

    for (let msg of messages) {
      const otherUserId = msg.senderId === taskerId ? msg.receiverId : msg.senderId;

      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, []);
      }

      chatMap.get(otherUserId).push(msg);
    }

    const chatList = await Promise.all(
      Array.from(chatMap.entries()).map(async ([otherUserId, msgs]) => {
        let name = 'Unknown';
        let avatar = '';

        // Try finding user first
        const user = await User.findById(otherUserId).select('name avatar');
        if (user) {
          name = user.name;
          avatar = user.avatar || 'https://yourdomain.com/default-avatar.png'; // fallback image
        } else {
          // Try finding tasker
          const tasker = await Tasker.findById(otherUserId).select('fullName profilePic');
          if (tasker) {
            name = tasker.fullName;
            avatar = tasker.profilePic || 'https://yourdomain.com/default-avatar.png'; // fallback image
          }
        }

        return {
          userId: otherUserId,
          name,
          avatar,
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


const markTaskerMessagesAsRead = async (req, res) => {
  const { taskerId, userId } = req.body;

  if (!taskerId || !userId) return res.status(400).json({ message: 'taskerId and userId are required' });

  try {
    const result = await Message.updateMany(
      {
        senderId: userId,
        receiverId: taskerId,
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

const setSocketInstance = (ioInstance) => {
  io = ioInstance;
};

module.exports = {
  getMessagesWithUser,
  getTaskerChatList,
  markTaskerMessagesAsRead,
  setSocketInstance
};
