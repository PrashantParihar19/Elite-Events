import { useEffect, useState, useCallback } from 'react';
import axios from '../api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({ 
    totalTransactions: 0, 
    totalTickets: 0, 
    totalRevenue: 0 
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };

      const [orgRes, statRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/users/pending-organizers`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/admin-stats`, config)
      ]);

      setPending(orgRes.data);
      setStats({
        totalTransactions: statRes.data.totalTransactions || 0,
        totalTickets: statRes.data.totalTickets || 0,
        totalRevenue: statRes.data.totalRevenue || 0
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleApprove = async (id) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/verify/${id}`, {}, config);
      toast.success("Organizer Verified!");
      fetchDashboardData(); 
    } catch (err) {
      toast.error("Approval failed.");
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Prashant, are you sure you want to REJECT this organizer?")) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('eliteUser'));
        const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
        const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/reject/${id}`, {}, config);
        toast.success(data.message);
        fetchDashboardData(); 
      } catch (err) {
        toast.error("Could not reject organizer.");
      }
    }
  };

  if (loading) return <div className="text-center py-20 text-yellow-500 font-black animate-pulse uppercase tracking-widest">Accessing Elite Command Center...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-12">
      {/* HEADER */}
      <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-10 border-l-4 border-yellow-600 pl-6">
        SuperAdmin <span className="text-yellow-500">Command Center</span>
      </h2>

      {/* 🚀 STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* CARD 1: REVENUE */}
        <div className="bg-gray-900/60 p-8 rounded-[40px] border border-gray-800 shadow-2xl relative overflow-hidden group">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Revenue</p>
          <p className="text-4xl font-black italic text-yellow-500">₹{stats.totalRevenue.toLocaleString()}</p>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM2 9v7a2 2 0 002 2h12a2 2 0 002-2V9H2zm10 3a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z"></path></svg>
          </div>
        </div>

        {/* CARD 2: TOTAL PAX */}
        <div className="bg-gray-900/60 p-8 rounded-[40px] border border-gray-800 shadow-2xl relative overflow-hidden group">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Tickets Sold (Pax)</p>
          <p className="text-4xl font-black italic text-white">{stats.totalTickets}</p>
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM2 14a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z"></path></svg>
          </div>
        </div>

        {/* CARD 3: SPY STAT */}
        <div className="bg-gray-900/60 p-8 rounded-[40px] border border-blue-900/30 shadow-2xl relative overflow-hidden group">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Transactions</p>
          <p className="text-4xl font-black italic text-blue-400">{stats.totalTransactions}</p>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg>
          </div>
        </div>
      </div>

      {/* PENDING TABLE */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-[30px] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800 bg-white/5">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Pending Organizer Approvals</h3>
        </div>
        
        {/* 🎯 Added a horizontal scroll container in case the table gets wide */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-black/20 border-b border-gray-800">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Name / Email</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Soft Details</th>
                {/* 🎯 NEW COLUMN HEADER */}
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Official Documents</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.length > 0 ? pending.map((org) => (
                <tr key={org._id} className="border-b border-gray-800 hover:bg-white/5 transition duration-300">
                  <td className="p-6">
                    <p className="text-sm font-bold uppercase italic text-white">{org.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{org.email}</p>
                  </td>
                  
                  {/* Soft Details Cell */}
                  <td className="p-6 text-xs text-gray-300">
                    {org.organizerDetails?.organizationName ? (
                      <div className="space-y-2 font-mono">
                        <p><span className="text-gray-500 font-black tracking-widest uppercase text-[9px]">ORG:</span> {org.organizerDetails.organizationName}</p>
                        <p><span className="text-gray-500 font-black tracking-widest uppercase text-[9px]">TEL:</span> {org.organizerDetails.contactNumber}</p>
                        <a 
                          href={org.organizerDetails.professionalLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-block mt-1 text-[10px] font-black text-blue-400 hover:text-blue-300 hover:underline uppercase tracking-widest border border-blue-900/50 bg-blue-900/10 px-3 py-1 rounded-md transition-colors"
                        >
                          🔗 Linked Profile
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-600 italic text-[10px] uppercase">No Soft Details</span>
                    )}
                  </td>

                  {/* 🎯 NEW DATA CELL: Hard Verification Documents */}
                  <td className="p-6">
                    {org.organizerDetails?.aadhaarCard ? (
                      <div className="flex flex-col space-y-2">
                        <a 
                          href={org.organizerDetails.aadhaarCard} target="_blank" rel="noreferrer"
                          className="text-[10px] font-black text-yellow-500 border border-yellow-600/30 bg-yellow-600/10 px-3 py-1 rounded-md hover:bg-yellow-600/30 transition-colors uppercase tracking-widest w-max"
                        >
                          📄 View Aadhaar
                        </a>
                        {org.organizerDetails.panCard && (
                          <a 
                            href={org.organizerDetails.panCard} target="_blank" rel="noreferrer"
                            className="text-[10px] font-black text-yellow-500 border border-yellow-600/30 bg-yellow-600/10 px-3 py-1 rounded-md hover:bg-yellow-600/30 transition-colors uppercase tracking-widest w-max"
                          >
                            📄 View PAN
                          </a>
                        )}
                        {org.organizerDetails.businessLicense && (
                          <a 
                            href={org.organizerDetails.businessLicense} target="_blank" rel="noreferrer"
                            className="text-[10px] font-black text-yellow-500 border border-yellow-600/30 bg-yellow-600/10 px-3 py-1 rounded-md hover:bg-yellow-600/30 transition-colors uppercase tracking-widest w-max"
                          >
                            📄 View License
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-600 italic text-[10px] uppercase">No Docs Uploaded</span>
                    )}
                  </td>

                  <td className="p-6 flex flex-col justify-center items-center gap-3 h-full min-h-[120px]">
                    <button onClick={() => handleApprove(org._id)} className="w-full sm:w-auto bg-yellow-600 text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-yellow-500 transition active:scale-95">Approve ✅</button>
                    <button onClick={() => handleReject(org._id)} className="w-full sm:w-auto bg-red-600/10 text-red-600 px-6 py-2 rounded-xl font-black text-[10px] uppercase border border-red-600/20 hover:bg-red-600 hover:text-white transition active:scale-95">Reject ❌</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-gray-500 italic">No pending organizers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;