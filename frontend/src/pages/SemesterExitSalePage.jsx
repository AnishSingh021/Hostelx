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
  ChevronRight, 
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Info,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Mock senior exit timelines (graduation countdowns)
const INITIAL_SENIORS = [
  {
    id: 's-1',
    name: 'Anirudh Goyal (CSE)',
    room: 'Room 402, Satpura Block',
    exitSecondsLeft: 1.5 * 24 * 3600 + 4 * 3600, // 1d 4h
    headline: 'Leaving for Bangalore corporate job! Selling entire room assets.',
    profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 's-2',
    name: 'Priyanka Sen (ECE)',
    room: 'Room 204, Nilgiri Block',
    exitSecondsLeft: 2 * 24 * 3600 + 10 * 3600, // 2d 10h
    headline: 'Relocating to Germany for Masters. Everything must go by Tuesday.',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 's-3',
    name: 'Vikram Aditya (ME)',
    room: 'Room 108, Aravali Block',
    exitSecondsLeft: 4.2 * 24 * 3600, // 4d 4h
    headline: 'Graduating senior clearing study setups, tools, and cycle.',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60'
  }
];

// Mock bulk room bundles
const BULK_BUNDLES = [
  {
    id: 'bundle-1',
    sellerName: 'Anirudh Goyal',
    room: 'Room 402, Satpura Block',
    title: 'Room 402 Premium CSE Bundle 💻',
    description: 'Get a heavy duty study setup. Perfect for incoming sophomores looking for a fully-equipped CSE dorm room.',
    items: [
      'Hero Ranger 21-Speed Cycle (Excellent chain condition)',
      'Orthopedic Spring Mattress (Single size, 5-inch)',
      'Bajaj 36L High-Velocity Room Cooler (Includes custom stands)'
    ],
    originalValue: 9500,
    clearancePrice: 5200,
    badge: 'Urgently Liquidation',
    tags: ['Cycle', 'Mattress', 'Cooler'],
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'bundle-2',
    sellerName: 'Priyanka Sen',
    room: 'Room 204, Nilgiri Block',
    title: 'Room 204 Cozy Study Station 📚',
    description: 'Complete comfortable desk unit designed for night owl prep. Linens and cushion chair are thoroughly sanitized.',
    items: [
      'Ergonomic High-Back Cushion Study Chair',
      'Belkin 8-Socket Surge Extension Board',
      'Bajaj 10W LED Study Desk Lamp (3-levels color adjustable)',
      'Cozy Single Fitted Bedsheet + Ortho Neck Pillow'
    ],
    originalValue: 4200,
    clearancePrice: 2200,
    badge: 'Cozy Dorm Study',
    tags: ['Chair', 'Lamp', 'Linen'],
    image: 'https://images.unsplash.com/photo-1519642918688-7e43d1a016f6?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'bundle-3',
    sellerName: 'Vikram Aditya',
    room: 'Room 108, Aravali Block',
    title: 'Room 108 Surival Kit 🍳',
    description: 'Avoid mess hall queues. Cooking assets and high speed air breeze table fan to beat the intense campus heat.',
    items: [
      'Prestige 2000W Induction Cooker (Touch paneled)',
      'High-Speed 12-inch Table Fan (3-speeds control)',
      'Plastic Washroom Bucket (25L) + Canteen mug'
    ],
    originalValue: 3400,
    clearancePrice: 1699,
    badge: 'Kitchen SURVIVAL',
    tags: ['Induction', 'Fan', 'Kitchen'],
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60'
  }
];

