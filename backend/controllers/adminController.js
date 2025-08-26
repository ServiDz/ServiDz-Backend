const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

// Generate token with admin ID
const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: "admin" }, // include admin ID here
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
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
      token: generateToken(admin), // pass admin object to include id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login admin
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        email: admin.email,
        token: generateToken(admin), // include admin ID in token
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get admin profile
// Get logged-in admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = req.admin; // from protectAdmin middleware
    res.status(200).json({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      avatar: admin.avatar, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Upload admin avatar
exports.uploadAdminAvatar = async (req, res) => {
  try {
    const admin = req.admin; // from protectAdmin middleware

    if (!req.file) {
      return res.status(400).json({ message: "No avatar file uploaded" });
    }

    // File is already handled by multer-storage-cloudinary
    // The uploaded file info is in req.file
    admin.avatar = req.file.path; // multer-storage-cloudinary stores the URL in `path`
    await admin.save();

    res.status(200).json({
      message: "Avatar uploaded successfully",
      avatar: admin.avatar,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
