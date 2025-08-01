const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
    type: String,
    enum: ['user', 'professional', 'admin'],
    default: 'user'
    },
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String },
    fcmToken: { type: String },
});


module.exports = mongoose.model('User', userSchema);