export default function SemesterExitSalePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [seniors, setSeniors] = useState(INITIAL_SENIORS);
  const [toastMessage, setToastMessage] = useState('');
  
  // Negotiation Modal State
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(15); // Default 15% discount offer
  const [negotiationStatus, setNegotiationStatus] = useState('');

  // Ticking Countdown Interval
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
    if (totalSeconds <= 0) return 'LEFT CAMPUS ✈️';
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fast Negotiation calculations
  const originalPrice = selectedBundle?.clearancePrice || 0;
  const offeredPrice = Math.round(originalPrice * (1 - discountPercent / 100));
  
  // Decide live if senior accepts offer immediately
  const getOfferProbability = () => {
    if (discountPercent <= 10) return { status: 'Instant Acceptance! ✅', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    if (discountPercent <= 20) return { status: 'High Chance of Senior Approval ⚡', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    return { status: 'Requires Senior Negotiation (30% off limit) ⚠️', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse' };
  };

  const offerProbability = getOfferProbability();

  const handleOpenNegotiation = (bundle) => {
    setSelectedBundle(bundle);
    setDiscountPercent(15);
  };

  const handleConfirmOffer = () => {
    const isInstant = discountPercent <= 10;
    
    if (isInstant) {
      triggerToast(`🎉 Instant buyout approved! Order created for ₹${offeredPrice}. Check your chats for verification codes.`);
    } else {
      triggerToast(`📢 Fast offer of ₹${offeredPrice} (-${discountPercent}%) sent to ${selectedBundle.sellerName}! Live negotiation channel opened.`);
    }
    
    setSelectedBundle(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative pb-16">
      {/* High intensity clearance glow */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] -z-10" />

      {/* Nav Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition cursor-pointer"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                Semester Exit Sale
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full animate-bounce">
                CLEARANCE BOARD
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold">Bulk dormitory liquidation and fast senior negotiations</p>
          </div>
        </div>

        <Link 
          to="/sell?listingType=exit-sale"
          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-red-500/20 cursor-pointer active:scale-95 transition"
        >
          <Flame className="w-4 h-4 fill-white" />
          List Clearance
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* Cinematic Header Warning */}
        <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-red-950/20 via-card to-amber-950/10 border-2 border-red-500/20 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-red-400 animate-pulse" />
              Seniors campus checkout ongoing
            </span>
            <h1 className="text-3xl font-black tracking-tight">Seniors Moving-Out Liquidation</h1>
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed font-medium">
              Graduating students are packing up their lives! Buy bulk packages (entire room mattress + table fan + cycles + desk lamps) at up to 60% discount. Propose fast negotiation offers directly using our interactive pricing slider.
            </p>
          </div>

          {/* Warning Flag */}
          <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-2xl max-w-xs self-start md:self-auto flex items-start gap-3">
            <BadgeAlert className="w-6 h-6 text-red-500 flex-shrink-0 animate-bounce" />
            <div>
              <h4 className="text-xs font-black text-red-400">Strict Exit Timelines</h4>
              <p className="text-[9.5px] text-muted-foreground mt-0.5 leading-relaxed font-semibold">
                Seniors leaving college must empty hostel inventories before room inspection dates. Fast transactions are guaranteed.
              </p>
            </div>
          </div>
        </div>

        {/* Live Seniors Exit Countdowns (Grid) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                <Clock className="w-4.5 h-4.5 text-red-500" />
                Senior Checkout Departure Timelines
              </h3>
              <p className="text-xs text-muted-foreground">Ticking countdown clocks detailing room inspection schedules</p>
            </div>
            <span className="text-[9px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">LIVE SCHEDULE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {seniors.map((snr) => (
              <div 
                key={snr.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-md flex items-center gap-4 relative overflow-hidden group hover:border-red-500/20 transition-all duration-300"
              >
                {/* Visual side marker */}
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500"></div>

                <img 
                  src={snr.profileImage} 
                  alt={snr.name} 
                  className="w-14 h-14 rounded-full object-cover border border-border flex-shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-extrabold text-sm text-foreground truncate">{snr.name}</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{snr.room}</p>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-1 truncate italic">"{snr.headline}"</p>
                  
                  {/* Countdown display */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-black text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/15 w-fit">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                    <span>Inspection in: {formatCountdown(snr.exitSecondsLeft)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clearance Bundles Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-extrabold text-xl tracking-tight flex items-center gap-2">
                <Package className="w-5.5 h-5.5 text-amber-500" />
                Featured Bulk Room Clearance Bundles
              </h3>
              <p className="text-xs text-muted-foreground">Get single-box pricing discounts on multi-item student dormitory assets</p>
            </div>
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">BULK SAVINGS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BULK_BUNDLES.map((bundle) => (
              <div 
                key={bundle.id}
                className="bg-card border border-border rounded-3xl p-5.5 shadow-md flex flex-col justify-between hover:shadow-xl hover:border-red-500/20 transition-all duration-300 relative group"
              >
                {/* Urgently Liquidation Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-amber-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-red-600/10">
                  {bundle.badge}
                </div>

                <div>
                  {/* Thumbnail aspect ratio */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-muted/40 border border-border mb-4">
                    <img 
                      src={bundle.image} 
                      alt={bundle.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                  </div>

                  <h4 className="font-black text-base text-foreground leading-tight">{bundle.title}</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{bundle.room} · Owner: {bundle.sellerName}</p>
                  
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed font-semibold">{bundle.description}</p>
                  
                  {/* Bundled Items lists */}
                  <div className="mt-4 space-y-2 bg-muted/30 border border-border p-3.5 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">What is inside this bundle:</p>
                    <div className="space-y-1.5">
                      {bundle.items.map((it, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] font-bold text-muted-foreground leading-relaxed">
                          <CornerDownRight className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>{it}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Buyout Panel */}
                <div className="pt-4 border-t border-border mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground line-through block font-bold">Value: ₹{bundle.originalValue}</span>
                    <span className="text-xl font-black text-foreground">₹{bundle.clearancePrice}</span>
                    <span className="text-[9px] text-rose-500 font-extrabold flex items-center gap-0.5 mt-0.5 bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/20 w-fit">
                      <TrendingDown className="w-3 h-3" />
                      Save {Math.round((1 - bundle.clearancePrice / bundle.originalValue) * 100)}%
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenNegotiation(bundle)}
                      className="px-3.5 py-2.5 bg-card border border-border text-foreground hover:bg-muted text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <Sliders className="w-3.5 h-3.5" /> Offer
                    </button>
                    
                    <button 
                      onClick={() => triggerToast(`🎉 Instant buyout reserved for "${bundle.title}"! Delivery coordinates locks generated.`)}
                      className="px-4 py-2.5 bg-foreground text-background text-xs font-black rounded-xl hover:opacity-90 active:scale-95 transition cursor-pointer"
                    >
                      Instant Buy
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Negotiation disclaimer panel */}
        <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 p-4.5 rounded-3xl text-xs text-muted-foreground font-semibold leading-relaxed">
          <Info className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>Need items immediately? The Exit Sale terminal lets buyers secure room bundle reserves. The seller receives instant alerts, and meetups must happen within 24 hours of inspection countdowns.</span>
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
              className="bg-foreground text-background text-xs font-bold px-6 py-3.5 rounded-full shadow-2xl"
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
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-3xl p-6 backdrop-blur-lg z-10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/15 text-red-500 rounded-xl">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Fast Negotiation Terminal</h3>
                  <p className="text-[10px] text-muted-foreground">Make instant buyouts off clearance prices</p>
                </div>
              </div>

              <div className="border-t border-b border-border py-4.5 space-y-4 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Bundle:</span>
                  <span className="text-foreground">{selectedBundle.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clearance Price:</span>
                  <span className="text-foreground">₹{originalPrice}</span>
                </div>

                {/* Slider Input */}
                <div className="space-y-2 pt-2 bg-muted/40 p-3.5 rounded-2xl border border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground uppercase">Propose Discount Stake</span>
                    <span className="text-rose-500 font-extrabold text-xs px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-md">
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
                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  
                  <div className="flex justify-between text-[8.5px] text-muted-foreground font-black tracking-wider uppercase">
                    <span>5% (Fair)</span>
                    <span>15% (Aggressive)</span>
                    <span>30% (Max Cut)</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-extrabold text-foreground">Proposing Buyout Offer:</span>
                  <span className="text-xl font-black text-rose-500">₹{offeredPrice}</span>
                </div>
              </div>

              {/* Acceptance probability warning */}
              <div className={`p-3 border rounded-2xl text-[10px] font-black flex items-center gap-1.5 justify-center ${offerProbability.color}`}>
                {offerProbability.status}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button 
                  onClick={() => setSelectedBundle(null)}
                  className="py-2.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl border border-border hover:bg-muted transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmOffer}
                  className="py-2.5 bg-red-500 text-white text-xs font-black rounded-xl hover:bg-red-600 transition cursor-pointer"
                >
                  Submit Stake
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
