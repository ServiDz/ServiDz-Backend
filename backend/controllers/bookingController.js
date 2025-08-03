const Booking = require('../models/Booking');
const Tasker = require('../models/Tasker');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/fcm');
const mongoose = require('mongoose');


//  POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { userId, taskerId, date, time, location, description } = req.body;

    // ✅ Validate required fields
    if (!userId || !taskerId || !date || !time || !location?.latitude || !location?.longitude) {
      return res.status(400).json({ message: 'All fields including location are required' });
    }

    // ✅ Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ✅ Check if tasker exists
    const tasker = await Tasker.findById(taskerId);
    if (!tasker) return res.status(404).json({ message: 'Tasker not found' });

    // ✅ Create booking
    const booking = await Booking.create({
      userId,
      taskerId,
      date,
      time,
      location,
      description,
      status: 'pending',
    });

    // ✅ Send notification to tasker
    if (tasker.fcmToken) {
      const title = '📩 New Booking Request';
      const body = `${user.name || 'A user'} booked your service on ${date} at ${time}.`;

      await sendNotification(tasker.fcmToken, title, body);
      await Notification.create({
        userId: tasker._id,
        userModel: 'Tasker',
        title,
        body,
        type: 'booking',
      });
    }

    // ✅ Send confirmation notification to user
    if (user.fcmToken) {
      const title = '✅ Booking Submitted';
      const body = `You’ve successfully booked ${tasker.fullName || 'a tasker'} on ${date} at ${time}.`;

      await sendNotification(user.fcmToken, title, body);
      await Notification.create({
        userId: user._id,
        userModel: 'User',
        title,
        body,
        type: 'booking',
      });
    }

    // ✅ Populate user fields (e.g., name and avatar)
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name avatar') // 🧠 include only what you need
      .populate('taskerId', 'fullName');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Booking creation failed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// acce^pt booking 

// @desc    Accept a booking
// @route   PATCH /api/bookings/:id/accept
const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('userId', 'name avatar fcmToken')
      .populate('taskerId', 'fullName');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'accepted';
    await booking.save();

    // ✅ Notify user
    const title = '✅ Booking Accepted';
    const body = `Your booking for ${booking.date} at ${booking.time} was accepted by ${booking.taskerId.fullName}.`;

    if (booking.userId.fcmToken) {
      await sendNotification(booking.userId.fcmToken, title, body);
    }

    await Notification.create({
      userId: booking.userId._id,
      userModel: 'User',
      title,
      body,
      type: 'booking'
    });

    res.status(200).json({ message: 'Booking accepted', booking });
  } catch (error) {
    console.error('Accept booking failed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


//reject booking

// @desc    Reject a booking
// @route   PATCH /api/bookings/:id/reject
const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('userId', 'name avatar fcmToken')
      .populate('taskerId', 'fullName');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'rejected';
    await booking.save();

    // ✅ Notify user
    const title = '❌ Booking Rejected';
    const body = `Your booking for ${booking.date} at ${booking.time} was rejected by ${booking.taskerId.fullName}.`;

    if (booking.userId.fcmToken) {
      await sendNotification(booking.userId.fcmToken, title, body);
    }

    await Notification.create({
      userId: booking.userId._id,
      userModel: 'User',
      title,
      body,
      type: 'booking'
    });

    res.status(200).json({ message: 'Booking rejected', booking });
  } catch (error) {
    console.error('Reject booking failed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getBookingsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const bookings = await Booking.find({ userId }).populate('taskerId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};


const getTaskerBookings = async (req, res) => {
  try {
    const taskerId = req.params.taskerId.trim(); 

    // Fetch all bookings for the tasker and populate user info
    const bookings = await Booking.find({ taskerId })
      .populate('userId', 'name avatar')  // 👈 Only fetch name and avatar of user
      .sort({ createdAt: -1 }); // optional: newest first

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Failed to fetch tasker bookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// @desc    Get the next accepted job for a tasker
// @route   POST /api/bookings/next-job
const getNextJob = async (req, res) => {
  const { taskerId } = req.body;

  if (!taskerId) {
    return res.status(400).json({ message: 'taskerId is required' });
  }

  try {
    const now = new Date();

    // Fetch all accepted bookings for this tasker
    const bookings = await Booking.find({
      taskerId,
      status: 'accepted',
    }).populate('userId', 'name avatar phone');

    console.log("📦 Accepted bookings (raw):", bookings.length);

    // Filter bookings where the string date (when converted to Date) is in the future
    const futureBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date); // convert string to Date
      return bookingDate >= now;
    });

    console.log("📅 Future accepted bookings:", futureBookings.length);

    // Sort the future bookings by date ascending
    futureBookings.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (futureBookings.length === 0) {
      return res.status(404).json({ message: 'No upcoming job found' });
    }

    const nextJob = futureBookings[0];

    res.status(200).json({ nextJob });
  } catch (error) {
    console.error('❌ Error getting next job:', error);
    res.status(500).json({ message: 'Server error while fetching next job' });
  }
};



module.exports = {
  createBooking,
  getBookingsByUserId,
  acceptBooking,
  rejectBooking,
  getTaskerBookings,
  getNextJob
};
