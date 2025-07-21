const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TempUser',
    required: true,
    },
    otp: {
    type: String,
    required: true,
    },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // expires in 5 min
});

module.exports = mongoose.model('Otp', otpSchema);
