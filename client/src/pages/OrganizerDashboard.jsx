import { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from '../api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const { user, login } = useContext(AuthContext);
  const [stats, setStats] = useState({
    liveEvents: 0,
    totalReach: 0,
    potentialRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  // 🎯 RE-APPLICATION FORM STATE
  const [showReapplyForm, setShowReapplyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reapplyData, setReapplyData] = useState({
    organizationName: '', contactNumber: '', professionalLink: ''
  });
  const [reapplyFiles, setReapplyFiles] = useState({
    aadhaarCard: null, panCard: null, businessLicense: null
  });

  // 🛡️ 1. HOISTED STATS FUNCTION
  const fetchDashboardStats = useCallback(async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
      if (!storedUser) return;
      
      const token = storedUser.token;
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const myEvents = data.filter(event => event.organizer === storedUser._id);
      setEvents(myEvents);

      const liveCount = myEvents.length;
      const reach = myEvents.reduce((acc, event) => acc + (event.availableTickets || 0), 0);
      const revenue = myEvents.reduce((acc, event) => acc + ((event.availableTickets || 0) * (event.price || 0)), 0);

      setStats({
        liveEvents: liveCount, totalReach: reach, potentialRevenue: revenue
      });
      setLoading(false);
    } catch (err) {
      console.error("Dashboard Stats Error:", err);
      setLoading(false);
    }
  }, []);

  // 📡 2. THE LIVE PULSE LISTENER
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, { transports: ['websocket'] });
    socket.on('connect', () => console.log("📡 Dashboard Live Pulse: Connected"));
    socket.on('TICKET_SCANNED', (data) => {
      console.log("🔥 REAL-TIME SCAN DETECTED:", data);
      fetchDashboardStats(); 
    });
    return () => socket.disconnect(); 
  }, [fetchDashboardStats]);

  // 🔃 3. INITIAL LOAD
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const checkMyStatus = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, config);
      
      login({ ...storedUser, ...data }); 
      
      if (data.isApproved) {
        toast.success("Verification Successful! Welcome to the Command Center.");
        window.location.reload(); 
      } else if (data.status === 'rejected') {
        window.location.reload(); 
      } else {
        toast("Still Pending. Please wait for the SuperAdmin.", { icon: '⏳' });
      }
    } catch (err) {
      toast.error("Status check failed. Please try again later.");
    }
  };

  // 🎯 4. THE REDEMPTION LOOP (Updated with Form Data)
  const submitReapplication = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
      const config = { 
        headers: { 
          Authorization: `Bearer ${storedUser.token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };

      // STEP 1: Upload the new corrected files and text
      const formData = new FormData();
      if(reapplyData.organizationName) formData.append('organizationName', reapplyData.organizationName);
      if(reapplyData.contactNumber) formData.append('contactNumber', reapplyData.contactNumber);
      if(reapplyData.professionalLink) formData.append('professionalLink', reapplyData.professionalLink);
      
      if(reapplyFiles.aadhaarCard) formData.append('aadhaarCard', reapplyFiles.aadhaarCard);
      if(reapplyFiles.panCard) formData.append('panCard', reapplyFiles.panCard);
      if(reapplyFiles.businessLicense) formData.append('businessLicense', reapplyFiles.businessLicense);

      // Hit the profile route to save the new Cloudinary files
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, formData, config);

      // STEP 2: Trigger the status flip to 'pending'
      const jsonConfig = { headers: { Authorization: `Bearer ${storedUser.token}` } };
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/reapply`, {}, jsonConfig);
      
      toast.success(data.message);
      
      // Update local context
      const updatedUser = { ...storedUser, status: 'pending' };
      localStorage.setItem('eliteUser', JSON.stringify(updatedUser));
      login(updatedUser);
      
      window.location.reload(); 
    } catch (err) {
      toast.error("Failed to submit re-application. Please check your files.");
      setIsSubmitting(false);
    }
  };

  // 🚫 BLOCK 1: REJECTED STATE
  if (user?.role === 'Organizer' && user?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-center">
        <div className={`mx-auto p-8 bg-red-900/10 border border-red-900/30 rounded-3xl shadow-2xl transition-all duration-500 ${showReapplyForm ? 'max-w-2xl w-full' : 'max-w-md'}`}>
          {!showReapplyForm ? (
            <>
              <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">❌</div>
              <h3 className="text-xl font-black italic uppercase tracking-widest text-white mb-2">Application Declined</h3>
              <p className="text-gray-400 text-sm mb-8">
                Your request to join the Elite Organizer grid was not approved. Please review your documents and ensure your profile details are accurate before trying again.
              </p>
              <button 
                onClick={() => setShowReapplyForm(true)}
                className="w-full bg-transparent border border-yellow-600 text-yellow-500 hover:bg-yellow-600 hover:text-black font-black uppercase text-[10px] tracking-widest py-4 rounded-xl transition-all duration-300"
              >
                Fix & Re-Apply
              </button>
            </>
          ) : (
            <form onSubmit={submitReapplication} className="text-left space-y-6 animate-fadeIn">
              <h3 className="text-xl font-black italic uppercase tracking-widest text-yellow-500 border-b border-yellow-600/30 pb-4 text-center">Update Verification Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Organization / Brand Name" required
                  className="w-full p-3 bg-black border border-gray-800 rounded-lg focus:border-yellow-500 outline-none text-sm text-gray-200"
                  onChange={(e) => setReapplyData({...reapplyData, organizationName: e.target.value})} />
                <input type="tel" placeholder="Contact Number" required
                  className="w-full p-3 bg-black border border-gray-800 rounded-lg focus:border-yellow-500 outline-none text-sm text-gray-200"
                  onChange={(e) => setReapplyData({...reapplyData, contactNumber: e.target.value})} />
                <input type="url" placeholder="Professional Link (LinkedIn, Insta)" required
                  className="w-full p-3 bg-black border border-gray-800 rounded-lg focus:border-yellow-500 outline-none text-sm text-gray-200 md:col-span-2"
                  onChange={(e) => setReapplyData({...reapplyData, professionalLink: e.target.value})} />
              </div>

              <div className="space-y-4 bg-black/50 p-4 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Upload Corrected Documents (PDF/Image)</p>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-yellow-600">Aadhaar Card</label>
                  <input type="file" accept=".jpg,.png,.pdf" required onChange={(e) => setReapplyFiles({...reapplyFiles, aadhaarCard: e.target.files[0]})}
                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-yellow-600 file:text-black hover:file:bg-yellow-500 cursor-pointer" />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-yellow-600">PAN Card</label>
                  <input type="file" accept=".jpg,.png,.pdf" required onChange={(e) => setReapplyFiles({...reapplyFiles, panCard: e.target.files[0]})}
                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-yellow-600 file:text-black hover:file:bg-yellow-500 cursor-pointer" />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-yellow-600">Business License / GST</label>
                  <input type="file" accept=".jpg,.png,.pdf" required onChange={(e) => setReapplyFiles({...reapplyFiles, businessLicense: e.target.files[0]})}
                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-yellow-600 file:text-black hover:file:bg-yellow-500 cursor-pointer" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowReapplyForm(false)} className="w-1/3 bg-gray-800 text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="w-2/3 bg-yellow-600 text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition disabled:opacity-50">
                  {isSubmitting ? 'Uploading to Vault...' : 'Submit New Documents'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ⏳ BLOCK 2: PENDING STATE
  // ... (Keep your exact Block 2 here, no changes needed) ...

  if (user?.role === 'Organizer' && !user?.isApproved && !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-yellow-600/10 rounded-full flex items-center justify-center animate-pulse border border-yellow-600/20">
            <span className="text-5xl">⏳</span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-yellow-600 text-black text-[8px] font-black px-2 py-1 rounded-md uppercase">Pending</div>
        </div>
        <h2 className="text-white font-black text-4xl uppercase italic tracking-tighter">Verification <span className="text-yellow-500">Required</span></h2>
        <p className="text-gray-500 mt-4 max-w-sm mx-auto text-sm leading-relaxed">
          "Prashant, your account is currently in the audit queue. Our SuperAdmin verifies every organizer to ensure the 'Elite' quality of Ahmedabad events."
        </p>
        <button onClick={checkMyStatus} className="mt-8 bg-yellow-600 text-black px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-lg">
          Sync Elite Status ⚡
        </button>
      </div>
    );
  }

  // ✅ BLOCK 3: APPROVED STATE (The Command Center)
  // ... (Keep your exact Block 3 here, no changes needed) ...
  return (
    <div className="min-h-screen bg-black p-6 md:p-10">
      <div className="bg-gray-900 border border-yellow-600 p-8 rounded-2xl shadow-2xl">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
          <div>
            <h2 className="text-4xl font-black text-yellow-500 italic tracking-tighter">
              COMMAND <span className="text-white">CENTER</span>
            </h2>
            <p className="text-gray-400">Welcome back, {user?.name || 'Organizer'}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard/create" className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-6 rounded-xl shadow-lg transition-all text-xs uppercase tracking-tighter">
              + Create Event
            </Link>

            <Link to="/manage-events" className="bg-gray-800 border border-gray-700 hover:border-yellow-600 text-gray-300 py-3 px-6 rounded-xl transition-all text-xs font-bold uppercase tracking-tighter">
              ⚙️ Manage
            </Link>

            {/* 🎯 INTEGRATED SCANNER BUTTON */}
            <Link to="/scanner" className="bg-red-600 hover:bg-red-500 text-white font-black py-3 px-6 rounded-xl shadow-lg transition-all text-xs uppercase tracking-tighter flex items-center gap-2">
              📸 Scan Tickets
            </Link>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-black border border-gray-800 p-6 rounded-2xl">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Live Events</p>
            <h2 className="text-5xl font-black text-white italic">
              {stats.liveEvents < 10 ? `0${stats.liveEvents}` : stats.liveEvents}
            </h2>
          </div>

          <div className="bg-black border border-gray-800 p-6 rounded-2xl">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Ahmedabad Reach</p>
            <h2 className="text-5xl font-black text-white italic">
              {stats.totalReach >= 1000 ? `${(stats.totalReach / 1000).toFixed(1)}k` : stats.totalReach}
            </h2>
          </div>

          <div className="bg-black border border-gray-800 p-6 rounded-2xl border-l-4 border-l-yellow-600">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Revenue (INR)</p>
            <h2 className="text-5xl font-black text-yellow-500 italic">
              ₹{stats.potentialRevenue >= 1000 ? `${(stats.potentialRevenue / 1000).toFixed(0)}k` : stats.potentialRevenue}
            </h2>
          </div>
        </div>

        {/* LIVE PREVIEW SECTION */}
        <div className="mt-10 bg-gray-900/20 border-2 border-dashed border-gray-800 rounded-[2.5rem] p-10">
          {events.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em]">Current Live Listings</h3>
                <Link to="/manage-events" className="text-yellow-600 text-[10px] font-bold uppercase hover:underline">View All Details</Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {events.slice(0, 4).map(event => (
                  <div key={event._id} className="group relative h-40 bg-black rounded-2xl overflow-hidden border border-gray-800 hover:border-yellow-600 transition-all">
                    <img 
                      src={event.image} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                      alt={event.title} 
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                      <p className="text-white text-xs font-bold truncate uppercase italic">{event.title}</p>
                      <p className="text-yellow-500 text-[10px] font-black uppercase tracking-tighter">₹{event.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-4xl mb-4">🎪</div>
              <h3 className="text-xl font-bold text-gray-500 uppercase italic">Your Ahmedabad Event List is Empty</h3>
              <Link to="/dashboard/create" className="text-yellow-500 font-black uppercase tracking-widest text-xs border-b-2 border-yellow-500 pb-1">
                Start your first event now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;