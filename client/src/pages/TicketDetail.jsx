import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api';
import { QRCodeCanvas } from 'qrcode.react';

const TicketDetail = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🎯 THE FIX: Move this to the top level so the JSX below can see it!
  const storedUser = JSON.parse(localStorage.getItem('eliteUser'));

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        if (!storedUser?.token) return;

        const config = { 
          headers: { 
            Authorization: `Bearer ${storedUser.token}`,
            "ngrok-skip-browser-warning": "true"
          } 
        };
        
        // Fetch the bookings
        const { data: response } = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/my-tickets`, config);
        
        // Find the specific booking from the array
        const found = response.data.find(b => b._id === id);
        setBooking(found);
        setLoading(false);
      } catch (err) {
        console.error("Ticket Fetch Error:", err);
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-yellow-500 font-black italic animate-pulse tracking-widest">
        VERIFYING ELITE PASS...
      </div>
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="font-black italic uppercase">Pass Not Found or Invalid.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
      <div className="max-w-md mx-auto bg-gray-900 border border-yellow-500/30 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.1)]">
        
        {/* Header Section */}
        <div className="p-8 text-center border-b border-gray-800">
          <h2 className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.4em] mb-2">Official Entry Pass</h2>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            {booking.event?.title || "Elite Event"}
          </h1>
        </div>

        {/* QR Code Section - Standardized with MyBookings */}
        <div className="p-10 bg-white flex justify-center">
          <div className="p-3 border-2 border-dashed border-gray-300 rounded-3xl">
            <QRCodeCanvas 
              value={`PASS_ID:${booking._id}|PAX:${booking.ticketsBooked || booking.pax || 1}|HOLDER:${storedUser?.name || "Guest"}`}
              size={200}
              level={"H"}
              includeMargin={false}
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="p-8 space-y-6">
          <div className="flex justify-between border-b border-gray-800 pb-4">
            <div>
              <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Elite Member</p>
              <p className="font-bold uppercase text-sm text-yellow-500">{storedUser?.name || "Guest"}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Tickets</p>
              <p className="font-bold uppercase text-sm">{booking.ticketsBooked || booking.pax || 1} PAX</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Date</p>
              <p className="font-bold text-xs">
                {booking.event?.date ? new Date(booking.event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "TBA"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Venue Area</p>
              <p className="font-bold text-xs truncate">{booking.event?.location?.area || "Ahmedabad"}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 space-y-3">
            <button 
              onClick={() => window.print()}
              className="w-full bg-yellow-500 text-black font-black uppercase py-4 rounded-2xl hover:bg-white transition-all text-[10px] tracking-widest shadow-lg active:scale-95"
            >
              Print / Download Pass
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-transparent border border-gray-800 text-gray-500 font-black uppercase py-4 rounded-2xl hover:text-white transition-all text-[9px] tracking-widest active:scale-95"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Security Footer */}
      <p className="text-center mt-8 text-[8px] text-gray-700 uppercase font-black tracking-[0.5em]">
        Non-Transferable • Elite Events Ecosystem • Ahmedabad
      </p>
    </div>
  );
};

export default TicketDetail;