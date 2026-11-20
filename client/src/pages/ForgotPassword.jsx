import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // This endpoint will handle the logic of checking if the user exists 
      // and sending the reset email.
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/forgot-password`, { email });
      
      setMessage("Check your inbox. If an account exists, a recovery link has been sent.");
      setEmail(''); 
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-yellow-600 w-full max-w-md">
        <h2 className="text-3xl font-bold text-yellow-500 mb-4 text-center italic text-shadow-gold">Recover Access</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Enter your registered email address and we'll send you a secure link to reset your vault credentials.
        </p>

        {message && <div className="bg-green-900/40 border border-green-500 text-green-200 p-3 rounded mb-4 text-sm text-center">{message}</div>}
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-yellow-500 outline-none transition-all"
              placeholder="your-email@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition transform active:scale-95 shadow-lg shadow-yellow-900/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Processing..." : "Send Recovery Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-gray-500 hover:text-yellow-500 text-sm transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;