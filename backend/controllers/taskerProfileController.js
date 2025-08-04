const Tasker = require("../models/Tasker");


// GET /api/tasker/profile
exports.getTaskerProfile = async (req, res) => {
    const { taskerId } = req.body;

    try {
        const tasker = await Tasker.findById(taskerId).select("-password");
        if (!tasker) return res.status(404).json({ success: false, message: "Tasker not found" });

        res.status(200).json({ success: true, tasker });
    } catch (err) {
        console.error(err);
            res.json({ message: error.message })
    }
};

// PUT /api/tasker/profile/edit
exports.editTaskerProfile = async (req, res) => {
    const { taskerId, name, email } = req.body;

    try {
        const updatedTasker = await Tasker.findByIdAndUpdate(
            taskerId,
            { name, email },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedTasker)
            return res.status(404).json({ success: false, message: "Tasker not found" });

        res.status(200).json({ success: true, tasker: updatedTasker });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to update profile" });
    }
};

// POST /api/tasker/profile/upload-avatar
exports.updateTaskerAvatar = async (req, res) => {
    const { taskerId } = req.body;

    if (!req.file || !taskerId) {
        return res.status(400).json({ success: false, message: "Missing image or taskerId" });
    }

    try {
        const profilePicUrl = req.file.path; // Cloudinary URL from multer storage

        const updatedTasker = await Tasker.findByIdAndUpdate(
            taskerId,
            { profilePic: profilePicUrl },
            { new: true, runValidators: true }
        ).select('-password -refreshToken');

        if (!updatedTasker) {
            return res.status(404).json({ success: false, message: "Tasker not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile picture uploaded and updated successfully",
            tasker: updatedTasker,
        });
    } catch (err) {
        console.error("Error uploading profile picture:", err);
        res.status(500).json({ success: false, message: "Server error while uploading profile picture" });
    }
};


exports.uploadCertificate = async (req, res) => {
  try {
    const { taskerId, description } = req.body;
    const file = req.file;

    if (!taskerId || !file) {
      return res.status(400).json({ message: 'Missing taskerId or file' });
    }

    const newCertificate = {
      filePath: file.path,
      description,
      uploadedAt: new Date(),
    };

    const updatedTasker = await Tasker.findByIdAndUpdate(
      taskerId,
      { $push: { certifications: newCertificate } },
      { new: true }
    );

    if (!updatedTasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    res.status(200).json({
      message: 'Certificate uploaded and added successfully',
      certifications: updatedTasker.certifications,
    });
  } catch (error) {
    console.error('Upload error:', error); // ✅ proper logging

    res.status(500).json({ message: 'Server error' });
  }
};


// GET /api/tasker/certifications
exports.getTaskerCertifications = async (req, res) => {
    const { taskerId } = req.body;

    try {
    if (!taskerId) {
        return res.status(400).json({ success: false, message: "Missing taskerId" });
    }

    const tasker = await Tasker.findById(taskerId).select("certifications");

    if (!tasker) {
        return res.status(404).json({ success: false, message: "Tasker not found" });
    }

    res.status(200).json({ success: true, certifications: tasker.certifications });
    } catch (error) {
    console.error("Error fetching certifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { taskerId, isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'isAvailable must be a boolean' });
    }

    const updatedTasker = await Tasker.findByIdAndUpdate(
      taskerId,
      { isAvailable },
      { new: true }
    );

    if (!updatedTasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    res.status(200).json({
      message: 'Availability updated successfully',
      tasker: updatedTasker,
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.addOrUpdateRating = async (req, res) => {
  try {
    const { taskerId, userId, value, review } = req.body;

    if (!taskerId || !userId || value === undefined) {
      return res.status(400).json({ message: 'taskerId, userId, and value are required' });
    }

    if (value < 0 || value > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    const tasker = await Tasker.findById(taskerId);
    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    // Check if user already rated
    const existingRating = tasker.ratings.find(r => r.userId.toString() === userId);

    if (existingRating) {
      existingRating.value = value;
      existingRating.review = review || existingRating.review; // update if provided
      existingRating.ratedAt = new Date();
    } else {
      tasker.ratings.push({ userId, value, review });
    }

    // Recalculate average rating
    const total = tasker.ratings.reduce((sum, r) => sum + r.value, 0);
    tasker.rating = total / tasker.ratings.length;

    await tasker.save();

    res.status(200).json({
      message: 'Rating and review submitted successfully',
      averageRating: tasker.rating,
      ratingsCount: tasker.ratings.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTaskerRating = async (req, res) => {
  try {
    const { taskerId } = req.params;

    const tasker = await Tasker.findById(taskerId)
      .populate('ratings.userId', 'name avatar'); // ✅ populate reviewer info

    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    const averageRating = tasker.rating;

    const ratingsWithReviews = tasker.ratings
      .filter(r => r.review && r.userId) // only include valid reviews
      .sort((a, b) => new Date(b.ratedAt) - new Date(a.ratedAt)) // ✅ sort newest first
      .map(r => ({
        value: r.value,
        review: r.review,
        ratedAt: r.ratedAt,
        user: {
          _id: r.userId._id,
          name: r.userId.name,
          avatar: r.userId.avatar,
        }
      }));

    res.status(200).json({
      taskerId: tasker._id,
      averageRating,
      ratingsCount: tasker.ratings.length,
      reviews: ratingsWithReviews
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};