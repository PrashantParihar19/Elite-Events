import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext); 

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to check for Organizer role regardless of Capitalization
  const isOrganizer = user?.role?.toLowerCase() === 'organizer';

  return (
    <nav className="flex justify-between items-center py-6 px-4 bg-black border-b border-gray-900 sticky top-0 z-[100] backdrop-blur-md bg-black/80">
      <Link to="/" className="text-2xl font-black italic tracking-tighter uppercase text-white">
        ELITE<span className="text-yellow-500">EVENTS</span>
      </Link>

      <div className="flex items-center gap-8">
        <Link to="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition">Home</Link>
        
        {user ? (
          <div className="relative group">
            {/* USER CAPSULE */}
            <button className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 px-5 py-2 rounded-full hover:border-yellow-600 transition-all duration-300">
              <div className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center text-black font-black text-[10px]">
                {user.name?.charAt(0) || "U"}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {user.name?.split(' ')[0] || "User"}
              </span>
              <span className="text-gray-600 text-[8px]">▼</span>
            </button>

            {/* DROPDOWN MENU */}
            <div className="absolute right-0 mt-2 w-56 bg-black border border-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden backdrop-blur-xl bg-black/90">
              <div className="p-4 border-b border-gray-900 bg-white/5">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Authenticated As</p>
                <p className="text-[10px] font-bold text-white truncate">{user.email}</p>
              </div>

              {/* 👑 Systems Admin */}
              {user.isAdmin && (
                <Link 
                  to="/superadmin" 
                  className="flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-yellow-500 hover:bg-yellow-600 hover:text-black transition-all border-b border-gray-900"
                >
                  <span>👑</span> Command Center
                </Link>
              )}

              {/* 👤 VIEW PROFILE */}
              <Link 
                to="/profile" 
                className="flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-yellow-600 hover:text-black transition-all border-b border-gray-900"
              >
                <span>👤</span> My Identity
              </Link>

              <Link 
                to="/my-bookings" 
                className="flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-yellow-600 hover:text-black transition-all border-b border-gray-900"
              >
                <span>🎟️</span> My Passes
              </Link>

              {/* ORGANIZER TOOLS SECTION */}
              {isOrganizer && (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-yellow-600 hover:text-black transition-all border-b border-gray-900"
                  >
                    <span>🛠️</span> Organizer Dash
                  </Link>

                  <Link 
                    to="/scanner" 
                    className="flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-yellow-600/10 hover:bg-yellow-600 hover:text-black transition-all border-b border-gray-900"
                  >
                    <span>📷</span> Scan Tickets
                  </Link>
                </>
              )}

              <button 
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-all"
              >
                <span>🚪</span> Exit System
              </button>
            </div>
          </div>
        ) : (
          <Link to="/login" className="bg-yellow-600 text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition shadow-lg shadow-yellow-600/20">
            Entry
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;