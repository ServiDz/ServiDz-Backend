const Earning = require('../models/Earning');


const getTaskerEarnings = async (req, res) => {
    try {
    const taskerId = req.user.taskerId;

    if (!taskerId) {
        return res.status(400).json({ message: 'Tasker ID missing in request user' });
    }

    const earnings = await Earning.find({ taskerId }).sort({ createdAt: -1 });

    const total = earnings.reduce((sum, e) => sum + e.amount, 0);

    res.status(200).json({
        total,
        earnings,
    });
    } catch (error) {
    console.error('Failed to fetch tasker earnings:', error);
    res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getTaskerEarnings };
