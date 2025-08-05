const bcrypt = require('bcrypt');
const User = require('../models/User');
const Tasker = require('../models/Tasker'); // if you support taskers too

// Helper to get the correct model
const getModel = (role) => (role === 'tasker' ? Tasker : User);

// 1. Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId || req.user.taskerId;
    const role = req.user.role;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    }

    const Model = getModel(role);
    const user = await Model.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// 2. Logout (handled on client-side — just acknowledge)
const logout = async (req, res) => {
  // You may blacklist token here if needed
  res.status(200).json({ message: 'Logged out successfully (token should be removed on client)' });
};

// 3. Deactivate Account
const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const Model = getModel(role);
    const user = await Model.findByIdAndUpdate(userId, { isActive: false });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  changePassword,
  logout,
  deactivateAccount,
};
