const express = require('express');
const router = express.Router();
const taskerController = require('../controllers/taskerController');

// Multer & Cloudinary Setup
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); 

// Setup cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tasker_files',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({ storage });

// Route to add a new tasker
router.post(
  '/add',
  upload.fields([
    { name: 'certification', maxCount: 1 },
    { name: 'profilePic', maxCount: 1 }
  ]),
  taskerController.createTasker
);

// Route to get all taskers
// Get all taskers
router.get('/all', taskerController.getAllTaskers);

// Get a tasker by ID
router.post('/getById', taskerController.getTaskerByIdFromBody);


module.exports = router;
