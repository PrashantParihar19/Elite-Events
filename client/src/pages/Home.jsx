import { useState, useEffect } from 'react';
import axios from '../api';
import EventCard from '../components/EventCard';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [userBookings, setUserBookings] = useState([]); 
  const [organizerEvents, setOrganizerEvents] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [pastEvents, setPastEvents] = useState([]);
  const [pastVisibleCount, setPastVisibleCount] = useState(4);
  const location = useLocation();

  const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
  const userRole = storedUser?.role?.toLowerCase(); 
  const isSystemAdmin = storedUser?.isAdmin === true; 
  const navigate = useNavigate(); 
  const categories = ["All", "Sports", "Music", "Food", "Tech", "Comedy", "Workshop"];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Inside fetchInitialData in Home.jsx
        const config = storedUser?.token ? { 
          headers: { 
            Authorization: `Bearer ${storedUser.token}`,
            "ngrok-skip-browser-warning": "true" 
          } 
        } : {}; // Empty headers if guest
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/all`, config);

        console.log("DEBUG: Global Events Received:", data.length);
        setEvents(data);
        setFilteredEvents(data);

        if (storedUser?.token) {
          const config = { 
            headers: { 
              Authorization: `Bearer ${storedUser.token}`,
              "ngrok-skip-browser-warning": "true" 
            } 
          };
          
          if (isSystemAdmin) {
            setOrganizerEvents(data); 
          } else if (userRole === 'organizer') {
            const { data: response } = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/organizer-events`, config);
            
            // 🎯 THE FIX: Extract payload and combine active + past into one array
            const payload = response.data ? response.data : response;
            const combinedEvents = [...(payload.activeEvents || []), ...(payload.pastEvents || [])];

            console.log("DEBUG: Organizer Events Received:", combinedEvents.length);
            setOrganizerEvents(combinedEvents);
          } else {
            // 🎯 FETCH PASSES FOR PRINCE/USER
            try {
              const { data: response } = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/my-tickets`, config);
              setUserBookings(response.data || []);
            } catch (err) {
              console.error("Ticket Fetch Failed:", err);
            }
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Elite Error:", error);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

useEffect(() => {
  const term = searchTerm.toLowerCase();
  const now = new Date().getTime();
  const gracePeriod = 60 * 60 * 1000; 

  // 1. UPCOMING LOGIC
  const upcoming = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(term) || 
                          event.location.area.toLowerCase().includes(term);
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const eventDate = new Date(event.date);
    const endOfEventDay = new Date(eventDate).setHours(23, 59, 59, 999);
    const isStillValid = now < (endOfEventDay + gracePeriod);

    return matchesSearch && matchesCategory && isStillValid;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  // 2. THE SECURE ARCHIVE LOGIC
  const archive = events.filter((event) => {
    const eventDate = new Date(event.date);
    const endOfEventDay = new Date(eventDate).setHours(23, 59, 59, 999);
    const isPast = now >= (endOfEventDay + gracePeriod);

    if (!isPast) return false;

    // RULE 1: GUESTS (Hide everything)
    if (!storedUser) return false;

    // RULE 2: ORGANIZERS & ADMINS (Show only THEIR events)
    if (userRole === 'organizer' || isSystemAdmin) {
      // 🎯 FIXED: Check for both _id and id
      const currentUserId = storedUser._id || storedUser.id;
      return event.organizer === currentUserId && (selectedCategory === "All" || event.category === selectedCategory);
    }

    // 🎯 RULE 3: NORMAL USERS (THE FIX)
    // Check if the user's booking list includes this specific past event
    const hasBookedThisEvent = userBookings.some(booking => 
      (booking.event?._id || booking.event) === event._id
    );
// Only show it if they bought a ticket AND it matches the search category
    return hasBookedThisEvent && (selectedCategory === "All" || event.category === selectedCategory);
    
  })
  // Sorted Descending (Most recent past date first)
  .sort((a, b) => new Date(b.date) - new Date(a.date));

  setFilteredEvents(upcoming);
  setPastEvents(archive);

  // 🎯 THE FIX IS HERE: We watch storedUser?._id (a string) instead of the object
}, [searchTerm, selectedCategory, events, storedUser?._id, storedUser?.id, userRole, isSystemAdmin,userBookings]);
  
  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const catParam = params.get('category');
  
  if (catParam) {
    setSelectedCategory(catParam);
    // Smooth scroll to grid so they see the result
    document.getElementById('discovery-grid')?.scrollIntoView({ behavior: 'smooth' });
  }
}, [location.search]);

  const renderUserTickets = () => {
    return userBookings.map((booking) => (
      <div 
        key={booking._id} 
        className="min-w-[320px] bg-gradient-to-br from-gray-900 to-black border border-yellow-500/20 p-5 rounded-3xl flex gap-5 items-center group hover:border-yellow-500/50 transition-all cursor-pointer relative overflow-hidden"
        onClick={() => navigate(`/my-tickets/${booking._id}`)}
      >
        {/* 🎨 UI: LEFT PERFORATION CIRCLE */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-full border border-yellow-500/20 z-10"></div>
        
        {/* 🎨 UI: RIGHT PERFORATION CIRCLE */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-full border border-yellow-500/20 z-10"></div>

        {/* 🎨 UI: DOTTED PERFORATION LINE */}
        <div className="absolute right-[52px] top-0 bottom-0 w-[1px] border-r border-dashed border-white/10"></div>

        {/* DATA: EVENT IMAGE */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-gray-800 z-0">
          <img 
            src={booking.event?.image} 
            className="w-full h-full object-cover group-hover:scale-110 transition-all" 
            alt="Event" 
          />
        </div>

        {/* DATA: EVENT DETAILS */}
        <div className="flex-grow z-0">
          <span className="text-[7px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-2 py-0.5 rounded">
            Confirmed Pass
          </span>
          <p className="font-black uppercase text-xs text-white truncate w-32 mb-1">
            {booking.event?.title}
          </p>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
            📍 {booking.event?.location?.area}
          </p>
        </div>

        {/* DATA: ACTION ARROW */}
        <div className="h-full flex items-center pr-2 z-0">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs group-hover:bg-yellow-500 group-hover:text-black transition-all">
            →
          </div>
        </div>
      </div>
    ));
  };

  const renderManagementGrid = () => {
    return organizerEvents.map(event => (
      <div key={event._id} className="min-w-[300px] bg-gray-900/50 border border-yellow-600/30 p-5 rounded-3xl group hover:border-yellow-500 transition-all cursor-pointer" onClick={() => navigate(`/dashboard/`)}>
        <p className="font-black uppercase text-xs text-yellow-500 truncate mb-4 tracking-tight">{event.title}</p>
        <div className="flex justify-between items-end gap-4">
          <div className="flex flex-col gap-2 flex-grow">
            <div className="flex justify-between items-center">
              <span className="text-[8px] text-gray-500 uppercase font-black tracking-[0.2em]">{event.attendees?.length > 0 ? "Active Traffic" : "Launch Ready"}</span>
            </div>
            <p className="text-2xl font-black text-white tracking-tighter">{event.attendees?.length || 0} <span className="text-[10px] text-gray-600">/ {event.availableTickets}</span></p>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500" style={{ width: `${(event.attendees?.length / event.availableTickets) * 100}%` }}></div>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/edit-event/${event._id}`); }} className="text-[9px] font-black uppercase text-black bg-yellow-500 px-4 py-2 rounded-xl">Quick Edit</button>
        </div>
      </div>
    ));
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 font-black italic underline tracking-widest">SYNCING THE ELITE GRID...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
{/* 1. HERO & SEARCH - ELITE 2.0 */}
<div className="pt-24 pb-12 px-6 text-center relative overflow-hidden">
  
  {/* Subtle Background Glow (The "Aura") */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-600/10 blur-[120px] rounded-full pointer-events-none"></div>

  <div className="relative z-10">
    {/* Main Title with Metallic Gradient */}
    <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter mb-2 flex flex-col md:block">
      <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">Elite</span>
      <span className="bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 bg-clip-text text-transparent ml-0 md:ml-2">
        Events
      </span>
    </h1>

    {/* Refined Slogan */}
    <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-[0.8em] font-bold mb-16 opacity-70">
      Elite Planning for <span className="text-gray-400">Every Occasion</span>
    </p>

    {/* Category Pill Navigation (Refined) */}
    <div className="max-w-4xl mx-auto mb-12 flex gap-4 overflow-x-auto no-scrollbar pb-4 justify-start md:justify-center">
      {categories.map((cat) => (
        <button 
          key={cat} 
          onClick={() => setSelectedCategory(cat)} 
          className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${
            selectedCategory === cat 
            ? "bg-yellow-500 text-black border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-105" 
            : "bg-white/5 border-white/10 text-gray-500 hover:border-yellow-500/50 hover:text-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>

    {/* The "Stealth" Search Bar */}
    <div className="max-w-2xl mx-auto relative group px-4">
      <div className="absolute -inset-1 bg-yellow-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div className="relative">
        <input 
          type="text" 
          placeholder="Find your vibe in Ahmedabad..." 
          className="w-full pl-14 pr-6 py-5 bg-[#0a0a0a] border border-white/5 rounded-2xl outline-none focus:border-yellow-500/40 italic font-bold text-white transition-all shadow-2xl" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl opacity-30 group-hover:opacity-100 group-focus-within:text-yellow-500 transition-all duration-300">
          🔍
        </span>
      </div>
    </div>
  </div>
</div>

      {/* 2. MANAGEMENT VIEWS (Admin/Organizer) */}
      {(isSystemAdmin || userRole === 'organizer') && (
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <h2 className="text-xs font-black text-yellow-600 uppercase tracking-[0.5em] mb-6">
            {isSystemAdmin ? "SuperAdmin: Global Management" : "Your Conducted Events"}
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
            {renderManagementGrid()}
          </div>
        </div>
      )}

      {/* 3. 🎯 USER PASSES VIEW (Prince's Tickets) */}
      {userBookings.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mb-20">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.4em] mb-1">Personal Ecosystem</h2>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter">Your Active Passes</h3>
            </div>
            <button onClick={() => navigate('/my-bookings')} className="text-[9px] font-black uppercase text-gray-500 hover:text-white border-b border-gray-800 pb-1">View All History</button>
          </div>
          
        <div className="relative">
          {/* Optional: Left & Right Fades to indicate more passes */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

          <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
            {renderUserTickets()}
          </div>
        </div>
        </div>
      )}

    {/* 4. DISCOVERY GRID - Curated View */}
    <div  id="discovery-grid" className="max-w-7xl mx-auto px-6 pb-24">
      <h2 className="text-xs font-black text-gray-600 uppercase tracking-[0.5em] mb-10 border-b border-gray-900 pb-4">
        Upcoming Discoveries
      </h2>
       
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {/* 🎯 THE SLICE: Only show up to visibleCount */}
        {filteredEvents.slice(0, visibleCount).map(event => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>

      {/* 🎯 VIEW MORE BUTTON: Only shows if there are more events to reveal */}
      {filteredEvents.length > visibleCount && (
        <div className="mt-16 flex justify-center">
          <button 
            onClick={() => setVisibleCount(prev => prev + 6)}
            className="group relative px-12 py-4 bg-transparent border border-yellow-500/30 rounded-2xl overflow-hidden transition-all hover:border-yellow-500"
          >
            <div className="absolute inset-0 bg-yellow-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 group-hover:text-white transition-colors">
              Expand the Grid
            </span>
          </button>
        </div>
      )}
      </div>
{/* 5. THE ARCHIVE: Past Experiences (Horizontal Stealth Version) */}
{pastEvents.length > 0 && (
  <div className="max-w-7xl mx-auto px-6 pb-32 border-t border-gray-900/50 pt-20">
    <div className="flex justify-between items-end mb-10">
      <div>
        <h2 className="text-[10px] font-black text-yellow-600/40 uppercase tracking-[0.5em] mb-2">The Archive</h2>
        <h3 className="text-3xl font-black italic uppercase text-gray-500">Past Experiences</h3>
      </div>
      
      {/* 🎯 View All History Link on the Right */}
      <button 
        onClick={() => navigate('/my-bookings')} 
        className="text-[9px] font-black uppercase text-gray-600 hover:text-yellow-500 border-b border-transparent hover:border-yellow-500 pb-1 transition-all"
      >
        Explore Full History →
      </button>
    </div>

    {/* Horizontal Scroll for Archive */}
    <div className="flex gap-6 overflow-x-auto pb-10 no-scrollbar scroll-smooth">
      {pastEvents.slice(0, 8).map(event => (
        <div key={event._id} className="min-w-[300px] md:min-w-[350px] transition-all duration-700">
           <EventCard event={event} isPast={true} /> 
        </div>
      ))}
      
      {/* 🎯 "THE END" Card for the scroll */}
      {pastEvents.length > 8 && (
        <div 
          onClick={() => navigate('/my-bookings')}
          className="min-w-[200px] flex flex-col items-center justify-center bg-white/5 border border-dashed border-gray-800 rounded-xl cursor-pointer group hover:border-yellow-500/50 transition-all"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-yellow-500">
            + {pastEvents.length - 8} More
          </p>
          <span className="text-[8px] text-gray-700 font-bold uppercase mt-2 italic">View Full Archive</span>
        </div>
      )}
    </div>
  </div>
)}<Footer />    
</div>
      
  );
};

export default Home;