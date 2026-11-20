const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },

  // 🎯 THE FIX: Added 'ticketTierName' to the Snapshot
  eventSnapshot: {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    image: { type: String },
    locationArea: { type: String },
    ticketTierName: { type: String, default: 'General Admission' } 
  },

  ticketsBooked: { 
    type: Number, 
    required: true, 
    default: 1 
  },
  totalPrice: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Confirmed', 'Cancelled', 'Attended'], 
    default: 'Confirmed' 
  },
  bookingDate: { 
    type: Date, 
    default: Date.now 
  },
  qrCode: { 
    type: String 
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);