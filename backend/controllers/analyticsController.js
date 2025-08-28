const Tasker = require("../models/Tasker");
const Earning = require("../models/Earning");

exports.getTaskersDistribution = async (req, res) => {
  try {
    const distribution = await Tasker.aggregate([
      { $group: { _id: "$profession", count: { $sum: 1 } } },
      { $sort: { count: -1 } } // optional: sort descending
    ]);

    res.status(200).json(distribution);
  } catch (error) {
    console.error("Taskers distribution error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMonthlyEarnings = async (req, res) => {
  try {
    const earnings = await Earning.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalEarnings: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 } // sort by latest first
      }
    ]);

    // Format response for frontend
    const formatted = earnings.map(e => ({
      year: e._id.year,
      month: e._id.month,
      totalEarnings: e.totalEarnings
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Monthly earnings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};