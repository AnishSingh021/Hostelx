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
  Sparkles, 
  Navigation,
  ArrowUpDown,
  Clock,
  Heart
} from 'lucide-react';

// Hardcoded campus hostel coordinates (mocked relative to a BITS campus center)
const HOSTEL_LOCATIONS = {
  "Tagore Bhavan": { lat: 28.3651, lng: 75.5875, color: "#ec4899", desc: "North Block" },
  "Gargi Hall": { lat: 28.3630, lng: 75.5855, color: "#3b82f6", desc: "West Girls Block" },
  "Sarojini House": { lat: 28.3622, lng: 75.5862, color: "#8b5cf6", desc: "Central Girls Block" },
  "Nehru Hall": { lat: 28.3662, lng: 75.5888, color: "#10b981", desc: "Northeast Boys Block" },
  "Budh Bhavan": { lat: 28.3615, lng: 75.5895, color: "#f59e0b", desc: "Southeast Boys Block" },
  "Meera Hall": { lat: 28.3635, lng: 75.5840, color: "#ec4899", desc: "Northwest Girls Block" },
  "Krishna Bhavan": { lat: 28.3658, lng: 75.5868, color: "#06b6d4", desc: "Central Boys Block" },
  "Vyasa Hostel": { lat: 28.3670, lng: 75.5898, color: "#f43f5e", desc: "Far North Boys Block" },
  "Ramanujan Hostel": { lat: 28.3645, lng: 75.5890, color: "#14b8a6", desc: "East Boys Block" }
};

// Standard campus coordinates default fallback (e.g. BITS Central Library / Clock Tower)
const DEFAULT_CAMPUS_LAT = 28.3639;
const DEFAULT_CAMPUS_LNG = 75.5870;

