const Booking = require('../models/Booking');
const Tasker = require('../models/Tasker');
const User = require('../models/User');
const Notification = require('../models/Notification'); // ✅ Import Notification model
const { sendNotification } = require('../utils/fcm');   // ✅ Import notification sender

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public or Protected (optional)
const createBooking = async (req, res) => {
  try {
    const { userId, taskerId, date, time, location, description } = req.body;

    // ✅ Validate required fields
    if (!userId || !taskerId || !date || !time || !location?.latitude || !location?.longitude) {
      return res.status(400).json({ message: 'All fields including location are required' });
    }

    // ✅ Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Check if tasker exists
    const tasker = await Tasker.findById(taskerId);
    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    // ✅ Create booking
    const booking = new Booking({
      userId,
      taskerId,
      date,
      time,
      location,
      description,
      status: 'pending'
    });

    await booking.save();

    // ✅ Send and store notification to tasker
    if (tasker.fcmToken) {
      const title = '📩 New Booking Request';
      const body = `${user.name || 'A user'} booked your service on ${date} at ${time}.`;

      await sendNotification(tasker.fcmToken, title, body);

      await Notification.create({
        userId: tasker._id,
        userModel: 'Tasker',
        title,
        body,
        type: 'booking'
      });
    }

    // ✅ Send and store confirmation notification to user
    if (user.fcmToken) {
      const title = '✅ Booking Submitted';
      const body = `You’ve successfully booked ${tasker.fullName || 'a tasker'} on ${date} at ${time}. Please wait for their response.`;

      await sendNotification(user.fcmToken, title, body);

      await Notification.create({
        userId: user._id,
        userModel: 'User',
        title,
        body,
        type: 'booking'
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking creation failed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get all bookings by user ID
// @route   GET /api/bookings/user/:userId
const getBookingsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const bookings = await Booking.find({ userId }).populate('taskerId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

module.exports = {
  createBooking,
  getBookingsByUserId
};
