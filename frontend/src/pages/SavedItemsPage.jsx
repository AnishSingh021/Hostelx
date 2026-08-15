import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ui/Navbar';
import { BACKEND_URL } from '../config';

export default function SavedItemsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/saved`, {
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
      await fetch(`${BACKEND_URL}/api/products/${productId}/like`, {
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
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Hostel</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link to={`/product/${product._id}`}>
                          <img src={product.images[0]} alt={product.title} className="w-10 h-10 rounded-lg object-cover bg-muted flex-shrink-0" />
                        </Link>
                        <div>
                          <Link to={`/product/${product._id}`} className="font-bold text-foreground line-clamp-1 hover:text-primary transition">{product.title}</Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">₹{product.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        {product.hostel}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground">
                        {product.condition}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleUnlike(product._id)}
                        className="p-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition cursor-pointer flex items-center gap-1"
                        title="Remove from saved"
                      >
                        <Heart className="w-4 h-4 fill-destructive" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

