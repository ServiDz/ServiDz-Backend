// backend/controllers/aiController.js
const runPython = require("../utils/runPython");
const Tasker = require("../models/Tasker");

exports.predictCategory = async (req, res) => {
  try {
    const imagePath = req.file.path; // multer gives you the path

    // 🔹 Call Python AI model
    const rawOutput = await runPython(imagePath);

    // ✅ Clean Python output (extract category after "Predicted service:")
    let predictedCategory = rawOutput.toString().trim();
    const match = predictedCategory.match(/Predicted service:\s*(\w+)/i);
    if (match) {
      predictedCategory = match[1].toLowerCase(); 
    } else {
      return res.status(400).json({ error: "Could not parse prediction" });
    }

    // 🔹 Find taskers with that profession 
    const taskers = await Tasker.find({
      profession: { $regex: new RegExp("^" + predictedCategory + "$", "i") },
    });

    res.json({
      category: predictedCategory,
      taskers,
    });
  } catch (err) {
    console.error("AI prediction error:", err);
    res.status(500).json({ error: err.toString() });
  }
};