const express = require('express');
const router = express.Router();
const { generateDescription } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// 🎯 This is the endpoint your Frontend is calling
router.post('/generate', protect, generateDescription);

module.exports = router;