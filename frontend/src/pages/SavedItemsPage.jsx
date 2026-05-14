import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SavedItemsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products/saved', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        setProducts(data);
      } catch (e) {
        console.error('Error fetching saved items:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [user.token]);

  const handleUnlike = async (productId) => {
    try {
      await fetch(`http://localhost:5000/api/products/${productId}/like`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4 flex items-center gap-3">
        <Link to="/dashboard" className="p-1.5 rounded-full hover:bg-muted transition cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Saved Items
        </h1>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-card border border-border rounded-2xl h-72" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center">
            <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No saved items yet</h2>
            <p className="text-muted-foreground mb-6">
              Tap the ❤️ on any product to save it here for later.
            </p>
            <Link
              to="/marketplace"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm group flex flex-col"
              >
                <div className="relative h-52 bg-muted">
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <button
                    onClick={() => handleUnlike(product._id)}
                    className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition cursor-pointer"
                    title="Remove from saved"
                  >
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-semibold text-base line-clamp-1 hover:text-primary transition">{product.title}</h3>
                  </Link>
                  <p className="text-primary font-bold text-lg mt-1">₹{product.price.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {product.hostel}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full capitalize">
                      {product.condition}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
