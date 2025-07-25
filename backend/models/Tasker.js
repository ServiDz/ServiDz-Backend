const mongoose = require('mongoose');

const taskerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  profession: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  certification: {
    type: String
  },
  description: {
    type: String
  },
  profilePic: {
  type: String, 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tasker', taskerSchema);
