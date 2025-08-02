
const express = require('express');
const router = express.Router();

const {
  getMessagesWithUser,
  getTaskerChatList,
  markTaskerMessagesAsRead
} = require('../controllers/taskerMessageController');

// 📨 Get all messages between a tasker and a specific user
router.post('/getMessagesWithUser', getMessagesWithUser);

// 📋 Get chat list for a tasker
router.post('/chatList', getTaskerChatList);

// ✅ Mark all messages from a user to tasker as read
router.post('/markAsRead', markTaskerMessagesAsRead);

module.exports = router;
