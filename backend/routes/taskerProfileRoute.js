const express = require("express");
const router = express.Router();
const upload = require("../middleware/cloudinaryUpload");
const taskerProfileController = require("../controllers/taskerProfileController");
const { updateTaskerAvatar } = require("../controllers/taskerProfileController");
const verifyToken = require('../middleware/verifyToken');
const { verify } = require("crypto");


// GET Tasker profile
router.get('/profile', verifyToken, taskerProfileController.getTaskerProfile);


// Edit Tasker profile
router.put("/profile/edit", taskerProfileController.editTaskerProfile);

// Upload Tasker avatar
router.put('/update-avatar', upload.single('image'), updateTaskerAvatar);

router.post(
  '/upload',
  verifyToken,
  upload.single('certificate'),
  taskerProfileController.uploadCertificate
);

router.post(
  "/certifications",
  taskerProfileController.getTaskerCertifications
);

// Update availability route
router.put('/update-availability', taskerProfileController.updateAvailability);

router.post('/rate', taskerProfileController.addOrUpdateRating);

router.get('/:taskerId/ratings', taskerProfileController.getTaskerRating);

router.put('/update-name',  taskerProfileController.updateTaskerName);
router.put('/update-location', taskerProfileController.updateTaskerLocation);
router.put('/update-phone', taskerProfileController.updateTaskerPhone);

module.exports = router;
