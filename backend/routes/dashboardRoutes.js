const express = require("express");
const router = express.Router();
const { getDashboardAnalytics } = require("../controllers/dashboardController");

// GET /api/dashboard/analytics
router.get("/analytics", getDashboardAnalytics);

module.exports = router;
