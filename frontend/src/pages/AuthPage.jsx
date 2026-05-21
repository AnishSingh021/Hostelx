import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  Sparkles, 
  ShoppingBag, 
  MessageSquare, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
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

export default function AuthPage() {
  const { user, login, updateProfile } = useAuth();
  const [step, setStep] = useState(1); // 1: Authentication, 2: Profile Completion
  const [isLoginTab, setIsLoginTab] = useState(true); // Toggle between Login and Signup forms
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    hostel: '',
    room: ''
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
    const response = await fetch('https://hostelx-backend-a228.onrender.com/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: displayNameValue || firebaseUser.displayName || 'HostelX Student',
        email: firebaseUser.email,
        profileImage: firebaseUser.photoURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
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
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          college: formData.college,
          hostel: formData.hostel,
          room: formData.room
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
      
      {/* LEFT COLUMN: Modern Campus Startup Branding & Features Showcase (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 text-white relative overflow-hidden flex-col justify-between p-12 lg:p-16">
        
        {/* Abstract decorative glowing grid in background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/25 rounded-full blur-[80px] -ml-28 -mb-28 pointer-events-none" />
        
        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <HostelXLogo className="w-8 h-8" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            HostelX
          </span>
        </div>

        {/* Feature Cards Grid (Middle Content) */}
        <div className="my-auto max-w-lg space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-blue-200">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Campus Hub
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Buy, Sell & Connect <br />
              <span className="bg-gradient-to-r from-blue-200 to-teal-100 bg-clip-text text-transparent">
                On Your Campus
              </span>
            </h1>
            <p className="text-lg text-blue-100/90 leading-relaxed font-light">
              HostelX is the premier secure hyper-local marketplace optimized entirely for college and hostel dorm students.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: ShoppingBag, label: "Campus Trade", desc: "Buy & sell textbooks, gadgets, and bikes safely." },
              { icon: MessageSquare, label: "Direct Chat", desc: "Negotiate live in real-time with other students." },
              { icon: ShieldCheck, label: "Verified Users", desc: "Exclusive college login matching your exact peers." },
              { icon: TrendingUp, label: "Instant Bidding", desc: "Make offers or list emergency items dynamically." }
            ].map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + idx * 0.1 }}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors border border-white/10 rounded-2xl p-4 flex flex-col justify-between"
              >
                <feat.icon className="w-6 h-6 text-teal-300 mb-2" />
                <div>
                  <h3 className="font-semibold text-white text-sm">{feat.label}</h3>
                  <p className="text-xs text-blue-100/75 mt-1">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-blue-200/60 relative z-10 border-t border-white/10 pt-6">
          <span>© {new Date().getFullYear()} HostelX Technologies</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Secure Authentication</span>
        </div>
      </div>

      {/* RIGHT COLUMN: The Interactive Authenticating Card (Mobile Friendly) */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center p-6 md:p-12 lg:p-16 bg-white">
        
        <div className="w-full max-w-md flex flex-col items-stretch space-y-8">
          
          {/* Header Mobile Brand Info */}
          <div className="text-center flex flex-col items-center space-y-3">
            <div className="flex md:hidden items-center justify-center p-3 rounded-2xl bg-blue-50 border border-blue-100 shadow-sm mb-1">
              <HostelXLogo className="w-12 h-12" />
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {step === 1 ? (isLoginTab ? 'Welcome Back' : 'Join HostelX') : 'Complete Setup'}
            </h2>
            <p className="text-sm text-slate-500 font-normal">
              {step === 1 
                ? (isLoginTab ? 'Log in with your college account to browse campus deals.' : 'Create an account to start buying and selling locally.') 
                : 'Enter your location details so students nearby can contact you.'}
            </p>
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
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-xl font-medium text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>

                <div className="relative flex py-2 items-center text-xs text-slate-400 uppercase font-semibold">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4">or use Email</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                {/* Form Navigation Tabs */}
                <div className="bg-slate-100 p-1.5 rounded-xl flex items-center relative">
                  <button
                    type="button"
                    onClick={() => handleTabToggle(true)}
                    className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg z-10 transition-colors ${isLoginTab ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabToggle(false)}
                    className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg z-10 transition-colors ${!isLoginTab ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Sign Up
                  </button>
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
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all ${validationErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-slate-200'}`}
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
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                      {isLoginTab && (
                        <button type="button" className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all ${validationErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-slate-200'}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all ${validationErrors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-slate-200'}`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {isLoginTab ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footnote toggling */}
                <div className="text-center text-xs text-slate-500">
                  By continuing, you agree to HostelX's{' '}
                  <a href="#" className="underline font-medium hover:text-slate-800">Terms of Service</a> and{' '}
                  <a href="#" className="underline font-medium hover:text-slate-800">Privacy Policy</a>.
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
                className="space-y-6"
              >
                {/* Back Link to Authentication */}
                <div className="flex items-center">
                  <button
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
                  <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Let's find deals on campus!</span>
                    To show items nearest you, HostelX requires you to specify your local college building. This maintains campus trust.
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
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                        placeholder="e.g. Stanford University"
                      />
                    </div>
                  </div>

                  {/* HOSTEL DORM NAME */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Hostel / Dormitory Block</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.hostel}
                        onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                        placeholder="e.g. Cedro Hall / Block D"
                      />
                    </div>
                  </div>

                  {/* ROOM NUMBER */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Room Number (Optional)</label>
                    <div className="relative">
                      <DoorOpen className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                        placeholder="e.g. 308"
                      />
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
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
      
    </div>
  );
}
