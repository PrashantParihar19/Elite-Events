import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    role: 'Attendee',
    organizerDetails: {
      organizationName: '',
      contactNumber: '',
      professionalLink: ''
    }
  });

  // 🎯 NEW: State to hold the selected files
  const [files, setFiles] = useState({
    aadhaarCard: null,
    panCard: null,
    businessLicense: null
  });

  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleOrganizerChange = (e) => {
    setFormData({
      ...formData,
      organizerDetails: {
        ...formData.organizerDetails,
        [e.target.name]: e.target.value
      }
    });
  };

  // 🎯 NEW: Handler for file inputs
  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 🎯 NEW: Construct FormData to handle the mix of text and files
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
    submitData.append('role', formData.role);

    if (formData.role === 'Organizer') {
      submitData.append('organizationName', formData.organizerDetails.organizationName);
      submitData.append('contactNumber', formData.organizerDetails.contactNumber);
      submitData.append('professionalLink', formData.organizerDetails.professionalLink);

      if (files.aadhaarCard) submitData.append('aadhaarCard', files.aadhaarCard);
      if (files.panCard) submitData.append('panCard', files.panCard);
      if (files.businessLicense) submitData.append('businessLicense', files.businessLicense);
    }

    try {
      // 🎯 Ensure Axios knows we are sending multipart/form-data
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/register`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      login(response.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Email might already be taken.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-10 bg-black">
      {/* Added a subtle neon glow to the shadow */}
      <div className="bg-gray-900 p-8 rounded-2xl shadow-[0_0_15px_rgba(202,138,4,0.15)] border border-yellow-600 w-full max-w-md">
        <h2 className="text-3xl font-bold text-yellow-500 mb-6 text-center italic tracking-wide">Join The Elite</h2>
        
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Full Name"
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-yellow-500 outline-none text-gray-200"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <input 
            type="email" placeholder="Email Address"
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-yellow-500 outline-none text-gray-200"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input 
            type="password" placeholder="Create Password"
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-yellow-500 outline-none text-gray-200"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          
          <div className="flex flex-col space-y-2 pb-2">
            <label className="text-sm font-medium text-gray-400">Account Purpose:</label>
            <select 
              className="w-full p-3 bg-black border border-gray-700 rounded-lg text-yellow-500 outline-none cursor-pointer"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="Attendee">I want to discover & book events</option>
              <option value="Organizer">I want to host & manage events</option>
            </select>
          </div>

          {/* 🎯 THE VERIFICATION SLIDE-DOWN */}
          {formData.role === 'Organizer' && (
            <div className="p-4 bg-black/60 border border-yellow-600/40 rounded-xl space-y-5 mb-4 shadow-inner">
              
              {/* Soft Details Section */}
              <div className="space-y-3">
                <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest border-b border-yellow-600/30 pb-2">
                  1. Profile Details
                </p>
                <input 
                  type="text" name="organizationName" placeholder="Organization / Brand Name"
                  className="w-full p-3 bg-black border border-gray-800 rounded-lg focus:border-yellow-500 outline-none text-sm text-gray-200"
                  onChange={handleOrganizerChange}
                  required
                />
                <input 
                  type="tel" name="contactNumber" placeholder="Contact Number"
                  className="w-full p-3 bg-black border border-gray-800 rounded-lg focus:border-yellow-500 outline-none text-sm text-gray-200"
                  onChange={handleOrganizerChange}
                  required
                />
                <input 
                  type="url" name="professionalLink" placeholder="Professional Link (LinkedIn, Insta)"
                  className="w-full p-3 bg-black border border-gray-800 rounded-lg focus:border-yellow-500 outline-none text-sm text-gray-200"
                  onChange={handleOrganizerChange}
                  required
                />
              </div>

              {/* 🎯 Hard Details (Files) Section */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest border-b border-yellow-600/30 pb-2">
                  2. Official Documents (PDF/Image)
                </p>
                
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-gray-400">Aadhaar Card</label>
                  <input 
                    type="file" name="aadhaarCard" accept=".jpg,.png,.pdf"
                    onChange={handleFileChange} required
                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-yellow-600 file:text-black hover:file:bg-yellow-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-gray-400">PAN Card</label>
                  <input 
                    type="file" name="panCard" accept=".jpg,.png,.pdf"
                    onChange={handleFileChange} required
                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-yellow-600 file:text-black hover:file:bg-yellow-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-gray-400">Business License / GST</label>
                  <input 
                    type="file" name="businessLicense" accept=".jpg,.png,.pdf"
                    onChange={handleFileChange} required
                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-yellow-600 file:text-black hover:file:bg-yellow-500 cursor-pointer"
                  />
                </div>
              </div>

            </div>
          )}

          <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition transform active:scale-95 shadow-[0_0_10px_rgba(202,138,4,0.4)] mt-4">
            Create Elite Account
          </button>
        </form>
        
        <p className="mt-6 text-center text-gray-400 text-sm">
          Already a member? <Link to="/login" className="text-yellow-500 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;