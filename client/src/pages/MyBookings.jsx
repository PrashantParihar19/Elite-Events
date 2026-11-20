import { useEffect, useState, useContext } from 'react';
import axios from '../api';
import { QRCodeCanvas } from 'qrcode.react'; 
import { AuthContext } from '../context/AuthContext'; 
import toast from 'react-hot-toast';

const MyBookings = () => {
  const { user } = useContext(AuthContext); 
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
        const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/my-tickets`, config);
        setBookings(data.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
      }
    };
    fetchMyTickets();
  }, []);

  const handleDownload = async (bookingId) => {
    try {
        const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/bookings/invoice/${bookingId}`, 
            { 
                headers: { Authorization: `Bearer ${storedUser.token}` },
                responseType: 'blob' 
            }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice_${bookingId}.pdf`);
        document.body.appendChild(link);
        link.click();
    } catch (err) {
        toast.error("Download failed. Please try again.");
    }
};

  if (loading) return <div className="text-center py-20 text-yellow-500 font-black animate-pulse">GENERATING PASSES...</div>;

  return (
  <div className="min-h-screen bg-black text-white py-12 px-6">
    <div className="max-w-5xl mx-auto">
      <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-l-8 border-yellow-600 pl-6">
        Your <span className="text-yellow-500">Elite Vault</span>
      </h2>

      {bookings.length > 0 ? (
        <div className="grid gap-10">
          {bookings.map((booking) => (
            <div key={booking._id} className="relative bg-gray-900/40 border border-gray-800 rounded-[40px] overflow-hidden flex flex-col lg:flex-row items-center hover:border-yellow-600/50 transition-all duration-500 group">
              
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-16 bg-black rounded-r-full border-y border-r border-gray-800 hidden lg:block"></div>

              <div className="w-full lg:w-1/3 h-64 lg:h-full overflow-hidden">
                <img 
                  src={booking.eventSnapshot?.image || booking.event?.image || 'placeholder-image-url.jpg'} 
                  alt={booking.eventSnapshot?.title || booking.event?.title || 'Event Removed'} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>

              <div className="flex-1 p-10 space-y-4">
                <div>
                  <span className="text-yellow-600 font-black text-[10px] uppercase tracking-[0.4em]">Confirmed Entry</span>
                  <h3 className="text-3xl font-black uppercase italic mt-2">
                    {booking.eventSnapshot?.title || booking.event?.title}
                  </h3>
                </div>
                
                <div className="flex flex-wrap gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <p>📍 {booking.eventSnapshot?.locationArea || booking.event?.location?.area}</p>
                  <p>📅 {new Date(booking.eventSnapshot?.date || booking.event?.date).toDateString()}</p>
                  {/* 🎯 THE NEW TIER BADGE */}
                  <p className="text-yellow-500">🏷️ {booking.eventSnapshot?.ticketTierName || 'General Admission'}</p>
                  <p>🎟️ {booking.ticketsBooked} Pax</p>
                </div>

                <div className="pt-6 border-t border-gray-800/50">
                  <p className="text-[8px] text-gray-600 font-black uppercase mb-1">Transaction ID</p>
                  <p className="text-gray-400 font-mono text-xs">{booking._id}</p>
                </div>
              </div>

              <div className="w-full lg:w-1/4 p-10 bg-white/5 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-gray-800">
                <div className="p-3 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  <QRCodeCanvas 
                    value={`PASS_ID:${booking._id}|PAX:${booking.ticketsBooked}|HOLDER:${user.name}`}
                    size={120} 
                    level={"H"}
                    includeMargin={false}
                  />
                </div>
                
                <p className="mt-4 text-[8px] font-black uppercase text-yellow-600 tracking-widest animate-pulse text-center">
                  Scan at Entrance
                </p>
                
                <button 
                  onClick={() => handleDownload(booking._id)}
                  className="mt-8 w-full py-4 bg-yellow-600/10 border border-yellow-600/20 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] text-yellow-600 hover:bg-yellow-600 hover:text-black transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-gray-900 rounded-[50px]">
          <p className="text-gray-600 italic">The vault is currently empty.</p>
        </div>
      )}
    </div>
  </div>
);
};

export default MyBookings;