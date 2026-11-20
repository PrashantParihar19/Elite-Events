import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        email,
        password
      });

      login(response.data); 

      console.log("Access Granted! Welcome, " + response.data.name);

            navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again!");
    }

  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-yellow-600 w-full max-w-md">
        <h2 className="text-3xl font-bold text-yellow-500 mb-6 text-center italic text-shadow-gold">Access The Vault</h2>
        
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-yellow-500 outline-none transition-all"
              placeholder="prince@elite.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium">Password</label>
              {/* Added Forgot Password link right above the password input or below */}
              <Link to="/forgot-password" title="Recover your account" className="text-xs text-yellow-600 hover:text-yellow-400 transition-colors">
                Forgot Password?
              </Link>
            </div>
            <input 
              type="password" className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-yellow-500 outline-none transition-all"
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>
          <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition transform active:scale-95 shadow-lg shadow-yellow-900/20 mt-2">
            Verify Credentials
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            Not a member of the elite? 
            <br />
            <Link to="/register" className="text-yellow-500 font-semibold hover:underline mt-2 inline-block">
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;