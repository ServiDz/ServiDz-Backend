// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { createBooking, getBookingsByUserId , acceptBooking , rejectBooking , getTaskerBookings, getNextJob,markAsCompleted,getTaskerBookingSummary, getSchedule, getUserBookings } = require('../controllers/bookingController');
const { verify } = require('crypto');
const verifyToken = require('../middleware/verifyToken');

// POST /api/bookings
router.post('/create', createBooking);
router.get('/user/:userId', getBookingsByUserId);
router.patch('/:id/accept', acceptBooking);
router.patch('/:id/reject', rejectBooking);
router.get('/tasker/:taskerId', getTaskerBookings);
// POST /api/bookings/next-job
router.post('/next-job',getNextJob);
router.get('/:taskerId/summary', getTaskerBookingSummary);

router.patch('/:id/complete', markAsCompleted);
router.get('/schedule/:taskerId', getSchedule);
router.get('/userBookings', verifyToken, getUserBookings);

module.exports = router;
