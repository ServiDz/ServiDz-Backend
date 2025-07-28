// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { createBooking, getBookingsByUserId } = require('../controllers/bookingController');

// POST /api/bookings
router.post('/create', createBooking);

// GET /api/bookings/user/:userId
router.get('/user/:userId', getBookingsByUserId);

module.exports = router;
