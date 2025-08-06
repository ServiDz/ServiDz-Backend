const express = require('express');
const router = express.Router();
const { getTaskerEarnings } = require('../controllers/earningController');
const verifyToken = require('../middleware/verifyToken');

// ✅ GET /api/earnings (requires auth)
router.get('/', verifyToken, getTaskerEarnings);

module.exports = router;