export default function NearbyPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('All');
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest', 'newest', 'cheapest'
  const [maxDistance, setMaxDistance] = useState(600); // meters
  
  // Coordinate simulator coordinates state
  const [userCoords, setUserCoords] = useState({
    lat: parseFloat(localStorage.getItem('userLat')) || DEFAULT_CAMPUS_LAT,
    lng: parseFloat(localStorage.getItem('userLng')) || DEFAULT_CAMPUS_LNG
  });
  const [activeGPS, setActiveGPS] = useState(!!localStorage.getItem('userLat'));
  const [hoveredHostelOnMap, setHoveredHostelOnMap] = useState(null);

  // Sync products list
  const fetchProducts = async () => {
    try {
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/products');
      if (response.ok) {
        const data = await response.json();
        // Remove auctions from here if they shouldn't show, but usually standard products show up. 
        // We will include active listings and map them.
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

  // Update coordinate storage when manually changed or simulated
  const simulateLocation = (hostelName) => {
    if (HOSTEL_LOCATIONS[hostelName]) {
      const { lat, lng } = HOSTEL_LOCATIONS[hostelName];
      localStorage.setItem('userLat', lat.toString());
      localStorage.setItem('userLng', lng.toString());
      setUserCoords({ lat, lng });
      setActiveGPS(true);
    } else {
      localStorage.setItem('userLat', DEFAULT_CAMPUS_LAT.toString());
      localStorage.setItem('userLng', DEFAULT_CAMPUS_LNG.toString());
      setUserCoords({ lat: DEFAULT_CAMPUS_LAT, lng: DEFAULT_CAMPUS_LNG });
      setActiveGPS(true);
    }
  };

  const clearLocationSimulation = () => {
    localStorage.removeItem('userLat');
    localStorage.removeItem('userLng');
    setUserCoords({ lat: DEFAULT_CAMPUS_LAT, lng: DEFAULT_CAMPUS_LNG });
    setActiveGPS(false);
  };

  // Helper Euclidean Distance Calculator (Meters)
  const calculateDistance = (productCoords, userC) => {
    if (!productCoords || productCoords.length !== 2) {
      // Fallback: assign a pseudo-random coordinate based on the hostel to make it visually real
      return 150; 
    }
    const [pLng, pLat] = productCoords;
    // Standard rough conversion: 1 degree latitude ~ 111,000 meters
    const dist = Math.sqrt(Math.pow(pLat - userC.lat, 2) + Math.pow(pLng - userC.lng, 2)) * 111000;
    return Math.round(dist);
  };

  // Safe Hostel Assignment
  const getProductHostel = (item) => {
    return item.hostel || item.seller?.hostel || "Tagore Bhavan";
  };

  // Get item counts per hostel for Map Visualization
  const getHostelItemCount = (hostelName) => {
    return products.filter(p => getProductHostel(p).toLowerCase() === hostelName.toLowerCase()).length;
  };

  // Get distance descriptions dynamically
  const getDistanceBadge = (dist, itemHostel) => {
    const isSameHostel = user?.hostel && itemHostel?.toLowerCase() === user.hostel.toLowerCase();
    
    if (isSameHostel) {
      return (
        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-lg border border-emerald-500/20 flex items-center gap-1 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          Same Hostel 🏠
        </span>
      );
    }
    if (dist < 100) {
      return (
        <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-black px-2 py-0.5 rounded-lg border border-cyan-500/20 flex items-center gap-0.5">
          <MapPin className="w-3 h-3 text-cyan-400" />
          &lt; 1 min away (Immediate) 🚶‍♂️
        </span>
      );
    } else if (dist < 300) {
      return (
        <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-lg border border-blue-500/20 flex items-center gap-0.5">
          <MapPin className="w-3 h-3 text-blue-400" />
          3 mins away (Same Zone) 🚶‍♂️
        </span>
      );
    } else if (dist < 500) {
      return (
        <span className="bg-amber-500/10 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-lg border border-amber-500/20 flex items-center gap-0.5">
          <MapPin className="w-3 h-3 text-amber-400" />
          5 mins away (Outer Block) 🚶‍♂️
        </span>
      );
    } else {
      return (
        <span className="bg-zinc-800 text-zinc-400 text-[10px] font-black px-2 py-0.5 rounded-lg border border-zinc-700/50 flex items-center gap-0.5">
          <MapPin className="w-3 h-3 text-zinc-500" />
          {Math.round(dist)}m away 🚶‍♂️
        </span>
      );
    }
  };

  // Filter & Sort core logic
  const processedProducts = products
    .map(item => {
      // Calculate distance relative to current active userCoords
      let coords = item.location?.coordinates;
      if (!coords || coords.length !== 2) {
        // If product coordinates are missing, fetch its hostel's default coordinate
        const itemHostel = getProductHostel(item);
        const match = Object.keys(HOSTEL_LOCATIONS).find(k => k.toLowerCase() === itemHostel.toLowerCase());
        if (match) {
          coords = [HOSTEL_LOCATIONS[match].lng, HOSTEL_LOCATIONS[match].lat];
        } else {
          coords = [DEFAULT_CAMPUS_LNG, DEFAULT_CAMPUS_LAT];
        }
      }
      const distance = calculateDistance(coords, userCoords);
      return { ...item, calculatedDistance: distance, mappedCoords: coords };
    })
    .filter(item => {
      // Search matching
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Hostel selection
      if (selectedHostel !== 'All') {
        const itemHostel = getProductHostel(item);
        if (itemHostel.toLowerCase() !== selectedHostel.toLowerCase()) return false;
      }

      // Distance limit
      return item.calculatedDistance <= maxDistance;
    })
    .sort((a, b) => {
      if (sortBy === 'nearest') {
        return a.calculatedDistance - b.calculatedDistance;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'cheapest') {
        const aPrice = a.isAuction ? (a.bids?.length > 0 ? Math.max(...a.bids.map(b => b.amount)) : a.startingBid) : a.price;
        const bPrice = b.isAuction ? (b.bids?.length > 0 ? Math.max(...b.bids.map(b => b.amount)) : b.startingBid) : b.price;
        return aPrice - bPrice;
      }
      return 0;
    });

  // Calculate coordinates mapping into SVG Canvas view box (e.g. 500x500)
  // Bounding box of coordinates:
  const latMin = 28.3610;
  const latMax = 28.3675;
  const lngMin = 75.5835;
  const lngMax = 75.5905;

  const getCanvasCoords = (lat, lng) => {
    // Map lat to Y (inverted since Y=0 is top in SVG)
    const y = 400 - ((lat - latMin) / (latMax - latMin)) * 300;
    // Map lng to X
    const x = 50 + ((lng - lngMin) / (lngMax - lngMin)) * 400;
    return { x, y };
  };

  const userSvgPos = getCanvasCoords(userCoords.lat, userCoords.lng);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col relative pb-10">
      {/* Background Radial Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header bar */}
      <header className="max-w-7xl w-full mx-auto px-4 py-6 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="p-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition cursor-pointer text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Compass className="w-5.5 h-5.5 text-blue-400 animate-spin-slow" />
              Smart Nearby Radar
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
              Instantly find and sort campus deals by walking distance
            </p>
          </div>
        </div>

        {/* Global Live Location Sync Badge */}
        <div className="flex items-center gap-2">
          {activeGPS ? (
            <span className="flex items-center gap-2 text-xs font-black bg-emerald-500/10 text-emerald-400 px-3.5 py-1.5 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              GPS MATCH: {user?.hostel || 'Simulated'}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-xs font-black bg-zinc-900 text-zinc-500 px-3.5 py-1.5 rounded-2xl border border-zinc-800">
              GPS OFFLINE (DEFAULT)
            </span>
          )}
        </div>
      </header>

      {/* Main Grid content */}
      <main className="max-w-7xl w-full mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Left Side: Campus Interactive Vector Map HUD */}
        <div className="w-full lg:w-96 flex-shrink-0 space-y-6">
          
          <div className="bg-[#0b0e16] border border-zinc-900 rounded-[2rem] p-6 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Glowing top line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500"></div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-zinc-200">Campus Vector Radar</h3>
                <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Hover node to inspect stock</span>
              </div>
              
              {activeGPS && (
                <button
                  onClick={clearLocationSimulation}
                  className="text-[9px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg hover:bg-rose-500/20 transition cursor-pointer"
                >
                  Reset GPS
                </button>
              )}
            </div>

            {/* SVG Visual Vector Canvas Map */}
            <div className="relative aspect-square w-full rounded-2xl border border-zinc-900 bg-[#04060b] overflow-hidden select-none">
              {/* Polar circular coordinates grids for radar look */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[85%] h-[85%] rounded-full border border-zinc-900/50 border-dashed" />
                <div className="w-[60%] h-[60%] rounded-full border border-zinc-900/40 border-dashed" />
                <div className="w-[35%] h-[35%] rounded-full border border-zinc-900/30 border-dashed" />
                
                {/* Diagonal radar crosshairs */}
                <div className="absolute w-[95%] h-[1px] bg-zinc-900/20" />
                <div className="absolute h-[95%] w-[1px] bg-zinc-900/20" />
              </div>

              {/* Glowing radar sweeping line */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/2 to-transparent origin-center animate-spin-slow pointer-events-none" style={{ animationDuration: '8s' }} />

              {/* Main SVG Graphic */}
              <svg className="w-full h-full relative" viewBox="0 0 500 400">
                {/* Connection pathways */}
                <path 
                  d="M 100 150 L 220 220 M 220 220 L 320 250 M 320 250 L 400 120 M 220 220 L 250 80 M 250 80 L 100 150" 
                  stroke="#1e293b" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4" 
                  fill="none" 
                />

                {/* Hostels pins nodes */}
                {Object.entries(HOSTEL_LOCATIONS).map(([name, loc]) => {
                  const { x, y } = getCanvasCoords(loc.lat, loc.lng);
                  const itemCount = getHostelItemCount(name);
                  const isHovered = hoveredHostelOnMap === name;
                  const isActiveFilter = selectedHostel.toLowerCase() === name.toLowerCase();

                  return (
                    <g 
                      key={name}
                      className="cursor-pointer"
                      onClick={() => setSelectedHostel(isActiveFilter ? 'All' : name)}
                      onMouseEnter={() => setHoveredHostelOnMap(name)}
                      onMouseLeave={() => setHoveredHostelOnMap(null)}
                    >
                      {/* Pulse glows for active or stocked hostels */}
                      {(isHovered || isActiveFilter || itemCount > 0) && (
                        <circle 
                          cx={x} 
                          cy={y} 
                          r={isActiveFilter ? 20 : 14} 
                          fill="none" 
                          stroke={loc.color} 
                          strokeWidth="1.5" 
                          className="animate-ping opacity-25" 
                        />
                      )}

                      {/* Main node point */}
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={isActiveFilter ? 8 : 5.5} 
                        fill={isActiveFilter ? loc.color : (itemCount > 0 ? loc.color : "#3f3f46")} 
                        className="transition-all duration-300"
                      />

                      {/* Text label with stock count */}
                      <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        fill={isActiveFilter || isHovered ? "#ffffff" : "#71717a"}
                        fontSize="8.5"
                        fontWeight="black"
                        className="pointer-events-none select-none tracking-tight"
                      >
                        {name.split(" ")[0]} {itemCount > 0 && `(${itemCount})`}
                      </text>
                    </g>
                  );
                })}

                {/* User Current Position Simulator Marker */}
                <g>
                  {/* Outer pulse */}
                  <circle 
                    cx={userSvgPos.x} 
                    cy={userSvgPos.y} 
                    r="18" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="1.5" 
                    className="animate-pulse opacity-40" 
                  />
                  {/* Direction Arrow */}
                  <polygon 
                    points={`${userSvgPos.x},${userSvgPos.y - 6} ${userSvgPos.x - 5},${userSvgPos.y + 5} ${userSvgPos.x},${userSvgPos.y + 2} ${userSvgPos.x + 5},${userSvgPos.y + 5}`}
                    fill="#10b981"
                    stroke="#07090e"
                    strokeWidth="1"
                  />
                </g>
              </svg>

              {/* Float popover details when hovering hostel nodes */}
              {hoveredHostelOnMap && (
                <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/95 border border-zinc-900 rounded-xl p-3 backdrop-blur-md flex items-center justify-between">
                  <div>
                    <h4 className="text-[11px] font-black text-white">{hoveredHostelOnMap}</h4>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase">{HOSTEL_LOCATIONS[hoveredHostelOnMap].desc}</p>
                  </div>
                  <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                    {getHostelItemCount(hoveredHostelOnMap)} units listed
                  </span>
                </div>
              )}
            </div>

            {/* GPS Geolocation Simulator Panel */}
            <div className="space-y-3 bg-zinc-950/60 border border-zinc-900 p-4.5 rounded-2xl">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                <Navigation className="w-3.5 h-3.5 text-zinc-600 animate-pulse" />
                <span>Simulate GPS Position</span>
              </div>
              <p className="text-[10px] text-zinc-600 font-semibold leading-relaxed">
                Click any local hostel to teleport your device coordinate simulator and recalculate walking steps.
              </p>

              <div className="grid grid-cols-2 gap-1.5">
                {Object.keys(HOSTEL_LOCATIONS).map((name) => (
                  <button
                    key={name}
                    onClick={() => simulateLocation(name)}
                    className={`text-[9px] font-bold text-left px-2.5 py-2 rounded-lg border transition truncate cursor-pointer ${
                      user?.hostel?.toLowerCase() === name.toLowerCase() || 
                      (activeGPS && Math.abs(userCoords.lat - HOSTEL_LOCATIONS[name].lat) < 0.0001)
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                    }`}
                  >
                    🏠 {name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Proximity listings directory */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Action Row Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b0e16] border border-zinc-900 p-5 rounded-[2rem] shadow-xl">
            
            {/* Left side filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Hostel Select Dropdown */}
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-1.5">
                <span className="text-[9px] text-zinc-500 font-black uppercase">Hostel:</span>
                <select
                  value={selectedHostel}
                  onChange={(e) => setSelectedHostel(e.target.value)}
                  className="bg-transparent text-xs font-black text-zinc-300 outline-none cursor-pointer"
                >
                  <option value="All" className="bg-[#07090e]">All Hostels</option>
                  {Object.keys(HOSTEL_LOCATIONS).map(h => (
                    <option key={h} value={h} className="bg-[#07090e]">{h}</option>
                  ))}
                </select>
              </div>

              {/* Distance Slider Slider */}
              <div className="flex items-center gap-2.5 bg-zinc-950 border border-zinc-900 rounded-xl px-3.5 py-1.5 min-w-44">
                <span className="text-[9px] text-zinc-500 font-black uppercase flex-shrink-0">Radius:</span>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1 rounded-lg bg-zinc-800 cursor-pointer"
                />
                <span className="text-xs font-black text-blue-400 flex-shrink-0">{maxDistance}m</span>
              </div>
            </div>

            {/* Right side search and sort options */}
            <div className="flex items-center gap-3">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search distance..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-900 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-xs font-semibold text-zinc-300 w-44"
                />
              </div>

              {/* Sorting buttons */}
              <div className="flex items-center bg-zinc-950 border border-zinc-900 rounded-xl p-0.5">
                {[
                  { id: 'nearest', label: 'Nearest' },
                  { id: 'newest', label: 'Newest' },
                  { id: 'cheapest', label: 'Cheapest' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      sortBy === opt.id
                        ? 'bg-blue-500 text-white font-black shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
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
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Loading campus products layout...</span>
            </div>
          ) : processedProducts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/10 border border-zinc-900 rounded-[2rem] p-8 max-w-md mx-auto flex flex-col items-center">
              <Compass className="w-12 h-12 text-zinc-700 mb-4 animate-bounce" />
              <h4 className="font-extrabold text-sm text-zinc-300">No goods within distance</h4>
              <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed">
                Try widening your GPS radius selector, toggling off the hostel filter, or searching different terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processedProducts.map((item) => {
                const itemHostel = getProductHostel(item);
                const itemPrice = item.isAuction 
                  ? (item.bids?.length > 0 ? Math.max(...item.bids.map(b => b.amount)) : item.startingBid)
                  : item.price;
                const isSellerOnline = Math.random() > 0.4; // simulated online state

                return (
                  <motion.div
                    key={item._id}
                    layout
                    whileHover={{ y: -4 }}
                    className="bg-zinc-900/30 border border-zinc-900/80 p-5 rounded-[2rem] hover:border-zinc-800 transition duration-300 flex flex-col justify-between gap-4 relative overflow-hidden group"
                  >
                    {/* Pulsing radar dot inside card */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      {isSellerOnline && (
                        <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                          Seller Online
                        </span>
                      )}
                      
                      {item.isAuction && (
                        <span className="bg-pink-500/10 text-pink-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-pink-500/20">
                          Auction
                        </span>
                      )}
                    </div>

                    {/* Main Image and metadata */}
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950 flex-shrink-0 group-hover:scale-102 transition">
                        <img
                          src={item.images?.[0] || 'https://via.placeholder.com/150'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="font-extrabold text-xs sm:text-sm text-zinc-200 truncate group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
                          {item.description || 'No description provided.'}
                        </p>
                        
                        <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold uppercase mt-1">
                          📍 {itemHostel} · Room {item.seller?.room || 'Dorm'}
                        </div>
                      </div>
                    </div>

                    {/* Proximity / Distance info row */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-900/60">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-black">Calculated Radius</span>
                        <div className="mt-1 flex items-center gap-1.5">
                          {getDistanceBadge(item.calculatedDistance, itemHostel)}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[8px] text-zinc-500 uppercase font-black block">
                          {item.isAuction ? 'High Bid' : 'Price'}
                        </span>
                        <span className="text-sm font-black text-zinc-100">
                          ₹{itemPrice}
                        </span>
                      </div>
                    </div>

                    {/* Call to actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/product/${item._id}`}
                        className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[10px] font-black uppercase tracking-wider rounded-xl text-center transition cursor-pointer"
                      >
                        Inspect Listing
                      </Link>
                      
                      <Link
                        to={`/product/${item._id}`}
                        className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition cursor-pointer shadow-md shadow-blue-500/10"
                      >
                        <Compass className="w-4 h-4" />
                      </Link>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
