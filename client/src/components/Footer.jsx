import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Footer = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 🎯 THE "WAKE UP" LOGIC
  useEffect(() => {
    const rawData = localStorage.getItem('user');
    if (rawData) {
      try {
        setUser(JSON.parse(rawData));
      } catch (err) {
        console.error("Footer: Auth parse error", err);
      }
    }
  }, []);

  // 🎯 ROBUST ROLE CHECKS
  // We check every possible place the role or admin status could be hiding
  const isLoggedIn = !!user;
  const isOrganizer = 
    user?.role === 'organizer' || 
    user?.user?.role === 'organizer' || 
    user?.isAdmin === true || 
    user?.user?.isAdmin === true ||
    user?.role === 'admin';

  const handleExplore = () => {
    const grid = document.getElementById('discovery-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10 px-6 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          {/* BRAND */}
          <div className="col-span-1">
            <div className="text-2xl font-black italic uppercase tracking-tighter mb-6 text-white">
              ELITE<span className="text-yellow-500">EVENTS</span>
            </div>
            <p className="text-gray-500 text-[10px] leading-relaxed uppercase tracking-[0.2em] font-medium">
              Ahmedabad's most exclusive event ecosystem. Curating the vibes that define the city's nightlife and culture.
            </p>
          </div>

          {/* NAVIGATION */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8 border-b border-yellow-500/20 pb-2 w-fit">
              Navigation
            </h4>
            <ul className="space-y-4">
              <li>
                <button onClick={() => { navigate('/'); window.scrollTo(0,0); }} className="footer-link">Home</button>
              </li>
              <li>
                <button onClick={handleExplore} className="footer-link">Explore Events</button>
              </li>

              {/* 🎯 LOGGED IN USERS ONLY */}
              {isLoggedIn && (
                <li>
                  <Link to="/my-bookings" className="footer-link">My Tickets</Link>
                </li>
              )}

              {/* 🎯 ORGANIZERS / ADMINS ONLY */}
              {isOrganizer && (
                <li>
                  <Link to="/organizer/dashboard" className="footer-link text-yellow-500/80">
                    Organizer Portal
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* CATEGORIES */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8 border-b border-yellow-500/20 pb-2 w-fit">
              Categories
            </h4>
            <ul className="space-y-4">
              {['Sports', 'Music', 'Tech', 'Comedy'].map((cat) => (
                <li key={cat}>
                  <button 
                    onClick={() => { navigate(`/?category=${cat}`); window.scrollTo(0,0); }} 
                    className="text-[10px] text-gray-500 hover:text-white font-black uppercase tracking-widest transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* STAY CONNECTED */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8 border-b border-yellow-500/20 pb-2 w-fit">
              Stay Connected
            </h4>
            <div className="relative mb-6">
              <input type="email" placeholder="EMAIL ADDRESS" className="w-full bg-white/5 border border-white/10 py-3 px-4 text-[10px] text-white placeholder:text-gray-700 focus:outline-none focus:border-yellow-500/50 font-black" />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500 text-[10px] font-black">JOIN</button>
            </div>
            <div className="flex gap-6 text-[10px] text-gray-700 font-black">
              <span>INSTAGRAM</span>
              <span>X</span>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[8px] font-black text-gray-800 tracking-[0.3em] uppercase">© 2026 ELITE EVENTS ECOSYSTEM.</p>
          <div className="text-[8px] font-black text-yellow-600/50 uppercase italic">CURATED IN AHMEDABAD</div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .footer-link {
          font-size: 10px;
          color: #6b7280;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.3s;
          text-align: left;
          display: block;
        }
        .footer-link:hover {
          color: #eab308;
          padding-left: 4px;
        }
      `}} />
    </footer>
  );
};

export default Footer;