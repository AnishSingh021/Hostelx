import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  MapPin, 
  Compass, 
  SlidersHorizontal, 
  Search, 
  Navigation,
  ArrowUpDown,
  Clock,
  Heart,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Building
} from 'lucide-react';

// Default campus center coordinates (e.g. Chandigarh University baseline setup)
const DEFAULT_CAMPUS_LAT = 28.3639;
const DEFAULT_CAMPUS_LNG = 75.5870;

// Haversine distance calculator (returns meters)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

// Generate deterministic lat/lng offsets based on hostel name if product has no coordinates
function getDeterministicCoords(hostelName, collegeName, baseLat, baseLng) {
  if (!hostelName) return { lat: baseLat, lng: baseLng };
  let hash = 0;
  const str = hostelName + (collegeName || '');
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Safe bounded offset (within ~500m of the base)
  const latOffset = ((hash & 0xFF) / 255 - 0.5) * 0.005;
  const lngOffset = (((hash >> 8) & 0xFF) / 255 - 0.5) * 0.005;
  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset
  };
}

export default function NearbyPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('All');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest', 'same-hostel', 'same-university', 'newest'
  const [maxDistance, setMaxDistance] = useState(1000); // in meters
  
  // Real Geolocation state
  const [userCoords, setUserCoords] = useState({
    lat: DEFAULT_CAMPUS_LAT,
    lng: DEFAULT_CAMPUS_LNG
  });
  const [gpsStatus, setGpsStatus] = useState('prompt'); // 'prompt', 'watching', 'denied', 'unsupported'
  const [gpsError, setGpsError] = useState(null);

  // Sync products list from backend
  const fetchProducts = async () => {
    try {
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching nearby products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Request GPS and track location
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unsupported');
      return;
    }

    setGpsStatus('prompt');
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsStatus('watching');
        setGpsError(null);
      },
      (error) => {
        console.warn("GPS watch error:", error);
        setGpsError(error.message);
        setGpsStatus('denied');
        // If denied, fallback coordinates from user's hostel or default
        if (user?.hostel) {
          const fallback = getDeterministicCoords(user.hostel, user.college, DEFAULT_CAMPUS_LAT, DEFAULT_CAMPUS_LNG);
          setUserCoords(fallback);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user]);

  // Request manual permission
  const requestGPSPermission = () => {
    if (!navigator.geolocation) return;
    setGpsStatus('prompt');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsStatus('watching');
        setGpsError(null);
      },
      (error) => {
        setGpsError(error.message);
        setGpsStatus('denied');
      }
    );
  };

  // Safe Hostel & College Extraction helper
  const getProductHostel = (item) => {
    return item.hostel || item.seller?.hostel || "Main Dorm";
  };

  const getProductCollege = (item) => {
    return item.seller?.college || "Global University";
  };

  // Discover hostels dynamically from loaded listings & current user
  const dynamicHostels = [...new Set([
    ...(user?.hostel ? [user.hostel] : []),
    ...products.map(getProductHostel).filter(Boolean)
  ])];

  // Discover colleges dynamically
  const dynamicColleges = [...new Set([
    ...(user?.college ? [user.college] : []),
    ...products.map(getProductCollege).filter(Boolean)
  ])];

  // Process and sort products based on distance and metadata
  const processedProducts = products
    .map(item => {
      let lat = DEFAULT_CAMPUS_LAT;
      let lng = DEFAULT_CAMPUS_LNG;
      const coords = item.location?.coordinates;

      if (coords && coords.length === 2 && (coords[0] !== 0 || coords[1] !== 0)) {
        lng = coords[0];
        lat = coords[1];
      } else {
        // Fallback to deterministic coordinates for beautiful representation
        const itemHostel = getProductHostel(item);
        const itemCollege = getProductCollege(item);
        const fallback = getDeterministicCoords(itemHostel, itemCollege, DEFAULT_CAMPUS_LAT, DEFAULT_CAMPUS_LNG);
        lat = fallback.lat;
        lng = fallback.lng;
      }

      const distance = calculateHaversineDistance(userCoords.lat, userCoords.lng, lat, lng);
      return { 
        ...item, 
        calculatedDistance: distance,
        lat,
        lng
      };
    })
    .filter(item => {
      // Search matches title / description
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Filter by dynamic hostel
      if (selectedHostel !== 'All') {
        const itemHostel = getProductHostel(item);
        if (itemHostel.toLowerCase() !== selectedHostel.toLowerCase()) return false;
      }

      // Filter by dynamic college
      if (selectedCollege !== 'All') {
        const itemCollege = getProductCollege(item);
        if (itemCollege.toLowerCase() !== selectedCollege.toLowerCase()) return false;
      }

      // Filter by walking radius
      return item.calculatedDistance <= maxDistance;
    })
    .sort((a, b) => {
      if (sortBy === 'nearest') {
        return a.calculatedDistance - b.calculatedDistance;
      }
      if (sortBy === 'same-hostel') {
        const aSame = user?.hostel && getProductHostel(a).toLowerCase() === user.hostel.toLowerCase() ? 1 : 0;
        const bSame = user?.hostel && getProductHostel(b).toLowerCase() === user.hostel.toLowerCase() ? 1 : 0;
        if (aSame !== bSame) return bSame - aSame;
        return a.calculatedDistance - b.calculatedDistance;
      }
      if (sortBy === 'same-university') {
        const aSame = user?.college && getProductCollege(a).toLowerCase() === user.college.toLowerCase() ? 1 : 0;
        const bSame = user?.college && getProductCollege(b).toLowerCase() === user.college.toLowerCase() ? 1 : 0;
        if (aSame !== bSame) return bSame - aSame;
        return a.calculatedDistance - b.calculatedDistance;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  // Calculate formatted walk time estimate
  const formatWalkTime = (meters) => {
    if (meters < 50) return "Less than 1 min walk";
    // Avg walking speed ~ 80 meters per minute
    const mins = Math.max(1, Math.round(meters / 80));
    return `${mins} min walk`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative pb-10">
      
      {/* Header bar consistent with Dashboard */}
      <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="p-2 bg-muted hover:bg-secondary border border-border rounded-xl transition cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-foreground">
              <Compass className="w-5.5 h-5.5 text-primary animate-spin-slow" />
              Smart Nearby Listings
            </h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
              Live GPS Geolocation Discovery Feed
            </p>
          </div>
        </div>

        {/* GPS Live Tracking Badge */}
        <div className="flex items-center gap-2">
          {gpsStatus === 'watching' ? (
            <span className="flex items-center gap-2 text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/30 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              GPS ACTIVE: {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}
            </span>
          ) : gpsStatus === 'denied' ? (
            <button
              onClick={requestGPSPermission}
              className="flex items-center gap-1.5 text-xs font-black bg-amber-100 text-amber-700 px-3.5 py-1.5 rounded-xl border border-amber-200 hover:bg-amber-200 transition cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 animate-pulse" />
              GPS DENIED: Enable Location
            </button>
          ) : (
            <span className="flex items-center gap-2 text-xs font-black bg-muted text-muted-foreground px-3.5 py-1.5 rounded-xl border border-border">
              GPS STATUS: PENDING
            </span>
          )}
        </div>
      </header>

      {/* Main Grid content */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Left Side: GPS controls & Dynamic filters */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden">
            <div>
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Live GPS Radar
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider mt-1">
                Real-world distance tracking
              </p>
            </div>

            {/* GPS HUD Info */}
            <div className="p-4 bg-muted/50 border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground">Coordinates:</span>
                <span className="font-mono text-foreground font-semibold">{userCoords.lat.toFixed(5)}°N, {userCoords.lng.toFixed(5)}°E</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground">Your Hostel:</span>
                <span className="font-semibold text-primary">{user?.hostel || 'Not Configured'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground">University:</span>
                <span className="font-semibold text-foreground truncate max-w-36">{user?.college || 'Not Configured'}</span>
              </div>
            </div>

            {/* Radius Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground">Search Radius:</span>
                <span className="text-primary font-black">{maxDistance >= 1000 ? `${(maxDistance/1000).toFixed(1)} km` : `${maxDistance} meters`}</span>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground font-bold">
                <span>50m (Immediate Block)</span>
                <span>5km (Full Campus)</span>
              </div>
            </div>

            {/* Filter by Hostel */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Filter by Hostel:</label>
              <select
                value={selectedHostel}
                onChange={(e) => setSelectedHostel(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
              >
                <option value="All">All Hostels ({dynamicHostels.length})</option>
                {dynamicHostels.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Filter by University */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Filter by University:</label>
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
              >
                <option value="All">All Universities ({dynamicColleges.length})</option>
                {dynamicColleges.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

          </div>

        </div>

        {/* Right Side: Proximity Listings Feed */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Action Row Search & Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search nearby campus items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none text-xs font-semibold text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Sorting Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-black uppercase flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort:
              </span>
              <div className="flex bg-muted p-0.5 rounded-xl border border-border">
                {[
                  { id: 'nearest', label: 'Nearest' },
                  { id: 'same-hostel', label: 'Hostel' },
                  { id: 'same-university', label: 'University' },
                  { id: 'newest', label: 'Newest' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      sortBy === opt.id
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Directory Listings container */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4 bg-card border border-border rounded-2xl">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Syncing nearby coordinates...</span>
            </div>
          ) : processedProducts.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-2xl p-8 max-w-md mx-auto flex flex-col items-center shadow-sm">
              <div className="p-4 bg-muted text-muted-foreground rounded-2xl mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-base text-foreground">No nearby listings found</h4>
              <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed">
                Expand your campus distance or adjust filters to discover more items around you.
              </p>
              <button
                onClick={() => {
                  setMaxDistance(3000);
                  setSelectedHostel('All');
                  setSelectedCollege('All');
                }}
                className="mt-5 px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
              >
                Expand Radius to 3km
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AnimatePresence>
                {processedProducts.map((item) => {
                  const itemHostel = getProductHostel(item);
                  const itemCollege = getProductCollege(item);
                  const isSameHostel = user?.hostel && itemHostel.toLowerCase() === user.hostel.toLowerCase();
                  const isSameCollege = user?.college && itemCollege.toLowerCase() === user.college.toLowerCase();
                  
                  const displayPrice = item.isAuction 
                    ? (item.bids?.length > 0 ? Math.max(...item.bids.map(b => b.amount)) : item.startingBid)
                    : (item.isRental ? item.rentPrice : item.price);

                  return (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -3 }}
                      className="bg-card border border-border p-5 rounded-2xl hover:border-primary/40 hover:shadow-md transition duration-300 flex flex-col justify-between gap-4 relative overflow-hidden group shadow-sm"
                    >
                      {/* Top Badges */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                        {isSameHostel && (
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-200">
                            Same Hostel
                          </span>
                        )}
                        {item.isAuction && (
                          <span className="bg-pink-100 text-pink-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-pink-200">
                            Live Auction
                          </span>
                        )}
                        {item.isRental && (
                          <span className="bg-blue-100 text-blue-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-blue-200">
                            Rent
                          </span>
                        )}
                      </div>

                      {/* Info structure */}
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0">
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1580216223006-25f0adfa18e1?q=80&w=300'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1580216223006-25f0adfa18e1?q=80&w=300';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <h3 className="font-extrabold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.description || 'No description provided.'}
                          </p>
                          
                          <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold mt-1.5 flex-wrap">
                            <span className="flex items-center gap-0.5 bg-muted px-1.5 py-0.5 rounded-md text-[9px]">
                              🏠 {itemHostel}
                            </span>
                            <span className="flex items-center gap-0.5 bg-muted px-1.5 py-0.5 rounded-md text-[9px] truncate max-w-32">
                              🎓 {itemCollege}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Geolocation info row */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/60">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-muted-foreground uppercase font-black tracking-wider">Estimated Distance</span>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-foreground">
                              {item.calculatedDistance >= 1000 
                                ? `${(item.calculatedDistance/1000).toFixed(2)} km` 
                                : `${Math.round(item.calculatedDistance)}m away`}
                            </span>
                            <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                              🚶‍♂️ {formatWalkTime(item.calculatedDistance)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[8px] text-muted-foreground uppercase font-black tracking-wider block">
                            {item.isAuction ? 'Starting Bid' : (item.isRental ? 'Rent' : 'Price')}
                          </span>
                          <span className="text-base font-black text-primary">
                            ₹{displayPrice}{item.isRental && `/${item.rentalDuration}`}
                          </span>
                        </div>
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex gap-2">
                        <Link
                          to={`/product/${item._id}`}
                          className="flex-1 py-2 bg-muted hover:bg-secondary border border-border text-foreground text-[10px] font-black uppercase tracking-wider rounded-xl text-center transition cursor-pointer"
                        >
                          View Details
                        </Link>
                        
                        <Link
                          to={`/product/${item._id}`}
                          className="px-3 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl flex items-center justify-center transition cursor-pointer shadow-md shadow-primary/15"
                        >
                          <Compass className="w-4 h-4" />
                        </Link>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
