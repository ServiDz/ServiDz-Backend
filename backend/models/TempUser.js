const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: { type: Date, default: Date.now, expires: 600 }, // expires in 10 min
});

module.exports = mongoose.model('TempUser', tempUserSchema);
