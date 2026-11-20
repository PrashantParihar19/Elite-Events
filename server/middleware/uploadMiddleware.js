const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Configure Cloudinary (Make sure these are in your .env file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Setup Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Organize files into folders based on their field name
    let folderName = 'EliteEvents/Other';
    
    if (file.fieldname === 'profileImage') folderName = 'EliteEvents/Profiles';
    if (['aadhaarCard', 'panCard', 'businessLicense'].includes(file.fieldname)) {
      folderName = 'EliteEvents/VerificationDocs';
    }

    return {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'pdf'], // Allow PDF for docs
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;