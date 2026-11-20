import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2 group">
      {/* The Iconic 'E' Shield */}
      <div className="bg-gradient-to-br from-yellow-400 to-yellow-700 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-900/20 transform group-hover:rotate-12 transition-transform duration-300">
        <span className="text-black font-black text-2xl italic">E</span>
      </div>
      
      {/* The Brand Name */}
      <div className="flex flex-col leading-none">
        <span className="text-xl font-black tracking-tighter text-white">
          ELITE<span className="text-yellow-500">EVENTS</span>
        </span>
        <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
          Ahmedabad
        </span>
      </div>
    </Link>
  );
};

export default Logo;