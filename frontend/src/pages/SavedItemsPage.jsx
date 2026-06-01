import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ui/Navbar';

export default function SavedItemsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await fetch('https://hostelx-backend-a228.onrender.com/api/products/saved', {
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
      await fetch(`https://hostelx-backend-a228.onrender.com/api/products/${productId}/like`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" /> Saved Items
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-card border border-border rounded-2xl h-72" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center flex flex-col items-center max-w-2xl mx-auto py-16">
            <Heart className="w-16 h-16 text-muted-foreground/30 mb-4 animate-pulse" />
            <h2 className="text-xl font-bold mb-2">No saved items yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
              Browse listings and add them to your wishlist by clicking the ❤️ icon. Discover incredible student deals!
            </p>
            <Link
              to="/marketplace"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 active:scale-[0.99] transition shadow-md hover:shadow-lg"
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
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm group flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <div className="relative h-52 bg-muted overflow-hidden">
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
      </div>
    </div>
  );
}
