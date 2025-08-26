const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register new admin
exports.createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({ email, password });
    res.status(201).json({
      _id: admin._id,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login admin
exports.loginAdmin = async (req, res) => {
  try {
    console.log("📩 Login request received:", req.body);

    const { email, password } = req.body;

    // Check if request body is being parsed correctly
    if (!email || !password) {
      console.log("⚠️ Missing email or password in request");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    console.log("🔍 Admin lookup result:", admin ? admin.email : "Not found");

    if (admin && (await admin.matchPassword(password))) {
      console.log("✅ Password matched, generating token...");
      res.json({
        _id: admin._id,
        email: admin.email,
        token: generateToken(admin._id),
      });
    } else {
      console.log("❌ Invalid credentials for email:", email);
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("💥 Server error during login:", error.message);
    res.status(500).json({ message: error.message });
  }
};
