import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Inbox, ArrowUpRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ui/Navbar';

export default function MyRentalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/outfits/requests`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIncoming(data.incoming);
        setOutgoing(data.outgoing);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchRequests();
  }, [user]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/outfits/requests/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        fetchRequests(); // refresh the list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'rejected': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'completed': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  };

  const currentList = activeTab === 'incoming' ? incoming : outgoing;

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8 mt-16">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Rental Requests</h1>
            <p className="text-xs text-muted-foreground mt-1">Manage your fashion rentals</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-card border border-border rounded-xl">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${
              activeTab === 'incoming' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Requests Received
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${
              activeTab === 'outgoing' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Requests
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-20 bg-card/30 border border-border/80 rounded-[2rem] p-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-extrabold">No requests found</h3>
            <p className="text-xs text-muted-foreground mt-2">
              {activeTab === 'incoming' 
                ? "You haven't received any rental requests for your outfits yet."
                : "You haven't made any requests to rent outfits yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map(req => (
              <motion.div 
                key={req._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img src={req.outfit?.image} alt="Outfit" className="w-16 h-20 rounded-lg object-cover border border-border" />
                  <div>
                    <h4 className="font-extrabold text-sm">{req.outfit?.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      {activeTab === 'incoming' ? (
                        <>Requested by <span className="font-bold text-foreground">{req.renter?.name}</span> from {req.renter?.hostel}</>
                      ) : (
                        <>Owner: <span className="font-bold text-foreground">{req.owner?.name}</span> from {req.owner?.hostel}</>
                      )}
                    </p>
                    {req.message && (
                      <p className="text-xs italic text-muted-foreground mt-1">"{req.message}"</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {activeTab === 'incoming' && req.status === 'pending' && (
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => handleStatusUpdate(req._id, 'rejected')}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-card text-rose-500 hover:bg-rose-500 hover:text-white border border-border hover:border-rose-500 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-lg hover:shadow-rose-500/20"
                    >
                      <XCircle className="w-4 h-4" /> Decline Request
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(req._id, 'accepted')}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 border border-transparent"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Request
                    </button>
                  </div>
                )}
                
                {activeTab === 'incoming' && req.status === 'accepted' && (
                  <button 
                    onClick={() => handleStatusUpdate(req._id, 'completed')}
                    className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark as Returned
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
