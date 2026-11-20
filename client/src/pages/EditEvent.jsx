import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api';
import toast from 'react-hot-toast';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', price: 0, 
    category: 'Music', customCategory: '',
    availableTickets: 50,
    area: 'Satellite', customArea: '',
    address: ''
  });

  const [showCustomArea, setShowCustomArea] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const categories = ["Music", "Sports", "Tech", "Food", "Workshop", "Other (Custom)"];
  const ahmedabadAreas = ["Motera", "Satellite", "Vastrapur", "Prahladnagar", "Gota", "Bopal", "CG Road", "Other (Custom)"];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/all`);
        const eventToEdit = data.find(e => e._id === id);
        
        if (eventToEdit) {
          setFormData({
            title: eventToEdit.title,
            description: eventToEdit.description,
            date: eventToEdit.date.split('T')[0],
            price: eventToEdit.price,
            category: eventToEdit.category,
            availableTickets: eventToEdit.availableTickets,
            area: eventToEdit.location.area,
            address: eventToEdit.location.address
          });
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalArea = showCustomArea ? formData.customArea : formData.area;
    const finalCategory = showCustomCategory ? formData.customCategory : formData.category;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('date', formData.date);
    data.append('price', formData.price);
    data.append('category', finalCategory);
    data.append('availableTickets', formData.availableTickets);
    data.append('location[area]', finalArea);
    data.append('location[address]', formData.address);
    if (image) data.append('image', image);

    try {
      const token = JSON.parse(localStorage.getItem('eliteUser')).token;
      await axios.put(`${import.meta.env.VITE_API_URL}/api/events/${id}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Elite Update: Event fully synchronized.");
      navigate('/manage-events');
    } catch (err) {
      toast.error("Update failed. Ensure all fields are valid.");
    }
  };

  if (loading) return <div className="text-center py-20 text-yellow-500 font-black animate-pulse uppercase italic">Syncing with Cloud...</div>;

  return (
    <div className="py-10 flex justify-center">
      <div className="bg-gray-900 border border-yellow-600 p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-3xl font-black text-yellow-500 mb-6 italic uppercase tracking-tighter underline decoration-yellow-800">Edit Elite Event</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. IMAGE UPLOAD */}
          <div className="border-2 border-dashed border-gray-800 rounded-xl p-4 text-center hover:border-yellow-600 transition cursor-pointer">
            <label className="cursor-pointer text-xs text-gray-500 uppercase font-bold tracking-widest block">
              {image ? `New Poster: ${image.name}` : "Change Event Poster? (Optional)"}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
            </label>
          </div>

          {/* 2. TITLE & CATEGORY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={formData.title} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white outline-none focus:border-yellow-500"
              placeholder="Event Title" onChange={(e) => setFormData({...formData, title: e.target.value})} required />
            
            <select value={formData.category} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-yellow-500 outline-none"
              onChange={(e) => {
                const val = e.target.value;
                setShowCustomCategory(val === "Other (Custom)");
                setFormData({...formData, category: val});
              }}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {showCustomCategory && (
            <input type="text" className="w-full p-3 bg-yellow-900/10 border border-yellow-700 rounded-xl text-white outline-none"
              placeholder="Custom Category Name" onChange={(e) => setFormData({...formData, customCategory: e.target.value})} required />
          )}

          {/* 3. DATE, TICKETS & PRICE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="date" value={formData.date} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white outline-none focus:border-yellow-500"
              style={{ colorScheme: 'dark' }} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
            <input type="number" value={formData.availableTickets} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white outline-none focus:border-yellow-500"
              placeholder="Tickets" onChange={(e) => setFormData({...formData, availableTickets: e.target.value})} required />
            <input type="number" value={formData.price} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white outline-none focus:border-yellow-500"
              placeholder="Price (₹)" onChange={(e) => setFormData({...formData, price: e.target.value})} required />
          </div>

          {/* 4. AREA & ADDRESS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={formData.area} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-yellow-500 outline-none"
              onChange={(e) => {
                const val = e.target.value;
                setShowCustomArea(val === "Other (Custom)");
                setFormData({...formData, area: val});
              }}>
              {ahmedabadAreas.map(area => <option key={area} value={area}>{area}</option>)}
            </select>
            <input type="text" value={formData.address} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white outline-none focus:border-yellow-500"
              placeholder="Venue Address" onChange={(e) => setFormData({...formData, address: e.target.value})} required />
          </div>

          {showCustomArea && (
            <input type="text" className="w-full p-3 bg-yellow-900/10 border border-yellow-700 rounded-xl text-white outline-none"
              placeholder="Custom Area Name" onChange={(e) => setFormData({...formData, customArea: e.target.value})} required />
          )}

          {/* 5. DESCRIPTION */}
          <textarea value={formData.description} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white outline-none focus:border-yellow-500 h-28 resize-none"
            placeholder="Description" onChange={(e) => setFormData({...formData, description: e.target.value})} required />

          <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-xl transition shadow-lg active:scale-95 shadow-yellow-900/30">
            SAVE UPDATED EVENT
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;