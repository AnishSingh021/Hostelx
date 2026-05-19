import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, ChevronLeft, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MyListingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = async () => {
    try {
      const response = await fetch('https://hostelx-backend.onrender.com/api/products/my/listings', {
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
        const response = await fetch(`https://hostelx-backend.onrender.com/api/products/${id}`, {
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
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product._id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="h-48 w-full bg-muted relative">
                  <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  {/* Status Badge */}
                  <div className={`absolute top-2 left-2 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold capitalize ${
                    product.status === 'sold'
                      ? 'bg-destructive/90 text-white'
                      : 'bg-background/90 text-foreground'
                  }`}>
                    {product.status}
                  </div>
                  {/* Views Badge */}
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span>{product.views || 0} views</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg line-clamp-1 mb-1">{product.title}</h3>
                  <p className="text-primary font-bold text-xl mb-1">₹{product.price}</p>
                  <p className="text-xs text-muted-foreground mb-4">{product.category} · {product.condition}</p>
                  
                  <div className="mt-auto flex gap-3">
                    <button 
                      onClick={() => navigate(`/edit-item/${product._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-2 rounded-xl font-medium hover:opacity-80 transition cursor-pointer"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-destructive/10 text-destructive py-2 rounded-xl font-medium hover:bg-destructive/20 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
