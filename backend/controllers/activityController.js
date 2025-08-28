// controllers/activityController.js
const User = require("../models/User");
const Tasker = require("../models/Tasker");
const Booking = require("../models/Booking");
const Earning = require("../models/Earning");
const TempUser = require("../models/TempUser");
const TempTasker = require("../models/tempTasker");

exports.getRecentActivities = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch collections
    const [newUsers, newTempUsers, newTaskers, newTempTaskers, newBookings, newEarnings] = await Promise.all([
      User.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }).sort({ createdAt: -1 }).limit(5),
      TempUser.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }).sort({ createdAt: -1 }).limit(5),
      Tasker.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }).sort({ createdAt: -1 }).limit(5),
      TempTasker.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }).sort({ createdAt: -1 }).limit(5),
      Booking.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }).sort({ createdAt: -1 }).limit(5),
      Earning.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }).sort({ createdAt: -1 }).limit(5),
    ]);

    const activities = [];

    // Users
    newUsers.forEach(u => activities.push({
      type: "User",
      activity: "New user signup",
      reference: u._id,
      date: u.createdAt,
      status: "completed"
    }));

    // Temp users
    newTempUsers.forEach(u => activities.push({
      type: "User",
      activity: "New user signup (temp)",
      reference: u._id,
      date: u.createdAt,
      status: "pending"
    }));

    // Taskers
    newTaskers.forEach(t => activities.push({
      type: "Tasker",
      activity: "New tasker registered",
      reference: t._id,
      date: t.createdAt,
      status: "completed"
    }));

    // Temp taskers
    newTempTaskers.forEach(t => activities.push({
      type: "Tasker",
      activity: "New tasker registered (temp)",
      reference: t._id,
      date: t.createdAt,
      status: "pending"
    }));

    // Bookings
    newBookings.forEach(b => activities.push({
      type: "Booking",
      activity: "New booking created",
      reference: b._id,
      date: b.createdAt,
      status: b.status || "pending"
    }));

    // Earnings
    newEarnings.forEach(e => activities.push({
      type: "Payment",
      activity: `Payment of $${e.amount}`,
      reference: e._id,
      date: e.createdAt,
      status: "completed"
    }));

    // Sort descending and limit
    activities.sort((a, b) => b.date - a.date);

    res.status(200).json(activities.slice(0, 10));

  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({ message: "Server error" });
  }
};