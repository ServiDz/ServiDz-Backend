const express = require("express");
const { createAdmin, loginAdmin, getAdminProfile } = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/authAdmin"); // <-- middleware to get req.admin
const upload = require('../utils/upload');
const { uploadAdminAvatar } = require('../controllers/adminController');

const router = express.Router();

router.post("/register", createAdmin);
router.post("/login", loginAdmin);

// New route to get the logged-in admin profile
router.get("/profile", protectAdmin, getAdminProfile);

router.put('/avatar', protectAdmin, upload.single('avatar'), uploadAdminAvatar);
module.exports = router;
