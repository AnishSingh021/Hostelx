import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Sparkles, 
  ShoppingCart, 
  Users, 
  MapPin, 
  TrendingDown, 
  BookOpen, 
  Plus, 
  Check, 
  Calculator, 
  Info,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ESSENTIAL_CATEGORIES = [
  { id: 'Mattress', name: 'Mattress', emoji: '🛏️', desc: 'Dorm sleeping comfort' },
  { id: 'Bucket', name: 'Bucket & Mug', emoji: '🪣', desc: 'Washroom essentials' },
  { id: 'Induction', name: 'Induction Stove', emoji: '🍳', desc: 'Midnight maggi makers' },
  { id: 'Bedsheet', name: 'Bedsheets', emoji: '🛌', desc: 'Cozy linens & pillows' },
  { id: 'Extension board', name: 'Extension Board', emoji: '🔌', desc: 'Multiple plug stations' },
  { id: 'Table fan', name: 'Table Fan', emoji: '🌀', desc: 'Cool breeze for hot nights' },
  { id: 'Pillow', name: 'Pillows', emoji: '😴', desc: 'Soft neck support' },
  { id: 'Study lamp', name: 'Study Lamp', emoji: '💡', desc: 'Late night exam lights' }
];

export default function RoommateEssentialsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [hostelFilterOnly, setHostelFilterOnly] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Shared Split Buying State
  const [splitItem, setSplitItem] = useState({ title: 'Induction Cooker', price: 1800 });
  const [roommatesCount, setRoommatesCount] = useState(3);
  const [splitName, setSplitName] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch items from DB
  const fetchEssentials = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/products');
      if (response.ok) {
        const data = await response.json();
        // Match our essentials list categories
        const essentialsCategories = ['Mattress', 'Kitchen', 'Electronics', 'Others', 'Books'];
        
        // Let's filter products matching our categories or title keywords
        const filtered = data.filter(p => {
          const titleLower = p.title.toLowerCase();
          const matchesKeyword = ['mattress', 'bucket', 'induction', 'bedsheet', 'extension', 'fan', 'pillow', 'lamp', 'study', 'cooker', 'kettle'].some(kw => titleLower.includes(kw));
          return matchesKeyword || essentialsCategories.includes(p.category);
        });
        setProducts(filtered);
      }
    } catch (e) {
      console.error('Failed to fetch essentials:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEssentials();
  }, []);

  // Filtered Essentials
  const filteredProducts = products.filter(p => {
    // Category match
    const categoryMatches = activeCategory === 'All' || 
      p.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
      p.title.toLowerCase().includes(activeCategory.toLowerCase());
    
    // Hostel block match
    const hostelMatches = !hostelFilterOnly || 
      p.hostel?.toLowerCase() === user?.hostel?.toLowerCase();

    return categoryMatches && hostelMatches;
  });

  // Bundle deals mock definition
  const BUNDLE_DEALS = [
    {
      id: 'study-pack',
      title: 'High-Scores Study Pack 📚',
      desc: 'Get your desk set up for midterms with key utilities.',
      items: ['Study Lamp', 'Extension Board', 'Table Fan'],
      originalPrice: 1950,
      bundlePrice: 1399,
      badge: 'Bestseller',
      accentColor: 'from-teal-500 to-emerald-500'
    },
    {
      id: 'dorm-cozy',
      title: 'Ultimate Dorm Sleep Pack 🛏️',
      desc: 'Unpack and sleep straight away. Clean sheets and mattress.',
      items: ['Mattress', 'Comfort Pillow', 'Bedsheet'],
      originalPrice: 2800,
      bundlePrice: 1899,
      badge: 'High Value',
      accentColor: 'from-indigo-500 to-violet-500'
    },
    {
      id: 'kitchen-maggi',
      title: 'Midnight Maggi Muncher Bundle 🍜',
      desc: 'Cook and survive late nights without canteen orders.',
      items: ['Induction Stove', 'Induction Cookware', 'Water Jug'],
      originalPrice: 2400,
      bundlePrice: 1699,
      badge: 'Hot Seller',
      accentColor: 'from-amber-500 to-rose-500'
    }
  ];

  const handleBuyBundle = (bundle) => {
    setSelectedBundle(bundle);
  };

  const handleConfirmBundlePurchase = () => {
    setSelectedBundle(null);
    triggerToast(`🎉 Bundle "${selectedBundle.title}" ordered successfully! Delivery is being grouped.`);
  };

  const splitValue = Math.round(splitItem.price / roommatesCount);

  return (
    <div className="min-h-screen bg-background text-foreground relative pb-16">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

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
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">
                Roommate Essentials
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 bg-teal-500/10 text-teal-500 border border-teal-500/20 rounded-full">
                WING DEPOT
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold">Necessities for dorm comfort and wing utility</p>
          </div>
        </div>

        <Link 
          to="/sell?listingType=buy"
          className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-teal-500/20 cursor-pointer active:scale-95 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          List Essential
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* Hero & Intro Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-950/20 via-card to-emerald-950/10 border border-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
               wing-level coordination ready
            </span>
            <h1 className="text-3xl font-black tracking-tight">Wing Depot: Basic Dorm Needs</h1>
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed font-medium">
              Don't spend thousands at local retail centers. Buy student essentials like mattresses, buckets, fans, and extension boards from leaving graduates. Split costs or grab bundled savings!
            </p>
          </div>

          {/* Toggle Block Proximity */}
          <div className="bg-card border border-border p-4.5 rounded-2xl flex flex-col justify-center items-start gap-2 max-w-xs self-start md:self-auto">
            <h4 className="text-xs font-bold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-500" />
              Proximity Hub Sorting
            </h4>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Showing matching items inside <span className="text-foreground font-bold">{user?.hostel || 'your hostel block'}</span> first.
            </p>
            <div className="flex items-center gap-2 mt-1 w-full">
              <button 
                onClick={() => setHostelFilterOnly(!hostelFilterOnly)}
                className={`w-full py-1.5 rounded-xl border text-[10px] font-bold transition cursor-pointer ${
                  hostelFilterOnly 
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-500' 
                    : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                {hostelFilterOnly ? 'Only My Hostel Enabled' : 'Show All Campus Blocks'}
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: Pre-packaged Bundle Deals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Exclusive Wing Bundles</h3>
              <p className="text-xs text-muted-foreground">Pre-packaged sets with group student discounts applied</p>
            </div>
            <span className="text-[9px] font-bold text-teal-500 bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded-lg">DISCOUNTS SAVED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BUNDLE_DEALS.map((bundle) => (
              <div 
                key={bundle.id}
                className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl hover:border-teal-500/20 transition-all duration-300 group"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bundle.accentColor} opacity-5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500`} />
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 text-[9px] font-black uppercase bg-teal-500/10 text-teal-500 rounded-full border border-teal-500/20">
                      {bundle.badge}
                    </span>
                    <div className="flex items-center text-xs gap-1.5 font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/15">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Save {Math.round((1 - bundle.bundlePrice / bundle.originalPrice) * 100)}%
                    </div>
                  </div>
                  <h4 className="font-black text-base text-foreground mb-2 leading-tight">{bundle.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-normal mb-4 font-semibold">{bundle.desc}</p>
                  
                  {/* Items List */}
                  <div className="space-y-1.5 mb-6">
                    {bundle.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>{it}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-muted-foreground line-through block font-bold">₹{bundle.originalPrice}</span>
                    <span className="text-xl font-black text-foreground">₹{bundle.bundlePrice}</span>
                  </div>
                  <button 
                    onClick={() => handleBuyBundle(bundle)}
                    className="px-4.5 py-2.5 bg-foreground text-background text-xs font-black rounded-xl hover:opacity-90 active:scale-95 transition cursor-pointer"
                  >
                    Buy Pack
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Shared Wing Split-Cost Calculator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          <div className="bg-card border border-border p-6 rounded-3xl shadow-md space-y-4 md:col-span-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5 text-teal-500 animate-bounce" />
                <h3 className="font-extrabold text-base">Shared Split Buying</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-normal font-semibold">
                Buying a heavy utility (stove, fridge, table fan) with your roomies? Calculate instant shares and coordination codes.
              </p>

              {/* Calculator Form */}
              <div className="space-y-3.5 mt-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Select Item Target</label>
                  <select 
                    value={splitItem.title} 
                    onChange={(e) => {
                      const sel = e.target.value;
                      if (sel === 'Induction Stove') setSplitItem({ title: 'Induction Stove', price: 1800 });
                      if (sel === 'High-Velocity Cooler') setSplitItem({ title: 'High-Velocity Cooler', price: 2999 });
                      if (sel === 'Utility Table Fan') setSplitItem({ title: 'Utility Table Fan', price: 1200 });
                      if (sel === 'Multi-Rack Bookshelf') setSplitItem({ title: 'Multi-Rack Bookshelf', price: 900 });
                    }}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="Induction Stove">Induction Stove (₹1,800)</option>
                    <option value="High-Velocity Cooler">High-Velocity Cooler (₹2,999)</option>
                    <option value="Utility Table Fan">Utility Table Fan (₹1,200)</option>
                    <option value="Multi-Rack Bookshelf">Multi-Rack Bookshelf (₹900)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Roommates Splitting</label>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setRoommatesCount(num)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-black cursor-pointer transition ${
                          roommatesCount === num 
                            ? 'bg-teal-500 text-white border-teal-500' 
                            : 'bg-muted border-border hover:bg-secondary'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Co-Buyer Nickname</label>
                  <input
                    type="text"
                    placeholder="e.g. Wing B-4"
                    value={splitName}
                    onChange={(e) => setSplitName(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground font-bold block uppercase">Per Person Split</span>
                <span className="text-xl font-black text-teal-500">₹{splitValue}</span>
              </div>
              <button 
                onClick={() => {
                  triggerToast(`📢 Split buying request for "${splitItem.title}" published! Shared payment codes dispatched.`);
                  setSplitName('');
                }}
                disabled={!splitName}
                className="px-4.5 py-2.5 bg-teal-500 text-white text-xs font-black rounded-xl hover:bg-teal-600 active:scale-95 disabled:opacity-50 transition cursor-pointer"
              >
                Split Buying
              </button>
            </div>
          </div>

          {/* Dynamic Interactive Panel explanation */}
          <div className="bg-card border border-border p-6 rounded-3xl shadow-md md:col-span-2 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="font-extrabold text-base text-foreground flex items-center gap-1.5">
                <Users className="w-5 h-5 text-indigo-500" />
                Live Wing Coordination board
              </h4>
              <p className="text-xs text-muted-foreground leading-normal font-semibold">
                Roommate split requests let students purchase high-value appliances by sharing stakes. Ownership stakes can be resold back when leaving college!
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="bg-muted/30 border border-border p-3.5 rounded-2xl flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <div>
                      <h5 className="text-xs font-black text-foreground">Wing 402 split: Induction stove</h5>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Created by Sneha P. · B-Hall Block</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-foreground">3 / 4 Joined</span>
                    <button 
                      onClick={() => triggerToast("🎉 Joined Sneha's shared purchase stake! Total split recalculating.")}
                      className="block text-[10px] font-bold text-teal-500 hover:underline mt-0.5 cursor-pointer"
                    >
                      Join Split (₹450)
                    </button>
                  </div>
                </div>

                <div className="bg-muted/30 border border-border p-3.5 rounded-2xl flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <div>
                      <h5 className="text-xs font-black text-foreground">Room 211 split: Tower Air Cooler</h5>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Created by Dev Patel · Vyasa Block</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-foreground">2 / 3 Joined</span>
                    <button 
                      onClick={() => triggerToast("🎉 Joined Dev's shared purchase stake! Total split recalculating.")}
                      className="block text-[10px] font-bold text-teal-500 hover:underline mt-0.5 cursor-pointer"
                    >
                      Join Split (₹1000)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 p-3 rounded-2xl text-[10px] text-indigo-400 font-semibold leading-relaxed mt-4">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Wing purchases utilize standard QR code claims. One student collects the physical item, and HostelX locks stakes safely until delivery confirmations.</span>
            </div>
          </div>
        </div>

        {/* Section 3: Room Essentials Browse */}
        <div id="essentials-browse" className="space-y-6 pt-6 border-t border-border/50">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-xl tracking-tight">Browse Dorm Necessities</h3>
              <p className="text-xs text-muted-foreground">Select essential sub-categories or fetch local wing items</p>
            </div>

            {/* Category selection */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar max-w-full">
              <button
                onClick={() => setActiveCategory('All')}
                className={`whitespace-nowrap px-4 py-2 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                  activeCategory === 'All'
                    ? 'bg-foreground text-background border-foreground shadow-sm'
                    : 'bg-card border-border text-muted-foreground hover:border-teal-500/40 hover:text-foreground'
                }`}
              >
                🌐 All Items
              </button>
              {ESSENTIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-foreground text-background border-foreground shadow-md'
                      : 'bg-card border-border text-muted-foreground hover:border-teal-500/40 hover:text-foreground'
                  }`}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* List items grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="bg-card/50 border border-border rounded-3xl p-4.5 h-64 animate-pulse space-y-4">
                  <div className="w-full h-36 bg-muted rounded-2xl" />
                  <div className="h-4 bg-muted rounded-xl w-3/4" />
                  <div className="h-3 bg-muted rounded-xl w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-card/30 border border-border/80 rounded-[2.5rem] p-8 max-w-md mx-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl mb-4">🪣</div>
              <h4 className="font-extrabold text-base text-foreground">No matching essentials found</h4>
              <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-normal font-semibold">
                No active mattress, bucket, or cooking assets listed for this hostel block. Try switching block filters to see campus wide listings!
              </p>
              <button 
                onClick={() => setHostelFilterOnly(false)}
                className="mt-4 px-4 py-2 bg-teal-500 text-white text-xs font-black rounded-xl hover:bg-teal-600 active:scale-95 transition cursor-pointer"
              >
                Show All Campus Items
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredProducts.map((p) => {
                const isSameHostel = p.hostel?.toLowerCase() === user?.hostel?.toLowerCase();
                return (
                  <motion.div
                    key={p._id}
                    layout
                    whileHover={{ y: -5 }}
                    className="bg-card border border-border rounded-3xl p-4.5 shadow-md flex flex-col justify-between relative group hover:border-teal-500/20 transition-all duration-300"
                  >
                    <div>
                      {/* Thumbnail */}
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted/40 border border-border mb-3.5">
                        <img 
                          src={p.images?.[0] || 'https://via.placeholder.com/250'} 
                          alt={p.title} 
                          className="w-full h-full object-cover" 
                        />
                        {isSameHostel && (
                          <span className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide border border-emerald-600/10">
                            Same Hostel
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <h4 className="font-extrabold text-sm text-foreground group-hover:text-teal-500 transition line-clamp-1">{p.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold mt-0.5">{p.hostel} · Room {p.seller?.room || 'Dorm'}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-normal font-semibold">{p.description}</p>
                    </div>

                    <div className="pt-3 border-t border-border mt-3 flex items-center justify-between">
                      <span className="text-base font-black text-foreground">₹{p.price}</span>
                      <button 
                        onClick={() => navigate(`/product/${p._id}`)}
                        className="px-3.5 py-2 bg-foreground text-background text-xs font-black rounded-xl hover:opacity-90 active:scale-95 transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Toast Alert */}
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

      {/* Bundle Purchase Modal */}
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
                <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Group Bundle checkout</h3>
                  <p className="text-[10px] text-muted-foreground">Confirm your dormitory essential bundle order</p>
                </div>
              </div>

              <div className="space-y-2 border-y border-border py-4.5 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-muted-foreground">Bundle Name:</span>
                  <span className="text-foreground">{selectedBundle.title}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-muted-foreground">Hostel Destination:</span>
                  <span className="text-foreground">{user?.hostel || 'Default Block'}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-muted-foreground">Original Bundle Value:</span>
                  <span className="text-foreground line-through">₹{selectedBundle.originalPrice}</span>
                </div>
                <div className="flex justify-between font-black pt-1">
                  <span className="text-teal-500">Wing Discount Price:</span>
                  <span className="text-teal-500 text-lg">₹{selectedBundle.bundlePrice}</span>
                </div>
              </div>

              <div className="flex items-center p-3 bg-teal-500/10 border border-teal-500/25 rounded-2xl gap-2 text-[10px] text-teal-400 font-semibold leading-relaxed">
                <AlertCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <span>Wing discount prices automatically include multi-item shipping coordination. Sellers package items in a single dorm bundle box for delivery.</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button 
                  onClick={() => setSelectedBundle(null)}
                  className="py-2.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl border border-border hover:bg-muted transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmBundlePurchase}
                  className="py-2.5 bg-teal-500 text-white text-xs font-black rounded-xl hover:bg-teal-600 transition cursor-pointer"
                >
                  Confirm Claim
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
