import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronLeft, SlidersHorizontal, X } from 'lucide-react';

// Categories with emojis for the animated placeholder
const CATEGORY_SUGGESTIONS = [
  'Search for Electronics 💻',
  'Search for Books 📚',
  'Search for Cycle 🚲',
  'Search for Mattress 🛏',
  'Search for Gaming 🎮',
  'Search for Kitchen items 🍳',
  'Search for Fashion 👗',
  'Search for Notes 📝',
  'Search for Accessories 🎒',
];

function useAnimatedPlaceholder(suggestions, interval = 2500) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = suggestions[index];
    let timeout;

    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 55);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), interval);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const animatedPlaceholder = useAnimatedPlaceholder(CATEGORY_SUGGESTIONS);
  const inputRef = useRef(null);

  const categories = ['All', 'Electronics', 'Books', 'Cycle', 'Mattress', 'Gaming', 'Kitchen', 'Fashion', 'Notes', 'Accessories', 'Others'];

  const fetchProducts = async (cat = activeCategory, kw = keyword) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (kw) queryParams.append('keyword', kw);
      if (cat && cat !== 'All') queryParams.append('category', cat);

      const response = await fetch(`http://localhost:5000/api/products?${queryParams}`);
      let data = await response.json();

      // Client-side nearby sorting using saved geolocation
      const lat = parseFloat(localStorage.getItem('userLat'));
      const lng = parseFloat(localStorage.getItem('userLng'));

      if (nearbyOnly && lat && lng) {
        data = data
          .filter(p => p.location?.coordinates?.length === 2)
          .map(p => {
            const [pLng, pLat] = p.location.coordinates;
            const dist = Math.sqrt(Math.pow(pLat - lat, 2) + Math.pow(pLng - lng, 2));
            return { ...p, _dist: dist };
          })
          .sort((a, b) => a._dist - b._dist);
      }

      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(activeCategory, keyword);
    // eslint-disable-next-line
  }, [activeCategory, nearbyOnly]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(activeCategory, keyword);
  };

  const clearSearch = () => {
    setKeyword('');
    fetchProducts(activeCategory, '');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-muted transition cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-extrabold text-primary tracking-tight">Browse Products</h1>
            </div>
            <button
              onClick={() => setNearbyOnly(!nearbyOnly)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition cursor-pointer ${nearbyOnly ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
            >
              <MapPin className="w-4 h-4" />
              Nearby
            </button>
          </div>

          {/* Search Row */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={animatedPlaceholder || ' '}
                className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground/60 transition"
              />
              {keyword && (
                <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Categories Bar */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition cursor-pointer ${
                activeCategory === c
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-card-foreground border-border hover:border-primary hover:text-primary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-card border border-border rounded-2xl h-80" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-semibold">No products found</p>
            <p className="text-muted-foreground mt-2">Try a different keyword or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {products.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link to={`/product/${product._id}`}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="aspect-square w-full relative overflow-hidden bg-muted">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold capitalize">
                          {product.condition}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-base line-clamp-1">{product.title}</h3>
                        <p className="text-primary font-bold text-lg mt-1">₹{product.price}</p>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mt-2">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="line-clamp-1">{product.hostel}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
