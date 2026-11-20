import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${storedUser.token}` }
        });
        setProfileData(data);
        // 🎯 Initialize form data with fetched profile
        setFormData({ name: data.name, bio: data.bio || '' });
        setLoading(false);
      } catch (err) {
        console.error("Profile Fetch Error", err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

 const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
      
      // 🎯 1. This box contains the IMAGE
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('bio', formData.bio);
      if (selectedFile) {
        dataToSend.append('image', selectedFile);
      }

      // 🎯 2. YOU MUST SEND 'dataToSend' HERE! (Was previously sending 'formData')
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile`, 
        dataToSend, // ✅ Correct box
        {
          headers: { 
            Authorization: `Bearer ${storedUser.token}`,
            'Content-Type': 'multipart/form-data' // ⚡ Required for photos
          }
        }
      );

      setProfileData(data);
      
      // 🔄 3. Update LocalStorage so the Navbar knows you have a photo
      localStorage.setItem('eliteUser', JSON.stringify({ ...storedUser, ...data }));

      setIsEditing(false);
      toast.success("Identity Updated Successfully!");
    } catch (err) {
      console.error("Update Error:", err.response?.data || err.message);
      toast.success("Could not update profile.");
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 font-black italic uppercase">Loading Identity...</div>;

  return (
    <div className="min-h-screen bg-black p-6 md:p-20 flex flex-col items-center">
      
      {/* 🎫 IDENTITY CARD */}
      <div className="w-full max-w-4xl bg-gray-900 border border-yellow-600 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-yellow-600/10">
        
        {/* HEADER / COVER */}
        <div className="h-32 bg-gradient-to-r from-yellow-600 to-yellow-900 flex items-end p-8">
          <div className="w-24 h-24 bg-black rounded-3xl border-4 border-gray-900 overflow-hidden -mb-12 shadow-xl flex items-center justify-center">
            {profileData?.profileImage ? (
                <img src={profileData.profileImage} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
                <span className="text-4xl text-gray-700">👤</span>
            )}
            </div>
        </div>

        <div className="p-8 pt-16 flex flex-col md:flex-row justify-between gap-8">
          
          {/* USER DETAILS SECTION */}
          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Public Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-black border border-gray-800 p-3 rounded-xl text-white mt-1 focus:border-yellow-600 outline-none font-bold italic"
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Identity Bio</label>
                  <textarea 
                    className="w-full bg-black border border-gray-800 p-3 rounded-xl text-white mt-1 focus:border-yellow-600 outline-none italic h-24"
                    placeholder="Describe your role in the EliteEvents ecosystem..."
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="bg-yellow-600 text-black px-6 py-2 rounded-lg font-black text-[10px] uppercase">Save Changes</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 font-black text-[10px] uppercase hover:text-white transition">Cancel</button>
                </div>
              </form>
            ) : (
              <div>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                  {profileData?.name}
                </h1>
                <p className="text-gray-500 font-mono text-sm uppercase tracking-widest mt-1">
                  {profileData?.email}
                </p>
                <p className="text-gray-400 mt-4 italic text-sm max-w-md">
                  {profileData?.bio || "No bio added yet. Tell the Ahmedabad community about yourself."}
                </p>
                
                <div className="flex gap-3 mt-6">
                  <span className="bg-white/5 border border-gray-800 px-4 py-1 rounded-full text-[10px] font-black uppercase text-gray-400">
                    Role: {profileData?.role}
                  </span>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${
                    profileData?.isApproved 
                    ? "bg-green-500/10 border-green-500 text-green-500" 
                    : "bg-yellow-500/10 border-yellow-500 text-yellow-500"
                  }`}>
                    {profileData?.isApproved ? "Verified Agent" : "Status: Pending Audit"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="flex flex-col gap-3">

            {/* Inside the Edit Form */}
            {isEditing && (
            <div className="mt-4">
                <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Update Photo</label>
                <input 
                type="file" 
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="block w-full text-xs text-gray-400 mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-yellow-600 file:text-black hover:file:bg-yellow-500"
                />
            </div>
            )}
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-8 rounded-xl transition-all uppercase text-[10px] tracking-widest active:scale-95"
              >
                Edit Credentials
              </button>
            )}
            <button 
              onClick={logout}
              className="bg-transparent border border-red-900/50 text-red-500 hover:bg-red-500 hover:text-white font-black py-3 px-8 rounded-xl transition-all uppercase text-[10px] tracking-widest active:scale-95"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-800 mt-8">
          <div className="p-10 border-b md:border-b-0 md:border-r border-gray-800">
             <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Account Seniority</h3>
             <p className="text-white text-xl font-bold italic uppercase">
               Joined {new Date(profileData?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
             </p>
          </div>
          <div className="p-10 bg-white/[0.02]">
             <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Elite Tier</h3>
             <p className="text-yellow-500 text-xl font-bold italic uppercase">
               {profileData?.role === 'Admin' ? 'SuperAdmin Principal' : 'Standard Member'}
             </p>
          </div>
        </div>

      </div>

      {/* FOOTER NOTE */}
      <p className="mt-10 text-[10px] text-gray-700 font-black uppercase tracking-[0.5em] text-center">
        EliteEvents Ahmedabad // Identity Node: {profileData?._id}
      </p>

    </div>
  );
};

export default Profile;