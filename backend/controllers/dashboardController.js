const User = require("../models/User");
const Tasker = require("../models/Tasker");
const Booking = require("../models/Booking");
const Earning = require("../models/Earning");

// Calculate percentage change between two numbers
function getPercentageChange(today, yesterday) {
  if (yesterday === 0 && today > 0) return 100;
  if (yesterday === 0 && today === 0) return 0;
  return ((today - yesterday) / yesterday) * 100;
}

exports.getDashboardAnalytics = async (req, res) => {
  try {
    // ===== Date ranges =====
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    // ===== Users =====
    const totalUsers = await User.countDocuments();
    const todayUsers = await User.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });
    const yesterdayUsers = await User.countDocuments({
      createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
    });
    const usersGrowth = getPercentageChange(todayUsers, yesterdayUsers);

    // ===== Taskers =====
    const totalTaskers = await Tasker.countDocuments();
    const todayTaskers = await Tasker.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });
    const yesterdayTaskers = await Tasker.countDocuments({
      createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
    });
    const taskersGrowth = getPercentageChange(todayTaskers, yesterdayTaskers);

    // ===== Bookings =====
    const todaysBookings = await Booking.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });
    const yesterdaysBookings = await Booking.countDocuments({
      createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
    });
    const bookingsGrowth = getPercentageChange(todaysBookings, yesterdaysBookings);

    // ===== Earnings =====
    const todaysEarningsResult = await Earning.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const todaysEarnings = todaysEarningsResult.length
      ? todaysEarningsResult[0].total
      : 0;

    const yesterdaysEarningsResult = await Earning.aggregate([
      { $match: { createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const yesterdaysEarnings = yesterdaysEarningsResult.length
      ? yesterdaysEarningsResult[0].total
      : 0;

    const earningsGrowth = getPercentageChange(todaysEarnings, yesterdaysEarnings);

    // ===== Response =====
    res.json({
      totalUsers,
      totalTaskers,
      todaysBookings,
      todaysEarnings,
      analytics: {
        users: {
          today: todayUsers,
          yesterday: yesterdayUsers,
          growth: usersGrowth.toFixed(2),
        },
        taskers: {
          today: todayTaskers,
          yesterday: yesterdayTaskers,
          growth: taskersGrowth.toFixed(2),
        },
        bookings: {
          today: todaysBookings,
          yesterday: yesterdaysBookings,
          growth: bookingsGrowth.toFixed(2),
        },
        earnings: {
          today: todaysEarnings,
          yesterday: yesterdaysEarnings,
          growth: earningsGrowth.toFixed(2),
        },
      },
    });
  } catch (err) {
    console.error("Error fetching dashboard analytics:", err);
    res.status(500).json({ message: "Server error" });
  }
};
