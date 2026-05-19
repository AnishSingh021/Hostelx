import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Users, ShoppingBag, MessageSquare, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('https://hostelx-backend.onrender.com/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDeleteProduct = async (id) => {
    if(window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`https://hostelx-backend.onrender.com/api/admin/product/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if(response.ok) {
          fetchStats(); // Refresh data
        }
      } catch (error) {
        console.error('Failed to delete product', error);
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading admin panel...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Users</p>
              <h2 className="text-3xl font-bold">{stats.counts.users}</h2>
            </div>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-secondary text-secondary-foreground rounded-xl">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Products</p>
              <h2 className="text-3xl font-bold">{stats.counts.products}</h2>
            </div>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-accent text-accent-foreground rounded-xl">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Active Chats</p>
              <h2 className="text-3xl font-bold">{stats.counts.chats}</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Products */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold text-xl mb-4">Recent Products</h3>
            <div className="space-y-4">
              {stats.recentProducts.map(p => (
                <div key={p._id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">By {p.seller?.name} • ₹{p.price}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteProduct(p._id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold text-xl mb-4">Recent Users</h3>
            <div className="space-y-4">
              {stats.recentUsers.map(u => (
                <div key={u._id} className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                  <img src={u.profileImage} alt="User" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email} • {u.hostel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
