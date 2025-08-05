const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const upload = require('../middleware/cloudinaryUpload');
const verifyToken = require('../middleware/verifyToken');


// GET profile
router.get('/', verifyToken, profileController.getProfile);

// PUT edit profile
router.put('/edit', profileController.editProfile);

// POST upload avatar (file via form-data)
router.post('/upload-avatar', verifyToken, upload.single('avatar'), profileController.uploadAvatarToCloudinary);

// POST update phone number
router.post('/update-phone', verifyToken, profileController.updatePhoneNumber);

module.exports = router;
