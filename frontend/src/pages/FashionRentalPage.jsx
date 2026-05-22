import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  ShieldCheck, 
  RotateCcw, 
  Star, 
  MapPin, 
  TrendingUp, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { FEATURED_CATEGORIES, VERIFIED_SELLERS } from '../components/fashion/FashionDummyData';
import OutfitCard from '../components/fashion/OutfitCard';
import RentOutfitModal from '../components/fashion/RentOutfitModal';
import UploadOutfitModal from '../components/fashion/UploadOutfitModal';

export default function FashionRentalPage() {
  const navigate = useNavigate();
  
  // State variables
  const [outfits, setOutfits] = useState(() => {
    // Only load user-uploaded items (stored in sessionStorage), never dummy data
    const cached = sessionStorage.getItem('campusFits');
    return cached ? JSON.parse(cached) : [];
  });

  // Wishlist stored in localStorage
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('fashionWishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleWishlist = (outfitId) => {
    setWishlist(prev => {
      const updated = prev.includes(outfitId) ? prev.filter(id => id !== outfitId) : [...prev, outfitId];
      localStorage.setItem('fashionWishlist', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Interactive Modal states
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('popular');
  const [toastMessage, setToastMessage] = useState('');

  // Scroll to top on active category change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [activeCategory]);

  // Save outfits state when modified
  const updateOutfitsState = (updatedList) => {
    setOutfits(updatedList);
    sessionStorage.setItem('campusFits', JSON.stringify(updatedList));
  };

  // Toast handler
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Upload handler
  const handleUploadFit = (newFit) => {
    const updated = [newFit, ...outfits];
    updateOutfitsState(updated);
    setIsUploadOpen(false);
    triggerToast(`✨ "${newFit.title}" has been published to hostel fashion feeds!`);
  };

  // Checkout Success handler
  const handleRentSuccess = (outfitId) => {
    const updated = outfits.map(o => {
      if (o.id === outfitId) {
        return { ...o, availability: false };
      }
      return o;
    });
    updateOutfitsState(updated);
    triggerToast("🎉 Outfit rented! Check receipt details for coordinates.");
  };

  // Live filtered items
  const filteredOutfits = outfits.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.occasion === activeCategory;
    const matchesGender = genderFilter === 'All' || item.gender === genderFilter;
    const matchesSize = sizeFilter === 'All' || item.size === sizeFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.occasion.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesGender && matchesSize && matchesSearch;
  });

  // Sorted items
  const sortedOutfits = [...filteredOutfits].sort((a, b) => {
    if (sortOrder === 'price-low') return a.rentPrice - b.rentPrice;
    if (sortOrder === 'price-high') return b.rentPrice - a.rentPrice;
    if (sortOrder === 'rating') return b.rating - a.rating;
    return b.views - a.views; // popular default
  });

  // Extra metric count
  const availableCount = outfits.filter(o => o.availability).length;

  return (
    <div className="min-h-screen bg-background text-foreground relative pb-16">
      {/* Absolute Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

      {/* Sticky Premium Nav Header */}
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
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                Rent Your Vibe
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full animate-pulse">
                FIT HUB
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold">Hostel peer-to-peer wardrobe sharing network</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active stats badge */}
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded-xl shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            {availableCount} Active Fits Available
          </span>
          
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-black shadow-md shadow-primary/10 cursor-pointer active:scale-95 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Upload Outfit
          </button>
        </div>
      </header>

      {/* Slogan Hero Banner & Trust Ticker */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        
        {/* Safety and Trust Reminders replacing the promotional hero banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl backdrop-blur-sm shadow-sm">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1 text-left">
              <h4 className="text-xs font-black text-foreground uppercase tracking-wider font-bold">Inspect Outfit Condition</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Always inspect outfit condition before accepting handover.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl backdrop-blur-sm shadow-sm">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl shrink-0">
              <MapPin className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1 text-left">
              <h4 className="text-xs font-black text-foreground uppercase tracking-wider font-bold">Meet Safely</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Meet in common hostel areas while exchanging rented items.
              </p>
            </div>
          </div>
        </div>

        {/* Community Closet empty state vs content grid */}
        {outfits.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                The Hostel Closet is Empty!
              </h2>
              <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                Be the pioneer who kicks off our hostel's wardrobe revolution. Share your premium style, set your price, and earn inside your hostel!
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl pt-4">
              {/* Interactive rack card */}
              <div 
                onClick={() => setIsUploadOpen(true)}
                className="bg-card/40 border border-dashed border-border hover:border-primary/50 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px] cursor-pointer group hover:bg-card/75 transition-all duration-300 relative overflow-hidden"
              >
                {/* Glowing glow effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:scale-125 transition-all duration-500"></div>
                
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition duration-300 relative">
                  <Plus className="w-8 h-8 text-primary stroke-[3]" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary"></span>
                  </span>
                </div>
                
                <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider group-hover:text-primary transition-colors">List Your Fit</h4>
                <p className="text-xs text-muted-foreground mt-2 max-w-[200px] leading-relaxed">
                  Click to open the Closet Creator. Drag in outfit details and set your daily price.
                </p>
              </div>

              {/* Sample glass cards to look premium */}
              <div className="bg-card/25 border border-border/50 rounded-3xl p-8 flex flex-col justify-between min-h-[300px] opacity-60 backdrop-blur-sm relative overflow-hidden select-none animate-pulse" style={{ animationDuration: '4s' }}>
                <div className="space-y-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-xl">🎉</div>
                  <h4 className="font-extrabold text-sm text-foreground/80 uppercase tracking-wider">Party Wear Category</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Club fits, premium hoodies, jackets, and aesthetic streetwear coordinates waiting to be uploaded.
                  </p>
                </div>
                <div className="text-[10px] text-muted-foreground font-semibold border-t border-border/40 pt-4 text-left">
                  🌱 Awaiting community upload
                </div>
              </div>

              <div className="bg-card/25 border border-border/50 rounded-3xl p-8 flex flex-col justify-between min-h-[300px] opacity-60 backdrop-blur-sm relative overflow-hidden select-none animate-pulse" style={{ animationDuration: '6s' }}>
                <div className="space-y-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-xl">👟</div>
                  <h4 className="font-extrabold text-sm text-foreground/80 uppercase tracking-wider">Limited Kicks</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Monetize your Yeezys, Jordans, or Dunks directly. Safe face-to-face handover to trusted peers.
                  </p>
                </div>
                <div className="text-[10px] text-muted-foreground font-semibold border-t border-border/40 pt-4 text-left">
                  🌱 Awaiting community upload
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Trending Outfits Carousel slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight flex items-center gap-1.5">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Trending in Hostels
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Fits rented most frequently this week</p>
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold px-2.5 py-1 bg-secondary rounded-lg border border-border">
                  HOT DEALS
                </span>
              </div>

              {/* Staggered overflow scroll row */}
              <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                {outfits.slice(0, 4).map((outfit) => (
                  <div key={`trending-${outfit.id}`} className="flex-shrink-0 w-60 sm:w-64">
                    <OutfitCard
                      outfit={outfit}
                      onRentClick={(fit) => setSelectedOutfit(fit)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Closet Sellers */}
            {VERIFIED_SELLERS.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight flex items-center gap-1.5">
                    <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
                    Verified Hostel Closets
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Closets of top fashion rated students in hostels</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {VERIFIED_SELLERS.map((seller) => (
                    <div 
                      key={seller.id}
                      className="bg-card border border-border p-4.5 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-colors group relative overflow-hidden shadow-sm"
                    >
                      <div className="flex gap-3.5">
                        <img
                          src={seller.avatar}
                          alt={seller.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/10 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <h4 className="font-extrabold text-xs sm:text-sm text-foreground truncate">{seller.name}</h4>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          </div>
                          <p className="text-[9px] text-muted-foreground font-semibold flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-primary" />
                            {seller.hostel}
                          </p>
                          <span className="inline-block px-1.5 py-0.5 text-[8px] font-black bg-primary/10 text-primary border border-primary/20 rounded mt-1.5 uppercase">
                            {seller.badge}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground/80 leading-normal mt-3 line-clamp-2">
                        "{seller.bio}"
                      </p>

                      <div className="flex items-center justify-between border-t border-border/50 pt-2.5 mt-3.5">
                        <div className="flex items-center gap-0.5 text-xs text-amber-500 font-extrabold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{seller.rating}</span>
                          <span className="text-[9px] text-muted-foreground font-semibold ml-0.5">({seller.reviews} reviews)</span>
                        </div>
                        <button 
                          onClick={() => triggerToast(`💬 Connection request sent to ${seller.name}'s chat closet!`)}
                          className="text-[9px] font-bold text-primary hover:underline"
                        >
                          View Closet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Filter Controls Header */}
            <div id="browse-console" className="space-y-6 pt-6 border-t border-border/50">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-xl tracking-tight">Browse Hostel Wardrobes</h3>
                  <p className="text-xs text-muted-foreground">Select occassions, sizes, or search for brands</p>
                </div>
                
                {/* Search Input */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search brand, outfit, keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9.5 pr-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs font-semibold transition text-foreground"
                  />
                </div>
              </div>

              {/* Detailed Filters row */}
              <div className="bg-card/50 border border-border rounded-2.5xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm backdrop-blur-md">
                <div className="flex flex-wrap items-center gap-3.5">
                  {/* Sliders indicator icon */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-extrabold uppercase mr-1">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    <span>Filters</span>
                  </div>

                  {/* Gender selector */}
                  <div>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="bg-background border border-border text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-primary text-foreground cursor-pointer"
                    >
                      <option value="All">All Genders</option>
                      <option value="Men">Men's Wear</option>
                      <option value="Women">Women's Wear</option>
                      <option value="Unisex">Unisex Fits</option>
                    </select>
                  </div>

                  {/* Size selector */}
                  <div>
                    <select
                      value={sizeFilter}
                      onChange={(e) => setSizeFilter(e.target.value)}
                      className="bg-background border border-border text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-primary text-foreground cursor-pointer"
                    >
                      <option value="All">All Sizes</option>
                      <option value="S">S (Small)</option>
                      <option value="M">M (Medium)</option>
                      <option value="L">L (Large)</option>
                      <option value="XL">XL (Extra Large)</option>
                      <option value="Free Size">Free Size</option>
                      <option value="UK 8">UK 8 (Sneakers)</option>
                      <option value="UK 9">UK 9 (Sneakers)</option>
                      <option value="UK 10">UK 10 (Sneakers)</option>
                    </select>
                  </div>

                  {/* Sort selector */}
                  <div>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="bg-background border border-border text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-primary text-foreground cursor-pointer"
                    >
                      <option value="popular">Popularity (Views)</option>
                      <option value="rating">Highest Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* Clear filters shortcut */}
                {(activeCategory !== 'All' || searchQuery !== '' || genderFilter !== 'All' || sizeFilter !== 'All') && (
                  <button
                    onClick={() => {
                      setActiveCategory('All');
                      setSearchQuery('');
                      setGenderFilter('All');
                      setSizeFilter('All');
                    }}
                    className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1 justify-center md:justify-end cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* Categories Pill tracker */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                <button
                  onClick={() => setActiveCategory('All')}
                  className={`whitespace-nowrap px-4.5 py-2.5 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                    activeCategory === 'All'
                      ? 'bg-foreground text-background border-foreground shadow-md'
                      : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  🌐 All Styles
                </button>
                {FEATURED_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-4.5 py-2.5 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-foreground text-background border-foreground shadow-md'
                        : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {cat.emoji} {cat.name}
                  </button>
                ))}
              </div>

              {/* Outfit grid with Framer Motion animations */}
              {sortedOutfits.length === 0 ? (
                <div className="text-center py-20 bg-card/30 border border-border/80 rounded-[2.5rem] p-8 max-w-lg mx-auto flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl mb-4">👟</div>
                  <h4 className="font-extrabold text-base">No active outfits found</h4>
                  <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-normal">
                    We couldn't locate clothing matching that description. Try broadening your categories or search query.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5 sm:gap-6">
                  <AnimatePresence>
                    {sortedOutfits.map((outfit) => (
                      <motion.div
                        key={`outfit-${outfit.id}`}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <OutfitCard
                          outfit={outfit}
                          onRentClick={(fit) => setSelectedOutfit(fit)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Floating Action Launchers */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-foreground text-background text-xs font-bold px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-2"
            >
              <span>{toastMessage}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Outfit Modal dialogue */}
      <AnimatePresence>
        {isUploadOpen && (
          <UploadOutfitModal
            onClose={() => setIsUploadOpen(false)}
            onUploadSuccess={handleUploadFit}
          />
        )}
      </AnimatePresence>

      {/* Rent Outfit Checkout Modal dialogue */}
      <AnimatePresence>
        {selectedOutfit && (
          <RentOutfitModal
            outfit={selectedOutfit}
            onClose={() => setSelectedOutfit(null)}
            onRentSuccess={handleRentSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
