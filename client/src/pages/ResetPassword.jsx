import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const { token } = useParams(); // Grabs the token from the URL
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match.");

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/reset-password/${token}`, { password });
      setMessage(response.data.message);
      
      // Send them to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-gray-900 p-8 rounded-2xl border border-yellow-600 w-full max-w-md">
        <h2 className="text-3xl font-bold text-yellow-500 mb-6 text-center italic">Set New Credentials</h2>
        
        {message && <div className="bg-green-900/40 border border-green-500 text-green-200 p-3 rounded mb-4 text-sm text-center">{message}</div>}
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" placeholder="New Password" required
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-yellow-500 outline-none"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <input 
            type="password" placeholder="Confirm New Password" required
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-yellow-500 outline-none"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg">
            Update Vault Access
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;