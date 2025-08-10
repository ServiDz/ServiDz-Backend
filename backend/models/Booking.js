const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    taskerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tasker',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String, // Optional but useful for UI
      },
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], 
      default: 'pending',
    },
     earning: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Earning',
    required: false, // explicitly optional
    default: null
  },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('Booking', bookingSchema);

