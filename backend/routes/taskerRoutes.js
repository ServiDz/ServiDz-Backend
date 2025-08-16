const express = require('express');
const router = express.Router();
const taskerController = require('../controllers/taskerController');
const upload = require('../middleware/taskerUpload'); // ✅ Using separated upload config

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
router.get('/all', taskerController.getAllTaskers);
router.get('/top-rated', taskerController.getTopRatedTaskers);

// Get a tasker by ID
router.post('/getById', taskerController.getTaskerByIdFromBody);

module.exports = router;
