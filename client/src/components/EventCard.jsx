import { useState } from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event, isPast }) => {
  const [showFullDesc, setShowFullDesc] = useState(false);

  return (
    <div className={`bg-gray-900 border ${isPast ? 'border-gray-800 opacity-70' : 'border-gray-800 hover:border-yellow-600'} rounded-xl overflow-hidden transition-all duration-300 transform ${!isPast && 'hover:-translate-y-2'} shadow-xl group relative flex flex-col h-full`}>
      
      {/* 🎯 INFO OVERLAY */}
      {!isPast && (
        <div className={`absolute inset-0 z-40 bg-black/95 backdrop-blur-md p-6 transition-all duration-500 flex flex-col ${showFullDesc ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-yellow-500 font-black uppercase italic text-xs tracking-widest">Full Description</h4>
            <button onClick={() => setShowFullDesc(false)} className="text-gray-500 hover:text-white text-xl">×</button>
          </div>
          <div className="flex-grow overflow-y-auto no-scrollbar pr-2">
            <p className="text-gray-300 text-sm leading-relaxed italic">
              {event.description}
            </p>
          </div>
          <button 
            onClick={() => setShowFullDesc(false)}
            className="mt-4 w-full py-2 border border-yellow-600/30 text-yellow-600 text-[10px] font-black uppercase rounded-lg hover:bg-yellow-600 hover:text-black transition-all"
          >
            Close Details
          </button>
        </div>
      )}

      {/* IMAGE SECTION */}
      <div className={`${isPast ? 'h-32' : 'h-48'} bg-gradient-to-br from-gray-800 to-black flex items-center justify-center relative overflow-hidden shrink-0`}>
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.title} 
            className={`w-full h-full object-cover transition-transform duration-500 ${!isPast && 'group-hover:scale-110'} ${isPast ? 'grayscale opacity-40' : 'opacity-90 group-hover:opacity-100'}`}
          />
        ) : (
          <span className="text-yellow-500 font-bold opacity-10 uppercase tracking-widest text-[8px] px-4 text-center">Elite Archive</span>
        )}
        
        <div className={`absolute top-3 right-3 ${isPast ? 'bg-gray-800/80 text-gray-500' : 'bg-yellow-600/90 text-black'} text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter`}>
          {event.location?.area || "Ahmedabad"}
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className={`${isPast ? 'p-4' : 'p-5'} flex flex-col flex-grow`}>
        {/* 🎯 FIXED TITLE AREA: Forces 2 lines of space always */}
        <h3 className={`${isPast ? 'text-sm' : 'text-xl'} font-bold ${isPast ? 'text-gray-500' : 'text-white'} mb-2 uppercase italic tracking-tight line-clamp-2 h-[3.5rem] flex items-center`}>
          {event.title}
        </h3>

        {/* 🎯 DESCRIPTION AREA: Uses flex-grow to push footer down */}
        {!isPast && (
          <div className="mb-4 flex-grow">
            <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed inline">
              {event.description}
            </p>
            {event.description.length > 60 && (
              <button 
                onClick={() => setShowFullDesc(true)}
                className="ml-2 text-yellow-600 font-black text-[10px] uppercase hover:text-yellow-400 transition-colors"
              >
                ... more
              </button>
            )}
          </div>
        )}
        
        {/* 🎯 FOOTER: Pushed to bottom via mt-auto */}
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex justify-between items-center text-[10px] mb-4">
            <span className="text-gray-600 font-black italic uppercase tracking-tighter">
              {isPast ? "ARCHIVED" : `📅 ${new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
            </span>
            <span className={`${isPast ? 'text-gray-700' : 'text-yellow-500'} font-black text-sm`}>
              ₹{event.price}
            </span>
          </div>

          {/* BUTTON */}
          {!isPast ? (
            <Link to={`/event/${event._id}`} className="block w-full text-center py-3 bg-transparent border border-yellow-600 text-yellow-500 rounded-lg hover:bg-yellow-600 hover:text-black transition-all duration-300 font-black uppercase tracking-widest text-xs active:scale-95">
              Get Tickets
            </Link>
          ) : (
            <div className="block w-full text-center py-2 bg-gray-800/30 border border-gray-800 text-gray-700 rounded-lg font-black uppercase tracking-widest text-[9px] cursor-not-allowed">
              Concluded
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;