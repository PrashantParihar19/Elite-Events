import { useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', 
    category: 'Music', customCategory: '',
    area: 'Satellite', customArea: '',
    address: ''
  });
  
  // 🎯 NEW: Dynamic Ticket Tiers State
  const [ticketTiers, setTicketTiers] = useState([
    { name: 'General Admission', price: 0, quantity: 50 }
  ]);

  const [image, setImage] = useState(null); 
  const [aiLoading, setAiLoading] = useState(false);
  const [showCustomArea, setShowCustomArea] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const navigate = useNavigate();

  const categories = ["Music", "Sports", "Tech", "Food", "Workshop","Art","eSports","Entertainment","Other (Custom)"];
  const ahmedabadAreas = ["Motera", "Satellite", "Vastrapur", "Prahladnagar", "Gota", "Bopal", "CG Road", "Other (Custom)"];

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "Other (Custom)") {
      setShowCustomCategory(true);
      setFormData({ ...formData, category: "Other" });
    } else {
      setShowCustomCategory(false);
      setFormData({ ...formData, category: value });
    }
  };

  const handleAreaChange = (e) => {
    const value = e.target.value;
    if (value === "Other (Custom)") {
      setShowCustomArea(true);
      setFormData({ ...formData, area: "Other" });
    } else {
      setShowCustomArea(false);
      setFormData({ ...formData, area: value });
    }
  };

  // 🎯 TIER MANAGEMENT FUNCTIONS
  const handleTierChange = (index, field, value) => {
    const updatedTiers = [...ticketTiers];
    updatedTiers[index][field] = value;
    setTicketTiers(updatedTiers);
  };

  const addTier = () => {
    setTicketTiers([...ticketTiers, { name: '', price: 0, quantity: 10 }]);
  };

  const removeTier = (index) => {
    if (ticketTiers.length === 1) return toast.error("You must have at least one ticket tier.");
    const updatedTiers = ticketTiers.filter((_, i) => i !== index);
    setTicketTiers(updatedTiers);
  };

  const handleAIDescription = async () => {
    if (!formData.title || !formData.category) {
      return toast.error("Please enter a Title and Category first so the AI has context!");
    }
    try {
      setAiLoading(true);
      const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
      const token = storedUser?.token;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/generate`, {
        title: formData.title,
        category: formData.category,
        location: "Ahmedabad"
      });

      setFormData({ ...formData, description: data.description });
    } catch (err) {
      console.error("AI Error:", err.response?.data || err.message);
      toast.error("AI generation failed. Please type manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalArea = showCustomArea ? formData.customArea.trim() : formData.area;
    const finalCategory = showCustomCategory ? formData.customCategory.trim() : formData.category;

    if (!finalArea || !finalCategory) {
      toast.error("Please provide both a category and an area.");
      return;
    }

    // Validate Tiers
    const isTiersValid = ticketTiers.every(tier => tier.name && tier.price >= 0 && tier.quantity > 0);
    if (!isTiersValid) {
      return toast.error("Please ensure all ticket tiers have a name, price, and valid quantity.");
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('date', formData.date);
    data.append('category', finalCategory);
    data.append('location[area]', finalArea);
    data.append('location[address]', formData.address);
    
    // 🎯 Stringify the array so FormData can handle it
    data.append('ticketTiers', JSON.stringify(ticketTiers));

    if (image) {
      data.append('image', image);
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
      const token = storedUser.token;
      
      await axios.post(`${import.meta.env.VITE_API_URL}/api/events/create`, 
        data, 
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      toast.success(`Elite Update: "${formData.title}" is now published!`);
      navigate('/dashboard');
    } catch (err) {
      console.error("Creation failed", err);
      toast.error("Error: Please ensure your image is under 5MB and all fields are filled.");
    }
  };

  return (
    <div className="py-10 flex justify-center">
      <div className="max-w-2xl w-full bg-gray-900 border border-yellow-600 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-black text-yellow-500 mb-6 italic tracking-tight uppercase">
          Create Elite Event
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
              Event Poster (Cloud Upload)
            </label>
            <div className="relative group border-2 border-dashed border-gray-800 rounded-2xl p-6 text-center hover:border-yellow-600 transition-all cursor-pointer bg-black/50">
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setImage(e.target.files[0])}
                required
              />
              <div className="space-y-2">
                <div className="text-3xl">🖼️</div>
                <p className="text-sm text-gray-400">
                  {image ? (
                    <span className="text-yellow-500 font-bold">Selected: {image.name}</span>
                  ) : (
                    "Click to upload or drag your poster here"
                  )}
                </p>
                <p className="text-[10px] text-gray-600 italic">Supports: JPG, PNG, WEBP (Max 5MB)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Event Title</label>
              <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded-xl focus:border-yellow-500 outline-none text-white"
                placeholder="e.g. IPL 2026 Final Screening"
                onChange={(e) => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Category</label>
              <select className="w-full p-3 bg-black border border-gray-800 rounded-xl text-yellow-500 outline-none"
                onChange={handleCategoryChange}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {showCustomCategory && (
            <input type="text" className="w-full p-3 bg-yellow-900/10 border border-yellow-700 rounded-xl text-white outline-none animate-pulse"
              placeholder="Enter Custom Category (e.g. Comedy, Art Expo)"
              onChange={(e) => setFormData({...formData, customCategory: e.target.value})} required />
          )}

          {/* 🎯 DATE ONLY (Moved Price and Tickets to the Tiers section below) */}
          <div className="grid grid-cols-1 gap-4">
            <div className="relative group">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  min={new Date().toISOString().split("T")[0]} 
                  className="w-full p-3 bg-black border border-gray-800 rounded-xl focus:border-yellow-500 outline-none text-white cursor-pointer appearance-none"
                  style={{ colorScheme: 'dark' }}
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  required 
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-yellow-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 🎯 THE NEW TICKET TIERS SECTION */}
          <div className="p-5 bg-black/40 border border-gray-800 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Ticket Pricing Tiers</label>
              <button type="button" onClick={addTier} className="text-[10px] font-black uppercase tracking-widest text-yellow-500 hover:text-white transition-colors bg-yellow-600/10 px-3 py-1 rounded-md">
                + Add Tier
              </button>
            </div>
            
            {ticketTiers.map((tier, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <div className="md:col-span-5">
                  <input type="text" placeholder="Tier Name (e.g. VIP)" className="w-full p-2 bg-black border border-gray-800 rounded-lg focus:border-yellow-500 outline-none text-white text-sm"
                    value={tier.name} onChange={(e) => handleTierChange(index, 'name', e.target.value)} required />
                </div>
                <div className="md:col-span-3">
                  <input type="number" min="0" placeholder="Price (₹)" className="w-full p-2 bg-black border border-gray-800 rounded-lg focus:border-yellow-500 outline-none text-white text-sm"
                    value={tier.price} onChange={(e) => handleTierChange(index, 'price', e.target.value)} required />
                </div>
                <div className="md:col-span-3">
                  <input type="number" min="1" placeholder="Qty" className="w-full p-2 bg-black border border-gray-800 rounded-lg focus:border-yellow-500 outline-none text-white text-sm"
                    value={tier.quantity} onChange={(e) => handleTierChange(index, 'quantity', e.target.value)} required />
                </div>
                <div className="md:col-span-1 text-center">
                  <button type="button" onClick={() => removeTier(index)} className="text-red-500 hover:text-red-400 font-bold text-xl">×</button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Ahmedabad Area</label>
              <select className="w-full p-3 bg-black border border-gray-800 rounded-xl text-yellow-500 outline-none"
                onChange={handleAreaChange}>
                {ahmedabadAreas.map(area => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>
            {showCustomArea && (
            <input type="text" className="w-full p-3 bg-yellow-900/10 border border-yellow-700 rounded-xl text-white outline-none animate-pulse"
              placeholder="Enter Custom Area (e.g. Maninagar, Nikol)"
              onChange={(e) => setFormData({...formData, customArea: e.target.value})} required />
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Venue/Address</label>
              <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded-xl focus:border-yellow-500 outline-none text-white"
                placeholder="e.g. Narendra Modi Stadium, Gate 4"
                onChange={(e) => setFormData({...formData, address: e.target.value})} required />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase text-gray-500">Event Description</label>
            <button 
              type="button"
              onClick={handleAIDescription}
              className="text-[10px] font-black text-yellow-500 hover:text-white uppercase tracking-tighter transition-all flex items-center gap-1"
            >
              {aiLoading ? "✨ Thinking..." : "✨ Generate with AI"}
            </button>
          </div>
            <textarea className="w-full bg-black border border-gray-800 rounded-2xl p-4 h-32 focus:border-yellow-600 outline-none transition-all"
              placeholder="What's the vibe?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})} required />
          </div>

          <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-xl transition shadow-lg active:scale-95 shadow-yellow-900/20">
            PUBLISH TO ELITE GRID
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;