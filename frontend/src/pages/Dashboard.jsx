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
  Sun, 
  Moon, 
  MessageCircle, 
  Settings, 
  Camera, 
  X, 
  Loader2,
  Search,
  Sparkles,
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
  BadgeAlert
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [emergencyListings, setEmergencyListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBoostInfo, setShowBoostInfo] = useState(false);

  // Settings states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    college: '',
    hostel: '',
    room: ''
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const openSettings = () => {
    setSettingsForm({
      name: user?.name || '',
      college: user?.college || '',
      hostel: user?.hostel || '',
      room: user?.room || ''
    });
    setProfilePreview(user?.profileImage || '');
    setProfileImageFile(null);
    setErrorMsg('');
    setSuccessMsg('');
    setIsSettingsOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size must be less than 5MB');
        return;
      }
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!settingsForm.name.trim() || !settingsForm.college.trim() || !settingsForm.hostel.trim()) {
      setErrorMsg('Name, University, and Hostel Name are required');
      return;
    }

    setSaveLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('name', settingsForm.name.trim());
      formData.append('college', settingsForm.college.trim());
      formData.append('hostel', settingsForm.hostel.trim());
      formData.append('room', settingsForm.room.trim());
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const res = await fetch('https://hostelx-backend-a228.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update state in Context
      updateProfile({
        name: data.name,
        college: data.college,
        hostel: data.hostel,
        room: data.room,
        profileImage: data.profileImage
      });

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setIsSettingsOpen(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch('https://hostelx-backend-a228.onrender.com/api/chats/unread', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        setUnreadCount(data.unread || 0);
      } catch (e) { /* silent fail */ }
    };
    fetchUnread();
    // Poll every 10s as a fallback
    const interval = setInterval(fetchUnread, 10000);

    // Also react immediately when another user reads messages (socket)
    const sock = io('https://hostelx-backend-a228.onrender.com');
    sock.emit('setup', user);
    sock.on('messages read', () => fetchUnread());
    sock.on('message received', () => fetchUnread());

    return () => {
      clearInterval(interval);
      sock.disconnect();
    };
  }, [user?.token]);

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const res = await fetch('https://hostelx-backend-a228.onrender.com/api/products?listingType=emergency');
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

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
        }
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

  const firstName = user.name?.split(' ')[0] || 'there';

  const menuItems = [
    {
      label: 'Buy Items',
      desc: 'Browse nearby products',
      icon: <ShoppingBag className="w-7 h-7" />,
      action: () => handleNavigateWithLocation('/marketplace'),
      style: 'bg-card text-card-foreground border border-border hover:border-primary hover:bg-primary/5 shadow-md',
      iconBg: 'bg-primary/10 text-primary',
    },
    {
      label: 'Sell Item',
      desc: 'Upload product / post ads',
      icon: <Tag className="w-7 h-7" />,
      action: () => handleNavigateWithLocation('/sell'),
      style: 'bg-card text-card-foreground border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary sell-btn shadow-md',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      label: 'Saved Items',
      desc: 'View your wishlist',
      icon: <Bookmark className="w-7 h-7" />,
      action: () => navigate('/saved'),
      style: 'bg-card text-card-foreground border border-border hover:bg-rose-500/5 hover:border-rose-400 shadow-md',
      iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    },
    {
      label: 'My Listings',
      desc: 'Manage your products',
      icon: <List className="w-7 h-7" />,
      action: () => navigate('/my-listings'),
      style: 'bg-card text-card-foreground border border-border hover:bg-violet-500/5 hover:border-violet-400 shadow-md',
      iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      label: 'Admin panel',
      desc: 'Manage marketplace',
      icon: <ShieldCheck className="w-7 h-7" />,
      action: () => navigate('/admin'),
      style: 'bg-card text-card-foreground border border-destructive/30 hover:border-destructive hover:bg-destructive/5 shadow-md',
      iconBg: 'bg-destructive/10 text-destructive',
    });
  }

  // Pre-flight quick search items
  const quickSearches = [
    { text: 'Chair under 2000', query: 'chair under 2000' },
    { text: 'Mattress', query: 'mattress' },
    { text: 'Cycle under 3k', query: 'cycle under 3000' },
    { text: 'Study Books', query: 'books' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Nav with premium design */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-2xl tracking-tighter bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            HostelX
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full hidden sm:inline">CAMPUS V2</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Messages */}
          <button
            onClick={() => navigate('/chat')}
            className="relative p-2.5 rounded-full bg-muted hover:bg-secondary transition active:scale-95 cursor-pointer"
            title="Messages"
          >
            <MessageCircle className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={openSettings}
            className="p-2.5 rounded-full bg-muted hover:bg-secondary transition active:scale-95 cursor-pointer"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-3 py-2 rounded-xl transition cursor-pointer border border-transparent hover:border-destructive/10"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        
        {/* Welcome greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">Dormitory Hub</p>
            <h1 className="text-4xl font-black tracking-tight mt-1">
              Welcome, <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">{firstName}!</span> 👋
            </h1>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-2xl shadow-sm self-start sm:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <p className="text-xs font-bold text-muted-foreground">
              GPS Enabled: <span className="text-foreground">{user.hostel}</span>
            </p>
          </div>
        </motion.div>

        {/* Dynamic Price-Drop Alert Badge (Pulsing notifications widget) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/saved')}
          className="relative overflow-hidden bg-gradient-to-r from-rose-500/10 via-card/50 to-primary/5 border border-rose-500/20 rounded-2xl p-4.5 shadow-sm cursor-pointer hover:border-rose-500/40 hover:shadow-md transition-all duration-300 flex items-center gap-4 group"
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

        {/* AI Semantic Search Console (Magic sparkling input box) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden bg-gradient-to-b from-card/90 to-card border-2 border-primary/20 shadow-xl rounded-3xl p-6 backdrop-blur-md group"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-2xl -z-10 group-hover:scale-125 transition-all"></div>
          
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-base font-extrabold tracking-tight">AI Semantic Query Console</h3>
            <span className="px-2 py-0.5 text-[9px] font-extrabold text-primary bg-primary/10 border border-primary/20 rounded-full">NATURAL LANGUAGE</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Try: 'cheap cycle under 3000' or 'mattress' or 'chair below 1k'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-muted/40 border border-border focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm font-medium transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-2xl hover:bg-primary/95 shadow-md shadow-primary/20 hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4.5 h-4.5" /> AI Search
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
                className="px-3 py-1 bg-muted/60 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition cursor-pointer"
              >
                {qs.text}
              </button>
            ))}
          </div>
        </motion.div>

        {/* User Intel & Platform Stats HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Boost Credits HUD Card */}
          <div className="bg-card/50 border border-border p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300">
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
          <div className="bg-card/50 border border-border p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-pink-500/20 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl group-hover:scale-105 transition">
                <Gavel className="w-5.5 h-5.5" />
              </div>
              <Link to="/marketplace?tab=auctions" className="text-xs text-primary font-bold hover:underline">View</Link>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Bids & Auctions Activity</p>
              <h3 className="text-2xl font-black mt-1">Live Console</h3>
              <p className="text-xs text-muted-foreground mt-1">Bid on monitors, cycles, gaming units.</p>
            </div>
          </div>

          {/* Location radius check card */}
          <div className="bg-card/50 border border-border p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-teal-500/20 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl group-hover:scale-105 transition">
                <MapPin className="w-5.5 h-5.5" />
              </div>
              <span className="text-[10px] text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 font-bold uppercase">100m Range</span>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Campus GPS Geolocation</p>
              <h3 className="text-2xl font-black mt-1">Smart Nearby</h3>
              <p className="text-xs text-muted-foreground mt-1">Same hostel ranked first, then nearest units.</p>
            </div>
          </div>

        </div>

        {/* Emergency "Need Now" Ticker Panel */}
        {emergencyListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-500/10 border-2 border-rose-500/20 rounded-2xl relative overflow-hidden shadow-lg shadow-rose-500/5"
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
                  className="flex-shrink-0 w-64 bg-card border border-rose-500/20 hover:border-rose-500 rounded-xl p-3.5 cursor-pointer hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.images?.[0] || 'https://via.placeholder.com/150'}
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

        {/* Showcase Hub Grid of the 17 advanced campus shortcuts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg tracking-tight">Advanced Campus Trading Hubs</h3>
            <span className="text-[10px] text-muted-foreground font-semibold px-2 py-1 bg-secondary rounded-lg border border-border">MODERN FEATURES</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {/* Shortcut 1: Room Essentials (Roommate Marketplace) */}
            <div 
              onClick={() => handleNavigateWithLocation('/marketplace?category=Room%20Essentials')}
              className="bg-card border border-border hover:border-primary/40 hover:bg-primary/5 p-4.5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition flex flex-col items-center justify-center text-center gap-2.5 group"
            >
              <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl group-hover:scale-110 transition">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Roommate Essentials</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Mattress, bucket, induction</p>
              </div>
            </div>

            {/* Shortcut 2: Lost & Found Section */}
            <div 
              onClick={() => handleNavigateWithLocation('/marketplace?tab=lost-found')}
              className="bg-card border border-border hover:border-primary/40 hover:bg-primary/5 p-4.5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition flex flex-col items-center justify-center text-center gap-2.5 group"
            >
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl group-hover:scale-110 transition">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Lost & Found Section</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Report or upload findings</p>
              </div>
            </div>

            {/* Shortcut 3: Semester Exit Sale */}
            <div 
              onClick={() => handleNavigateWithLocation('/marketplace?tag=exit-sale')}
              className="bg-card border border-border hover:border-primary/40 hover:bg-primary/5 p-4.5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition flex flex-col items-center justify-center text-center gap-2.5 group"
            >
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl group-hover:scale-110 transition">
                <Flame className="w-5 h-5 fill-red-500 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Semester Exit Sale</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Leaving hostel fast sales</p>
              </div>
            </div>

            {/* Shortcut 4: Temporary Item Rentals */}
            <div 
              onClick={() => handleNavigateWithLocation('/marketplace?tab=rentals')}
              className="bg-card border border-border hover:border-primary/40 hover:bg-primary/5 p-4.5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition flex flex-col items-center justify-center text-center gap-2.5 group"
            >
              <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl group-hover:scale-110 transition">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Temporary Rentals</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Calculators, monitors hire</p>
              </div>
            </div>

            {/* Shortcut 5: Auction / Bidding System */}
            <div 
              onClick={() => handleNavigateWithLocation('/marketplace?tab=auctions')}
              className="bg-card border border-border hover:border-primary/40 hover:bg-primary/5 p-4.5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition flex flex-col items-center justify-center text-center gap-2.5 group"
            >
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Auction Terminal</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Gaming, cycles bidding</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Delivery Network Logistics Center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleNavigateWithLocation('/marketplace?delivery=true')}
          className="relative overflow-hidden bg-card border border-border p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center gap-5 cursor-pointer hover:border-primary/30 transition-all duration-300 group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl -z-10 group-hover:scale-125 transition-all"></div>
          
          <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition flex-shrink-0">
            <Truck className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h4 className="font-extrabold text-lg text-foreground">Student Campus Delivery Network</h4>
              <span className="px-2.5 py-0.5 text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full uppercase self-center sm:self-auto">EARN MONEY</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Students nearby can earn pocket money by delivering items inside campus! Look for products with active delivery fees, or check <span className="font-bold text-primary">"Can Deliver"</span> when uploading your listings.
            </p>
          </div>

          <button className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition flex-shrink-0 cursor-pointer active:scale-95">
            Explore Delivery Jobs
          </button>
        </motion.div>

        {/* Standard Core Marketplace Actions Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg tracking-tight">Core Marketplace Actions</h3>
            <span className="text-[10px] text-muted-foreground font-semibold px-2 py-1 bg-secondary rounded-lg border border-border">PRODUCT MANAGEMENT</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menuItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                onClick={item.action}
                className={`w-full flex items-center gap-5 p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer ${item.style}`}
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
              className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-3xl p-6 backdrop-blur-lg z-10 space-y-4"
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

      {/* Glassmorphic Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saveLoading && setIsSettingsOpen(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-md bg-card/90 border border-border shadow-2xl rounded-3xl p-6 backdrop-blur-lg overflow-hidden z-10"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                disabled={saveLoading}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-extrabold tracking-tight">Profile Settings</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Keep your hostel and contact information up-to-date
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                {/* DP upload section */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img
                      src={profilePreview || '/placeholder.png'}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Change Profile Picture
                  </button>
                </div>

                {/* Fields */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm font-medium"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      University Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.college}
                      onChange={(e) => setSettingsForm({ ...settingsForm, college: e.target.value })}
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm font-medium"
                      placeholder="e.g. Stanford University"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Hostel Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.hostel}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hostel: e.target.value })}
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm font-medium"
                      placeholder="e.g. Trinity Hall"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Room Number <span className="text-muted-foreground/60 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.room}
                      onChange={(e) => setSettingsForm({ ...settingsForm, room: e.target.value })}
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm font-medium"
                      placeholder="e.g. 302B"
                    />
                  </div>
                </div>

                {/* Notifications */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-center font-medium"
                  >
                    {errorMsg}
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-center font-medium"
                  >
                    {successMsg}
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    disabled={saveLoading}
                    className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/95 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {saveLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
