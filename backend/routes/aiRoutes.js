// backend/routes/aiRoutes.js
const express = require("express");
const multer = require("multer");
const { predictCategory } = require("../controllers/aiController");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // store uploaded imgs in /uploads

router.post("/predict", upload.single("image"), predictCategory);

module.exports = router;
