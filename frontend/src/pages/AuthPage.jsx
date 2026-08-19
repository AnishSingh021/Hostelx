import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  User, 
  MapPin, 
  Building, 
  DoorOpen, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  ShoppingBag, 
  MessageSquare, 
  ShieldCheck,
  TrendingUp,
  Search,
  X,
  ChevronDown,
  Check,
  Compass,
  Layers,
  Home
} from 'lucide-react';
import { CAMPUS_DATA } from '../data/hostels';
import { BACKEND_URL } from '../config';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile as updateFirebaseProfile 
} from 'firebase/auth';

// Sleek animated SVG Logo for HostelX
const HostelXLogo = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" /> {/* Vibrant Blue */}
        <stop offset="100%" stopColor="#1d4ed8" /> {/* Darker Indigo-Blue */}
      </linearGradient>
    </defs>
    {/* Outer rotating pulse ring */}
    <motion.circle 
      cx="50" 
      cy="50" 
      r="44" 
      stroke="url(#logoGradient)" 
      strokeWidth="4" 
      strokeDasharray="6 6"
      animate={{ rotate: 360 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
    />
    {/* Modern architectural roof structure */}
    <path 
      d="M20 40 L50 20 L80 40" 
      stroke="url(#logoGradient)" 
      strokeWidth="7" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Hostel floor foundation */}
    <path 
      d="M22 75 L78 75" 
      stroke="url(#logoGradient)" 
      strokeWidth="6" 
      strokeLinecap="round" 
    />
    {/* Exchange / Marketplace Arrow symbol forming an "X" in the center */}
    <path 
      d="M32 44 L68 70 M68 44 L32 70" 
      stroke="url(#logoGradient)" 
      strokeWidth="8" 
      strokeLinecap="round" 
    />
    {/* Little glowing core dot */}
    <circle cx="50" cy="57" r="5" fill="url(#logoGradient)" className="animate-pulse" />
  </svg>
);
// Premium offline vector SVG avatar fallback
const FallbackAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='none'><circle cx='50' cy='50' r='50' fill='%23e2e8f0'/><circle cx='50' cy='38' r='18' fill='%2394a3b8'/><path d='M20 80 C 20 62, 35 55, 50 55 C 65 55, 80 62, 80 80' stroke='%2394a3b8' stroke-width='6' stroke-linecap='round'/></svg>";

