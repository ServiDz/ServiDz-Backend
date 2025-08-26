const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, banUser, activateUser } = require('../controllers/usersController');


// GET all users
router.get('/all', getAllUsers);
router.delete('/:userId', deleteUser);
router.put('/ban/:userId', banUser);
// Activate user
router.put('/activate/:userId', activateUser);

module.exports = router;
