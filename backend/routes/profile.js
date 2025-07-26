const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const upload = require('../middleware/cloudinaryUpload');


// GET profile
router.get('/', profileController.getProfile);

// PUT edit profile
router.put('/edit', profileController.editProfile);

// POST upload avatar (file via form-data)
router.post('/upload-avatar', upload.single('avatar'), profileController.uploadAvatarToCloudinary);

module.exports = router;
