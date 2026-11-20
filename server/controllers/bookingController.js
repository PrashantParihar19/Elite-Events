const Booking = require("../models/Booking");
const Event = require("../models/Event");
const { sendBookingEmail, generateInvoicePDF } = require("../services/emailService");
const QRCode = require('qrcode');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a new booking (For Free Events)
// @route   POST /api/bookings
// @access  Private 
exports.createBooking = async (req, res) => {
  try {
    const { eventId, pax, ticketsBooked, tierName } = req.body;
    const userId = req.user.id; 
    const userEmail = req.user.email;
    const userName = req.user.name;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const ticketCount = Number(pax || ticketsBooked) || 0;
    if (ticketCount <= 0) return res.status(400).json({ success: false, message: "Select at least 1 ticket." });

    // 🎯 DYNAMIC TIER LOGIC
    let priceToCharge = event.price;
    let selectedTier = null;
    if (event.ticketTiers && event.ticketTiers.length > 0) {
      selectedTier = event.ticketTiers.find(t => t.name === tierName);
      if (selectedTier) priceToCharge = selectedTier.price;
    }

    const totalPrice = priceToCharge * ticketCount;
    const seatsAvailable = selectedTier ? selectedTier.quantity : event.availableTickets;

    if (seatsAvailable < ticketCount) return res.status(400).json({ success: false, message: `Only ${seatsAvailable} seats left.` });

    const newBooking = new Booking({
      user: userId,
      event: eventId,
      ticketsBooked: ticketCount,
      totalPrice: totalPrice,
      status: "Confirmed",
      bookingDate: new Date(),
      
      eventSnapshot: {
        title: event.title,
        date: event.date,
        image: event.image,
        locationArea: event.location?.area || "Location TBA",
        ticketTierName: tierName || "General Admission" // 🎯 Log the tier
      }
    });

    const qrData = JSON.stringify({ id: newBooking._id, type: "ELITE_TICKET" });
    newBooking.qrCode = await QRCode.toDataURL(qrData);
    await newBooking.save();

    // 🎯 INVENTORY DEDUCTION (Global + Tier specific)
    event.availableTickets -= ticketCount;
    if (selectedTier) {
        selectedTier.quantity -= ticketCount;
    }
    for (let i = 0; i < ticketCount; i++) {
      event.attendees.push(userId);
    }
    await event.save();

    sendBookingEmail(userEmail, {
      _id: newBooking._id,
      userName: userName,
      eventName: event.title,
      pax: ticketCount,
      totalAmount: totalPrice,
      qrCode: newBooking.qrCode
    }).catch(err => console.error("Email Error:", err));

    res.status(201).json({ success: true, message: "Booking Successful!", data: newBooking });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("event", "title date location image")
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching your passes" });
  }
};

exports.downloadInvoice = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('event').populate('user');
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const safeEventTitle = booking.eventSnapshot?.title || booking.event?.title || "Event Removed";

        const pdfBuffer = await generateInvoicePDF({
            _id: booking._id,
            userName: booking.user.name,
            eventName: safeEventTitle,
            ticketsBooked: booking.ticketsBooked,
            totalAmount: booking.totalPrice,
            // 🎯 THE FIX: Pass the tier name from the snapshot to the PDF!
            ticketTierName: booking.eventSnapshot?.ticketTierName 
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Invoice_${booking._id}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: "Error generating invoice" });
    }
};

exports.getAdminStats = async (req, res) => {
  try {
    const transactionCount = await Booking.countDocuments();
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalTickets: { $sum: "$ticketsBooked" }, 
          totalRevenue: { $sum: "$totalPrice" }    
        }
      }
    ]);

    const finalStats = stats.length > 0 ? stats[0] : { totalTickets: 0, totalRevenue: 0 };

    res.status(200).json({
      totalTransactions: transactionCount,
      totalTickets: finalStats.totalTickets, 
      totalRevenue: finalStats.totalRevenue
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ success: false, message: "Error calculating stats" });
  }
};

exports.verifyBooking = async (req, res) => {
  try {
    const { qrData } = req.body;
    let targetId;

    if (qrData.includes('PASS_ID:')) {
      targetId = qrData.split('PASS_ID:')[1].split('|')[0].trim();
    } else {
      targetId = qrData;
    }

    const booking = await Booking.findById(targetId).populate('event').populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    const organizerId = booking.event.organizer.toString();
    const scannerId = req.user._id.toString();
    const isSystemAdmin = req.user.isAdmin; 

    if (organizerId !== scannerId && !isSystemAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: You aren't the organizer of this event." 
      });
    }

    if (booking.status === 'Attended') {
      return res.status(400).json({ 
        success: false, 
        message: `ALREADY SCANNED at ${new Date(booking.updatedAt).toLocaleTimeString()}` 
      });
    }

    booking.status = 'Attended';
    await booking.save();

    const io = req.app.get('io');
    io.emit('TICKET_SCANNED', { 
        eventID: booking.event._id,
        attendee: booking.user.name 
    });

    res.status(200).json({
      success: true,
      message: `CHECK-IN SUCCESS: Welcome, ${booking.user.name}!`,
      attendee: booking.user.name
    });

  } catch (error) {
    console.error("Scanner Error:", error);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { eventId, amount: incomingAmount } = req.body; 
    const cleanAmount = Math.round(Number(incomingAmount));

    if (!cleanAmount || cleanAmount <= 0) {
       return res.status(400).json({ message: "Invalid amount provided" });
    }

    const options = {
      amount: cleanAmount * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("RAZORPAY CRASH ERROR:", error);
    res.status(500).json({ message: "Razorpay Order failed", error: error.message });
  }
};

// --- STEP B: Verify AND Save Booking (For Paid Events) ---
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, ticketsBooked, pax, tierName } = req.body;
    const userId = req.user.id;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    if (hmac.digest('hex') !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid Signature" });
    }

    const event = await Event.findById(eventId);
    const ticketCount = Number(ticketsBooked || pax);
    
    // 🎯 DYNAMIC TIER LOGIC
    let priceToCharge = event.price;
    let selectedTier = null;
    if (event.ticketTiers && event.ticketTiers.length > 0) {
      selectedTier = event.ticketTiers.find(t => t.name === tierName);
      if (selectedTier) priceToCharge = selectedTier.price;
    }

    const totalPaid = priceToCharge * ticketCount;
  
    // Create Booking AND take the snapshot
    const newBooking = new Booking({
      user: userId,
      event: eventId,
      ticketsBooked: ticketCount,
      totalPrice: totalPaid,
      paymentId: razorpay_payment_id,
      status: "Confirmed",
      eventSnapshot: {
        title: event.title,
        date: event.date,
        image: event.image,
        locationArea: event.location?.area || "Location TBA",
        ticketTierName: tierName || "General Admission" // 🎯 Log the tier
      }
    });
    
    newBooking.qrCode = await QRCode.toDataURL(JSON.stringify({ id: newBooking._id }));
    await newBooking.save();

    // 🎯 INVENTORY DEDUCTION (Global + Tier specific)
    event.availableTickets -= ticketCount;
    if (selectedTier) {
      selectedTier.quantity -= ticketCount;
    }
    for (let i = 0; i < ticketCount; i++) {
      event.attendees.push(userId);
    }
    await event.save();

    sendBookingEmail(req.user.email, {
      _id: newBooking._id,
      userName: req.user.name,
      eventName: event.title,
      pax: ticketCount,
      totalAmount: totalPaid,
      qrCode: newBooking.qrCode
    }).catch(err => console.error("Email Error:", err));

    res.status(200).json({ success: true, message: "Elite Booking Confirmed!", data: newBooking });

  } catch (error) {
    res.status(500).json({ message: "Verification Error" });
  }
};