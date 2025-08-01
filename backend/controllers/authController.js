const User = require('../models/User');
const TempUser = require('../models/TempUser');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const sendEmail = require('../utils/sendEmail');
const TempTasker = require('../models/TempTasker');
const Tasker = require('../models/Tasker');
const { sendNotification } = require('../utils/fcm');
const Notification = require('../models/Notification'); // ✅ Added

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

    const otp = crypto.randomInt(1000, 9999).toString();
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
  const { userId, otp, role } = req.body;

  try {
    const validOtp = await Otp.findOne({ userId, otp });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const TempModel = role === 'tasker' ? TempTasker : TempUser;
    const Model = role === 'tasker' ? Tasker : User;

    const temp = await TempModel.findById(userId);
    if (!temp) {
      return res.status(404).json({ message: `Temporary ${role} not found` });
    }

    let newUserData;
    if (role === 'tasker') {
      newUserData = {
        fullName: temp.fullName,
        phone: temp.phone,
        location: temp.location,
        profession: temp.profession,
        email: temp.email,
        password: temp.password,
        role: temp.role,
      };
    } else {
      newUserData = {
        name: temp.name,
        email: temp.email,
        password: temp.password,
        role: temp.role,
      };
    }

    const newUser = await Model.create(newUserData);

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    await TempModel.deleteOne({ _id: userId });
    await Otp.deleteMany({ userId });

    // ✅ Send welcome notification and store it
    if (newUser.fcmToken) {
      const title = '🎉 Welcome to ServiDZ';
      const body = 'Your account has been created successfully!';

      await sendNotification(newUser.fcmToken, title, body);

      await Notification.create({
        userId: newUser._id,
        userModel: role === 'tasker' ? 'Tasker' : 'User',
        title,
        body,
        type: 'welcome'
      });
    }

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} verified and registered successfully`,
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
  const { email, password, role, fcmToken } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    const model = role === 'tasker' ? Tasker : User;
    const user = await model.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    if (fcmToken) {
      user.fcmToken = fcmToken;
    }

    await user.save();

    // ✅ Send welcome notification and store it
    if (user.fcmToken) {
      const title = '👋 Welcome Back to ServiDZ';
      const body = 'We’re glad to see you again!';

      await sendNotification(user.fcmToken, title, body);

      await Notification.create({
        userId: user._id,
        userModel: role === 'tasker' ? 'Tasker' : 'User',
        title,
        body,
        type: 'login'
      });
    }

    res.json({ success: true, accessToken, refreshToken, user });
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
