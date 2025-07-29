const express = require('express');
const router = express.Router();
const { getMessagesBetweenUsers , getMessages , editMessage, deleteMessage , getChatList , markMessagesAsRead, searchUsersByName} = require('../controllers/chatController');

// GET /api/chat/user3/user4
router.get('/:user1/:user2', getMessagesBetweenUsers);
router.post('/getMessages', getMessages);

// ✅ PUT: Edit a message
router.put('/editMessage/:messageId', editMessage);

// ✅ DELETE: Delete a message
router.delete('/deleteMessage/:messageId', deleteMessage);

// POST: Get chat list
router.post('/chat-list',getChatList);


router.put('/mark-read', markMessagesAsRead);

router.get('/search-users', searchUsersByName);


module.exports = router;
