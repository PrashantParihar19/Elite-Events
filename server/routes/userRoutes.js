const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { forgotPassword, resetPassword } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getPendingOrganizers, verifyOrganizer, rejectOrganizer ,reapplyOrganizer} = require('../controllers/userController');
const { getUserProfile, updateUserProfile // 🎯 Add this import
} = require('../controllers/userController');
const { upload } = require('../config/cloudinary');

// 🔒 SuperAdmin only routes
router.get('/pending-organizers', protect,adminOnly, getPendingOrganizers);
router.put('/verify/:id', protect,adminOnly, verifyOrganizer);
router.put('/reject/:id', protect,adminOnly, rejectOrganizer); // 👈 NEW
// Add this line where your other protected routes are
router.put('/reapply', protect, reapplyOrganizer);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'aadhaarCard', maxCount: 1 },
      { name: 'panCard', maxCount: 1 },
      { name: 'businessLicense', maxCount: 1 }
    ]), updateUserProfile);

// Define User Endpoints
router.post('/register', upload.fields([
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'businessLicense', maxCount: 1 }
]), userController.registerUser);
router.get('/all', userController.getAllUsers);
router.post('/login', userController.loginUser);

// Route to request the email
router.post('/forgot-password', forgotPassword);

// Update this line to handle the image file
// router.put('/profile', protect, upload.single('image'), updateUserProfile);

// Route to actually update the password (put the token in the URL)
router.put('/reset-password/:token', resetPassword);

module.exports = router;