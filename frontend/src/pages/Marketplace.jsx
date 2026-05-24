import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronLeft, X, HelpCircle, AlertOctagon, RefreshCw, ShoppingCart, Calendar, HelpCircle as FoundIcon, Hammer, ArrowUpDown, Tag, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { safeParseDescription } from '../lib/utils';

const CATEGORY_SUGGESTIONS = [
  'Search "cheap chair under 1k" 🤖',
  'Search "induction cooker" 🍳',
  'Search "mattress below rs 1500" 🛏',
  'Search "cycle in good condition" 🚲',
  'Search "engineering books" 📚',
];

function useAnimatedPlaceholder(suggestions, interval = 3000) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = suggestions[index];
    let timeout;

    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 50);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), interval);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 25);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % suggestions.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, index, suggestions, interval]);

  return displayed;
}

export default function Marketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialTab = searchParams.get('tab') || 'All';
  const initialCategory = searchParams.get('category') || 'All';
  const initialTag = searchParams.get('tag') || '';
  const initialDelivery = searchParams.get('delivery') === 'true';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeListingType, setActiveListingType] = useState(initialTab);
  const [aiSearch, setAiSearch] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(initialDelivery);
  const [activeRentType, setActiveRentType] = useState('offer');
  
  const animatedPlaceholder = useAnimatedPlaceholder(CATEGORY_SUGGESTIONS);
  const inputRef = useRef(null);

  const categories = ['All', 'Electronics', 'Books', 'Cycle', 'Mattress', 'Gaming', 'Kitchen', 'Fashion', 'Notes', 'Accessories', 'Others'];

  const listingTypes = [
    { type: 'All', label: 'All Listings', icon: <ShoppingCart className="w-4 h-4" /> },
    { type: 'buy', label: 'Items for Sale', icon: <Tag className="w-4 h-4" /> },
    { type: 'rent', label: 'Rentals', icon: <Calendar className="w-4 h-4" /> },
    { type: 'emergency', label: 'Campus Emergencies', icon: <RadioIcon className="w-4 h-4 animate-pulse text-rose-500" /> }
  ];

  const fetchProducts = async (cat = activeCategory, kw = keyword, type = activeListingType) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (kw) queryParams.append('keyword', kw);
      if (cat && cat !== 'All') queryParams.append('category', cat);
      
      if (type && type !== 'All') {
        if (type === 'lost') {
          queryParams.append('listingType', 'lost');
        } else if (type === 'rent') {
          queryParams.append('listingType', 'rent');
          queryParams.append('rentType', activeRentType);
        } else {
          queryParams.append('listingType', type);
        }
      }
      
      if (aiSearch) {
        queryParams.append('aiSearch', 'true');
      }

      // Proximity params
      if (user?.hostel) {
        queryParams.append('userHostel', user.hostel);
      }
      const lat = localStorage.getItem('userLat');
      const lng = localStorage.getItem('userLng');
      if (lat && lng) {
        queryParams.append('userLat', lat);
        queryParams.append('userLng', lng);
      }

      const response = await fetch(`https://hostelx-backend-a228.onrender.com/api/products?${queryParams}`);
      let data = await response.json();

      // Redundant Lost & Found merge block removed to enforce strict separation

      // Filter local nearby if toggled
      if (nearbyOnly && lat && lng) {
        data = data.filter(p => {
          if (!p.location?.coordinates || p.location.coordinates.length < 2) return false;
          const [pLng, pLat] = p.location.coordinates;
          const dist = Math.sqrt(Math.pow(pLat - parseFloat(lat), 2) + Math.pow(pLng - parseFloat(lng), 2));
          p.distanceKm = dist * 111; // Approx km for coordinates
          return p.distanceKm <= 1.5; // Within 1.5km range (campus radius)
        });
      }

      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(activeCategory, keyword, activeListingType);
    // eslint-disable-next-line
  }, [activeCategory, activeListingType, aiSearch, nearbyOnly, activeRentType]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(activeCategory, keyword, activeListingType);
  };

  const clearSearch = () => {
    setKeyword('');
    fetchProducts(activeCategory, '', activeListingType);
  };

  // Helper to calculate human readable proximity tags
  const renderProximityTag = (product) => {
    const isSameHostel = product.hostel?.toLowerCase() === user?.hostel?.toLowerCase();
    if (isSameHostel) {
      return (
        <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          Same Hostel 🏠
        </span>
      );
    }

    const lat = parseFloat(localStorage.getItem('userLat'));
    const lng = parseFloat(localStorage.getItem('userLng'));
    if (lat && lng && product.location?.coordinates?.length === 2) {
      const [pLng, pLat] = product.location.coordinates;
      const distance = Math.sqrt(Math.pow(pLat - lat, 2) + Math.pow(pLng - lng, 2)) * 111 * 1000; // Meters
      
      if (distance < 200) {
        return (
          <span className="bg-cyan-500/10 text-cyan-500 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            2 mins away 🚶‍♂️
          </span>
        );
      } else if (distance < 500) {
        return (
          <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            5 mins away 🚶‍♂️
          </span>
        );
      } else {
        return (
          <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {(distance / 1000).toFixed(1)} km away
          </span>
        );
      }
    }

    return (
      <span className="bg-muted text-muted-foreground text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-0.5">
        <MapPin className="w-3 h-3" />
        {product.hostel}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Premium Search Bar Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition cursor-pointer"
                title="Back to Dashboard"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Marketplace</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Find student deals and essentials within campus bounds</p>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Proximity Toggle */}
              <button
                onClick={() => setNearbyOnly(!nearbyOnly)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                  nearbyOnly 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' 
                    : 'bg-card border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Radius 1.5km
              </button>

            </div>
          </div>

          {/* Search form with AI parser */}
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={animatedPlaceholder || ' '}
                className="w-full pl-11 pr-24 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-foreground font-semibold text-sm transition"
              />
              
              {/* Clear Search Button */}
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {keyword && (
                  <button type="button" onClick={clearSearch} className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-95 shadow-md shadow-primary/10 transition cursor-pointer text-sm"
            >
              Search
            </button>
          </form>

          {/* Listing Types Tab Controller */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-border/40 pt-2.5">
            {listingTypes.map((tab) => (
              <button
                key={tab.type}
                onClick={() => setActiveListingType(tab.type)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeListingType === tab.type
                    ? 'bg-muted border border-muted-foreground/35 text-foreground'
                    : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {activeListingType === 'rent' && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 bg-muted/40 p-1.5 rounded-2xl max-w-xs border border-border mt-3"
            >
              <button
                type="button"
                onClick={() => setActiveRentType('offer')}
                className={`flex-1 text-center py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeRentType === 'offer'
                    ? 'bg-card border border-border text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Rental Offers
              </button>
              <button
                type="button"
                onClick={() => setActiveRentType('seek')}
                className={`flex-1 text-center py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeRentType === 'seek'
                    ? 'bg-card border border-border text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Buyer Demands
              </button>
            </motion.div>
          )}

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Categories Bar */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl border text-xs font-bold transition duration-200 cursor-pointer ${
                activeCategory === c
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-card-foreground border-border hover:border-primary hover:text-primary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>


        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-card border border-border rounded-2xl h-80" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-3xl p-8 max-w-md mx-auto flex flex-col items-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl mb-4 animate-bounce">📦</div>
            <h4 className="font-extrabold text-base text-foreground">No listings available yet</h4>
            <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed text-center">
              Be the first to upload your first item and start trading inside Chandigarh University hostels!
            </p>
            <Link
              to="/sell-item"
              className="mt-5 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:opacity-90 active:scale-[0.99] transition shadow-md"
            >
              Upload your first item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence>
              {products
                .filter(p => p.listingType !== 'lost' && p.listingType !== 'found' && p.listingType !== 'recovered' && !p.isAuction)
                .map((product, i) => {
                const isUrgent = product.isUrgent;
                const isBoosted = product.isBoosted;
                const isRental = product.listingType === 'rent';
                const isAuction = product.isAuction;
                
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="relative"
                  >
                    <Link to={`/product/${product._id}`}>
                      <motion.div
                        whileHover={{ y: -6 }}
                        className={`bg-card border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full relative ${
                          isUrgent 
                            ? 'border-rose-500/50 shadow-rose-500/5 ring-1 ring-rose-500/10' 
                            : isBoosted 
                            ? 'border-violet-500/50 shadow-violet-500/5 ring-1 ring-violet-500/10' 
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        {/* Image banner with overlays */}
                        <div className="aspect-square w-full relative overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {/* Badges container */}
                          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-[2]">
                            
                            {/* Urgent pulsing badge */}
                            {isUrgent && (
                              <span className="bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                                Urgent sale 🔥
                              </span>
                            )}
                            
                            {/* Premium Boosted badge */}
                            {isBoosted && (
                              <span className="bg-violet-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-0.5 shadow-md">
                                <Zap className="w-2.5 h-2.5" /> Boosted Listing
                              </span>
                            )}

                            {/* Auction active badge */}
                            {isAuction && (
                              <span className="bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-0.5 shadow-md">
                                <Hammer className="w-2.5 h-2.5" /> Live Auction
                              </span>
                            )}

                            {/* Rental Duration badge */}
                            {isRental && product.rentType === 'seek' && (
                              <span className="bg-purple-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                Looking to Rent ⏳
                              </span>
                            )}
                            {isRental && product.rentType !== 'seek' && (
                              <span className="bg-sky-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                Rental Offer 💰
                              </span>
                            )}

                            {/* Lost / Found logs badge */}
                            {product.listingType === 'lost' && (
                              <span className="bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                Lost Report 🎒
                              </span>
                            )}
                            {product.listingType === 'found' && (
                              <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                Found log 🔍
                              </span>
                            )}

                          </div>

                          {/* Condition rating tag on right */}
                          <div className="absolute top-2.5 right-2.5 bg-background/95 backdrop-blur-sm border border-border px-2 py-0.5 rounded-md text-[10px] font-bold capitalize shadow-sm text-foreground">
                            {product.condition}
                          </div>
                        </div>

                        {/* Details content */}
                        <div className="p-4 flex flex-col justify-between flex-grow">
                          <div>
                            <h3 className="font-extrabold text-base line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                              {product.title}
                            </h3>
                            
                            {/* Price labels */}
                            <div className="flex items-baseline gap-1 mt-1.5">
                              <span className="text-primary font-black text-xl tracking-tight">
                                ₹{product.price}
                              </span>
                              {isRental && (
                                <span className="text-muted-foreground text-[10px] font-bold">
                                  / {product.rentalDuration}
                                </span>
                              )}
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-1 py-0.2 rounded line-through ml-1">
                                  ₹{product.originalPrice}
                                </span>
                              )}
                            </div>
                            
                            {/* Short desc snippet */}
                            <p className="text-xs text-muted-foreground/80 line-clamp-2 mt-1.5 font-medium">
                              {safeParseDescription(product.description)}
                            </p>
                          </div>

                          {/* Smart proximity location bar */}
                          <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-4 gap-2">
                            {renderProximityTag(product)}
                          </div>
                        </div>

                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

// Inline temporary components
function RadioIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
      <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
    </svg>
  );
}
