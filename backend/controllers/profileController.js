const User = require("../models/User");
const validator = require('validator');

// GET /api/profile
exports.getProfile = async (req, res) => {
  try {
    const { role, userId } = req.user;

    if (role !== 'user' || !userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Not a user' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// PUT /api/profile/edit
exports.editProfile = async (req, res) => {
    const { userId,name, email } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser)
            return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to update profile" });
    }
};

// POST /api/profile/upload-avatar
exports.uploadAvatarToCloudinary = async (req, res) => {
  try {
    const { role, userId } = req.user;

    if (role !== 'user' || !userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Not a user' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Missing image file" });
    }

    const avatarUrl = req.file.path; // from multer-cloudinary

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Avatar uploaded and profile updated",
      user: updatedUser,
    });
  } catch (err) {
    console.error('Upload avatar error:', err);
    res.status(500).json({ success: false, message: "Failed to upload avatar" });
  }
};


exports.updatePhoneNumber = async (req, res) => {
  try {
    const { userId, phone } = req.body;
    console.log('📥 Incoming request to update phone number');
    console.log('🆔 userId:', userId);
    console.log('📞 phone:', phone);

    if (!userId || !phone) {
      return res.status(400).json({ message: 'userId and phone are required' });
    }

    // Remove all non-digit characters
    const cleanedPhone = phone.replace(/\D/g, '');
    console.log('📞 Cleaned phone:', cleanedPhone);

    // Validate: must be exactly 10 digits
    if (!validator.isLength(cleanedPhone, { min: 10, max: 10 })) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { phone: cleanedPhone },
      { new: true }
    );

    if (!user) {
      console.log('❌ User not found with ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ Phone number updated successfully');
    res.status(200).json({ message: 'Phone number updated successfully', user });

  } catch (error) {
    console.error('❌ Error updating phone number:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

