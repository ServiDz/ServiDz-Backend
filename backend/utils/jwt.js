const jwt = require('jsonwebtoken');

const generateAccessToken = (data) => {
  return jwt.sign(
    {
      userId: data.userId || null,
      taskerId: data.taskerId || null,
      role: data.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (data) => {
  return jwt.sign(
    {
      userId: data.userId || null,
      taskerId: data.taskerId || null,
      role: data.role
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };

