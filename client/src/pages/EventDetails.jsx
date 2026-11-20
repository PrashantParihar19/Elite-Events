import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState(1); 
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // 🎯 NEW: Track which ticket tier the user selected
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/${id}`);
        setEvent(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching details:", err);
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // 🎯 HELPER VARIABLES: Calculate dynamic pricing and capacity based on selection
  const hasTiers = event?.ticketTiers && event.ticketTiers.length > 0;
  const currentTier = hasTiers ? event.ticketTiers[selectedTierIndex] : { name: 'Standard Ticket', price: event?.price || 0, quantity: event?.availableTickets || 0 };
  const currentPrice = currentTier?.price || 0;
  const currentAvailable = currentTier?.quantity || 0;

  const processBooking = async () => {
    console.log("CHECKING KEY:", import.meta.env.VITE_RAZORPAY_KEY_ID);
    try {
      setBookingLoading(true);
      const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
      
      if (!storedUser) {
        toast.error("Please login to join this Elite event!");
        return navigate('/login');
      }

      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };

      // --- LOGIC 1: IF THE EVENT IS FREE ---
      if (currentPrice === 0) {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings/reserve`, {
          eventId: id,
          pax: tickets,
          tierName: currentTier.name // 🎯 Send the Tier Name!
        }, config);

        if (response.status === 201) {
          toast.success(`Elite Pass Confirmed for ${event.title}!`);
          navigate('/my-tickets');
        }
        return;
      }

      // --- LOGIC 2: IF THE EVENT IS PAID (Razorpay Flow) ---
      const { data: order } = await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings/create-order`, {
        eventId: id,
        amount: currentPrice * tickets // 🎯 Charge the Dynamic Tier Price
      }, config);

      console.log("DEBUG: Razorpay Key is:", import.meta.env.VITE_RAZORPAY_KEY_ID);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: "INR",
        name: "EliteEvents Ahmedabad",
        description: `Booking for ${event.title} - ${currentTier.name}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: id,
              ticketsBooked: tickets,
              tierName: currentTier.name // 🎯 Send the Tier Name to verify step
            };

            const verifyRes = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/bookings/verify-payment`, 
              verifyPayload, 
              config
            );

            if (verifyRes.data.success) {
              toast.success(`Payment Successful! Elite ${currentTier.name} Confirmed!`, {
              duration: 4000, 
            });
              navigate('/my-bookings');
            }
          } catch (err) {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: storedUser.name, email: storedUser.email },
        theme: { color: "#CA8A04" }, 
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed to initiate.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-yellow-500 font-black animate-pulse">SYNCING ASSETS...</div>;
  if (!event) return <div className="text-center py-20 text-red-500 uppercase font-black">Event Not Found</div>;

 return (
    <div className="min-h-screen bg-black text-white py-6 md:py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        
        {/* Left: Responsive Image Container */}
        <div className="lg:sticky lg:top-24 rounded-[30px] md:rounded-[40px] overflow-hidden border border-gray-900 shadow-[0_0_50px_rgba(202,138,4,0.1)]">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-[350px] md:h-[500px] lg:h-[600px] object-cover hover:scale-105 transition-transform duration-700" 
          />
        </div>

        {/* Right: Event Info & Checkout */}
        <div className="space-y-6 md:space-y-8 py-2 md:py-4">
          <div>
            <span className="bg-yellow-600/10 text-yellow-600 px-4 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-yellow-600/20">
              {event.category} • {event.location.area}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter mt-4 leading-[0.9]">
              {event.title}
            </h1>
          </div>

          <p className="text-gray-400 text-base md:text-lg leading-relaxed font-medium italic border-l-2 border-yellow-600 pl-4 md:pl-6">
            "{event.description}"
          </p>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="bg-gray-900/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-800">
              <p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase mb-1">Date & Time</p>
              <p className="text-white text-sm md:text-base font-bold">{new Date(event.date).toDateString()}</p>
            </div>
            <div className="bg-gray-900/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-800 border-b-4 border-b-yellow-600">
              <p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase mb-1">Starting Price</p>
              <p className="text-yellow-500 font-black text-lg md:text-xl">₹{event.price}</p>
            </div>
          </div>

          {/* 🎟️ THE BOOKING BOX */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-gray-800 shadow-2xl space-y-6">
            
            {/* 🎯 TICKET TYPE SELECTOR */}
            {hasTiers && (
              <div className="space-y-2 border-b border-gray-800 pb-6">
                <label className="text-white font-black uppercase text-[10px] tracking-widest">Select Ticket Type</label>
                <select 
                  className="w-full p-4 bg-black border border-gray-800 rounded-xl text-yellow-500 font-bold outline-none cursor-pointer hover:border-yellow-600 transition-colors appearance-none"
                  value={selectedTierIndex}
                  onChange={(e) => {
                    setSelectedTierIndex(Number(e.target.value));
                    setTickets(1); // Reset counter when switching tiers
                  }}
                >
                  {event.ticketTiers.map((tier, idx) => (
                    <option key={idx} value={idx} disabled={tier.quantity === 0}>
                      {tier.name} — ₹{tier.price} {tier.quantity === 0 ? '(SOLD OUT)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-white font-black uppercase text-[10px] tracking-widest">Quantity</span>
              <div className="flex items-center gap-4 md:gap-6 bg-black p-2 rounded-xl border border-gray-800">
                <button 
                  onClick={() => setTickets(Math.max(1, tickets - 1))}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-black text-yellow-500 hover:bg-white/5 rounded-lg transition"
                > – </button>
                <span className="text-lg md:text-xl font-black w-4 text-center">{tickets}</span>
                <button 
                  onClick={() => setTickets(Math.min(currentAvailable, tickets + 1))}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-black text-yellow-500 hover:bg-white/5 rounded-lg transition"
                > + </button>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-gray-800 pt-6">
              <div>
                <p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase mb-1">Total Amount</p>
                <p className="text-white font-black text-3xl md:text-4xl italic">₹{currentPrice * tickets}</p>
              </div>
              <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase mb-2">
                {currentAvailable} Left
              </p>
            </div>

            <button 
              onClick={processBooking}
              disabled={bookingLoading || currentAvailable === 0}
              className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest transition-all duration-300 shadow-xl active:scale-95 ${
                currentAvailable === 0 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-yellow-600 hover:bg-yellow-500 text-black'
              }`}
            >
              {bookingLoading ? "PROCESSING..." : currentAvailable === 0 ? "SOLD OUT" : "CONFIRM BOOKING"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;