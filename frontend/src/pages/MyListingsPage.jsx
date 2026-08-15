import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, ChevronLeft, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ui/Navbar';
import { BACKEND_URL } from '../config';

export default function MyListingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/my/listings`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching my listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing? This cannot be undone.')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (response.ok) {
          setProducts(products.filter(p => p._id !== id));
        } else {
          alert('Failed to delete product.');
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </Link>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <Link to="/sell" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:opacity-90 transition">
            <Plus className="w-5 h-5" /> Post New Ad
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading your listings...</div>
        ) : products.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2">You haven't listed anything yet!</h2>
            <p className="text-muted-foreground mb-6">Declutter your room and make some extra cash.</p>
            <Link to="/sell" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition">
              Start Selling
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map(product => (
                  <tr key={product._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.images[0]} alt={product.title} className="w-10 h-10 rounded-lg object-cover bg-muted flex-shrink-0" />
                        <div>
                          <p className="font-bold text-foreground line-clamp-1">{product.title}</p>
                          <p className="text-[10px] text-muted-foreground">{product.category} · {product.condition}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">₹{product.price}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        product.status === 'sold'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {product.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                        <Eye className="w-3.5 h-3.5" />
                        {product.views || 0}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/edit-item/${product._id}`)}
                          className="p-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

