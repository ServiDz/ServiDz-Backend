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
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String }

});

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
    }
});

module.exports = mongoose.model('User', userSchema);
