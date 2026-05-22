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

// Ambient mock terminal activity updates for a realistic live-market look
const MOCK_TICKER_UPDATES = [
  "Ramanujan Hostel: Kabir Mehta placed a ₹450 bid on Drew House Hoodie",
  "Gargi Hall: Sneha Patel is inspecting Royal Sherwani listings",
  "Krishna Bhavan: Dev Patel saved Btwin Rockrider Cycle",
  "Vyasa Hostel: Amit Roy placed a ₹2,800 bid on LG Gaming Monitor",
  "Sarojini House: Diya Sharma placed a ₹1,200 bid on Cozy Bean Bag",
  "Meera Hall: Neha Sen placed a ₹600 bid on Polaroid Camera",
  "Budh Bhavan: Raj Malhotra placed a ₹800 bid on Corsair Keyboard"
];

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
  const [tickerIndex, setTickerIndex] = useState(0);
  const [autoBidMax, setAutoBidMax] = useState('');
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);

  // Poll for ticker updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % MOCK_TICKER_UPDATES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  // Helper: render monospace countdown with urgency colors
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
      ? 'bg-zinc-800 text-zinc-500 border-zinc-700'
      : urgency === 'critical'
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
      : urgency === 'warning'
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
      : 'bg-pink-500/10 text-pink-400 border border-pink-500/20';

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
      // In a real application, sold auctions are marked as such. Here we show ended or items with bids
      return isEnded;
    }
    if (activeTab === 'my-bids') {
      // Bids where current user has bid
      if (!user) return false;
      return item.bids?.some(b => b.bidder === user._id || b.bidder?._id === user._id);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col relative pb-10">
      {/* Background Neon Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Campus live activity ticker banner */}
      <div className="bg-pink-500/10 border-b border-pink-500/20 text-pink-400 text-[10px] font-black uppercase tracking-wider py-2 overflow-hidden flex items-center justify-center relative">
        <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping mr-2"></span>
        <span className="animate-pulse duration-1000 transition-all">
          {MOCK_TICKER_UPDATES[tickerIndex]}
        </span>
      </div>

      {/* Header bar */}
      <header className="max-w-7xl w-full mx-auto px-4 py-6 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="p-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition cursor-pointer text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Gavel className="w-5.5 h-5.5 text-pink-500 animate-pulse" />
              Live Auction Terminal
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Real-time student bidding desk</p>
          </div>
        </div>

        {/* Global Live Stat Chip */}
        <span className="flex items-center gap-2 text-xs font-black bg-pink-500/10 text-pink-400 px-3.5 py-1.5 rounded-2xl border border-pink-500/20 shadow-lg shadow-pink-500/5">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
          LIVE DEMAND INDEX
        </span>
      </header>

      {/* Main Grid content */}
      <main className="max-w-7xl w-full mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Left Side: Auctions Grid directory */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Action Row: Search and Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/30 border border-zinc-900 p-4 rounded-3xl backdrop-blur-xl">
            
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
                      ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input bar */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                placeholder="Search live deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 bg-zinc-950 border border-zinc-900 rounded-xl focus:ring-1 focus:ring-pink-500 outline-none text-xs font-semibold text-zinc-300"
              />
            </div>

          </div>

          {/* Directory Listings container */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Syncing Live Bidding Ledger...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/10 border border-zinc-900 rounded-3xl p-8 max-w-md mx-auto flex flex-col items-center">
              <Gavel className="w-12 h-12 text-zinc-700 mb-4 animate-bounce" />
              <h4 className="font-extrabold text-sm text-zinc-300">No auctions matched</h4>
              <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed">
                Currently no active campus auctions found under this tab. Check back shortly or host one!
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
                    className={`bg-zinc-900/30 border p-5 rounded-3xl cursor-pointer flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden group ${
                      isSelected 
                        ? 'border-pink-500 bg-[#160d15]/20 shadow-lg shadow-pink-500/5 ring-1 ring-pink-500/20' 
                        : 'border-zinc-900 hover:border-zinc-800'
                    }`}
                  >
                    {/* Glowing highlight indicator */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>

                    {/* Top image & status */}
                    <div className="flex gap-4">
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/150'}
                        alt={item.title}
                        className="w-18 h-18 rounded-2xl object-cover border border-zinc-900 flex-shrink-0 group-hover:scale-102 transition"
                      />
                      <div className="overflow-hidden min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping"></span>
                          <span className="text-[9px] font-black uppercase text-pink-400 tracking-wider">Pulsing Active</span>
                        </div>
                        <h3 className="font-extrabold text-xs sm:text-sm text-zinc-200 group-hover:text-pink-400 transition-colors truncate">
                          {item.title}
                        </h3>
                        <p className="text-[9px] text-zinc-500 truncate font-semibold">
                          📍 {item.hostel} · Room {item.seller?.room || 'Dorm'}
                        </p>
                      </div>
                    </div>

                    {/* Auction specific stats card */}
                    <div className="grid grid-cols-2 gap-2.5 pt-3.5 border-t border-zinc-900/60">
                      <div className="bg-zinc-950/40 p-2 rounded-xl border border-zinc-900">
                        <span className="text-[8px] text-zinc-500 uppercase font-black block">Starting Bid</span>
                        <span className="text-xs font-black text-zinc-300">₹{item.startingBid}</span>
                      </div>
                      <div className="bg-zinc-950/40 p-2 rounded-xl border border-zinc-900">
                        <span className="text-[8px] text-pink-500/80 uppercase font-black block">Highest Bid</span>
                        <span className="text-xs font-black text-pink-400">₹{currentBid}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold uppercase">
                        <Users className="w-3.5 h-3.5 text-zinc-600" />
                        <span>{item.bids?.length || 0} active bids</span>
                        {/* Outbid badge: show if user was previously highest but got outbid */}
                        {user && item.bids?.length >= 2 && (() => {
                          const sorted = [...(item.bids || [])].sort((a, b) => b.amount - a.amount);
                          const topBidder = sorted[0]?.bidder?._id || sorted[0]?.bidder;
                          const secondBidder = sorted[1]?.bidder?._id || sorted[1]?.bidder;
                          const userId = user._id;
                          if (secondBidder === userId && topBidder !== userId) {
                            return <span className="ml-1 px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-[8px] font-black rounded border border-rose-500/30 animate-pulse">OUTBID!</span>;
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

        {/* Right Side: High-fidelity Live Terminal console */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <AnimatePresence mode="wait">
            {selectedAuction ? (
              <motion.div
                key={`terminal-${selectedAuction._id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-[#0b0e16] border border-zinc-800 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden space-y-6 sticky top-6"
              >
                {/* Glowing border top accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500 to-blue-500"></div>

                {/* Selected header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded uppercase">
                      Live Console Connected
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-zinc-100 mt-2 truncate max-w-[200px]" title={selectedAuction.title}>
                      {selectedAuction.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedAuction(null)}
                    className="text-xs font-bold text-zinc-500 hover:text-zinc-300 hover:underline cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>

                {/* Main Product Showcase */}
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950">
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
                <div className="bg-zinc-950/60 p-4.5 rounded-2xl border border-zinc-900 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Starting Price</span>
                    <span className="font-black text-zinc-300">₹{selectedAuction.startingBid}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-zinc-900 pt-2.5">
                    <span className="text-pink-400 font-black uppercase tracking-wider text-[9px]">Live High Bid</span>
                    <span className="text-base font-black text-pink-400">₹{getHighestBid(selectedAuction)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-zinc-900 pt-2.5">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Bids Logged</span>
                    <span className="font-bold text-zinc-300">{selectedAuction.bids?.length || 0} rounds</span>
                  </div>
                </div>

                {/* Auto-Bid Section */}
                <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-wider">Auto-Bid Ceiling</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5">System bids up to your max when outbid</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoBidEnabled(p => !p)}
                      className={`w-10 h-5 rounded-full border transition-all duration-200 cursor-pointer relative ${autoBidEnabled ? 'bg-pink-500 border-pink-500' : 'bg-zinc-800 border-zinc-700'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${autoBidEnabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {autoBidEnabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-500">₹</span>
                      <input
                        type="number"
                        placeholder={`Max ceiling (current: ₹${getHighestBid(selectedAuction)})`}
                        value={autoBidMax}
                        onChange={(e) => setAutoBidMax(e.target.value)}
                        className="w-full pl-7 pr-4 py-2.5 bg-zinc-950 border border-pink-500/30 rounded-xl focus:ring-1 focus:ring-pink-500 outline-none text-xs font-black text-zinc-200"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Bid input form */}
                <form onSubmit={handlePlaceBid} className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-500">₹</span>
                    <input
                      type="number"
                      required
                      placeholder={`Enter bid (min ₹${getHighestBid(selectedAuction) + 1})`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full pl-8.5 pr-4 py-3.5 bg-zinc-950 border border-zinc-900 rounded-2xl focus:ring-1 focus:ring-pink-500 outline-none text-xs font-black text-zinc-200"
                    />
                  </div>

                  {bidError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold rounded-xl flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {bidError}
                    </div>
                  )}

                  {bidSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-xl flex items-center gap-1.5 animate-pulse">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      Bid registered successfully! 🔨
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bidLoading}
                    className="w-full py-4 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow-lg shadow-pink-500/15 hover:shadow-pink-500/25 transition duration-300 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
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

                {/* Scrolling bid timeline log */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                    <History className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Real-time Bidding Logs</span>
                  </div>

                  <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 max-h-40 overflow-y-auto no-scrollbar space-y-3">
                    {selectedAuction.bids?.length > 0 ? (
                      selectedAuction.bids.slice().reverse().map((bid, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 text-xs border-b border-zinc-900/50 pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-[10px] border border-zinc-700 flex-shrink-0">
                              {bid.bidder?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-bold text-zinc-300 truncate text-[11px]">{bid.bidder?.name || 'Anonymous User'}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-pink-400 text-[11px]">₹{bid.amount}</span>
                            <span className="text-[8px] text-zinc-500 block">
                              {new Date(bid.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-zinc-500 font-semibold text-center italic py-4">No bidding history recorded yet. Standout and lead!</p>
                    )}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="bg-[#0b0e16]/30 border border-zinc-900 border-dashed rounded-[2rem] p-8 text-center flex flex-col items-center justify-center h-80 sticky top-6">
                <Gavel className="w-10 h-10 text-zinc-700 mb-3 animate-pulse" />
                <h4 className="font-bold text-xs text-zinc-400">No Terminal Selected</h4>
                <p className="text-[10px] text-zinc-500 mt-2 max-w-[200px] leading-relaxed">
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
