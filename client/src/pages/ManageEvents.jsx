import { useEffect, useState } from 'react';
import axios from '../api'; // Or standard axios if you aren't using an instance
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageEvents = () => {
  // 1. Separate state for Upcoming and Past events
  const [activeEvents, setActiveEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 2. State to handle which tab is currently selected
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'

  const fetchMyEvents = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
      const token = storedUser.token;

      // 🎯 USE THE NEW ROUTE: It already filters by your ID and splits by date!
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/organizer-events`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // The backend sends exactly what we need now
      setActiveEvents(response.data.activeEvents || []);
      setPastEvents(response.data.pastEvents || []);
      setLoading(false);
    } catch (err) {
      console.error("Management Fetch Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This event will be removed from the Elite Grid forever.")) {
      try {
        const token = JSON.parse(localStorage.getItem('eliteUser')).token;
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Remove from UI instantly (Only active events can be deleted anyway)
        setActiveEvents(activeEvents.filter(event => event._id !== id));
        toast.success("Event Deleted Successfully.");
      } catch (err) {
        toast.error("Delete failed. Check your connection.");
      }
    }
  };

  if (loading) return <div className="text-center py-20 text-yellow-500 font-bold">LOADING THE GRID...</div>;

  // Determine which list to show based on the active tab
  const displayedEvents = activeTab === 'upcoming' ? activeEvents : pastEvents;

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Manage <span className="text-yellow-500">Events</span>
        </h2>
        <Link to="/dashboard/create" className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg transition">
          + New Event
        </Link>
      </div>

      {/* 🎯 TAB NAVIGATION */}
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-2 font-bold rounded-t-lg transition ${
            activeTab === 'upcoming' 
            ? 'bg-gray-900 text-yellow-500 border-t border-l border-r border-gray-800' 
            : 'bg-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          UPCOMING ({activeEvents.length})
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={`px-6 py-2 font-bold rounded-t-lg transition ${
            activeTab === 'past' 
            ? 'bg-gray-900 text-yellow-500 border-t border-l border-r border-gray-800' 
            : 'bg-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          PAST EVENTS ({pastEvents.length})
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-b-2xl rounded-tr-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-gray-500 text-xs uppercase tracking-[0.2em] border-b border-gray-800">
              <th className="p-5">Event</th>
              <th className="p-5">Date</th>
              <th className="p-5">Price</th>
              <th className="p-5 text-right">Status / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {displayedEvents.map((event) => (
              <tr key={event._id} className="hover:bg-white/5 transition-colors group">
                <td className="p-5">
                  <div className="flex items-center gap-4">
                    <img src={event.image} className="w-12 h-12 rounded-lg object-cover border border-gray-800" alt="" />
                    <div>
                      <div className="text-white font-bold">{event.title}</div>
                      <div className="text-gray-500 text-xs">{event.location?.area || 'TBA'}</div>
                    </div>
                  </div>
                </td>
                <td className="p-5 text-gray-300 text-sm">
                  {new Date(event.date).toLocaleDateString()}
                </td>
                <td className="p-5 text-yellow-500 font-mono font-bold">
                  ₹{event.price}
                </td>
                <td className="p-5 text-right space-x-3">
                  
                  {/* 🎯 CONDITIONAL ACTIONS: Only show Edit/Delete if on the 'upcoming' tab */}
                  {activeTab === 'upcoming' ? (
                    <>
                      <Link to={`/edit-event/${event._id}`} className="text-xs font-bold text-blue-400 hover:underline uppercase">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(event._id)} className="text-xs font-bold text-red-500 hover:underline uppercase">
                        Delete
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                      Completed
                    </span>
                  )}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {displayedEvents.length === 0 && (
          <div className="p-20 text-center text-gray-600 italic">
            {activeTab === 'upcoming' 
              ? "No upcoming events found in your cluster." 
              : "You have no past events."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;