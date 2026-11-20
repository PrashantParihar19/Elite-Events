const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🛡️ 1. THE PROTECTOR: Verifies the JWT Token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Decode the token using your Secret Key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database (but don't send the password!)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move to the next step
    } catch (error) {
      console.error("Auth Error:", error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// 🛡️ 2. THE ORGANIZER GUARD: Only allows "Organizers" to pass
const organizerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Organizer') {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Only Organizers can perform this action' });
  }
};

const isVerifiedOrganizer = (req, res, next) => {
  // 🎯 Check if they are an Organizer AND if they are approved
  // Note: We let SuperAdmins bypass this so you can still test!
  if (req.user && (req.user.isApproved || req.user.isAdmin)) {
    next();
  } else {
    res.status(403).json({ message: "Access Denied: Your account is awaiting SuperAdmin approval." });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: SuperAdmin privileges required.' });
  }
};

module.exports = { protect, organizerOnly, isVerifiedOrganizer, adminOnly};