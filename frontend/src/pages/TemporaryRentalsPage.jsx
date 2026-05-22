import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  RotateCcw, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Info, 
  Clock, 
  Check, 
  Plus, 
  BookOpen, 
  Gamepad, 
  Tv, 
  Camera, 
  Music, 
  SlidersHorizontal,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TemporaryRentalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('offers'); // 'offers' or 'seeks'
  const [rentals, setRentals] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Rental Calculation State
  const [rentDays, setRentDays] = useState(3);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [booking, setBooking] = useState(false);

  // Fetch rentals dynamically
  const fetchRentalsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/products');
      if (!response.ok) throw new Error('Failed to load rentals');
      const data = await response.json();
      
      // Filter for items where isRental is true or listingType is 'rent'
      const activeRentals = data.filter(item => 
        item.status !== 'sold' && (item.isRental || item.listingType === 'rent')
      );
      setRentals(activeRentals);
    } catch (e) {
      console.error('Failed to load rentals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalsData();
  }, [user]);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [activeTab]);

  // Safety Reminders
  const RENTAL_ALERTS = [
    {
      id: 'a-1',
      type: 'warning',
      text: 'Verify gadget condition and functionality in-person before renting.'
    },
    {
      id: 'a-2',
      type: 'promo',
      text: 'Return rented items on time and in working condition to maintain your trust score.'
    }
  ];


  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Helper to map categories to relevant Lucide Icons
  const getCategoryIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('study') || cat.includes('book') || cat.includes('note') || cat.includes('tool')) {
      return <BookOpen className="w-5 h-5 text-pink-500" />;
    }
    if (cat.includes('game') || cat.includes('console') || cat.includes('ps5')) {
      return <Gamepad className="w-5 h-5 text-sky-500" />;
    }
    if (cat.includes('music') || cat.includes('sound') || cat.includes('speaker')) {
      return <Music className="w-5 h-5 text-rose-500" />;
    }
    if (cat.includes('camera') || cat.includes('photo') || cat.includes('video')) {
      return <Camera className="w-5 h-5 text-amber-500" />;
    }
    if (cat.includes('tv') || cat.includes('monitor') || cat.includes('screen') || cat.includes('electronics')) {
      return <Tv className="w-5 h-5 text-violet-500" />;
    }
    return <SlidersHorizontal className="w-5 h-5 text-slate-500" />;
  };

  // Helper to calculate pricing dynamically
  // If rentalDuration is 'day': dailyRate is rentPrice, weeklyRate is discounted
  // If rentalDuration is 'week': weeklyRate is rentPrice, dailyRate is calculated
  const getRateBreakdown = (item) => {
    if (!item) return { daily: 0, weekly: 0 };
    const price = item.rentPrice || item.price || 0;
    const duration = item.rentalDuration || 'day';

    if (duration === 'day') {
      return {
        daily: price,
        weekly: Math.round(price * 7 * 0.85) // 15% discount for 7 days
      };
    } else if (duration === 'week') {
      return {
        daily: Math.round(price / 7),
        weekly: price
      };
    } else { // month
      return {
        daily: Math.round(price / 30),
        weekly: Math.round(price / 4)
      };
    }
  };

  const calculateTotalCost = (item, days) => {
    if (!item) return 0;
    const rates = getRateBreakdown(item);
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    
    return (weeks * rates.weekly) + (remainingDays * rates.daily);
  };

  const handleOpenRentalCalculator = (item) => {
    if (!user) return navigate('/auth');
    setSelectedItem(item);
    setRentDays(3);
  };

  // Real Chat-backed Booking confirmation
  const handleConfirmRentalOrder = async () => {
    if (!user) return navigate('/auth');
    if (!selectedItem || booking) return;
    setBooking(true);

    const cost = calculateTotalCost(selectedItem, rentDays);
    const rates = getRateBreakdown(selectedItem);
    const depositRequirement = selectedItem.rentPrice > 1000 ? '₹1,500 Refundable Cash' : 'Collateral Student ID Card';

    try {
      // 1. Create/Access chat with the owner
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/chats', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ 
          userId: selectedItem.seller?._id || selectedItem.seller, 
          productId: selectedItem._id 
        })
      });

      if (response.ok) {
        const chat = await response.json();
        
        // 2. Post automated booking message
        const bookingMsg = `🎉 Rental Booking Request! I would like to rent your "${selectedItem.title}" starting on ${startDate} for ${rentDays} days. \n\nEstimate Cost: ₹${cost} (Rate: ₹${rates.daily}/day, ₹${rates.weekly}/week). \nDeposit Agreement: ${depositRequirement}. \nLet's coordinate meetup coordinates!`;

        await fetch(`https://hostelx-backend-a228.onrender.com/api/chats/${chat._id}/messages`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${user.token}` 
          },
          body: JSON.stringify({ text: bookingMsg })
        });

        triggerToast(`🎉 Booking request submitted! Opening chat with ${selectedItem.seller?.name || 'owner'}...`);
        setSelectedItem(null);
        setTimeout(() => navigate('/chat'), 1500);
      } else {
        triggerToast('❌ Failed to establish peer link.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('❌ Booking request processing failed.');
    } finally {
      setBooking(false);
    }
  };

  // Real Chat-backed Seek fulfillment offer
  const handleOfferToRent = async (item) => {
    if (!user) return navigate('/auth');
    try {
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/chats', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ 
          userId: item.seller?._id || item.seller, 
          productId: item._id 
        })
      });

      if (response.ok) {
        const chat = await response.json();
        
        const offerMsg = `👋 Hi! I saw your request looking to rent "${item.title}". I have this item available and would be happy to lend/rent it to you. Let me know when you need it and we can discuss meetup details!`;
        
        await fetch(`https://hostelx-backend-a228.onrender.com/api/chats/${chat._id}/messages`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${user.token}` 
          },
          body: JSON.stringify({ text: offerMsg })
        });

        triggerToast(`🎉 Response sent! Opening peer chat with ${item.seller?.name || 'requestee'}...`);
        setTimeout(() => navigate('/chat'), 1500);
      } else {
        triggerToast('❌ Failed to establish connection.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('❌ Offer transmission failed.');
    }
  };

  // Filter rentals by current active tab
  const filteredRentals = rentals.filter(item => {
    const isSeek = item.rentType === 'seek';
    return activeTab === 'seeks' ? isSeek : !isSeek;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 relative pb-16">
      {/* Pink & indigo styling gradients */}
      <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-pink-400/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-violet-400/5 rounded-full blur-[100px] -z-10" />

      {/* Nav Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center justify-center"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Temporary Rentals
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 bg-pink-100 text-pink-600 border border-pink-200 rounded-full">
                HIRE DEPOT
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">Scientific calculators, monitors, gaming and equipment hire</p>
          </div>
        </div>

        <Link 
          to="/sell?listingType=rent"
          className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          List Rental
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Dynamic Alerts Banner Stack */}
        <div className="space-y-2.5">
          {RENTAL_ALERTS.map((alert) => (
            <div 
              key={alert.id}
              className={`p-3.5 border rounded-2xl text-[11px] font-bold flex items-start gap-3 shadow-sm ${
                alert.type === 'warning' 
                  ? 'bg-amber-50 border-amber-200 text-amber-700' 
                  : 'bg-pink-50 border-pink-200 text-pink-700'
              }`}
            >
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{alert.text}</span>
            </div>
          ))}
        </div>

        {/* Main Concept Header */}
        <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-pink-50 via-white to-indigo-50 border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1 bg-pink-100 text-pink-700 border border-pink-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <RotateCcw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              Duration-Based Rentals
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800">Rent Gadgets & Equipment</h1>
            <p className="text-xs text-slate-600 max-w-lg leading-relaxed font-medium">
              Don't shell out thousands for a scientific calculator you only need for one semester exam, or a gaming console for just a weekend wing gathering. Rent securely from fellow hostel mates on a daily or weekly basis.
            </p>
          </div>


          <div className="bg-white border border-slate-200 p-4.5 rounded-2xl flex items-start gap-3.5 max-w-xs self-start md:self-auto shadow-sm">
            <div className="p-3 bg-pink-50 text-pink-600 border border-pink-100 rounded-xl flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 font-sans">Collateral Secure Lock</h4>
              <p className="text-[9px] text-slate-500 leading-normal font-semibold">
                Rentals specify security requirements (refundable deposits or student IDs) for maximum asset protection.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Offers vs Seeks) */}
        <div className="flex border-b border-slate-200 p-1 bg-white rounded-2xl w-fit shadow-sm">
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'offers' 
                ? 'bg-pink-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Available for Hire (Offers)
          </button>
          <button
            onClick={() => setActiveTab('seeks')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'seeks' 
                ? 'bg-pink-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Requested by Peers (Seeking)
          </button>
        </div>

        {/* Pricing Selection Matrix Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800">
                {activeTab === 'offers' ? 'Dorm Items for Rent' : 'Peer Rental Requests'}
              </h3>
              <p className="text-xs text-slate-500">
                {activeTab === 'offers' 
                  ? 'High-utility devices and items listed by peers on campus.' 
                  : 'Postings by students in search of specific tools or equipment.'}
              </p>
            </div>
            <span className="text-[9px] font-bold text-pink-600 bg-pink-50 border border-pink-200 px-2.5 py-1 rounded-lg">RATE MATRIX</span>
          </div>

          {loading ? (
            /* Premium Loading Skeletons */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white border border-slate-200 rounded-3xl p-6 h-96 animate-pulse space-y-4 shadow-sm">
                  <div className="aspect-video w-full rounded-2xl bg-slate-200" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-20 bg-slate-100 rounded" />
                  <div className="h-10 bg-slate-200 rounded w-full mt-4" />
                </div>
              ))}
            </div>
          ) : filteredRentals.length === 0 ? (
            /* High Fidelity Empty States */
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white border border-slate-200 rounded-3xl shadow-sm max-w-xl mx-auto space-y-6">
              <div className="p-4 bg-pink-50 text-pink-600 rounded-2xl border border-pink-100">
                <RotateCcw className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">
                  {activeTab === 'offers' ? 'No Active Rental Items' : 'No Peer Rental Requests'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md">
                  {activeTab === 'offers' 
                    ? 'No students have listed items for rent in your campus block at the moment. All standard marketplace items are active.'
                    : 'No students have posted active seek requests. If you need an item temporarily, submit your request now!'}
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button 
                  onClick={fetchRentalsData}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Refresh Feed
                </button>
                <Link 
                  to="/sell?listingType=rent"
                  className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {activeTab === 'offers' ? 'Rent Out Your Item' : 'Post Request'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredRentals.map((item) => {
                const rates = getRateBreakdown(item);
                const ownerName = item.seller?.name || 'Anonymous Peer';
                const ownerHostel = item.seller?.hostel || item.hostel || 'Hostel Block';
                const ownerRoom = item.seller?.room ? `Room ${item.seller.room}` : 'Dorm Room';
                const isUrgent = item.isUrgent;
                const depositPreference = item.rentPrice > 1000 ? '🛡️ Deposit: Cash' : '🛡️ Deposit: ID Card';

                return (
                  <div 
                    key={item._id}
                    className={`bg-white border rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group ${
                      isUrgent ? 'border-rose-300 ring-1 ring-rose-200/50' : 'border-slate-200 hover:border-pink-400'
                    }`}
                  >
                    <div>
                      {/* Thumbnail (only for offer items) */}
                      {activeTab === 'offers' && (
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 mb-4">
                          <img 
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60'} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-102 transition duration-500" 
                          />
                          
                          {/* Security Deposit preference tag */}
                          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur text-[8.5px] font-black px-2.5 py-0.5 rounded-lg border border-slate-200 text-slate-800 uppercase flex items-center gap-1 shadow-sm">
                            {depositPreference}
                          </span>

                          {isUrgent && (
                            <span className="absolute top-3 right-3 bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Urgent Hire
                            </span>
                          )}
                        </div>
                      )}

                      {/* Header info */}
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg flex-shrink-0 text-slate-700">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-sm text-slate-800 group-hover:text-pink-600 transition truncate">{item.title}</h4>
                          <p className="text-[9px] text-slate-400 font-bold">{ownerHostel} · {ownerRoom}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mt-3.5 font-semibold">{item.description}</p>
                      
                      {/* Rate comparison metrics (only for offer items) */}
                      {activeTab === 'offers' ? (
                        <div className="grid grid-cols-2 gap-3 mt-4 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                          <div className="text-center border-r border-slate-200">
                            <p className="text-[8.5px] text-slate-400 uppercase font-black">Daily Rate</p>
                            <p className="text-base font-black text-slate-800 mt-0.5">₹{rates.daily}<span className="text-[10px] text-slate-400 font-semibold">/day</span></p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8.5px] text-slate-400 uppercase font-black">Weekly Tier</p>
                            <p className="text-base font-black text-pink-600 mt-0.5">₹{rates.weekly}<span className="text-[10px] text-pink-600 font-semibold">/week</span></p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-400">Offered Budget:</span>
                            <span className="text-pink-600 text-sm font-black">₹{item.rentPrice || item.price}<span className="text-[10px] font-bold text-slate-500">/{item.rentalDuration || 'day'}</span></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer details */}
                    <div className="pt-4 border-t border-slate-200 mt-5.5 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{activeTab === 'offers' ? 'Owner' : 'Requestee'}</p>
                        <p className="text-xs font-black text-slate-800">{ownerName}</p>
                      </div>

                      {activeTab === 'offers' ? (
                        <button 
                          onClick={() => handleOpenRentalCalculator(item)}
                          className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-black rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm"
                        >
                          <Calendar className="w-4 h-4" /> Book Hire
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleOfferToRent(item)}
                          className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-black rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
                        >
                          Offer to Rent
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Booking Calendar Cost Calculator Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 z-10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-50 text-pink-600 border border-pink-100 rounded-xl">
                  <Calendar className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Booking Rental Planner</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Select days & estimate dynamic tier fees</p>
                </div>
              </div>

              <div className="border-t border-b border-slate-100 py-4.5 space-y-4 text-xs font-bold">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Asset Selected:</span>
                  <span className="text-slate-800 text-right truncate max-w-[200px]">{selectedItem.title}</span>
                </div>
                
                {/* Form selectors */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  
                  {/* Start Date */}
                  <div>
                    <label className="block text-[8.5px] font-black uppercase text-slate-400 mb-1">Select Rental Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer text-slate-700"
                    />
                  </div>

                  {/* Hire duration */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8.5px] font-black text-slate-400 uppercase">
                      <span>Rent Duration</span>
                      <span className="text-pink-600 font-extrabold">{rentDays} Days</span>
                    </div>
                    
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={rentDays}
                      onChange={(e) => setRentDays(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                    />
                    
                    <div className="flex justify-between text-[8.5px] text-slate-400 font-black tracking-wider uppercase">
                      <span>1 Day</span>
                      <span>7 Days (Week Discount)</span>
                      <span>30 Days (Max)</span>
                    </div>
                  </div>

                </div>

                {/* Rental calculations */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rental Cost:</span>
                    <span className="text-slate-800 font-extrabold">₹{calculateTotalCost(selectedItem, rentDays)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Security Deposit:</span>
                    <span className="text-slate-800 font-extrabold">
                      {selectedItem.rentPrice > 1000 ? '₹1,500 Refundable Cash' : 'Collateral Student ID Card'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200">
                    <span className="text-sm font-black text-slate-700">Total Estimate:</span>
                    <span className="text-xl font-black text-pink-600">₹{calculateTotalCost(selectedItem, rentDays)}</span>
                  </div>
                </div>

              </div>

              {/* Warning Alert */}
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-[9px] font-black leading-relaxed flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Return reminders are automated. Rented assets must be returned in the original working condition to unlock collateral or cash deposits.</span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button 
                  onClick={() => setSelectedItem(null)}
                  disabled={booking}
                  className="py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmRentalOrder}
                  disabled={booking}
                  className="py-2.5 bg-pink-600 text-white text-xs font-black rounded-xl hover:bg-pink-700 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {booking ? 'Reserving...' : 'Book Hire'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
