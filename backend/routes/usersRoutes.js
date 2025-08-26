const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, banUser } = require('../controllers/usersController');


// GET all users
router.get('/all', getAllUsers);
router.delete('/:userId', deleteUser);
router.put('/ban/:userId', banUser);

module.exports = router;
