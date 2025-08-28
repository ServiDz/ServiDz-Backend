const express = require("express");
const { getTaskersDistribution, getMonthlyEarnings } = require("../controllers/analyticsController"); 
const { protectAdmin } = require("../middleware/authAdmin");

const router = express.Router();

router.get("/taskers-distribution", protectAdmin, getTaskersDistribution);
router.get("/monthly-earnings", protectAdmin, getMonthlyEarnings);

module.exports = router;
