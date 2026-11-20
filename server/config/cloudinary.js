const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 🔐 1. Connect to your Cloudinary Account
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 🏗️ 2. Set up the Storage Folder Dynamically
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Check if the incoming file is a PDF
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');

    // 🎯 DEFAULT: Your original setup for Event Posters
    let folderName = 'EliteEvents_Posters';
    let resourceType = 'auto'; 

    // 🎯 OVERRIDE: If the file is for Hard Verification, send it to the Documents vault
    const documentFields = ['aadhaarCard', 'panCard', 'businessLicense'];
    
    if (documentFields.includes(file.fieldname)) {
      folderName = 'EliteEvents_Documents';
      resourceType = isPdf ? 'raw' : 'auto'; // 'raw' saves the PDF so Chrome can read it!
    }

    // Optional: If you ever add profile pictures back in
    if (file.fieldname === 'profileImage' || file.fieldname === 'image') {
      folderName = 'EliteEvents_Profiles';
    }

    return {
      folder: folderName,
      resource_type: resourceType,
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };