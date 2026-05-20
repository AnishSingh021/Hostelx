import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Tag, Bookmark, List, ShieldCheck, LogOut, MapPin, Sun, Moon, MessageCircle, Settings, Camera, X, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [unreadCount, setUnreadCount] = useState(0);

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
          <button onClick={toggleDarkMode} className="p-2 rounded-full bg-muted hover:bg-secondary transition cursor-pointer" title="Toggle Theme">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {/* Settings */}
          <button
            onClick={openSettings}
            className="p-2 rounded-full bg-muted hover:bg-secondary transition cursor-pointer"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
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
          className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-10 flex items-center justify-between gap-5"
        >
          <div className="flex items-center gap-5">
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
          </div>
          <button
            onClick={openSettings}
            className="p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-primary transition-all duration-200 cursor-pointer"
            title="Edit Profile"
          >
            <Settings className="w-5 h-5" />
          </button>
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
