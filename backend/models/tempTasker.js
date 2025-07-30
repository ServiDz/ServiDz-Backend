const mongoose = require('mongoose');

const tempTaskerSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, required: true },
  password: String,
  role: { type: String, default: 'tasker' },
  profession: String,
  location: String,
  phone: String,
});

module.exports = mongoose.model('TempTasker', tempTaskerSchema);
