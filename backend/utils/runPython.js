// backend/utils/runPython.js
const { spawn } = require("child_process");
const path = require("path");

function runPython(imagePath) {
  return new Promise((resolve, reject) => {
    // 🔹 Put absolute path to your AI repo predict.py
    const scriptPath = "D:/ServiDZ_AI/predict.py";

    const process = spawn("python", [scriptPath, imagePath]);

    let result = "";
    let error = "";

    process.stdout.on("data", (data) => {
      result += data.toString();
    });

    process.stderr.on("data", (data) => {
      error += data.toString();
    });

    process.on("close", (code) => {
      if (code !== 0) {
        reject(`Python process exited with code ${code}: ${error}`);
      } else {
        resolve(result.trim()); // predicted category
      }
    });
  });
}

module.exports = runPython;
