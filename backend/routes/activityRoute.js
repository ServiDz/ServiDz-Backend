// routes/activityRoute.js
const express = require("express");
const router = express.Router();
const { getRecentActivities } = require("../controllers/activityController");
const { protectAdmin } = require("../middleware/authAdmin");

router.get("/recent-activities", protectAdmin, getRecentActivities);

module.exports = router;
