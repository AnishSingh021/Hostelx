import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Tag, 
  Bookmark, 
  List, 
  ShieldCheck, 
  LogOut, 
  MapPin, 
  MessageCircle, 
  Settings, 
  Camera, 
  X, 
  Loader2,
  Search,
  Zap,
  Bell,
  Truck,
  Flame,
  Gavel,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingDown,
  Info,
  BadgeAlert,
  Menu,
  Shirt,
  Moon,
  Sun
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/ui/Navbar';

const FallbackAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='none'><circle cx='50' cy='50' r='50' fill='%23e2e8f0'/><circle cx='50' cy='38' r='18' fill='%2394a3b8'/><path d='M20 80 C 20 62, 35 55, 50 55 C 65 55, 80 62, 80 80' stroke='%2394a3b8' stroke-width='6' stroke-linecap='round'/></svg>";
const FallbackProductImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 100 100' fill='none'><rect width='100' height='100' rx='16' fill='%23f1f5f9'/><path d='M35 45 L50 32 L65 45 M37 70 L63 70 M40 47 L60 67 M60 47 L40 67' stroke='%23cbd5e1' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/><circle cx='50' cy='56' r='4' fill='%23cbd5e1'/></svg>";

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [emergencyListings, setEmergencyListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBoostInfo, setShowBoostInfo] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products?listingType=emergency`);
        if (res.ok) {
          const data = await res.json();
          setEmergencyListings(data.slice(0, 10));
        }
      } catch (e) {
        console.error('Failed to fetch emergencies:', e);
      }
    };
    fetchEmergencies();
  }, []);

  // Navigate with location permission request
  const handleNavigateWithLocation = (path) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          localStorage.setItem('userLat', position.coords.latitude);
          localStorage.setItem('userLng', position.coords.longitude);
          navigate(path);
        },
        () => {
          // Permission denied — navigate anyway without location
          navigate(path);
        },
        { timeout: 5000 }
      );
    } else {
      navigate(path);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    handleNavigateWithLocation(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="animate-pulse font-medium text-muted-foreground">Loading session details...</p>
      </div>
    );
  }

  let firstName = user.name?.split(' ')[0] || 'there';
  if (firstName === 'HostelX' || user.name === 'HostelX Student') {
    firstName = 'there';
  }

  // Dynamic Time-Based Greeting System — Real-time updates every minute
  const buildGreetingData = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const name = firstName;
    const minuteSeed = Math.floor(minutes / 10); // changes every 10 mins for variety

    const morning = [
      { title: `Good Morning, ${name} ☀️`, subtitle: "Morning has potential — what can you flip today? ☕", mood: "Early riser · Ready for campus hustle" },
      { title: `Rise & Shine, ${name} 🌞`, subtitle: "Dorm life starts here. Quick deals move fast! 🏃", mood: "Morning energy · Marketplace is live" },
      { title: `Wakey Wakey, ${name} 🥐`, subtitle: "Before lectures: check what's being sold near you! 📦", mood: "Caffeinated · Scanning hostel listings" },
    ];
    const afternoon = [
      { title: `Good Afternoon, ${name} 🌤️`, subtitle: "Midday marketplace check — fresh listings since morning 🔥", mood: "Mid-campus grind · Deals cooling down fast" },
      { title: `Afternoon slump, ${name}? 😪`, subtitle: "Some hostel deals are a perfect pick-me-up 🛒", mood: "Post-lunch scroll · Finding hidden gems" },
      { title: `Hey there, ${name} ✌️`, subtitle: "Afternoon is peak trade hours. Check the Auction Terminal 🎯", mood: "Prime trade hours · Campus is buzzing" },
    ];
    const evening = [
      { title: `Good Evening, ${name} 🌆`, subtitle: "Post-class essentials? HostelX has you covered tonight 🌇", mood: "Evening hustle · Dorm life picks up" },
      { title: `Dorm time, ${name} 🍜`, subtitle: "Ready for hostel chaos? Score some room essentials 🏠", mood: "Dinner hour · Hostel buzz is real" },
      { title: `Golden hour, ${name} 🌅`, subtitle: "Buy, sell, or rent before the night rush begins! ✨", mood: "Evening trader · Best time to list" },
    ];
    const night = [
      { title: `Still awake, ${name}? 🦉`, subtitle: "Late night marketplace activity is at its peak 🌙", mood: "Night owl · Marketplace never sleeps" },
      { title: `Night owl, ${name} 🌌`, subtitle: "Midnight scrolling? Some great deals surface after 11 PM 🌠", mood: "Cramming + Trading · Sleep is optional" },
      { title: `Late night grind, ${name} 🕯️`, subtitle: "Hostel trading knows no bedtime. Let's get to it 💪", mood: "2 AM deal hunter · Eyes wide open" },
    ];

    let pool;
    if (hours >= 5 && hours < 12) pool = morning;
    else if (hours >= 12 && hours < 17) pool = afternoon;
    else if (hours >= 17 && hours < 22) pool = evening;
    else pool = night;

    return pool[minuteSeed % pool.length];
  };

  const [greetingData, setGreetingData] = useState(buildGreetingData);
  const [liveTime, setLiveTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  });

  useEffect(() => {
    const tick = () => {
      setGreetingData(buildGreetingData());
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [firstName]);

  const menuItems = [
    {
      label: 'Buy Items',
      desc: 'Browse nearby products',
      icon: <ShoppingBag className="w-7 h-7" />,
      action: () => handleNavigateWithLocation('/marketplace'),
      style: 'bg-card/40 backdrop-blur-xl text-card-foreground border border-white/20 dark:border-white/10 hover:border-primary hover:bg-primary/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]',
      iconBg: 'bg-primary/10 text-primary',
    },
    {
      label: 'Sell Item',
      desc: 'Upload product / post ads',
      icon: <Tag className="w-7 h-7" />,
      action: () => handleNavigateWithLocation('/sell'),
      style: 'bg-card/40 backdrop-blur-xl text-card-foreground border border-white/20 dark:border-white/10 hover:bg-primary/90 hover:text-primary-foreground hover:border-primary sell-btn shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      label: 'Saved Items',
      desc: 'View your wishlist',
      icon: <Bookmark className="w-7 h-7" />,
      action: () => navigate('/saved'),
      style: 'bg-card/40 backdrop-blur-xl text-card-foreground border border-white/20 dark:border-white/10 hover:bg-rose-500/10 hover:border-rose-400 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]',
      iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    },
    {
      label: 'My Listings',
      desc: 'Manage your products',
      icon: <List className="w-7 h-7" />,
      action: () => navigate('/my-listings'),
      style: 'bg-card/40 backdrop-blur-xl text-card-foreground border border-white/20 dark:border-white/10 hover:bg-violet-500/10 hover:border-violet-400 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]',
      iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      label: 'Admin panel',
      desc: 'Manage marketplace',
      icon: <ShieldCheck className="w-7 h-7" />,
      action: () => navigate('/admin'),
      style: 'bg-card/40 backdrop-blur-xl text-card-foreground border border-destructive/30 hover:border-destructive hover:bg-destructive/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]',
      iconBg: 'bg-destructive/10 text-destructive',
    });
  }

  // Pre-flight quick search items
  const quickSearches = [
    { text: 'Mattress', query: 'mattress' },
    { text: 'Cycle', query: 'cycle' },
    { text: 'Calculator', query: 'calculator' },
    { text: 'Sneakers', query: 'sneakers' },
    { text: 'Study Table', query: 'study table' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Glassmorphism Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-rose-500/10 blur-[100px] pointer-events-none" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Welcome greeting with real-time animated transitions */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {user.hostel ? `${user.hostel} Community` : 'Chandigarh University Hostel Community'}
            </p>
            <AnimatePresence mode="wait">
              <motion.h1
                key={greetingData.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-foreground"
              >
                {greetingData.title}
              </motion.h1>
            </AnimatePresence>
            <p className="text-xs text-muted-foreground mt-1 max-w-lg font-medium leading-relaxed">
              {greetingData.subtitle}
            </p>
          </div>

          {/* Quick Stats Pill with live time */}
          <div className="flex flex-col items-end gap-1.5 self-start sm:self-auto">
            <div className="flex items-center gap-4 text-right">
              <button
                onClick={() => {
                  if (theme === 'system') setTheme('dark');
                  else if (theme === 'dark') setTheme('light');
                  else setTheme('system');
                }}
                className="p-2 bg-muted rounded-full hover:bg-muted/80 transition text-muted-foreground hover:text-foreground"
                title={`Theme: ${theme}`}
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'light' ? <Sun className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              </button>
              <p className="text-xs font-semibold text-muted-foreground">
                Hostel: <span className="text-foreground font-bold">{user.hostel}</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground bg-muted/40 border border-border/60 px-3 py-1 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {liveTime}
            </div>
          </div>
        </motion.div>

        {/* Dynamic Price-Drop Alert Badge (Pulsing notifications widget) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/saved')}
          className="relative overflow-hidden bg-gradient-to-r from-rose-500/10 via-card/50 to-primary/5 border border-rose-500/20 rounded-lg p-4.5 shadow-sm cursor-pointer hover:border-rose-500/40 hover:shadow-md transition-all duration-300 flex items-center gap-4 group"
        >
          <div className="p-3 bg-rose-500/20 text-rose-500 rounded-xl group-hover:scale-110 transition shadow-inner flex-shrink-0">
            <Bell className="w-5.5 h-5.5 animate-bounce" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-rose-500 font-bold px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-full uppercase">Alert Engine</span>
              <span className="text-[9px] text-muted-foreground font-semibold">10 minutes ago</span>
            </div>
            <h4 className="text-sm font-bold text-foreground mt-1 truncate">Wishlist Price Drop Detected!</h4>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              A saved mattress item in your wishlist recently dropped in price. Click here to grab it!
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition ml-auto flex-shrink-0" />
        </motion.div>

        {/* Search Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-xl p-6 group"
        >
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="text-base font-extrabold tracking-tight">Search Hostel Listings</h3>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search items in your hostel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background/50 backdrop-blur-md border border-white/20 dark:border-white/10 focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 rounded-xl text-sm font-medium transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/95 shadow-md shadow-primary/25 hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              Search
            </button>
          </form>

          {/* Quick pre-populated searches */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5">
            <span className="text-xs text-muted-foreground font-semibold">Popular queries:</span>
            {quickSearches.map((qs) => (
              <button
                key={qs.text}
                onClick={() => {
                  setSearchQuery(qs.query);
                  handleNavigateWithLocation(`/marketplace?search=${encodeURIComponent(qs.query)}`);
                }}
                className="px-3 py-1 bg-background/40 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/10 transition cursor-pointer shadow-sm"
              >
                {qs.text}
              </button>
            ))}
          </div>
        </motion.div>

        {/* User Intel & Platform Stats HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Boost Credits HUD Card */}
          <div className="bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 rounded-xl flex flex-col justify-between shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] relative overflow-hidden group hover:border-amber-500/40 hover:bg-card/60 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-105 transition">
                <Zap className="w-5.5 h-5.5 fill-amber-500 animate-pulse" />
              </div>
              <button 
                onClick={() => setShowBoostInfo(true)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition"
                title="Boost listing stats info"
              >
                <Info className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Premium Visibility Balance</p>
              <h3 className="text-2xl font-black mt-1 flex items-center gap-1.5">
                {user.boostCredits !== undefined ? user.boostCredits : 5} Credits
                <span className="text-xs text-amber-500 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25 font-extrabold">Active</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Get products ranked #1 in searches.</p>
            </div>
          </div>

          {/* Active Auctions/Bids Stats Card */}
          <div className="bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 rounded-xl flex flex-col justify-between shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] relative overflow-hidden group hover:border-pink-500/40 hover:bg-card/60 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl group-hover:scale-105 transition">
                <Gavel className="w-5.5 h-5.5" />
              </div>
              <Link to="/auctions" className="text-xs text-primary font-bold hover:underline">View</Link>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Bids & Auctions Activity</p>
              <h3 className="text-2xl font-black mt-1">Live Console</h3>
              <p className="text-xs text-muted-foreground mt-1">Bid on monitors, cycles, gaming units.</p>
            </div>
          </div>

          {/* Location radius check card */}
          <div 
            onClick={() => handleNavigateWithLocation('/nearby')}
            className="bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 rounded-xl flex flex-col justify-between shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] relative overflow-hidden group hover:border-teal-500/40 cursor-pointer hover:bg-card/60 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl group-hover:scale-105 transition">
                <MapPin className="w-5.5 h-5.5" />
              </div>
              <span className="text-[10px] text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 font-bold uppercase">100m Range</span>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Nearby Hostel Listings</p>
              <h3 className="text-2xl font-black mt-1">Smart Nearby</h3>
              <p className="text-xs text-muted-foreground mt-1">Find items available around your hostel.</p>
            </div>
          </div>

        </div>

        {/* Emergency "Need Now" Ticker Panel */}
        {emergencyListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-500/10 backdrop-blur-xl border-2 border-rose-500/30 rounded-xl relative overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-rose-500 font-extrabold text-xs uppercase tracking-wider animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                Need Now: Emergency Marketplace 🚨
              </span>
              <Link to="/marketplace?listingType=emergency" className="text-xs text-rose-500 font-bold hover:underline">
                View All Needs
              </Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar scroll-smooth">
              {emergencyListings.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/product/${item._id}`)}
                  className="flex-shrink-0 w-64 bg-card/60 backdrop-blur-md border border-rose-500/30 hover:border-rose-500 rounded-xl p-3.5 cursor-pointer hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.images?.[0] || FallbackProductImage}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover border border-border flex-shrink-0"
                    />
                    <div className="overflow-hidden min-w-0">
                      <h4 className="font-extrabold text-sm text-foreground truncate">{item.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{item.hostel} · Room {item.seller?.room || 'Dorm'}</p>
                      <p className="text-xs text-rose-500 font-bold mt-0.5">Budget: ₹{item.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Campus Trading Hubs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg tracking-tight">Campus Trading Hubs</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {/* Shortcut 1: Lost & Found Section */}
            <div 
              onClick={() => handleNavigateWithLocation('/lost-found')}
              className="bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:border-primary/50 hover:bg-card/60 p-4.5 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-lg cursor-pointer transition flex flex-col items-center justify-center text-center gap-2.5 group"
            >
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl group-hover:scale-110 transition">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Lost & Found Section</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Report or upload findings</p>
              </div>
            </div>

            {/* Shortcut 2: Semester Exit Sale */}
            <div 
              onClick={() => handleNavigateWithLocation('/exit-sale')}
              className="bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:border-primary/50 hover:bg-card/60 p-4.5 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-lg cursor-pointer transition flex flex-col items-center justify-center text-center gap-2.5 group"
            >
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl group-hover:scale-110 transition">
                <Flame className="w-5 h-5 fill-red-500 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Semester Exit Sale</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Leaving hostel fast sales</p>
              </div>
            </div>

            {/* Shortcut 3: Temporary Item Rentals */}
            <div 
              onClick={() => handleNavigateWithLocation('/rentals')}
              className="bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:border-primary/50 hover:bg-card/60 p-4.5 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-lg cursor-pointer transition flex flex-col items-center justify-center text-center gap-2.5 group"
            >
              <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl group-hover:scale-110 transition">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Temporary Rentals</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Calculators, monitors hire</p>
              </div>
            </div>

            {/* Shortcut 4: Auction / Bidding System */}
            <div 
              onClick={() => handleNavigateWithLocation('/auctions')}
              className="bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:border-primary/50 hover:bg-card/60 p-4.5 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-lg cursor-pointer transition flex flex-col items-center justify-center text-center gap-2.5 group"
            >
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Auction Terminal</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Gaming, cycles bidding</p>
              </div>
            </div>

            {/* Shortcut: My Rental Requests */}
            <div 
              onClick={() => handleNavigateWithLocation('/my-rentals')}
              className="bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:border-primary/50 hover:bg-card/60 p-4.5 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-lg cursor-pointer transition flex flex-col items-center justify-center text-center gap-2.5 group"
            >
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Rental Requests</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Manage your outfits</p>
              </div>
            </div>

            {/* Shortcut 5: Campus Fit Rental */}
            <div 
              onClick={() => navigate('/fashion')}
              className="bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:border-primary/50 hover:bg-card/60 p-4.5 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-lg cursor-pointer transition flex flex-col items-center justify-center text-center gap-2.5 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-wider rounded-bl-lg">
                New
              </div>
              <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl group-hover:scale-110 transition">
                <Shirt className="w-5 h-5 fill-violet-500/20" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Rent Your Vibe</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Rent clothes & sneakers</p>
              </div>
            </div>
          </div>

        </div>


        {/* Standard Core Marketplace Actions Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg tracking-tight">Core Marketplace Actions</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menuItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                onClick={item.action}
                className={`w-full flex items-center gap-5 p-5 rounded-lg text-left transition-all duration-200 cursor-pointer ${item.style}`}
              >
                <div className={`p-3.5 rounded-xl ${item.iconBg} flex-shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg leading-tight">{item.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{item.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

      </main>

      {/* Boost Informative Modal */}
      <AnimatePresence>
        {showBoostInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBoostInfo(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-lg p-6 backdrop-blur-lg z-10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Zap className="w-6 h-6 fill-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">Listing Boost Credits</h3>
                  <p className="text-xs text-muted-foreground">Advanced campus visibility assets</p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>🚀 **What is Listing Boost?**</p>
                <p>Boosting an item consumes **1 Credit** and pins your listing to the absolute top of the campus feed and search queries for **24 Hours**, allowing you to sell it 3x faster.</p>
                <p>🔥 **How to earn credits?**</p>
                <p>Every student receives **5 free credits** on registration. You can earn additional credits by completing secure meetup transactions using QR verification codes with buyers, or by maintaining high seller trust ratings!</p>
              </div>

              <button 
                onClick={() => setShowBoostInfo(false)}
                className="w-full py-2.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl border border-border hover:bg-muted transition cursor-pointer"
              >
                Got It!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}

