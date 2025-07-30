const Tasker = require('../models/Tasker');
const TempTasker = require('../models/TempTasker');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const sendEmail = require('../utils/sendEmail');

// STEP 1: Register — store temp tasker & send OTP
exports.register = async (req, res) => {
  const { fullName, email, password, profession, location, phone } = req.body;

  try {
    const existing = await Tasker.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    await TempTasker.deleteMany({ email: email.toLowerCase() });
    await Otp.deleteMany({}); // optional cleanup

    const hashedPassword = await bcrypt.hash(password, 10);

    const tempTasker = await TempTasker.create({
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        profession,
        location,
        phone,
    });

    const otp = crypto.randomInt(1000, 9999).toString();

    await Otp.create({ userId: tempTasker._id, otp });

    await sendEmail(
      email,
      'Your OTP Code',
      `Hello ${fullName},\n\nYour OTP code is: ${otp}\nIt will expire in 5 minutes.\n\nThanks,\nServiDZ Team`
    );

    res.status(200).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      tempTaskerId: tempTasker._id,
    });
  } catch (err) {
    console.error('Tasker registration error:', err);
    res.status(500).json({ message: 'Something went wrong during registration' });
  }
};

// STEP 2: Verify OTP — create real tasker
exports.verifyOtp = async (req, res) => {
  const { taskerId, otp } = req.body;

  try {
    const validOtp = await Otp.findOne({ userId: taskerId, otp });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const tempTasker = await TempTasker.findById(taskerId);
    if (!tempTasker) {
      return res.status(404).json({ message: 'Temporary tasker not found' });
    }

    const newTasker = await Tasker.create({
      fullName: tempTasker.fullName,
      email: tempTasker.email,
      password: tempTasker.password,
      role: 'tasker',
      profession: tempTasker.profession,
      location: tempTasker.location,
      phone: tempTasker.phone,
    });

    const accessToken = generateAccessToken(newTasker);
    const refreshToken = generateRefreshToken(newTasker);

    newTasker.refreshToken = refreshToken;
    await newTasker.save();

    await TempTasker.deleteOne({ _id: taskerId });
    await Otp.deleteMany({ userId: taskerId });

    res.status(201).json({
      message: 'Tasker verified and registered successfully',
      accessToken,
      refreshToken,
      tasker: newTasker,
    });
  } catch (err) {
    console.error('Tasker OTP verification error:', err);
    res.status(500).json({ message: 'Something went wrong during verification' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const tasker = await Tasker.findOne({ email: email.toLowerCase() });
    if (!tasker) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, tasker.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(tasker);
    const refreshToken = generateRefreshToken(tasker);

    tasker.refreshToken = refreshToken;
    await tasker.save();

    res.json({ accessToken, refreshToken, tasker });
  } catch (err) {
    console.error('Tasker login error:', err);
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
    const tasker = await Tasker.findById(decoded.id);

    if (!tasker || tasker.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(tasker);
    const newRefreshToken = generateRefreshToken(tasker);

    tasker.refreshToken = newRefreshToken;
    await tasker.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('Tasker refresh token error:', err);
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    const tasker = await Tasker.findById(req.user.id);
    if (!tasker) return res.status(404).json({ message: 'Tasker not found' });

    tasker.refreshToken = null;
    await tasker.save();

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed' });
  }
};
