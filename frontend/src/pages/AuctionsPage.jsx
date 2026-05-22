import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Gavel, 
  ChevronLeft, 
  Flame, 
  History, 
  Tag, 
  Hourglass, 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Users,
  Search,
  SlidersHorizontal
} from 'lucide-react';

export default function AuctionsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live'); // 'live', 'ending', 'sold', 'my-bids'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState(false);
  const [autoBidMax, setAutoBidMax] = useState('');
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);

  // Main products fetch
  const fetchAuctions = async () => {
    try {
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/products');
      if (response.ok) {
        const data = await response.json();
        // Filter only products marked as auctions
        const auctionItems = data.filter(p => p.isAuction === true);
        setProducts(auctionItems);
      }
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
    // High-frequency polling to simulate real-time bidding updates
    const pollInterval = setInterval(() => {
      fetchAuctions();
    }, 6000);

    return () => clearInterval(pollInterval);
  }, []);

  // Scroll to top on active tab change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [activeTab]);

  // Poll active selected auction detail specifically for live bid logs
  useEffect(() => {
    if (!selectedAuction) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`https://hostelx-backend-a228.onrender.com/api/products/${selectedAuction._id}`);
        if (res.ok) {
          const updated = await res.json();
          setSelectedAuction(updated);
        }
      } catch (err) {
        console.warn('Failed to poll selected auction details:', err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedAuction?._id]);

  // Place a Bid
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!selectedAuction) return;
    setBidError('');
    setBidSuccess(false);

    const amount = Number(bidAmount);
    const highestBid = selectedAuction.bids?.length > 0 
      ? Math.max(...selectedAuction.bids.map(b => b.amount))
      : selectedAuction.startingBid;

    if (!bidAmount || isNaN(amount) || amount <= 0) {
      setBidError('Please enter a valid bid amount.');
      return;
    }

    if (amount <= highestBid) {
      setBidError(`Bid must be at least ₹${highestBid + 1}.`);
      return;
    }

    setBidLoading(true);
    try {
      const response = await fetch(`https://hostelx-backend-a228.onrender.com/api/products/${selectedAuction._id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token if backend requires authentication
        },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();
      if (response.ok) {
        setBidSuccess(true);
        setBidAmount('');
        // Re-fetch listing details immediately
        const resDetail = await fetch(`https://hostelx-backend-a228.onrender.com/api/products/${selectedAuction._id}`);
        if (resDetail.ok) {
          const updated = await resDetail.json();
          setSelectedAuction(updated);
        }
        fetchAuctions();
      } else {
        setBidError(data.message || 'Failed to place bid. Try again.');
      }
    } catch (error) {
      console.error('Bid submit error:', error);
      setBidError('Connection failed. Please verify your internet.');
    } finally {
      setBidLoading(false);
    }
  };

  // Helper: calculate highest bid
  const getHighestBid = (item) => {
    if (!item.bids || item.bids.length === 0) return item.startingBid;
    return Math.max(...item.bids.map(b => b.amount));
  };

  // Helper: render countdown with urgency colors
  const CountdownTimer = ({ createdAt }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [urgency, setUrgency] = useState('normal'); // 'normal' | 'warning' | 'critical'

    useEffect(() => {
      const calculateTimeLeft = () => {
        const creationTime = new Date(createdAt).getTime();
        const duration = 48 * 60 * 60 * 1000;
        const expiryTime = creationTime + duration;
        const now = Date.now();
        const difference = expiryTime - now;

        if (difference <= 0) {
          setTimeLeft('ENDED');
          setUrgency('ended');
          return;
        }

        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        const hStr = String(hours).padStart(2, '0');
        const mStr = String(minutes).padStart(2, '0');
        const sStr = String(seconds).padStart(2, '0');
        setTimeLeft(`${hStr}:${mStr}:${sStr}`);

        const totalMinutes = difference / (1000 * 60);
        if (totalMinutes < 5) setUrgency('critical');
        else if (totalMinutes < 60) setUrgency('warning');
        else setUrgency('normal');
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(interval);
    }, [createdAt]);

    const colorClass = urgency === 'ended'
      ? 'bg-slate-100 text-slate-500 border-slate-200'
      : urgency === 'critical'
      ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
      : urgency === 'warning'
      ? 'bg-amber-50 text-amber-600 border-amber-200'
      : 'bg-blue-50 text-blue-600 border-blue-200';

    return (
      <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded font-mono border ${colorClass}`}>
        <Clock className="w-3 h-3" />
        {timeLeft}
      </span>
    );
  };

  // Filter listings based on active tab & query
  const filteredProducts = products.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Check expiry
    const creationTime = new Date(item.createdAt).getTime();
    const expiryTime = creationTime + (48 * 60 * 60 * 1000);
    const isEnded = expiryTime <= Date.now();

    if (activeTab === 'live') {
      return !isEnded;
    }
    if (activeTab === 'ending') {
      // Ending soon: less than 6 hours left
      const hrsLeft = (expiryTime - Date.now()) / (1000 * 60 * 60);
      return !isEnded && hrsLeft > 0 && hrsLeft < 6;
    }
    if (activeTab === 'sold') {
      return isEnded;
    }
    if (activeTab === 'my-bids') {
      if (!user) return false;
      return item.bids?.some(b => b.bidder === user._id || b.bidder?._id === user._id);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col relative pb-10">
      
      {/* Header bar */}
      <header className="max-w-7xl w-full mx-auto px-4 py-6 flex items-center justify-between border-b border-slate-200/80">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-sm transition cursor-pointer text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-slate-900">
              <Gavel className="w-5.5 h-5.5 text-blue-600" />
              Live Auction Terminal
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Real-time student bidding desk</p>
          </div>
        </div>

        {/* Global Live Stat Chip */}
        <span className="flex items-center gap-2 text-xs font-black bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-2xl border border-blue-200 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
          LIVE DEMAND INDEX
        </span>
      </header>

      {/* Main Grid content */}
      <main className="max-w-7xl w-full mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Left Side: Auctions Grid directory */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Action Row: Search and Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-3xl shadow-sm">
            
            {/* Tabs List */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'live', label: 'Live Auctions', icon: <Flame className="w-3.5 h-3.5" /> },
                { id: 'ending', label: 'Ending Soon', icon: <Hourglass className="w-3.5 h-3.5" /> },
                { id: 'sold', label: 'Recently Sold', icon: <CheckCircle className="w-3.5 h-3.5" /> },
                { id: 'my-bids', label: 'My Bids', icon: <TrendingUp className="w-3.5 h-3.5" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedAuction(null);
                  }}
                  className={`flex items-center gap-1.5 text-[11px] font-black tracking-wider uppercase px-4 py-2 rounded-xl border transition cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input bar */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search live deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white outline-none text-xs font-semibold text-slate-700 transition"
              />
            </div>

          </div>

          {/* Directory Listings container */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Syncing Live Bidding Ledger...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200/80 rounded-3xl p-8 max-w-md mx-auto flex flex-col items-center shadow-sm">
              <Gavel className="w-12 h-12 text-slate-300 mb-4" />
              <h4 className="font-extrabold text-sm text-slate-800">No live auction activity yet.</h4>
              <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
                Be the first to list an item for auction and start a live bidding race!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((item) => {
                const currentBid = getHighestBid(item);
                const isSelected = selectedAuction?._id === item._id;

                return (
                  <motion.div
                    key={item._id}
                    layout
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedAuction(item)}
                    className={`bg-white border p-5 rounded-3xl cursor-pointer flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden group ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50/20 shadow-md ring-1 ring-blue-500/20' 
                        : 'border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {/* Top image & status */}
                    <div className="flex gap-4">
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/150'}
                        alt={item.title}
                        className="w-18 h-18 rounded-2xl object-cover border border-slate-100 flex-shrink-0 group-hover:scale-102 transition"
                      />
                      <div className="overflow-hidden min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                          <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Active Auction</span>
                        </div>
                        <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {item.title}
                        </h3>
                        <p className="text-[9px] text-slate-500 truncate font-semibold">
                          📍 {item.hostel} · Room {item.seller?.room || 'Dorm'}
                        </p>
                      </div>
                    </div>

                    {/* Auction specific stats card */}
                    <div className="grid grid-cols-2 gap-2.5 pt-3.5 border-t border-slate-100">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[8px] text-slate-500 uppercase font-black block">Starting Bid</span>
                        <span className="text-xs font-black text-slate-800">₹{item.startingBid}</span>
                      </div>
                      <div className="bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                        <span className="text-[8px] text-blue-600 uppercase font-black block">Highest Bid</span>
                        <span className="text-xs font-black text-blue-700">₹{currentBid}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.bids?.length || 0} active bids</span>
                        {user && item.bids?.length >= 2 && (() => {
                          const sorted = [...(item.bids || [])].sort((a, b) => b.amount - a.amount);
                          const topBidder = sorted[0]?.bidder?._id || sorted[0]?.bidder;
                          const secondBidder = sorted[1]?.bidder?._id || sorted[1]?.bidder;
                          const userId = user._id;
                          if (secondBidder === userId && topBidder !== userId) {
                            return <span className="ml-1 px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black rounded border border-rose-200 animate-pulse">OUTBID!</span>;
                          }
                          return null;
                        })()}
                      </div>
                      <CountdownTimer createdAt={item.createdAt} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Side: Live Terminal console */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <AnimatePresence mode="wait">
            {selectedAuction ? (
              <motion.div
                key={`terminal-${selectedAuction._id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-md relative overflow-hidden space-y-6 sticky top-6"
              >
                {/* Glowing border top accent */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                {/* Selected header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase">
                      Live Console Connected
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mt-2 truncate max-w-[200px]" title={selectedAuction.title}>
                      {selectedAuction.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedAuction(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>

                {/* Main Product Showcase */}
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                  <img 
                    src={selectedAuction.images?.[0] || 'https://via.placeholder.com/150'} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute bottom-3 right-3">
                    <CountdownTimer createdAt={selectedAuction.createdAt} />
                  </div>
                </div>

                {/* Grid details */}
                <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Starting Price</span>
                    <span className="font-black text-slate-800">₹{selectedAuction.startingBid}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2.5">
                    <span className="text-blue-600 font-black uppercase tracking-wider text-[9px]">Live High Bid</span>
                    <span className="text-base font-black text-blue-600">₹{getHighestBid(selectedAuction)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Bids Logged</span>
                    <span className="font-bold text-slate-800">{selectedAuction.bids?.length || 0} rounds</span>
                  </div>
                </div>

                {/* Auto-Bid Section */}
                <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Auto-Bid Ceiling</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">System bids up to your max when outbid</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoBidEnabled(p => !p)}
                      className={`w-10 h-5 rounded-full border transition-all duration-200 cursor-pointer relative ${autoBidEnabled ? 'bg-blue-600 border-blue-600' : 'bg-slate-200 border-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${autoBidEnabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {autoBidEnabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">₹</span>
                      <input
                        type="number"
                        placeholder={`Max ceiling (current: ₹${getHighestBid(selectedAuction)})`}
                        value={autoBidMax}
                        onChange={(e) => setAutoBidMax(e.target.value)}
                        className="w-full pl-7 pr-4 py-2 bg-white border border-blue-300 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-xs font-black text-slate-800"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Bid input form */}
                <form onSubmit={handlePlaceBid} className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      placeholder={`Enter bid (min ₹${getHighestBid(selectedAuction) + 1})`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full pl-8.5 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-1 focus:ring-blue-500 outline-none text-xs font-black text-slate-800"
                    />
                  </div>

                  {bidError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold rounded-xl flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {bidError}
                    </div>
                  )}

                  {bidSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold rounded-xl flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      Bid registered successfully! 🔨
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bidLoading}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow-md hover:shadow-lg transition duration-300 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                  >
                    {bidLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Transmitting Bid...
                      </>
                    ) : (
                      <>
                        <Gavel className="w-4 h-4" />
                        Place Bidding Proposal
                      </>
                    )}
                  </button>
                </form>

                {/* Real bid timeline log */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Real-time Bidding Logs</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-h-40 overflow-y-auto no-scrollbar space-y-3">
                    {selectedAuction.bids?.length > 0 ? (
                      selectedAuction.bids.slice().reverse().map((bid, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 text-xs border-b border-slate-200/50 pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] border border-slate-300 flex-shrink-0">
                              {bid.bidder?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-bold text-slate-700 truncate text-[11px]">{bid.bidder?.name || 'Anonymous User'}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-blue-600 text-[11px]">₹{bid.amount}</span>
                            <span className="text-[8px] text-slate-400 block">
                              {new Date(bid.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 font-semibold text-center italic py-4">No live bidding activity yet. Place a bid to kickstart this auction!</p>
                    )}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="bg-white border border-slate-200 border-dashed rounded-[2rem] p-8 text-center flex flex-col items-center justify-center h-80 sticky top-6 shadow-sm">
                <Gavel className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
                <h4 className="font-bold text-xs text-slate-500">No Terminal Selected</h4>
                <p className="text-[10px] text-slate-400 mt-2 max-w-[200px] leading-relaxed">
                  Click any active auction card from the left directory to connect to its live bidding console.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
