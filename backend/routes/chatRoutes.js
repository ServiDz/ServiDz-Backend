const express = require('express');
const router = express.Router();
const { getMessagesBetweenUsers , getMessages , editMessage, deleteMessage} = require('../controllers/ChatController');

// GET /api/chat/user3/user4
router.get('/:user1/:user2', getMessagesBetweenUsers);
router.post('/getMessages', getMessages);

// New: Edit message
router.put('/editMessage/:messageId', editMessage);

// New: Delete message
router.delete('/deleteMessage/:messageId',deleteMessage);

module.exports = router;
