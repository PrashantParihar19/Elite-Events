const Event = require('../models/Event');

// 1. THE FETCHER
const getEvents = async (req, res) => {
  try {
    let query = {};
    if (req.user) {
      const { isAdmin, role } = req.user;
      if (role === 'user' && !isAdmin) {
        query = {}; 
      }
    } else {
      query = {}; 
    }
    const events = await Event.find(query)
      .populate('attendees')
      .sort({ date: -1 }) 
      .lean();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Elite Error: Could not fetch the grid." });
  }
};

// 2. THE CREATOR: 🎯 Updated to handle parsed Ticket Tiers
const createEvent = async (req, res) => {
  try {
    const { 
      title, description, date, category, location, ticketTiers
    } = req.body;

    const imageUrl = req.file ? req.file.path : "https://via.placeholder.com/800x400?text=Elite+Event+Poster";

    const finalLocation = {
      area: location?.area || req.body['location[area]'],
      address: location?.address || req.body['location[address]']
    };

    // 🎯 Parse the stringified tiers array back into JSON
    const parsedTiers = typeof ticketTiers === 'string' ? JSON.parse(ticketTiers) : ticketTiers;

    // Calculate total tickets and lowest starting price for backwards compatibility
    const totalTickets = parsedTiers.reduce((sum, tier) => sum + Number(tier.quantity), 0);
    const startingPrice = parsedTiers.length > 0 ? Math.min(...parsedTiers.map(t => Number(t.price))) : 0;

    const newEvent = new Event({
      title,
      description,
      date,
      price: startingPrice,           // Auto-calculated starting price
      category,           
      availableTickets: totalTickets, // Auto-calculated total capacity
      ticketTiers: parsedTiers,       // The new array!
      location: finalLocation,           
      image: imageUrl,    
      organizer: req.user._id 
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Save Error:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation Failed", details: error.errors });
    }
    res.status(500).json({ message: "Server Error during creation." });
  }
};

// 3. THE UPDATER
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const existingEvent = await Event.findById(id);
    if (!existingEvent) return res.status(404).json({ message: "Event not found" });
    if (new Date(existingEvent.date) < new Date()) {
      return res.status(403).json({ message: "Elite Error: Cannot edit past events." });
    }
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path;
    }
    const updatedEvent = await Event.findByIdAndUpdate(
      id, updateData, { new: true, runValidators: true } 
    );
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: "Update Failed", error: error.message });
  }
};

// 4. THE DESTROYER
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const existingEvent = await Event.findById(id);
    if (!existingEvent) return res.status(404).json({ message: "Event not found" });
    if (new Date(existingEvent.date) < new Date()) {
      return res.status(403).json({ message: "Elite Error: Cannot delete past events." });
    }
    await Event.findByIdAndDelete(id);
    res.json({ message: "Event successfully removed from the Elite Grid." });
  } catch (error) {
    res.status(500).json({ message: "Delete Failed" });
  }
};

// 5. FETCH BY ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    console.error("Backend ID Fetch Error:", error);
    res.status(500).json({ message: "Invalid Event ID format" });
  }
};

// 6. THE ORGANIZER DASHBOARD
const getOrganizerEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const activeEvents = await Event.find({ 
      organizer: req.user._id,
      date: { $gte: currentDate } 
    }).populate('attendees').sort({ date: 1 }); 

    const pastEvents = await Event.find({ 
      organizer: req.user._id,
      date: { $lt: currentDate }
    }).populate('attendees').sort({ date: -1 }); 

    res.json({ activeEvents, pastEvents });
  } catch (error) {
    res.status(500).json({ message: "Elite Error: Could not fetch your conducted events." });
  }
};

module.exports = {
  getEvents, createEvent, updateEvent, deleteEvent, getEventById, getOrganizerEvents
};