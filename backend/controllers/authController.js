const User = require('../models/User');
const TempUser = require('../models/TempUser');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const sendEmail = require('../utils/sendEmail');

// STEP 1: Register — store temp user & send OTP
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    await TempUser.deleteMany({ email: email.toLowerCase() });
    await Otp.deleteMany({}); // Optional: clear all old OTPs

    const hashedPassword = await bcrypt.hash(password, 10);
    const tempUser = await TempUser.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    const otp = crypto.randomInt(100000, 999999).toString();
    await Otp.create({ userId: tempUser._id, otp });

    await sendEmail(
      email,
      'Your OTP Code',
      `Hello ${name},\n\nYour OTP code is: ${otp}\nIt will expire in 5 minutes.\n\nThanks,\nServiDZ Team`
    );

    res.status(200).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      tempUserId: tempUser._id,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Something went wrong during registration' });
  }
};

// STEP 2: Verify OTP — create real user
exports.verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const validOtp = await Otp.findOne({ userId, otp });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const tempUser = await TempUser.findById(userId);
    if (!tempUser) {
      return res.status(404).json({ message: 'Temporary user not found' });
    }

    const newUser = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      role: tempUser.role,
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    await TempUser.deleteOne({ _id: userId });
    await Otp.deleteMany({ userId });

    res.status(201).json({
      message: 'User verified and registered successfully',
      accessToken,
      refreshToken,
      user: newUser,
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Something went wrong during verification' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('Login failed: user not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
      console.log('Password entered:', password);
    console.log('Password stored (hashed):', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

// REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Missing refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.refreshToken = null;
    await user.save();

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed' });
  }
};
