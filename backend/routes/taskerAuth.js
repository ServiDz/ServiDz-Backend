const express = require('express');
const router = express.Router();
const taskerAuth = require('../controllers/taskerAuthController');

router.post('/register', taskerAuth.register);        // Step 1
router.post('/verify', taskerAuth.verifyOtp);         // Step 2
router.post('/login', taskerAuth.login);
router.post('/refresh', taskerAuth.refreshToken);
router.post('/logout', taskerAuth.logout);

module.exports = router;
