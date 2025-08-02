// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { createBooking, getBookingsByUserId , acceptBooking , rejectBooking , getTaskerBookings} = require('../controllers/bookingController');

// POST /api/bookings
router.post('/create', createBooking);
router.get('/user/:userId', getBookingsByUserId);
router.patch('/:id/accept', acceptBooking);
router.patch('/:id/reject', rejectBooking);
router.get('/tasker/:taskerId', getTaskerBookings);




module.exports = router;
