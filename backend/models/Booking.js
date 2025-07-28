// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },  // you can use Date if needed
    time: { type: String, required: true },
    location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true },
    },
  status: { type: String, default: 'pending' }  // e.g., pending, accepted, completed
});

module.exports = mongoose.model('Booking', bookingSchema);

