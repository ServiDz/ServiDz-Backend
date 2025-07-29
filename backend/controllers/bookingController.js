// controllers/bookingController.js
const Booking = require('../models/Booking');
const Tasker = require('../models/Tasker');
const User = require('../models/User'); // ✅ Import User model

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public or Protected (optional)
const createBooking = async (req, res) => {
  try {
    const { userId, taskerId, date, time, location , description} = req.body;

    // ✅ Validate required fields
    if (!userId || !taskerId || !date || !time || !location?.latitude || !location?.longitude  ) {
      return res.status(400).json({ message: 'All fields including location are required' });
    }

    // ✅ Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Check if tasker exists
    const taskerExists = await Tasker.findById(taskerId);
    if (!taskerExists) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    // ✅ Create booking
    const booking = new Booking({
        userId,
      taskerId,
      date,
      time,
      location,
        description: description, // Optional description
      status: 'pending'
    });

    await booking.save();
    res.status(201).json(booking);

  } catch (error) {
    console.error('Booking creation failed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Optional: Get all bookings for a user
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
