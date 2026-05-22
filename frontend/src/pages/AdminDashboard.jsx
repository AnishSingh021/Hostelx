import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  Trash2, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  ShieldCheck,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hostelSortOrder, setHostelSortOrder] = useState('desc'); // desc or asc

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/admin/stats', {
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
        const response = await fetch(`https://hostelx-backend-a228.onrender.com/api/admin/product/${id}`, {
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

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-muted-foreground font-medium animate-pulse">Loading secure admin intelligence panel...</p>
    </div>
  );

  // Setup dynamic color palette for categories
  const chartColors = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
    '#f43f5e', // Rose
    '#14b8a6', // Teal
    '#3b82f6', // Blue
  ];

  // Process Category Distribution Data (with mock fallback if empty)
  const categoryList = stats?.categoryData && stats.categoryData.length > 0
    ? stats.categoryData.map(c => ({ name: c._id || 'Uncategorized', value: c.count }))
    : [
        { name: 'Room Essentials', value: 14 },
        { name: 'Books & Study', value: 9 },
        { name: 'Electronics', value: 7 },
        { name: 'Rentals', value: 4 },
        { name: 'Lost & Found', value: 3 },
        { name: 'Emergencies', value: 2 }
      ];

  const totalCategoryItems = categoryList.reduce((acc, curr) => acc + curr.value, 0);

  // Process Hostel Distribution Data (with mock fallback if empty)
  let hostelList = stats?.hostelData && stats.hostelData.length > 0
    ? stats.hostelData.map(h => ({ name: h._id || 'Unknown', value: h.count }))
    : [
        { name: 'Ramanujan Hostel', value: 16 },
        { name: 'Aryabhatta Hostel', value: 11 },
        { name: 'Kalam Hostel', value: 8 },
        { name: 'Bhabha Hostel', value: 5 },
        { name: 'Tagore Hostel', value: 3 }
      ];

  // Sort Hostel Data
  hostelList = [...hostelList].sort((a, b) => {
    return hostelSortOrder === 'desc' ? b.value - a.value : a.value - b.value;
  });

  const maxHostelCount = Math.max(...hostelList.map(h => h.value), 1);

  // Premium Features Stats
  const boostedCount = stats?.counts?.boosted || 0;
  const urgentCount = stats?.counts?.urgent || 0;
  const totalBids = stats?.counts?.bids || 0;
  const revenue = stats?.counts?.revenue || 0;

  // Percentage calculations
  const totalProducts = stats?.counts?.products || totalCategoryItems;
  const boostedPercentage = totalProducts > 0 ? Math.round((boostedCount / totalProducts) * 100) : 0;
  const urgentPercentage = totalProducts > 0 ? Math.round((urgentCount / totalProducts) * 100) : 0;

  // Donut SVG configuration
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  let accumulatedPercentage = 0;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header with Glassmorphic design */}
        <div className="relative overflow-hidden bg-card/40 border border-border backdrop-blur-md p-8 rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/5 rounded-full blur-[80px] -z-10"></div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-semibold tracking-wider text-primary bg-primary/10 rounded-full flex items-center gap-1 border border-primary/20">
                <ShieldCheck className="w-3.5 h-3.5" /> SECURE ROOT ACCESS
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Campus Intelligence Suite
            </h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
              Monitor real-time listings, analyze student distribution patterns, manage platform safety, and track premium boost conversions.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchStats}
              className="px-5 py-2.5 bg-secondary text-secondary-foreground text-sm font-semibold rounded-xl hover:bg-secondary/80 border border-border shadow-sm active:scale-95 transition"
            >
              Refresh Intel
            </button>
            <div className="h-10 w-px bg-border"></div>
            <div className="flex items-center gap-3">
              <img src={user.profileImage} alt="Admin" className="w-10 h-10 rounded-full border border-border object-cover" />
              <div className="hidden sm:block">
                <p className="text-xs text-muted-foreground">Admin Operator</p>
                <p className="text-sm font-bold truncate max-w-[120px]">{user.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 6-Card High-Fidelity Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Card 1: Users */}
          <div className="bg-card/50 border border-border backdrop-blur-sm p-5 rounded-2xl flex flex-col justify-between shadow-md hover:shadow-lg hover:border-primary/20 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] text-teal-500 font-semibold px-2 py-0.5 bg-teal-500/10 rounded-full">Active</span>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Total Users</p>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-1">{stats?.counts?.users}</h2>
            </div>
          </div>

          {/* Card 2: Products */}
          <div className="bg-card/50 border border-border backdrop-blur-sm p-5 rounded-2xl flex flex-col justify-between shadow-md hover:shadow-lg hover:border-primary/20 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl group-hover:scale-110 transition">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-[10px] text-indigo-500 font-semibold px-2 py-0.5 bg-indigo-500/10 rounded-full">Available</span>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Total Items</p>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-1">{stats?.counts?.products}</h2>
            </div>
          </div>

          {/* Card 3: Chats */}
          <div className="bg-card/50 border border-border backdrop-blur-sm p-5 rounded-2xl flex flex-col justify-between shadow-md hover:shadow-lg hover:border-primary/20 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl group-hover:scale-110 transition">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-[10px] text-pink-500 font-semibold px-2 py-0.5 bg-pink-500/10 rounded-full">Live</span>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Active Chats</p>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-1">{stats?.counts?.chats}</h2>
            </div>
          </div>

          {/* Card 4: Boosted */}
          <div className="bg-card/50 border border-border backdrop-blur-sm p-5 rounded-2xl flex flex-col justify-between shadow-md hover:shadow-lg hover:border-primary/20 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-[10px] text-amber-500 font-semibold px-2 py-0.5 bg-amber-500/10 rounded-full">Boosted</span>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Premium Boosts</p>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-1">{boostedCount}</h2>
            </div>
          </div>

          {/* Card 5: Bids Placed */}
          <div className="bg-card/50 border border-border backdrop-blur-sm p-5 rounded-2xl flex flex-col justify-between shadow-md hover:shadow-lg hover:border-primary/20 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[10px] text-blue-500 font-semibold px-2 py-0.5 bg-blue-500/10 rounded-full">Auctions</span>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Bids Placed</p>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-1">{totalBids}</h2>
            </div>
          </div>

          {/* Card 6: Platform Revenue with golden/emerald gradient glowing theme */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-card/50 to-primary/10 border-2 border-emerald-500/30 p-5 rounded-2xl flex flex-col justify-between shadow-lg shadow-emerald-500/5 group hover:shadow-emerald-500/10 hover:border-emerald-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -z-10 group-hover:scale-125 transition-all"></div>
            
            <div className="flex justify-between items-start">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-110 transition shadow-inner">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-[10px] text-emerald-400 font-bold px-2.5 py-0.5 bg-emerald-500/20 rounded-full border border-emerald-500/30 animate-pulse">REVENUE</span>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Simulated Earnings</p>
              <h2 className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">₹{revenue}</h2>
            </div>
          </div>
        </div>

        {/* Dynamic Visualization Suite Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart Section A: Category Distribution */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl">Category Distribution</h3>
                  <p className="text-xs text-muted-foreground">System-wide product category proportions</p>
                </div>
              </div>
              <span className="text-[10px] bg-secondary border border-border px-2.5 py-1 rounded-lg text-muted-foreground font-semibold">
                {totalCategoryItems} cataloged items
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4 flex-grow">
              {/* SVG Animated Donut Chart */}
              <div className="relative w-44 h-44 flex items-center justify-center select-none">
                <svg className="w-full h-full" viewBox="0 0 160 160">
                  {/* Empty base circle in case no data */}
                  {totalCategoryItems === 0 && (
                    <circle cx="80" cy="80" r="50" fill="transparent" stroke="#1f2937" strokeWidth="12" />
                  )}
                  
                  {categoryList.map((item, index) => {
                    const pct = totalCategoryItems > 0 ? (item.value / totalCategoryItems) * 100 : 0;
                    const strokeLength = (pct * circumference) / 100;
                    const strokeOffset = circumference - (accumulatedPercentage * circumference) / 100;
                    accumulatedPercentage += pct;

                    const isHovered = hoveredCategory?.name === item.name;

                    return (
                      <circle
                        key={item.name}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke={chartColors[index % chartColors.length]}
                        strokeWidth={isHovered ? "16" : "12"}
                        strokeDasharray={`${strokeLength} ${circumference}`}
                        strokeDashoffset={strokeOffset}
                        transform="rotate(-90 80 80)"
                        className="transition-all duration-300 cursor-pointer origin-center"
                        onMouseEnter={() => setHoveredCategory(item)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      />
                    );
                  })}
                </svg>

                {/* Text in the center of the donut chart */}
                <div className="absolute flex flex-col items-center justify-center text-center max-w-[100px] pointer-events-none">
                  {hoveredCategory ? (
                    <>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground truncate w-24">
                        {hoveredCategory.name}
                      </p>
                      <h4 className="text-2xl font-black text-foreground mt-0.5 leading-none">
                        {hoveredCategory.value}
                      </h4>
                      <p className="text-[10px] text-primary/80 font-bold mt-1.5 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/10">
                        {totalCategoryItems > 0 ? Math.round((hoveredCategory.value / totalCategoryItems) * 100) : 0}%
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        Total Catalog
                      </p>
                      <h4 className="text-3xl font-black text-foreground mt-1 leading-none">
                        {totalCategoryItems}
                      </h4>
                      <p className="text-[9px] text-muted-foreground font-semibold mt-1">
                        Active items
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Legend List */}
              <div className="flex-1 space-y-3 w-full max-w-[260px]">
                {categoryList.map((item, index) => {
                  const pct = totalCategoryItems > 0 ? Math.round((item.value / totalCategoryItems) * 100) : 0;
                  const color = chartColors[index % chartColors.length];
                  const isHovered = hoveredCategory?.name === item.name;

                  return (
                    <div 
                      key={item.name}
                      className={`flex items-center justify-between p-2 rounded-xl border border-transparent transition-all duration-200 ${
                        isHovered ? 'bg-secondary/40 border-border shadow-sm' : ''
                      }`}
                      onMouseEnter={() => setHoveredCategory(item)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                        <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">{item.value}</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-secondary text-primary rounded-md border border-border">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart Section B: Hostel Transaction Metrics */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl">Active Hostel Volume</h3>
                  <p className="text-xs text-muted-foreground">Product listing transactions sorted by residential hostels</p>
                </div>
              </div>

              <button
                onClick={() => setHostelSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="p-2 bg-secondary hover:bg-secondary/80 rounded-xl border border-border text-muted-foreground transition active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              >
                Volume: {hostelSortOrder === 'desc' ? 'Highest First' : 'Lowest First'}
              </button>
            </div>

            <div className="space-y-4 py-2 flex-grow justify-center flex flex-col">
              {hostelList.map((hostel, index) => {
                const percentage = maxHostelCount > 0 ? (hostel.value / maxHostelCount) * 100 : 0;
                
                return (
                  <div key={hostel.name} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-md bg-secondary border border-border flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                          {index + 1}
                        </span>
                        <span className="text-foreground truncate max-w-[200px]">{hostel.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-extrabold">{hostel.value} units</span>
                        <span className="text-[10px] text-muted-foreground">({Math.round((hostel.value / totalCategoryItems) * 100)}%)</span>
                      </div>
                    </div>

                    <div className="relative w-full h-3.5 bg-secondary/50 rounded-full overflow-hidden border border-border/30">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 shadow-sm relative group-hover:brightness-115 transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      >
                        {/* Glow tip */}
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/20 blur-[1px]"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feature Conversion & Monetization Funnel */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl">Platform Feature Conversion</h3>
              <p className="text-xs text-muted-foreground">Aggregated usage statistics of advanced functional pipelines</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Conversion 1: Boosted Rate */}
            <div className="bg-secondary/40 border border-border p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 text-[9px] font-bold text-primary bg-primary/10 rounded border border-primary/20">PREMIUM</span>
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Boosted listings</h4>
                <p className="text-xs text-muted-foreground mt-1"> Listings utilizing visibility credit assets.</p>
              </div>
              <div className="mt-5 space-y-2">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-primary">{boostedPercentage}%</span>
                  <span className="text-xs font-semibold text-muted-foreground">{boostedCount} / {totalProducts} items</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${boostedPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Conversion 2: Urgent Boost Rate */}
            <div className="bg-secondary/40 border border-border p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 text-[9px] font-bold text-amber-500 bg-amber-500/10 rounded border border-amber-500/20">BOOST</span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                </div>
                <h4 className="text-sm font-bold text-foreground">Urgent sales</h4>
                <p className="text-xs text-muted-foreground mt-1">Items labeled with high-urgency badges.</p>
              </div>
              <div className="mt-5 space-y-2">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-amber-500">{urgentPercentage}%</span>
                  <span className="text-xs font-semibold text-muted-foreground">{urgentCount} / {totalProducts} items</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${urgentPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Conversion 4: Bidding Engagement */}
            <div className="bg-secondary/40 border border-border p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/5 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 text-[9px] font-bold text-pink-500 bg-pink-500/10 rounded border border-pink-500/20">AUCTIONS</span>
                  <TrendingUp className="w-4 h-4 text-pink-500" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Auction Bids</h4>
                <p className="text-xs text-muted-foreground mt-1">Student bids placed on bidding listings.</p>
              </div>
              <div className="mt-5 space-y-2 flex flex-col justify-end flex-grow">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-pink-500">{totalBids}</span>
                  <span className="text-xs font-semibold text-muted-foreground">Total bids logged</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 font-semibold">
                  <span>High engagement rate detected</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Data Lists Section with premium layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Products with clean responsive design */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl">Recent Product Listings</h3>
                  <p className="text-xs text-muted-foreground">Review incoming student listings for compliance</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs bg-primary/10 text-primary rounded-full font-bold border border-primary/20">
                Latest 5
              </span>
            </div>

            <div className="divide-y divide-border/60">
              {stats.recentProducts && stats.recentProducts.length > 0 ? (
                stats.recentProducts.map(p => (
                  <div key={p._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {p.images && p.images[0] ? (
                        <img src={p.images[0]} alt={p.title} className="w-12 h-12 rounded-xl object-cover border border-border flex-shrink-0 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground border border-border">No Img</div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-foreground truncate max-w-[150px] group-hover:text-primary transition">{p.title}</p>
                          {p.isBoosted && <span className="px-1.5 py-0.5 text-[8px] font-extrabold text-amber-500 bg-amber-500/10 rounded border border-amber-500/20">BOOSTED</span>}
                          {p.isUrgent && <span className="px-1.5 py-0.5 text-[8px] font-extrabold text-red-500 bg-red-500/10 rounded border border-red-500/20">URGENT</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          Seller: <span className="font-medium text-foreground">{p.seller?.name || 'Unknown'}</span> ({p.hostel || 'No Hostel'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-extrabold text-foreground px-2 py-1 bg-secondary rounded-lg border border-border">₹{p.price}</span>
                      <button 
                        onClick={() => handleDeleteProduct(p._id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition duration-150 active:scale-90 border border-transparent hover:border-destructive/10"
                        title="Delete violation item"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">No recent products available.</div>
              )}
            </div>
          </div>

          {/* Recent Users with sleek list structure */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-500 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl">Recent Registrations</h3>
                  <p className="text-xs text-muted-foreground">List of incoming college student operators</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs bg-teal-500/10 text-teal-500 rounded-full font-bold border border-teal-500/20">
                Latest 5
              </span>
            </div>

            <div className="divide-y divide-border/60">
              {stats.recentUsers && stats.recentUsers.length > 0 ? (
                stats.recentUsers.map(u => (
                  <div key={u._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img 
                        src={u.profileImage} 
                        alt={u.name} 
                        className="w-12 h-12 rounded-full border border-border object-cover flex-shrink-0 shadow-sm transition group-hover:scale-105" 
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate max-w-[180px]">{u.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0 gap-1.5">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-secondary text-primary rounded-full border border-border uppercase">
                        {u.hostel || 'N/A'}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-semibold">
                        Room: {u.room || 'N/A'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">No recent users registered.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
