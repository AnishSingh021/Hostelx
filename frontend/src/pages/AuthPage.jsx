import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, User, MapPin, Building, DoorOpen } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export default function AuthPage() {
  const { user, login, updateProfile } = useAuth();
  const [step, setStep] = useState(1); // 1: Login, 2: Profile Completion
  const [formData, setFormData] = useState({
    name: 'Test Student',
    email: 'test@student.com',
    college: '',
    hostel: '',
    room: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && (!user.college || !user.hostel)) {
      setStep(2);
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Actual Firebase Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // 1. Authenticate with Firebase Google Auth
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Send the Firebase user details to our backend
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          profileImage: user.photoURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Server error during authentication');
      }
      
      // 3. Save to global Context
      login(data);
      
      // 4. If no college/hostel data, move to step 2
      if (!data.college || !data.hostel) {
        setStep(2);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google Login error:', error);
      // Clear any corrupted session data
      localStorage.removeItem('hostelx_user');
      alert(`Login failed: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real app, you would send this to the backend with the token
    const user = JSON.parse(localStorage.getItem('hostelx_user'));
    
    try {
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          college: formData.college,
          hostel: formData.hostel,
          room: formData.room
        })
      });
      
      if(response.ok) {
        const data = await response.json();
        updateProfile(data);
        navigate('/dashboard');
      } else {
        const errData = await response.json();
        if (response.status === 401) {
          // Token is invalid — clear session and send back to login
          localStorage.removeItem('hostelx_user');
          alert('Your session expired. Please sign in again.');
          setStep(1);
        } else {
          alert(`Setup failed: ${errData.message || 'Unknown error. Please try again.'}`);
        }
      }
    } catch (error) {
       console.error('Profile update error:', error);
       alert(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card border border-border shadow-2xl rounded-2xl p-8"
      >
        {step === 1 ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-card-foreground mb-2">Welcome to HostelX</h2>
            <p className="text-muted-foreground mb-8">Sign in to buy and sell on campus</p>
            
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-secondary text-secondary-foreground py-3 px-4 rounded-xl font-medium hover:bg-secondary/80 transition-colors"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => { setStep(1); localStorage.removeItem('hostelx_user'); }} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                ← Back
              </button>
            </div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">Complete Your Profile</h2>
            <p className="text-muted-foreground mb-6">Tell us where you live to find items near you.</p>
            
            <form onSubmit={handleProfileComplete} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">College/University</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="text" 
                    required
                    value={formData.college}
                    onChange={(e) => setFormData({...formData, college: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Stanford University"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Hostel/Dorm Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="text" 
                    required
                    value={formData.hostel}
                    onChange={(e) => setFormData({...formData, hostel: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Block A"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Room Number (Optional)</label>
                <div className="relative">
                  <DoorOpen className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="e.g. 104"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity mt-6"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
