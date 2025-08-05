const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  changePassword,
  logout,
  deactivateAccount,
} = require('../controllers/settingsController');

router.put('/change-password', verifyToken, changePassword);
router.post('/logout', verifyToken, logout);
router.post('/deactivate', verifyToken, deactivateAccount);

module.exports = router;
