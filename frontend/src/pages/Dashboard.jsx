import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Tag, Bookmark, List, ShieldCheck, LogOut, MapPin, Sun, Moon, MessageCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [unreadCount, setUnreadCount] = useState(0);

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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
      style: 'bg-card text-card-foreground border border-border hover:border-primary hover:bg-primary/5',
      iconBg: 'bg-primary/10 text-primary',
    },
    {
      label: 'Sell Item',
      desc: 'Upload a new product',
      icon: <Tag className="w-7 h-7" />,
      action: () => handleNavigateWithLocation('/sell'),
      style: 'bg-card text-card-foreground border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary sell-btn',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      label: 'Saved Items',
      desc: 'View your wishlist',
      icon: <Bookmark className="w-7 h-7" />,
      action: () => navigate('/saved'),
      style: 'bg-card text-card-foreground border border-border',
      iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    },
    {
      label: 'My Listings',
      desc: 'Manage your products',
      icon: <List className="w-7 h-7" />,
      action: () => navigate('/my-listings'),
      style: 'bg-card text-card-foreground border border-border',
      iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      label: 'Admin Panel',
      desc: 'Manage marketplace',
      icon: <ShieldCheck className="w-7 h-7" />,
      action: () => navigate('/admin'),
      style: 'bg-card text-card-foreground border border-destructive/30',
      iconBg: 'bg-destructive/10 text-destructive',
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Nav */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-xl tracking-tight text-primary">HostelX</span>
        <div className="flex items-center gap-3">
          {/* Messages */}
          <button
            onClick={() => navigate('/chat')}
            className="relative p-2 rounded-full bg-muted hover:bg-secondary transition cursor-pointer"
            title="Messages"
          >
            <MessageCircle className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {/* Dark mode */}
          <button onClick={toggleDarkMode} className="p-2 rounded-full bg-muted hover:bg-secondary transition cursor-pointer">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Welcome greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-muted-foreground text-base mb-1">Good to see you,</p>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome, <span className="text-primary">{firstName}!</span> 👋
          </h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-10 flex items-center gap-5"
        >
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/30"
          />
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <p className="text-sm mt-1 text-primary font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {user.hostel}, {user.college}
              {user.room && ` · Room ${user.room}`}
            </p>
          </div>
        </motion.div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              onClick={item.action}
              className={`w-full flex items-center gap-5 p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer ${item.style}`}
            >
              <div className={`p-3 rounded-xl ${item.iconBg} flex-shrink-0`}>
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{item.label}</h3>
                <p className="text-sm opacity-70 mt-0.5">{item.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}
