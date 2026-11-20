const express = require('express');
const router = express.Router();

// 1. Controller Imports
const { 
  createBooking, 
  getMyBookings, 
  downloadInvoice, 
  getAdminStats, 
  verifyBooking,
  createOrder,    // Add this
  verifyPayment   // Add this 
} = require('../controllers/bookingController');

// 2. Middleware Imports (Using the specific names from your authMiddleware.js)
const { 
  protect, 
  adminOnly, 
  organizerOnly 
} = require('../middleware/authMiddleware');

// --- USER ROUTES ---
router.post('/reserve', protect, createBooking);
router.post('/create-order', protect, createOrder); // For Razorpay Init
router.post('/verify-payment', protect, verifyPayment); // For Razorpay Finish
router.get('/my-tickets', protect, getMyBookings);
router.get('/invoice/:id', protect, downloadInvoice);

// --- SCANNER / ORGANIZER ROUTES ---
// We use 'protect' to identify the scanner, then 'organizerOnly' to check their role
router.post('/verify', protect, organizerOnly, verifyBooking);

// --- SUPERADMIN ROUTES ---
router.get('/admin-stats', protect, adminOnly, getAdminStats);

module.exports = router;