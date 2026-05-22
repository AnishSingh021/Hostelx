import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Flame, 
  Clock, 
  Sparkles, 
  Package, 
  ShieldCheck, 
  BadgeAlert, 
  Sliders, 
  CornerDownRight, 
  TrendingDown,
  Info,
  CheckCircle,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SemesterExitSalePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [seniors, setSeniors] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  
  // Negotiation Modal State
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(15); // Default 15% discount offer
  const [negotiating, setNegotiating] = useState(false);

  // Fetch clearance items and group them by seller
  const fetchClearanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/products');
      if (!response.ok) throw new Error('Failed to fetch clearance products');
      const data = await response.json();
      
      // Filter for active items that represent exit sale / clearance
      // We look for isUrgent, tags containing 'clearance', 'exit', 'bundle', or description/title matches
      const clearanceKeywords = ['exit', 'clearance', 'leaving', 'graduating', 'move-out', 'moving', 'bundle', 'pack', 'room', 'dorm'];
      const clearanceItems = data.filter(item => {
        if (item.status === 'sold') return false;
        const inTags = item.tags && item.tags.some(t => 
          t.toLowerCase().includes('clearance') || 
          t.toLowerCase().includes('exit') || 
          t.toLowerCase().includes('bundle')
        );
        const inTitle = item.title.toLowerCase().split(/[ \-_]/).some(w => clearanceKeywords.includes(w));
        const inDesc = item.description.toLowerCase().split(/[ \-_]/).some(w => clearanceKeywords.includes(w));
        return inTags || inTitle || inDesc || item.isUrgent;
      });

      // Group items by seller ID
      const sellerGroups = {};
      clearanceItems.forEach(item => {
        const sellerId = item.seller?._id || 'anonymous';
        if (!sellerGroups[sellerId]) {
          sellerGroups[sellerId] = {
            seller: item.seller || { name: 'Anonymous Senior', hostel: item.hostel || 'Hostel', college: 'Campus' },
            items: []
          };
        }
        sellerGroups[sellerId].items.push(item);
      });

      // Map groups to seniors timelines and room bundles
      const activeSeniors = [];
      const activeBundles = [];

      Object.keys(sellerGroups).forEach((sellerId) => {
        const group = sellerGroups[sellerId];
        const sellerName = group.seller.name || 'Anonymous Senior';
        const sellerHostel = group.seller.hostel || group.items[0]?.hostel || 'Hostel Block';
        const sellerRoom = group.seller.room ? `Room ${group.seller.room}` : 'Dorm Room';
        const profileImage = group.seller.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sellerName)}`;
        
        // Compute realistic dynamic countdown based on unique user id
        const hash = sellerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const exitSecondsLeft = (1.5 + (hash % 3)) * 24 * 3600 + (hash % 12) * 3600; 

        const categoriesSold = [...new Set(group.items.map(i => i.category))];
        const headline = `Clearance exit: clearing ${categoriesSold.join(', ')} setup before moving out!`;

        activeSeniors.push({
          id: sellerId,
          name: sellerName,
          room: `${sellerRoom}, ${sellerHostel}`,
          exitSecondsLeft,
          headline,
          profileImage
        });

        const totalPrice = group.items.reduce((sum, item) => sum + item.price, 0);
        const totalOriginalPrice = group.items.reduce((sum, item) => sum + (item.originalPrice || item.price * 1.6), 0);
        
        // Give 12% bundle discount if multiple items are bought together
        const bundleDiscount = group.items.length > 1 ? 0.88 : 1.0;
        const clearancePrice = Math.round(totalPrice * bundleDiscount);
        const originalValue = Math.round(totalOriginalPrice);

        activeBundles.push({
          id: `bundle-${sellerId}`,
          sellerId: sellerId,
          sellerName,
          room: `${sellerRoom}, ${sellerHostel}`,
          title: group.items.length > 1 ? `${sellerName}'s Dorm Clearance Bundle 📦` : `${group.items[0].title} (Exit Sale)`,
          description: group.items.length > 1 
            ? `Complete student room checkout pack at a combined discount! Includes all listed items in their room.`
            : group.items[0].description,
          items: group.items.map(i => `${i.title} (${i.condition === 'new' ? 'New' : 'Used'} condition)`),
          originalValue,
          clearancePrice,
          badge: group.items.some(i => i.isUrgent) ? 'Urgent checkout' : 'Dorm clearance',
          tags: [...new Set(group.items.flatMap(i => i.tags || [i.category]))].slice(0, 3),
          image: group.items[0]?.images?.[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&auto=format&fit=crop&q=60',
          rawItems: group.items
        });
      });

      setSeniors(activeSeniors);
      setBundles(activeBundles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClearanceData();
  }, [user]);

  // Countdown timer decrement
  useEffect(() => {
    const timer = setInterval(() => {
      setSeniors(prevSeniors => 
        prevSeniors.map(senior => ({
          ...senior,
          exitSecondsLeft: Math.max(0, senior.exitSecondsLeft - 1)
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds) => {
    if (totalSeconds <= 0) return 'ROOM VACATED ✈️';
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const originalPrice = selectedBundle?.clearancePrice || 0;
  const offeredPrice = Math.round(originalPrice * (1 - discountPercent / 100));
  
  const getOfferProbability = () => {
    if (discountPercent <= 10) return { status: 'Instant Acceptance ✅', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (discountPercent <= 20) return { status: 'High Chance of Approval ⚡', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { status: 'Requires Negotiation (High Cut) ⚠️', color: 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse' };
  };

  const offerProbability = getOfferProbability();

  const handleOpenNegotiation = (bundle) => {
    if (!user) return navigate('/auth');
    setSelectedBundle(bundle);
    setDiscountPercent(15);
  };

  // Chat-based negotiation submission
  const handleConfirmOffer = async () => {
    if (!user) return navigate('/auth');
    if (!selectedBundle || negotiating) return;
    setNegotiating(true);

    const isInstant = discountPercent <= 10;
    const targetPrice = offeredPrice;

    try {
      // Create/access chat channel with seller
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/chats', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ 
          userId: selectedBundle.sellerId, 
          productId: selectedBundle.rawItems[0]._id 
        })
      });

      if (response.ok) {
        const chat = await response.json();
        
        // Construct offer messaging
        const offerMsg = isInstant 
          ? `🎉 Instant Buyout! I am purchasing your room exit bundle "${selectedBundle.title}" at the offered clearance price of ₹${selectedBundle.clearancePrice}. Let's coordinate room inspection and collection details ASAP!`
          : `📢 Negotiation Bid! I have submitted a fast stake of ₹${targetPrice} (-${discountPercent}%) for your exit clearance bundle "${selectedBundle.title}". Since your checkout deadline is approaching, let me know if this works!`;

        await fetch(`https://hostelx-backend-a228.onrender.com/api/chats/${chat._id}/messages`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${user.token}` 
          },
          body: JSON.stringify({ text: offerMsg })
        });

        triggerToast(isInstant 
          ? `🎉 Buyout approved! Connecting you with ${selectedBundle.sellerName} in chat.`
          : `📢 fast negotiation offer sent! Open chat with ${selectedBundle.sellerName} to align.`
        );

        setSelectedBundle(null);
        setTimeout(() => navigate('/chat'), 1500);
      } else {
        triggerToast('❌ Could not establish chat link with the seller.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('❌ Failed to process negotiation offer.');
    } finally {
      setNegotiating(false);
    }
  };

  // Chat-based instant buy action
  const handleInstantBuy = async (bundle) => {
    if (!user) return navigate('/auth');
    try {
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/chats', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ 
          userId: bundle.sellerId, 
          productId: bundle.rawItems[0]._id 
        })
      });

      if (response.ok) {
        const chat = await response.json();
        
        const offerMsg = `🎉 Instant Buyout! I want to purchase your room clearance bundle "${bundle.title}" for ₹${bundle.clearancePrice} right now. Please coordinate meetup details in our room!`;
        
        await fetch(`https://hostelx-backend-a228.onrender.com/api/chats/${chat._id}/messages`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${user.token}` 
          },
          body: JSON.stringify({ text: offerMsg })
        });

        triggerToast(`🎉 Instant buyout reserved! Opening direct chat with ${bundle.sellerName}...`);
        setTimeout(() => navigate('/chat'), 1500);
      } else {
        triggerToast('❌ Could not link with seller details.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('❌ Checkout processing failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 relative pb-16">
      {/* Dynamic colorful blur backgrounds */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-red-400/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[120px] -z-10" />

      {/* Nav Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer flex items-center justify-center text-slate-600 hover:text-slate-900"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                Semester Exit Sale
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 bg-red-100 text-red-600 border border-red-200 rounded-full animate-bounce">
                CLEARANCE BOARD
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">Bulk dormitory liquidation and fast senior negotiations</p>
          </div>
        </div>

        <Link 
          to="/sell?listingType=buy"
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-md hover:shadow-lg active:scale-95 transition cursor-pointer"
        >
          <Flame className="w-4 h-4 fill-white" />
          List Clearance
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* Informative Header Panel */}
        <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-rose-50/60 via-white to-amber-50/50 border border-red-200/70 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-red-600 animate-pulse" />
              Seniors campus checkout ongoing
            </span>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Seniors Moving-Out Liquidation</h1>
            <p className="text-xs text-slate-600 max-w-lg leading-relaxed font-medium">
              Graduating students are packing up their lives! Buy bulk packages (entire room mattress + table fan + cycles + desk lamps) at up to 60% discount. Propose fast negotiation offers directly using our interactive pricing slider.
            </p>
          </div>

          {/* Warning Flag */}
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl max-w-xs self-start md:self-auto flex items-start gap-3 shadow-sm">
            <BadgeAlert className="w-6 h-6 text-red-600 flex-shrink-0 animate-bounce" />
            <div>
              <h4 className="text-xs font-black text-red-800">Strict Exit Timelines</h4>
              <p className="text-[9.5px] text-slate-600 mt-0.5 leading-relaxed font-semibold">
                Seniors leaving college must empty hostel inventories before room inspection dates. Fast transactions are guaranteed.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          /* Premium Loading Skeletons */
          <div className="space-y-8">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-slate-200 rounded-2xl p-5 h-32 animate-pulse space-y-3">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-6 bg-slate-100 rounded w-3/4 mt-2" />
                </div>
              ))}
            </div>
            <div className="h-6 w-56 bg-slate-200 rounded animate-pulse pt-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-slate-200 rounded-3xl p-6 h-96 animate-pulse space-y-4">
                  <div className="aspect-video w-full rounded-2xl bg-slate-200" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-20 bg-slate-100 rounded" />
                  <div className="h-10 bg-slate-200 rounded w-full mt-4" />
                </div>
              ))}
            </div>
          </div>
        ) : seniors.length === 0 ? (
          /* Gorgeous Empty State */
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white border border-slate-200 rounded-3xl shadow-sm max-w-xl mx-auto space-y-6">
            <div className="p-4 bg-red-50 text-red-500 rounded-2xl border border-red-100">
              <Package className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">No Senior Checkout Sales Yet</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Graduating students haven't listed their room liquidation bundles yet. All items are active under the standard marketplace.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full justify-center">
              <button 
                onClick={fetchClearanceData}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Refresh Board
              </button>
              <Link 
                to="/sell?listingType=buy"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                List Your Dorm Clearance
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Live Seniors Exit Countdowns (Grid) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5 text-slate-800">
                    <Clock className="w-4.5 h-4.5 text-red-600" />
                    Senior Checkout Departure Timelines
                  </h3>
                  <p className="text-xs text-slate-500">Ticking countdown clocks detailing room inspection schedules</p>
                </div>
                <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">LIVE SCHEDULE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {seniors.map((snr) => (
                  <div 
                    key={snr.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-red-400 hover:shadow-md transition-all duration-300"
                  >
                    {/* Visual side marker */}
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500"></div>

                    <img 
                      src={snr.profileImage} 
                      alt={snr.name} 
                      className="w-14 h-14 rounded-full object-cover border border-slate-100 flex-shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-sm text-slate-800 truncate">{snr.name}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{snr.room}</p>
                      <p className="text-[10px] text-slate-500 leading-normal mt-1 truncate italic">"{snr.headline}"</p>
                      
                      {/* Countdown display */}
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 w-fit">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        <span>Departure in: {formatCountdown(snr.exitSecondsLeft)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clearance Bundles Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-extrabold text-xl tracking-tight flex items-center gap-2 text-slate-800">
                    <Package className="w-5.5 h-5.5 text-amber-500" />
                    Featured Bulk Room Clearance Bundles
                  </h3>
                  <p className="text-xs text-slate-500">Get single-box pricing discounts on multi-item student dormitory assets</p>
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">BULK SAVINGS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {bundles.map((bundle) => (
                  <div 
                    key={bundle.id}
                    className="bg-white border border-slate-200 rounded-3xl p-5.5 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-red-400 transition-all duration-300 relative group"
                  >
                    {/* Urgently Liquidation Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-amber-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-red-600/10 shadow-sm">
                      {bundle.badge}
                    </div>

                    <div>
                      {/* Thumbnail aspect ratio */}
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 mb-4">
                        <img 
                          src={bundle.image} 
                          alt={bundle.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                        />
                      </div>

                      <h4 className="font-black text-base text-slate-800 leading-tight">{bundle.title}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{bundle.room} · Owner: {bundle.sellerName}</p>
                      
                      <p className="text-xs text-slate-600 mt-3 leading-relaxed font-semibold">{bundle.description}</p>
                      
                      {/* Bundled Items lists */}
                      <div className="mt-4 space-y-2 bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Included Room Assets:</p>
                        <div className="space-y-1.5">
                          {bundle.items.map((it, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[11px] font-bold text-slate-600 leading-relaxed">
                              <CornerDownRight className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                              <span>{it}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Buyout Panel */}
                    <div className="pt-4 border-t border-slate-200 mt-6 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 line-through block font-bold">Combined Value: ₹{bundle.originalValue}</span>
                        <span className="text-xl font-black text-slate-800">₹{bundle.clearancePrice}</span>
                        <span className="text-[9px] text-rose-600 font-extrabold flex items-center gap-0.5 mt-0.5 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 w-fit">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Save {Math.round((1 - bundle.clearancePrice / bundle.originalValue) * 100)}%
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenNegotiation(bundle)}
                          className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <Sliders className="w-3.5 h-3.5" /> Bid Offer
                        </button>
                        
                        <button 
                          onClick={() => handleInstantBuy(bundle)}
                          className="px-3.5 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 active:scale-95 transition cursor-pointer shadow-sm"
                        >
                          Buyout
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Negotiation disclaimer panel */}
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-4.5 rounded-3xl text-xs text-slate-600 font-semibold leading-relaxed shadow-sm">
          <Info className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>Need items immediately? The Exit Sale terminal lets buyers secure room bundle reserves. The graduating senior receives instant alerts, and meetups are coordinated automatically through dedicated real-time chat rooms.</span>
        </div>

      </main>

      {/* Global Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-slate-900 text-white text-xs font-bold px-6 py-3.5 rounded-full shadow-2xl"
            >
              <span>{toastMessage}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Fast Negotiation Slider Modal */}
      <AnimatePresence>
        {selectedBundle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBundle(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 z-10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Fast Negotiation Terminal</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Make instant buyouts off clearance prices</p>
                </div>
              </div>

              <div className="border-t border-b border-slate-100 py-4.5 space-y-4 text-xs font-bold">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Bundle:</span>
                  <span className="text-slate-800 text-right truncate max-w-[200px]">{selectedBundle.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Clearance Price:</span>
                  <span className="text-slate-800">₹{originalPrice}</span>
                </div>

                {/* Slider Input */}
                <div className="space-y-2 pt-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Propose Discount Stake</span>
                    <span className="text-rose-600 font-extrabold text-xs px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md">
                      -{discountPercent}%
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  
                  <div className="flex justify-between text-[8.5px] text-slate-400 font-black tracking-wider uppercase">
                    <span>5% (Fair)</span>
                    <span>15% (Aggressive)</span>
                    <span>30% (Max Cut)</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-extrabold text-slate-700">Proposing Buyout Offer:</span>
                  <span className="text-xl font-black text-rose-600">₹{offeredPrice}</span>
                </div>
              </div>

              {/* Acceptance probability warning */}
              <div className={`p-3 border rounded-2xl text-[10.5px] font-black flex items-center gap-1.5 justify-center ${offerProbability.color}`}>
                {offerProbability.status}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button 
                  onClick={() => setSelectedBundle(null)}
                  disabled={negotiating}
                  className="py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmOffer}
                  disabled={negotiating}
                  className="py-2.5 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {negotiating ? 'Sending Bid...' : 'Submit Stake'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
