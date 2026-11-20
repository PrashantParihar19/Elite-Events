const crypto = require('crypto'); // Built-in Node module
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Import JWT
const bcrypt = require('bcryptjs'); // Or however you hash passwords
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/users/register
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ email });

        // 2. Check if user exists AND password matches
        if (user && (await user.matchPassword(password))) {
            // 3. If correct, send the Digital Pass (Token)
            console.log("DB DATA FOUND:", {
            email: user.email,
            isAdmin: user.isAdmin,
            isApproved: user.isApproved
            });
            const token = jwt.sign(
                { id: user._id, role: user.role }, 
                process.env.JWT_SECRET, 
                { expiresIn: '30d' } // Pass is valid for 30 days
            );

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: token, // This is the "Digital Pass"
                isAdmin: user.isAdmin,      // 🎯 MUST SEND THIS
                isApproved: user.isApproved// 🎯 MUST SEND THIS
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) {
        res.status(500).json({ message: "Login Error", error: err.message });
    }
};

// @desc    Forgot Password - Generate Token & Send Email
exports.forgotPassword = async (req, res) => {
  try {
    // 1. Find user by email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "No elite account found with that email." });
    }

    // 2. Generate a random reset token (The "Vault Key")
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 3. Hash the token and save to database (Security first!)
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiry to 15 minutes
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; 

    await user.save();

    // 4. Create the Reset URL (Pointing to your Frontend)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // 5. The "Elite" Email Template
    const message = `
      <div style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 20px; border: 1px solid #ca8a04;">
        <h1 style="color: #eab308;">Vault Recovery Request</h1>
        <p>You requested access to reset your EliteEvents credentials. Click the button below to proceed. This link expires in 15 minutes.</p>
        <a href="${resetUrl}" style="background-color: #ca8a04; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">Reset My Password</a>
        <p style="margin-top: 20px; font-size: 0.8rem; color: #666;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Recovery - EliteEvents',
        message,
      });

      res.status(200).json({ message: 'Recovery email dispatched to the vault.' });
    } catch (err) {
      // If email fails, clear the tokens
      console.error("NODEMAILER ERROR:", err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Reset Password using the token from the email
exports.resetPassword = async (req, res) => {
  try {
    // 1. Hash the token from the URL to match what we stored in the DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 2. Find user with matching token and check if it hasn't expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }, // $gt means "greater than"
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired recovery link." });
    }

    // 3. Set the new password (The password will be hashed by your User Schema's 'pre-save' hook)
    user.password = req.body.password;
    
    // 4. Clear the reset fields so the link can't be used again
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Vault credentials updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists in Ahmedabad database" });
        }

        // 1. Prepare the base user object
        let userData = { name, email, password, role };

        // 2. 🎯 CATCH ORGANIZER DETAILS & FILES
        if (role === 'Organizer') {
            const { organizationName, contactNumber, professionalLink } = req.body;
            
            let organizerDetails = {
                organizationName,
                contactNumber,
                professionalLink,
                docsUploaded: false
            };

            // Check if Multer/Cloudinary successfully attached files to the request
            if (req.files) {
                if (req.files.aadhaarCard) organizerDetails.aadhaarCard = req.files.aadhaarCard[0].path;
                if (req.files.panCard) organizerDetails.panCard = req.files.panCard[0].path;
                if (req.files.businessLicense) organizerDetails.businessLicense = req.files.businessLicense[0].path;
                
                organizerDetails.docsUploaded = true;
            }

            // Attach the nested object to the main user data
            userData.organizerDetails = organizerDetails;
        }

        // 3. Create the user with ALL the collected data
        const user = await User.create(userData);

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' }
        );

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token,
            isAdmin: false,      // New users are never admins
            isApproved: false    // New users are never approved immediately
        });
    }catch (err) {
        // 🎯 THIS WILL CRACK OPEN THE [object Object]
        console.error("🚨 REAL REGISTRATION ERROR:", JSON.stringify(err, null, 2));
        
        res.status(500).json({ 
            message: "Server Error during registration", 
            error: err.message || "Unknown Error" 
        });
    }
};
// @desc    Get all users (Admin/Test only)
// @route   GET /api/users/all
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Don't show passwords!
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
};

// @desc    Update user profile / Upload Hard Documents
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      const body = req.body || {};

      // 1. Basic Info
      user.name = body.name || user.name;
      user.bio = body.bio || user.bio;

      // 2. Handle Profile Image (Existing)
      if (req.files && req.files.profileImage) {
        user.profileImage = req.files.profileImage[0].path;
      }

      // 3. Handle Organizer "Soft" & "Hard" Details
      if (user.role === 'Organizer') {
        // Ensure the object exists
        user.organizerDetails = user.organizerDetails || {};

        // Save Soft Details (This fixes the Admin visibility issue)
        user.organizerDetails.organizationName = body.organizationName || user.organizerDetails.organizationName;
        user.organizerDetails.contactNumber = body.contactNumber || user.organizerDetails.contactNumber;
        user.organizerDetails.professionalLink = body.professionalLink || user.organizerDetails.professionalLink;

        // 🎯 Handle Hard Document Uploads (Using req.files from Multer)
        if (req.files) {
          if (req.files.aadhaarCard) user.organizerDetails.aadhaarCard = req.files.aadhaarCard[0].path;
          if (req.files.panCard) user.organizerDetails.panCard = req.files.panCard[0].path;
          if (req.files.businessLicense) user.organizerDetails.businessLicense = req.files.businessLicense[0].path;
          
          user.organizerDetails.docsUploaded = true;
        }
      }

      // 4. Handle Email/Password (Existing logic)
      if (body.email && body.email !== user.email) {
        const emailExists = await User.findOne({ email: body.email });
        if (emailExists) return res.status(400).json({ message: "Email already taken." });
        user.email = body.email;
      }
      if (body.password) user.password = body.password;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        role: updatedUser.role,
        organizerDetails: updatedUser.organizerDetails, // 🚀 Admin will now see this
        isApproved: updatedUser.isApproved,
        status: updatedUser.status
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Update Error", error: err.message });
  }
};

// 🔍 Fetch all Organizers waiting for approval
// 🔍 Update getPendingOrganizers so Admin sees everything
exports.getPendingOrganizers = async (req, res) => {
  try {
    // We explicitly find organizers and ensure the details are included
    const organizers = await User.find({ 
      role: 'Organizer', 
      status: 'pending' 
    }).select('-password'); 
    
    res.status(200).json(organizers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending organizers" });
  }
};

// ✅ Approve an Organizer
exports.verifyOrganizer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      {status: 'approved', isApproved: true }, 
      { new: true }
    );
    res.status(200).json({ message: `${user.name} is now a Verified Organizer!`, user });
  } catch (error) {
    res.status(500).json({ message: "Approval failed" });
  }
};

// ❌ REJECT / DELETE an Organizer application
exports.rejectOrganizer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id,{ status: 'rejected', isApproved: false }, 
      { new: true });
    if (!user) {
      return res.status(404).json({ message: "Organizer not found." });
    }
    res.status(200).json({ message: `Application for ${user.name} has been rejected and cleared.` });
  } catch (error) {
    res.status(500).json({ message: "Rejection failed", error: error.message });
  }
};

// server/controllers/userController.js

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        status: user.status, // 'pending', 'approved', or 'rejected'
        createdAt: user.createdAt
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 🎯 ADD THIS TO userController.js
exports.reapplyOrganizer = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Reset status to pending so SuperAdmin sees them again
    user.status = 'pending';
    user.isApproved = false;
    
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Re-application submitted! Awaiting SuperAdmin audit." 
    });
  } catch (err) {
    res.status(500).json({ message: "Re-application failed", error: err.message });
  }
};

// 🎯 ADD THIS TO userController.js
exports.reapplyOrganizer = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Reset status to pending so SuperAdmin sees them again
    user.status = 'pending';
    user.isApproved = false;
    
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Re-application submitted! Awaiting SuperAdmin audit." 
    });
  } catch (err) {
    res.status(500).json({ message: "Re-application failed", error: err.message });
  }
};