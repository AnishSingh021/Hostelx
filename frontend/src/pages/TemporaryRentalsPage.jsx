import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  RotateCcw, 
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
import { BACKEND_URL } from '../config';

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
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    rentPrice: '',
    rentalDuration: 'day',
    category: 'Electronics',
    isUrgent: false,
    condition: 'used',
    rentType: 'offer',
    images: null
  });
  const [isUploading, setIsUploading] = useState(false);

  // Fetch rentals dynamically
  const fetchRentalsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/products?listingType=rent`);
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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/auth');

    // Manual Form Validation
    if (!uploadData.title.trim()) return triggerToast('⚠️ Please provide a title.');
    if (!uploadData.description.trim()) return triggerToast('⚠️ Please provide a description.');
    if (!uploadData.rentPrice) return triggerToast('⚠️ Please set a rental rate.');
    if (uploadData.rentType === 'offer' && (!uploadData.images || uploadData.images.length === 0)) {
      return triggerToast('⚠️ Please upload at least one image.');
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('rentPrice', uploadData.rentPrice);
      formData.append('rentalDuration', uploadData.rentalDuration);
      formData.append('category', uploadData.category);
      formData.append('listingType', 'rent');
      formData.append('isUrgent', uploadData.isUrgent);
      formData.append('condition', uploadData.condition);
      formData.append('rentType', uploadData.rentType);
      
      if (user?.hostel) {
        formData.append('hostel', user.hostel);
      }
      
      const lat = localStorage.getItem('userLat');
      const lng = localStorage.getItem('userLng');
      if (lat && lng) {
        formData.append('latitude', lat);
        formData.append('longitude', lng);
      }
      
      if (uploadData.images) {
        for (let i = 0; i < uploadData.images.length; i++) {
          formData.append('images', uploadData.images[i]);
        }
      }
      
      const response = await fetch(`${BACKEND_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (response.ok) {
        triggerToast('🎉 Rental item listed successfully!');
        setIsUploadOpen(false);
        setUploadData({ title: '', description: '', rentPrice: '', rentalDuration: 'day', category: 'Electronics', isUrgent: false, condition: 'used', rentType: 'offer', images: null });
        fetchRentalsData();
      } else {
        triggerToast('❌ Failed to list rental item.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('❌ Error listing item.');
    } finally {
      setIsUploading(false);
    }
  };

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
      return <Camera className="w-5 h-5 text-amber-400" />;
    }
    if (cat.includes('tv') || cat.includes('monitor') || cat.includes('screen') || cat.includes('electronics')) {
      return <Tv className="w-5 h-5 text-violet-500" />;
    }
    return <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />;
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
      const response = await fetch(`${BACKEND_URL}/api/chats`, {
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

        await fetch(`${BACKEND_URL}/api/chats/${chat._id}/messages`, {
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
      const response = await fetch(`${BACKEND_URL}/api/chats`, {
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
        
        await fetch(`${BACKEND_URL}/api/chats/${chat._id}/messages`, {
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
    <div className="min-h-screen bg-secondary/70 text-foreground relative pb-16">
      {/* Clean styling */}

      {/* Nav Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-card border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition cursor-pointer flex items-center justify-center"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-foreground">
                Temporary Rentals
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold">Scientific calculators, monitors, gaming and equipment hire</p>
          </div>
        </div>

        <button 
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          List Rental
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Dynamic Alerts Banner Stack */}
        <div className="space-y-2.5">
          {RENTAL_ALERTS.map((alert) => (
            <div 
              key={alert.id}
              className={`p-3.5 border rounded-2xl text-[11px] font-bold flex items-start gap-3 shadow-sm ${
                alert.type === 'warning' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' 
                  : 'bg-primary/10 border-primary/20 text-primary'
              }`}
            >
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{alert.text}</span>
            </div>
          ))}
        </div>

        {/* Main Concept Header */}
        <div className="relative rounded-[2rem] overflow-hidden bg-muted/40 border border-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Rent Gadgets & Equipment</h1>
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed font-medium">
              Don't shell out thousands for a scientific calculator you only need for one semester exam, or a gaming console for just a weekend wing gathering. Rent securely from fellow hostel mates on a daily or weekly basis.
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Offers vs Seeks) */}
        <div className="flex border-b border-border p-1 bg-card rounded-2xl w-fit shadow-sm">
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'offers' 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            Available for Hire (Offers)
          </button>
          <button
            onClick={() => setActiveTab('seeks')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'seeks' 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            Requested by Peers (Seeking)
          </button>
        </div>

        {/* Pricing Selection Matrix Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h3 className="font-extrabold text-lg text-foreground">
                {activeTab === 'offers' ? 'Dorm Items for Rent' : 'Peer Rental Requests'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {activeTab === 'offers' 
                  ? 'High-utility devices and items listed by peers on campus.' 
                  : 'Postings by students in search of specific tools or equipment.'}
              </p>
            </div>
          </div>

          {loading ? (
            /* Premium Loading Skeletons */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-card border border-border rounded-3xl p-6 h-96 animate-pulse space-y-4 shadow-sm">
                  <div className="aspect-video w-full rounded-2xl bg-muted" />
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-20 bg-secondary rounded" />
                  <div className="h-10 bg-muted rounded w-full mt-4" />
                </div>
              ))}
            </div>
          ) : filteredRentals.length === 0 ? (
            /* High Fidelity Empty States */
            <div className="flex flex-col items-center justify-center text-center p-12 bg-card border border-border rounded-3xl shadow-sm max-w-xl mx-auto space-y-6">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                <RotateCcw className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">
                  {activeTab === 'offers' ? 'No Active Rental Items' : 'No Peer Rental Requests'}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  {activeTab === 'offers' 
                    ? 'No students have listed items for rent in your campus block at the moment. All standard marketplace items are active.'
                    : 'No students have posted active seek requests. If you need an item temporarily, submit your request now!'}
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button 
                  onClick={fetchRentalsData}
                  className="px-5 py-2.5 bg-secondary hover:bg-muted text-secondary-foreground text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Refresh Feed
                </button>
                <button 
                  onClick={() => setIsUploadOpen(true)}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {activeTab === 'offers' ? 'Rent Out Your Item' : 'Post Request'}
                  <ArrowRight className="w-4 h-4" />
                </button>
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
                    className={`bg-card border rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group ${
                      isUrgent ? 'border-rose-300 ring-1 ring-rose-200/50' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div>
                      {/* Thumbnail (only for offer items) */}
                      {activeTab === 'offers' && (
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-secondary border border-border mb-4">
                          <img 
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60'} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-102 transition duration-500" 
                          />
                          
                          {/* Security Deposit preference tag */}
                          <span className="absolute top-3 left-3 bg-card/95 backdrop-blur text-[8.5px] font-black px-2.5 py-0.5 rounded-lg border border-border text-foreground uppercase flex items-center gap-1 shadow-sm">
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
                        <div className="p-1.5 bg-secondary rounded-lg flex-shrink-0 text-foreground">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-sm text-foreground group-hover:text-primary transition truncate">{item.title}</h4>
                          <p className="text-[9px] text-muted-foreground font-bold">{ownerHostel} · {ownerRoom}</p>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed mt-3.5 font-semibold">{item.description}</p>
                      
                      {/* Rate comparison metrics (only for offer items) */}
                      {activeTab === 'offers' ? (
                        <div className="grid grid-cols-2 gap-3 mt-4 bg-secondary border border-border p-3 rounded-2xl">
                          <div className="text-center border-r border-border">
                            <p className="text-[8.5px] text-muted-foreground uppercase font-black">Daily Rate</p>
                            <p className="text-base font-black text-foreground mt-0.5">₹{rates.daily}<span className="text-[10px] text-muted-foreground font-semibold">/day</span></p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8.5px] text-muted-foreground uppercase font-black">Weekly Tier</p>
                            <p className="text-base font-black text-primary mt-0.5">₹{rates.weekly}<span className="text-[10px] text-primary font-semibold">/week</span></p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 bg-secondary border border-border p-3.5 rounded-2xl">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-muted-foreground">Offered Budget:</span>
                            <span className="text-primary text-sm font-black">₹{item.rentPrice || item.price}<span className="text-[10px] font-bold text-muted-foreground">/{item.rentalDuration || 'day'}</span></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer details */}
                    <div className="pt-4 border-t border-border mt-5.5 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">{activeTab === 'offers' ? 'Owner' : 'Requestee'}</p>
                        <p className="text-xs font-black text-foreground">{ownerName}</p>
                      </div>

                      {activeTab === 'offers' ? (
                        <button 
                          onClick={() => handleOpenRentalCalculator(item)}
                          className="px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 text-xs font-black rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm"
                        >
                          <Calendar className="w-4 h-4" /> Book Hire
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleOfferToRent(item)}
                          className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-3xl p-6 z-10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl">
                  <Calendar className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Booking Rental Planner</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold">Select days & estimate dynamic tier fees</p>
                </div>
              </div>

              <div className="border-t border-b border-border py-4.5 space-y-4 text-xs font-bold">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Asset Selected:</span>
                  <span className="text-foreground text-right truncate max-w-[200px]">{selectedItem.title}</span>
                </div>
                
                {/* Form selectors */}
                <div className="space-y-3 bg-secondary p-4 rounded-2xl border border-border/80">
                  
                  {/* Start Date */}
                  <div>
                    <label className="block text-[8.5px] font-black uppercase text-muted-foreground mb-1">Select Rental Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer text-foreground"
                    />
                  </div>

                  {/* Hire duration */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8.5px] font-black text-muted-foreground uppercase">
                      <span>Rent Duration</span>
                      <span className="text-primary font-extrabold">{rentDays} Days</span>
                    </div>
                    
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={rentDays}
                      onChange={(e) => setRentDays(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 dark:bg-slate-300 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    
                    <div className="flex justify-between text-[8.5px] text-muted-foreground font-black tracking-wider uppercase">
                      <span>1 Day</span>
                      <span>7 Days (Week Discount)</span>
                      <span>30 Days (Max)</span>
                    </div>
                  </div>

                </div>

                {/* Rental calculations */}
                <div className="space-y-2 border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rental Cost:</span>
                    <span className="text-foreground font-extrabold">₹{calculateTotalCost(selectedItem, rentDays)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security Deposit:</span>
                    <span className="text-foreground font-extrabold">
                      {selectedItem.rentPrice > 1000 ? '₹1,500 Refundable Cash' : 'Refundable Security Deposit'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-border">
                    <span className="text-sm font-black text-foreground">Total Estimate:</span>
                    <span className="text-xl font-black text-primary">₹{calculateTotalCost(selectedItem, rentDays)}</span>
                  </div>
                </div>

              </div>

              {/* Warning Alert */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-2xl text-[9px] font-black leading-relaxed flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Return reminders are automated. Rented assets must be returned in the original working condition.</span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button 
                  onClick={() => setSelectedItem(null)}
                  disabled={booking}
                  className="py-2.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl border border-border hover:bg-muted transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmRentalOrder}
                  disabled={booking}
                  className="py-2.5 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:bg-primary/90 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {booking ? 'Reserving...' : 'Book Hire'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Rental Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-[2rem] p-6 sm:p-8 z-10 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-black text-foreground">Post a Rental Listing</h2>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">List your item or post a request directly here.</p>
                </div>
                <button 
                  onClick={() => setIsUploadOpen(false)}
                  className="p-2 bg-secondary text-muted-foreground rounded-xl hover:text-foreground transition cursor-pointer"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground uppercase">Title</label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. Scientific Calculator Casio"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground uppercase">Description</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-none"
                    placeholder="Provide condition details, model number, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground uppercase">Rate (₹)</label>
                    <input
                      type="number"
                      value={uploadData.rentPrice}
                      onChange={(e) => setUploadData({ ...uploadData, rentPrice: e.target.value })}
                      className="w-full bg-background border border-border px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground uppercase">Per</label>
                    <select
                      value={uploadData.rentalDuration}
                      onChange={(e) => setUploadData({ ...uploadData, rentalDuration: e.target.value })}
                      className="w-full bg-background border border-border px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground uppercase">Category</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Books">Books & Study</option>
                    <option value="Gaming">Gaming & Consoles</option>
                    <option value="Cameras">Cameras & Photo</option>
                    <option value="Music">Instruments & Audio</option>
                    <option value="Other">Other Equipment</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground uppercase">Listing Type</label>
                    <select
                      value={uploadData.rentType}
                      onChange={(e) => setUploadData({ ...uploadData, rentType: e.target.value })}
                      className="w-full bg-background border border-border px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="offer">I want to Rent Out</option>
                      <option value="seek">I am Seeking</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground uppercase">Condition</label>
                    <select
                      value={uploadData.condition}
                      onChange={(e) => setUploadData({ ...uploadData, condition: e.target.value })}
                      className="w-full bg-background border border-border px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="used">Used / Good</option>
                      <option value="new">New / Like New</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground uppercase">Images {uploadData.rentType === 'offer' && <span className="text-rose-500">*</span>}</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setUploadData({ ...uploadData, images: e.target.files })}
                    className="w-full bg-background border border-border px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>

                <label className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-secondary/50 transition">
                  <input
                    type="checkbox"
                    checked={uploadData.isUrgent}
                    onChange={(e) => setUploadData({ ...uploadData, isUrgent: e.target.checked })}
                    className="w-4 h-4 text-primary accent-primary"
                  />
                  <div>
                    <p className="text-sm font-black text-foreground">Mark as Urgent</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">Will be highlighted on the feed.</p>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-4 mt-2 bg-primary text-primary-foreground rounded-xl text-sm font-black tracking-wide hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Posting...' : 'Post Listing'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

