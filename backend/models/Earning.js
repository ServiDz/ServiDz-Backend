const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema(
  {
    taskerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tasker',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Earning', earningSchema);
