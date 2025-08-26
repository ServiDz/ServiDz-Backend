const User = require('../models/User');
const admin = require('firebase-admin'); // for sending notifications via FCM
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/fcm');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // fetch all users
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Send FCM notification if token exists
        if (user.fcmToken) {
            const message = {
                token: user.fcmToken,
                notification: {
                    title: 'Account Deleted',
                    body: 'Your account has been deleted by the admin.'
                }
            };
            Notification.create(message);
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Ban/Suspend user
const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'Suspended';
    await user.save();

    // Save notification
    await Notification.create({
      userId: user._id,
      userModel: 'User',
      title: 'Account Suspended',
      body: 'Your account has been suspended by the admin.',
      type: 'suspension'
    });

    // Send FCM
    if (user.fcmToken) {
      await sendNotification(
        user.fcmToken,
        'Account Suspended',
        'Your account has been suspended by the admin.',
        { type: 'suspension' }
      );
    }

    res.status(200).json({ message: 'User banned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Activate user
const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'Active';
    await user.save();

    // Save notification
    await Notification.create({
      userId: user._id,
      userModel: 'User',
      title: 'Account Activated',
      body: 'Your account has been activated by the admin.',
      type: 'activation'
    });

    // Send FCM
    if (user.fcmToken) {
      await sendNotification(
        user.fcmToken,
        'Account Activated',
        'Your account has been activated by the admin.',
        { type: 'activation' }
      );
    }

    res.status(200).json({ message: 'User activated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


module.exports = {
    getAllUsers,
    deleteUser,
    banUser,
    activateUser
};
