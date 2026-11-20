const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "Event title is required"],
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  // 🎯 Legacy support: We will use this as the "Starting At" price
  price: { 
    type: Number, 
    required: true,
    default: 0 
  },
  date: { 
    type: Date, 
    required: true 
  },
  location: {
    area: { 
      type: String, 
      required: [true, "Area/Neighborhood is required"],
      trim: true 
    },
    address: { 
      type: String, 
      required: [true, "Full address is required"],
      trim: true 
    }
  },
  attendees: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true 
  },
  // 🎯 Legacy support: Total sum of all tier quantities
  availableTickets: { 
    type: Number, 
    required: true,
    min: [0, "Tickets cannot be negative"]
  },
  
  // 🎯 THE NEW STRUCTURE: Array of Ticket Tiers
  ticketTiers: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],

  ticketIDPrefix: {
    type: String,
    default: "ELITE-" 
  },
  image: { 
    type: String ,
    default: ""
  },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'User' ,required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);