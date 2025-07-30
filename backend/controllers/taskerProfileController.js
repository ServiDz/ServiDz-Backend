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
        res.status(500).json({ success: false, message: "Server error" });
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