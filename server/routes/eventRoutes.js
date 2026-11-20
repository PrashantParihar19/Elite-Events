const express = require('express');
const router = express.Router();

// 🛡️ 1. Middleware Imports
const { protect, isVerifiedOrganizer, organizerOnly } = require('../middleware/authMiddleware');

// 📸 2. Cloudinary Config
const { upload } = require('../config/cloudinary');

// 🎯 3. Controller Imports
const { 
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  getEventById,
  getOrganizerEvents 
} = require('../controllers/eventController');

// --- ROUTES ---

// Public: Get all events for the Main Grid
router.get('/all', getEvents);

// Protected: Get events specifically for the logged-in organizer's dashboard
router.get('/organizer-events', protect, organizerOnly, getOrganizerEvents);

// Public: Get a single event by ID
router.get('/:id', getEventById); 

// Protected: Create a new event with a Poster
router.post('/create', protect, isVerifiedOrganizer, upload.single('image'), createEvent);

// Protected: Update an existing event (will fail if event is in the past)
router.put('/:id', protect, organizerOnly, upload.single('image'), updateEvent);

// Protected: Delete an event (will fail if event is in the past)
router.delete('/:id', protect, organizerOnly, deleteEvent);

module.exports = router;






















// const express = require('express');
// const router = express.Router();
// // 🛡️ 1. Import all middleware in one line
// const { protect, isVerifiedOrganizer, organizerOnly} = require('../middleware/authMiddleware');
// const { createEvent } = require('../controllers/eventController');
// // 2. Import the "Bouncer" (Middleware)
// // const { protect, organizerOnly } = require('../middleware/authMiddleware');

// // 3. Import the "Bridge" (Cloudinary Config)
// const { upload } = require('../config/cloudinary');
// // 1. Import the Controllers

// const { 
//   getEvents, 
//   createEvent, 
//   updateEvent, 
//   deleteEvent,
//   getEventById // 🎯 Add this!
// } = require('../controllers/eventController');



// // --- ROUTES ---

// // Public: Get all events for the Ahmedabad Grid
// router.get('/all', getEvents);
// router.get('/:id', getEventById); // 🎯 This is the new one!


// // Protected: Create a new event with a Poster
// router.post('/create', protect, isVerifiedOrganizer, upload.single('image'), createEvent);

// // Protected: Update an existing event (Supports new image upload)
// router.put('/:id', protect, organizerOnly, upload.single('image'), updateEvent);

// // Protected: Delete an event from the cluster
// router.delete('/:id', protect, organizerOnly, deleteEvent);


// module.exports = router;













// const express = require('express');
// const router = express.Router();
// const { upload } = require('../config/cloudinary'); // Import the bridge

// // 1. Make sure these names match the controller exactly!
// const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
// const { protect, organizerOnly } = require('../middleware/authMiddleware');

// // 2. Check Line 9 - Ensure 'getEvents' is actually a function
// router.get('/all', getEvents); 

// router.post('/create', protect, organizerOnly, upload.single('image'), createEvent);

// router.put('/:id', protect, organizerOnly, upload.single('image'), updateEvent);
// router.delete('/:id', protect, organizerOnly, deleteEvent);

// module.exports = router;



// const express = require('express');
// const router = express.Router();
// const eventController = require('../controllers/eventController');

// // Map the routes to the controller logic
// router.get('/all', eventController.getAllEvents);
// router.post('/create', eventController.createEvent);

// module.exports = router;