export default function AuthPage() {
  const { user, login, updateProfile } = useAuth();
  const [step, setStep] = useState(1); // 1: Authentication, 2: Profile Completion
  const [isLoginTab, setIsLoginTab] = useState(true); // Toggle between Login and Signup forms
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCustomCollege, setIsCustomCollege] = useState(false);
  const [isCustomHostel, setIsCustomHostel] = useState(false);
  
  // Custom searchable hostel selector states
  const [showHostelSelector, setShowHostelSelector] = useState(false);
  const [hostelSearchQuery, setHostelSearchQuery] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: 'Chandigarh University',
    hostel: 'Zakir B',
    room: '',
    wing: '',
    floor: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If user is already authenticated in context but profile is incomplete, force profile completion
  useEffect(() => {
    if (user) {
      if (!user.college || !user.hostel) {
        setStep(2);
        setFormData(prev => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          college: user.college || 'Chandigarh University',
          hostel: user.hostel || 'Zakir B',
          room: user.room || prev.room,
          wing: user.wing || prev.wing || '',
          floor: user.floor || prev.floor || ''
        }));
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  // Form input validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!isLoginTab && !formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!isLoginTab) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Synchronize authenticated Firebase user with MongoDB backend
  const syncWithBackend = async (firebaseUser, displayNameValue) => {
    const idToken = await firebaseUser.getIdToken();
    const response = await fetch(`${BACKEND_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken,
        name: displayNameValue || firebaseUser.displayName || 'Student',
        email: firebaseUser.email,
        profileImage: firebaseUser.photoURL || FallbackAvatar
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Database synchronization failed');
    }
    
    // Save to global Auth context (which handles localStorage and local session)
    login(data);

    if (!data.college || !data.hostel) {
      setStep(2);
    } else {
      navigate('/dashboard');
    }
  };

  // Google Sign In Authentication
  const handleGoogleLogin = async () => {
    setLoading(true);
    setServerError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncWithBackend(result.user);
    } catch (error) {
      console.error('Google Sign In error:', error);
      // Clean context in case of weird network issues
      localStorage.removeItem('hostelx_user');
      
      // Make errors student-friendly
      if (error.code === 'auth/popup-closed-by-user') {
        setServerError('Sign-in popup closed before completion. Please try again.');
      } else {
        setServerError(error.message || 'Google Sign In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Email & Password Submit (Login or Sign Up)
  const handleEmailAuthSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isLoginTab) {
        // --- 1. EMAIL & PASSWORD LOGIN ---
        const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        await syncWithBackend(result.user);
      } else {
        // --- 2. EMAIL & PASSWORD SIGNUP ---
        const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Update display name in Firebase Auth
        await updateFirebaseProfile(result.user, {
          displayName: formData.name
        });
        
        // Sync new account with MongoDB
        await syncWithBackend(result.user, formData.name);
      }
    } catch (error) {
      console.error('Email Authentication error:', error);
      localStorage.removeItem('hostelx_user');
      
      // Readable Firebase error code mappings
      switch (error.code) {
        case 'auth/email-already-in-use':
          setServerError('This email address is already in use by another account.');
          break;
        case 'auth/invalid-email':
          setServerError('Invalid email address format.');
          break;
        case 'auth/weak-password':
          setServerError('Password is too weak. Please use a stronger password.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setServerError('Incorrect email or password. Please try again.');
          break;
        default:
          setServerError(error.message || 'Authentication failed. Please verify your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Profile Details Completion (Step 2)
  const handleProfileCompleteSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.college.trim() || !formData.hostel.trim()) {
      setServerError('College and Hostel details are required.');
      return;
    }

    setLoading(true);
    setServerError('');
    
    // Retrieve current synced user details from local storage
    const stored = localStorage.getItem('hostelx_user');
    if (!stored) {
      setServerError('User session not found. Please log in again.');
      setStep(1);
      setLoading(false);
      return;
    }
    
    const currentUser = JSON.parse(stored);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          college: formData.college,
          hostel: formData.hostel,
          room: formData.room,
          wing: formData.wing,
          floor: formData.floor
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        // Sync context
        updateProfile(data);
        navigate('/dashboard');
      } else {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('hostelx_user');
          setServerError('Session expired. Please sign in again.');
          setStep(1);
        } else {
          setServerError(data.message || 'Profile completion failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Profile complete error:', error);
      setServerError('Network error while completing profile. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Reset errors when swapping tabs
  const handleTabToggle = (toLogin) => {
    setIsLoginTab(toLogin);
    setServerError('');
    setValidationErrors({});
    setFormData(prev => ({
      ...prev,
      password: '',
      confirmPassword: ''
    }));
  };

  return (
    <div className="min-h-screen w-full flex items-stretch justify-center bg-gray-50 text-slate-800 antialiased">
      
      {/* LEFT COLUMN: Premium Modern Branding (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 text-white relative overflow-hidden flex-col justify-between p-12 lg:p-16">
        
        {/* Cinematic Photographic Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] ease-linear scale-110"
          style={{ backgroundImage: "url('/assets/login_bg.png')" }}
        />
        {/* Rich gradient overlay for text readability and cinematic feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-indigo-900/80 to-blue-900/90 pointer-events-none mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 pointer-events-none" />
        
        {/* Top Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 relative z-10"
        >
          <div className="bg-white/10 backdrop-blur-xl p-2.5 rounded-2xl border border-white/20 shadow-2xl">
            <HostelXLogo className="w-8 h-8" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-md">
            HostelX
          </span>
        </motion.div>

        {/* Feature Cards Grid (Middle Content) */}
        <div className="my-auto max-w-lg space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-blue-200">
              <MapPin className="w-3.5 h-3.5 animate-pulse" /> Chandigarh University
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Buy, Sell & Connect <br />
              <span className="bg-gradient-to-r from-blue-200 to-teal-100 bg-clip-text text-transparent">
                In Your Hostel
              </span>
            </h1>
            <p className="text-lg text-blue-100/90 leading-relaxed font-light">
              HostelX is the premier hyper-local marketplace optimized for Chandigarh University hostellers to trade mattresses, study lamps, room gadgets, and exit sale bundles.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: ShoppingBag, label: "Hostel Trade", desc: "Buy & sell mattresses, study lamps, and fans safely inside wings." },
              { icon: MessageSquare, label: "Direct Chat", desc: "Negotiate live in real-time with other CU hostellers." },
              { icon: ShieldCheck, label: "Hostel Access", desc: "Secure hyper-local trades verified for Chandigarh University." },
              { icon: TrendingUp, label: "Instant Bidding", desc: "List emergency clearance items dynamically before exit dates." }
            ].map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + idx * 0.1 }}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
                className="bg-white/5 backdrop-blur-md transition-all border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-lg"
              >
                <div className="bg-gradient-to-br from-blue-400 to-indigo-400 w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-inner">
                  <feat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm tracking-wide">{feat.label}</h3>
                  <p className="text-xs text-blue-100/70 mt-1.5 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-blue-200/50 relative z-10 border-t border-white/5 pt-6 font-medium">
          <span>© {new Date().getFullYear()} HostelX Technologies</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure Authentication</span>
        </div>
      </div>

      {/* RIGHT COLUMN: The Interactive Authenticating Card (Mobile Friendly) */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center p-6 md:p-12 lg:p-16 bg-white relative">
        {/* Subtle right-side ambient glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] pointer-events-none opacity-50" />
        
        <div className="w-full max-w-md flex flex-col items-stretch space-y-8 relative z-10">
          
          {/* Centered Brand Header Logo (Both Mobile & Desktop) */}
          <div className="text-center flex flex-col items-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center justify-center p-4 rounded-[2rem] bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-xl shadow-blue-900/5"
            >
              <HostelXLogo className="w-14 h-14" />
            </motion.div>
            
            <h2 className="text-3xl font-black text-slate-900 tracking-tight animate-fade-in">
              {step === 1 ? (isLoginTab ? 'Welcome Back' : 'Join HostelX') : 'Complete Setup'}
            </h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
              {step === 1 
                ? (isLoginTab ? 'Log in with your CU account to browse hostel deals.' : 'Create an account to start trading inside Chandigarh University hostels.') 
                : 'Choose your hostel to discover nearby listings from students around you.'}
            </p>

            {step === 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-1.5 pt-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600">
                <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Verified CU Student</span>
              </div>
            )}
          </div>

          {/* MAIN WRAPPER FOR BOTH STEPS */}
          <AnimatePresence mode="wait">
            
            {step === 1 ? (
              <motion.div
                key="auth-forms"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* 1. GOOGLE LOGIN POPUP ACTION */}
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-slate-200 rounded-2xl font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </motion.button>

                <div className="relative flex py-2 items-center text-xs text-slate-400 uppercase font-bold tracking-widest">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4">or use Email</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                {/* Form Navigation Tabs */}
                <div className="bg-slate-100/70 p-1.5 rounded-2xl flex items-center relative backdrop-blur-sm">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => handleTabToggle(true)}
                    className={`flex-1 text-center py-2.5 text-sm font-bold rounded-xl z-10 transition-all duration-300 ${isLoginTab ? 'text-indigo-700 bg-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Log In
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => handleTabToggle(false)}
                    className={`flex-1 text-center py-2.5 text-sm font-bold rounded-xl z-10 transition-all duration-300 ${!isLoginTab ? 'text-indigo-700 bg-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Sign Up
                  </motion.button>
                </div>

                {/* ERROR FEEDBACK BANNER */}
                {serverError && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </motion.div>
                )}

                {/* EMAIL / PASSWORD FORM */}
                <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
                  
                  {/* NAME INPUT (SIGNUP ONLY) */}
                  {!isLoginTab && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5"
                    >
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all ${validationErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-slate-200'}`}
                          placeholder="e.g. Anish Singh"
                        />
                      </div>
                      {validationErrors.name && (
                        <p className="text-xs text-red-600 font-semibold">{validationErrors.name}</p>
                      )}
                    </motion.div>
                  )}

                  {/* EMAIL INPUT */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-widest">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all ${validationErrors.email ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200'}`}
                        placeholder="yourname@college.edu"
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-xs text-red-600 font-semibold">{validationErrors.email}</p>
                    )}
                  </div>

                  {/* PASSWORD INPUT */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                      {isLoginTab && (
                        <button type="button" className="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors cursor-pointer">
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all ${validationErrors.password ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200'}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-xs text-red-600 font-semibold">{validationErrors.password}</p>
                    )}
                  </div>

                  {/* CONFIRM PASSWORD INPUT (SIGNUP ONLY) */}
                  {!isLoginTab && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-widest">Confirm Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className={`w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all ${validationErrors.confirmPassword ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200'}`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {validationErrors.confirmPassword && (
                        <p className="text-xs text-red-600 font-semibold">{validationErrors.confirmPassword}</p>
                      )}
                    </motion.div>
                  )}

                  {/* SUBMIT BUTTON */}
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {isLoginTab ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Footnote toggling */}
                <div className="text-center text-xs text-slate-500">
                  By continuing, you agree to HostelX's{' '}
                  <Link to="/terms" className="underline font-medium hover:text-slate-800">Terms of Service</Link> and{' '}
                  <Link to="/privacy-policy" className="underline font-medium hover:text-slate-800">Privacy Policy</Link>.
                </div>
              </motion.div>
            ) : (
              // STEP 2: PROFILE DETAILS SETTING
              <motion.div
                key="profile-setup"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 relative"
              >
                {/* Back Link to Authentication */}
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      // Wipe session so they don't get stuck in state mismatch
                      localStorage.removeItem('hostelx_user');
                      setStep(1);
                      setServerError('');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>

                {/* Setup description */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-xs text-blue-700 leading-relaxed">
                  <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <span className="font-bold block mb-0.5 text-blue-800">Let's find deals in your hostel!</span>
                    Your hostel helps HostelX show trusted nearby deals and hostel-specific listings from students around you.
                  </div>
                </div>

                {/* ERROR FEEDBACK BANNER */}
                {serverError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={handleProfileCompleteSubmit} className="space-y-4">
                  {/* COLLEGE SELECTOR */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">College or University</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400 z-10" />
                      {!isCustomCollege ? (
                        <select
                          required
                          value={formData.college}
                          onChange={(e) => {
                            if (e.target.value === 'Other') {
                              setIsCustomCollege(true);
                              setFormData({ ...formData, college: '', hostel: 'Other Hostel' });
                              setIsCustomHostel(true);
                            } else {
                              setIsCustomCollege(false);
                              setFormData({ ...formData, college: e.target.value, hostel: 'Zakir B' });
                              setIsCustomHostel(false);
                            }
                          }}
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="Chandigarh University">Chandigarh University (CU)</option>
                          <option value="Other">Other University...</option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={formData.college}
                            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                            placeholder="e.g. Stanford University"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomCollege(false);
                              setFormData({ ...formData, college: 'Chandigarh University', hostel: 'Zakir B' });
                              setIsCustomHostel(false);
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2 py-1 shrink-0"
                          >
                            Select CU
                          </button>
                        </div>
                      )}
                      {!isCustomCollege && (
                        <div className="absolute right-3 top-3.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-t-slate-500 border-l-transparent border-r-transparent w-0 h-0" />
                      )}
                    </div>
                  </div>

                  {/* HOSTEL DROPDOWN */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Hostel</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-5 h-5 text-slate-400 z-10" />
                      {formData.college === 'Chandigarh University' && !isCustomHostel ? (
                        <button
                          type="button"
                          onClick={() => setShowHostelSelector(true)}
                          className="w-full flex items-center justify-between pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-left text-slate-800"
                        >
                          <span>{formData.hostel || "Choose your hostel..."}</span>
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={formData.hostel}
                            onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                            placeholder="e.g. Zakir B"
                          />
                          {formData.college === 'Chandigarh University' && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomHostel(false);
                                setFormData({ ...formData, hostel: 'Zakir B' });
                              }}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2 py-1 shrink-0"
                            >
                              Choose List
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OPTIONAL ADVANCED FIELDS (Wing, Floor, Room Number) */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {/* WING (OPTIONAL) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Wing (Opt)</label>
                      <div className="relative">
                        <Compass className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.wing}
                          onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                          className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-[10px]"
                          placeholder="A Wing"
                        />
                      </div>
                    </div>

                    {/* FLOOR (OPTIONAL) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Floor (Opt)</label>
                      <div className="relative">
                        <Layers className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.floor}
                          onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                          className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-[10px]"
                          placeholder="3rd Floor"
                        />
                      </div>
                    </div>

                    {/* ROOM NUMBER (OPTIONAL) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Room (Opt)</label>
                      <div className="relative">
                        <DoorOpen className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.room}
                          onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                          className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-[10px]"
                          placeholder="308"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SAVE BUTTON */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Complete Profile Setup
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Modern Grouped/Searchable Hostel Selector Overlay (Modal on Desktop, Bottom Sheet on Mobile) */}
                <AnimatePresence>
                  {showHostelSelector && (
                    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
                      {/* Backdrop overlay */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowHostelSelector(false)}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
                      />

                      {/* Modal / Bottom Sheet Card */}
                      <motion.div
                        initial={
                          window.innerWidth < 768 
                            ? { y: "100%", opacity: 1 } 
                            : { scale: 0.95, opacity: 0 }
                        }
                        animate={
                          window.innerWidth < 768 
                            ? { y: 0, opacity: 1 } 
                            : { scale: 1, opacity: 1 }
                        }
                        exit={
                          window.innerWidth < 768 
                            ? { y: "100%", opacity: 1 } 
                            : { scale: 0.95, opacity: 0 }
                        }
                        transition={{ type: "spring", damping: 30, stiffness: 350 }}
                        className="relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col max-h-[80vh] md:max-h-[70vh] z-10 overflow-hidden"
                      >
                        {/* Header Drag Handle for Mobile */}
                        <div className="flex md:hidden justify-center py-3 bg-white border-b border-slate-100 flex-shrink-0">
                          <div className="w-12 h-1 bg-slate-200 rounded-full" />
                        </div>

                        {/* Selector Header */}
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm">Select Your Hostel</h3>
                            <p className="text-[10px] text-slate-500">Chandigarh University Campus</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowHostelSelector(false)}
                            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Search Input */}
                        <div className="p-3 bg-slate-50 border-b border-slate-100 flex-shrink-0">
                          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs focus-within:ring-2 focus-within:ring-blue-500">
                            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                            <input
                              type="text"
                              value={hostelSearchQuery}
                              onChange={(e) => setHostelSearchQuery(e.target.value)}
                              placeholder="Search hostels (e.g. Zakir B, NC1)..."
                              className="w-full text-xs font-semibold outline-none bg-transparent text-slate-800 placeholder-slate-400"
                            />
                            {hostelSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setHostelSearchQuery('')}
                                className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Hostels List Container */}
                        <div className="p-3 overflow-y-auto space-y-3.5 flex-grow no-scrollbar bg-slate-50 max-h-[45vh]">
                          {(() => {
                            const cuData = CAMPUS_DATA['Chandigarh University'];
                            let hasAnyMatch = false;

                            const filteredCategories = cuData.categories.map(cat => {
                              const filteredHostels = cat.hostels.filter(h => 
                                h.toLowerCase().includes(hostelSearchQuery.toLowerCase())
                              );
                              if (filteredHostels.length > 0) hasAnyMatch = true;
                              return { ...cat, hostels: filteredHostels };
                            }).filter(cat => cat.hostels.length > 0);

                            if (!hasAnyMatch) {
                              return (
                                <div className="text-center py-6">
                                  <p className="text-xs font-bold text-slate-500">No hostels matched your search.</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsCustomHostel(true);
                                      setFormData({ ...formData, hostel: '' });
                                      setShowHostelSelector(false);
                                    }}
                                    className="text-xs text-blue-600 font-extrabold hover:underline mt-2"
                                  >
                                    Type Custom Hostel Name
                                  </button>
                                </div>
                              );
                            }

                            return filteredCategories.map(cat => (
                              <div key={cat.id} className="space-y-1.5">
                                <div className="flex items-center gap-1.5 px-1">
                                  <span className="text-xs">{cat.icon}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{cat.label}</span>
                                </div>
                                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                                  {cat.hostels.map((h) => {
                                    const isSelected = formData.hostel === h;
                                    return (
                                      <button
                                        key={h}
                                        type="button"
                                        onClick={() => {
                                          if (h === 'Other Hostel') {
                                            setIsCustomHostel(true);
                                            setFormData({ ...formData, hostel: '' });
                                          } else {
                                            setIsCustomHostel(false);
                                            setFormData({ ...formData, hostel: h });
                                          }
                                          setShowHostelSelector(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-bold transition-colors border-b border-slate-50 last:border-0 ${
                                          isSelected 
                                            ? 'bg-blue-50 text-blue-600' 
                                            : 'text-slate-700 hover:bg-slate-50/50 active:bg-slate-50'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-slate-400 flex-shrink-0">
                                            {cat.id === 'boys' ? (
                                              <Building className="w-3.5 h-3.5 text-blue-400" />
                                            ) : cat.id === 'girls' ? (
                                              <Home className="w-3.5 h-3.5 text-pink-400" />
                                            ) : (
                                              <Compass className="w-3.5 h-3.5 text-indigo-400" />
                                            )}
                                          </span>
                                          <span>{h}</span>
                                        </div>
                                        {isSelected && (
                                          <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-2.5 h-2.5" />
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
      
    </div>
  );
}


