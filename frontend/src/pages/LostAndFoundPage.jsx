import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Plus, 
  Search, 
  Camera, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Check, 
  Info, 
  AlertCircle, 
  Tag, 
  Bell, 
  ArrowRight, 
  Clock, 
  UploadCloud, 
  ShieldAlert,
  Filter,
  CheckCircle,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Safely parse serialized metadata from description
const parseItemDetails = (p) => {
  let desc = p.description;
  let location = p.hostel || 'Campus Block';
  let datetime = p.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
  let contact = '';
  let room = p.seller?.room ? `Room ${p.seller.room}, ${p.seller.hostel || p.hostel}` : p.hostel;
  let reporterName = p.seller?.name || 'Anonymous Student';

  try {
    const parsed = JSON.parse(p.description);
    if (parsed && typeof parsed === 'object') {
      desc = parsed.desc || p.description;
      location = parsed.location || location;
      datetime = parsed.datetime || datetime;
      contact = parsed.contact || contact;
      room = parsed.room || room;
    }
  } catch (e) {
    // Raw description fallback
  }

  return {
    id: p._id,
    title: p.title,
    type: p.listingType,
    description: desc,
    location,
    datetime,
    reward: p.price,
    tags: p.tags && p.tags.length > 0 ? p.tags : ['General'],
    reporter: reporterName,
    contact,
    room,
    image: p.images?.[0] || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=500&auto=format&fit=crop&q=60'
  };
};

// Helper to auto-tag based on keywords in title
const generateTagsFromTitle = (title) => {
  const words = title.toLowerCase().split(/[\s,._/#&+-]+/);
  const tags = [];
  
  const keywordsMap = {
    apple: 'Apple',
    ipad: 'iPad',
    iphone: 'iPhone',
    macbook: 'MacBook',
    sony: 'Sony',
    headphones: 'Headphones',
    earphones: 'Earbuds',
    airpods: 'AirPods',
    casio: 'Casio',
    calculator: 'Calculator',
    key: 'Key',
    lanyard: 'Lanyard',
    nike: 'Nike',
    dell: 'Dell',
    hp: 'HP',
    charger: 'Charger',
    adapter: 'Adapter',
    wallet: 'Wallet',
    purse: 'Wallet',
    card: 'Card',
    id: 'ID-Card',
    bottle: 'Bottle',
    umbrella: 'Umbrella',
    watch: 'Watch',
    sneakers: 'Shoes',
    shoes: 'Shoes',
    jacket: 'Jacket',
    hoodie: 'Hoodie',
    red: 'Red',
    blue: 'Blue',
    black: 'Black',
    white: 'White'
  };

  words.forEach(word => {
    if (keywordsMap[word]) {
      if (!tags.includes(keywordsMap[word])) {
        tags.push(keywordsMap[word]);
      }
    }
  });

  // Capitalize general short tags if no map matches
  words.forEach(word => {
    if (word.length > 3 && !tags.some(t => t.toLowerCase() === word) && tags.length < 5) {
      const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
      if (['lost', 'found', 'items', 'with', 'near', 'from', 'room'].indexOf(word) === -1) {
        tags.push(capitalized);
      }
    }
  });

  return tags.slice(0, 5);
};

export default function LostAndFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lost'); // lost, found, recovered
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Reporting Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    type: 'lost',
    description: '',
    location: '',
    datetime: '',
    reward: 0,
    hasReward: false,
    contact: '',
    room: user?.room ? `Room ${user.room}, ${user.hostel}` : '',
    image: ''
  });
  
  // Auto-calculated tags shown live in form
  const [liveTags, setLiveTags] = useState([]);
  
  // Simulated camera state
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(false);
  const [simulatedPhoto, setSimulatedPhoto] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/products');
      if (response.ok) {
        const data = await response.json();
        // filter lost/found/recovered products
        const filtered = data
          .filter(p => p.listingType === 'lost' || p.listingType === 'found' || p.listingType === 'recovered')
          .map(p => parseItemDetails(p));
        setItems(filtered);
      }
    } catch (e) {
      console.error('Failed to fetch items:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Watch title and update tags live
  useEffect(() => {
    if (reportForm.title) {
      setLiveTags(generateTagsFromTitle(reportForm.title));
    } else {
      setLiveTags([]);
    }
  }, [reportForm.title]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReportForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSimulatePhoto = (url, name) => {
    setReportForm(prev => ({ ...prev, image: url }));
    setSimulatedPhoto(name);
    setIsSimulatingCamera(false);
    triggerToast(`📸 Uploaded simulated photo of: ${name}`);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.title || !reportForm.description || !reportForm.location) {
      triggerToast('⚠️ Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const packedDescription = JSON.stringify({
        desc: reportForm.description,
        location: reportForm.location,
        datetime: reportForm.datetime || new Date().toLocaleString(),
        contact: reportForm.contact || '',
        room: reportForm.room || ''
      });

      const payload = {
        title: reportForm.title,
        description: packedDescription,
        price: reportForm.hasReward ? Number(reportForm.reward) : 0,
        category: 'Others',
        condition: 'used',
        hostel: user?.hostel || 'Other',
        listingType: reportForm.type,
        tags: JSON.stringify(liveTags.length > 0 ? liveTags : ['General']),
        isUrgent: reportForm.type === 'lost' ? true : false,
        canDeliver: false,
        deliveryFee: 0,
        isAuction: false,
        startingBid: 0,
        isRental: false,
        latitude: user?.latitude || 0,
        longitude: user?.longitude || 0
      };

      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        formData.append(key, payload[key]);
      });

      if (reportForm.image) {
        try {
          const imgResponse = await fetch(reportForm.image);
          const blob = await imgResponse.blob();
          formData.append('images', blob, 'screenshot.jpg');
        } catch (imgError) {
          console.error('Failed to attach simulated photo as file:', imgError);
        }
      }

      const res = await fetch('https://hostelx-backend-a228.onrender.com/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (res.ok) {
        const newProduct = await res.json();
        
        // Reset Form
        setReportForm({
          title: '',
          type: 'lost',
          description: '',
          location: '',
          datetime: '',
          reward: 0,
          hasReward: false,
          contact: '',
          room: user?.room ? `Room ${user.room}, ${user.hostel}` : '',
          image: ''
        });
        setSimulatedPhoto('');
        setIsReportModalOpen(false);

        // Check for AI Match!
        const lowerTitle = newProduct.title.toLowerCase();
        const potentialMatch = items.find(existing => {
          if (existing.type !== newProduct.listingType && existing.type !== 'recovered') {
            const matchesKeyword = existing.tags.some(tag => newProduct.tags?.includes(tag)) ||
                                   existing.title.toLowerCase().includes(lowerTitle) ||
                                   lowerTitle.includes(existing.title.toLowerCase());
            return matchesKeyword;
          }
          return false;
        });

        if (potentialMatch) {
          setTimeout(() => {
            triggerToast(`🧠 AI Smart Match Detected! "${potentialMatch.title}" matches your report!`);
          }, 1000);
        } else {
          triggerToast(`📢 Alert posted successfully to ${newProduct.listingType === 'lost' ? 'Lost' : 'Found'} bulletin board!`);
        }

        fetchItems();
      } else {
        const errorData = await res.json();
        triggerToast(`❌ Error: ${errorData.message || 'Failed to file report'}`);
      }
    } catch (err) {
      console.error('Failed to create report:', err);
      triggerToast('❌ Network error submitting report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsRecovered = async (itemId) => {
    try {
      const res = await fetch(`https://hostelx-backend-a228.onrender.com/api/products/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          listingType: 'recovered'
        })
      });

      if (res.ok) {
        triggerToast('🎉 Item marked as safely Recovered! Moved to archive.');
        fetchItems();
      } else {
        triggerToast('❌ Failed to update report status.');
      }
    } catch (e) {
      console.error('Recovered update error:', e);
      triggerToast('❌ Network error updating status.');
    }
  };

  // Filter items matching active tab and search query
  const filteredItems = items.filter(item => {
    const matchesTab = item.type === activeTab;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // Calculate potential smart matches to display in notification panel
  const getSmartMatchesCount = () => {
    let count = 0;
    const lostItems = items.filter(i => i.type === 'lost');
    const foundItems = items.filter(i => i.type === 'found');
    
    lostItems.forEach(lost => {
      const hasMatch = foundItems.some(found => 
        found.tags.some(tag => lost.tags.includes(tag)) ||
        lost.title.toLowerCase().includes(found.title.toLowerCase()) ||
        found.title.toLowerCase().includes(lost.title.toLowerCase())
      );
      if (hasMatch) count++;
    });
    return count;
  };

  const smartMatchesCount = getSmartMatchesCount();

  return (
    <div className="min-h-screen bg-background text-foreground relative pb-16">

      {/* Red Ambient glow to highlight Alert styling */}
      <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-rose-500/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-red-500/5 rounded-full blur-[100px] -z-10" />

      {/* Nav Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition cursor-pointer"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-rose-500 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Lost & Found Hub
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> LIVE REPORTING
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold">Campus instant recovery, rewards, and AI smart tagging</p>
          </div>
        </div>

        <button 
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-rose-500/20 cursor-pointer active:scale-95 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Report Item
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Smart Recovery Active Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-950/20 via-card to-amber-950/10 border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Search className="w-3 h-3 animate-pulse" />
              Smart-Match Active
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Active Recovery Bulletin</h1>
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed font-medium">
              Lost keys in the canteen? Left your calculator in the exam hall? Report details with a snapshot. Our semantic smart-match scanner compares lost tags with found tags in real-time.
            </p>
          </div>

          {/* Smart Match Ticker */}
          <div className="bg-card border border-border/80 p-4.5 rounded-2xl flex items-center gap-4 max-w-sm">
            <div className="p-3 bg-amber-500/15 text-amber-500 rounded-xl flex-shrink-0 relative">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              {smartMatchesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                  {smartMatchesCount}
                </span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-black text-foreground">Overlap Scanner Engine</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal font-semibold">
                {smartMatchesCount > 0 
                  ? `AI matched ${smartMatchesCount} overlapping lost/found item clusters currently.` 
                  : 'Currently monitoring campus database for matches. 0 active conflicts.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selectors & Search bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-card border border-border rounded-2xl self-start">
            <button
              onClick={() => setActiveTab('lost')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'lost'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🚨 Lost Items
            </button>
            <button
              onClick={() => setActiveTab('found')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'found'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🔍 Found Items
            </button>
            <button
              onClick={() => setActiveTab('recovered')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'recovered'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🎉 Recovered
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by keywords, tags, blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border pl-10 pr-4 py-2 rounded-xl text-xs font-semibold outline-none focus:border-rose-500/50 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-2.5 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Display Items List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-3xl p-8 max-w-md mx-auto flex flex-col items-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl mb-4 animate-bounce">📢</div>
            <h4 className="font-extrabold text-base text-foreground">No reports found on the bulletin</h4>
            <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed text-center font-semibold">
              Be the first to file a report! Report your lost or found items to instantly alert students across all hostels.
            </p>
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="mt-4 px-4.5 py-2 bg-rose-500 text-white text-xs font-black rounded-xl hover:bg-rose-600 active:scale-95 transition cursor-pointer"
            >
              File a Report
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => {
              const borderAccent = item.type === 'lost' 
                ? 'border-rose-500/25 hover:border-rose-500/50' 
                : item.type === 'found' 
                  ? 'border-amber-500/25 hover:border-amber-500/50' 
                  : 'border-emerald-500/25 hover:border-emerald-500/50';

              const badgeBg = item.type === 'lost'
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                : item.type === 'found'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

              return (
                <motion.div
                  key={item.id}
                  layout
                  className={`bg-card border ${borderAccent} rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-5 relative`}
                >
                  {/* Reward indicator */}
                  {item.reward > 0 && (
                    <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 border border-rose-400/20">
                      💰 Reward: ₹{item.reward}
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden bg-muted/40 border border-border flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border ${badgeBg}`}>
                          {item.type}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.datetime}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-foreground mt-2 leading-snug">{item.title}</h4>
                      <p className="text-xs text-muted-foreground font-semibold mt-1.5 leading-relaxed">{item.description}</p>
                      
                      {/* Location metadata */}
                      <p className="text-[10px] text-foreground font-black mt-2 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {item.location}
                      </p>

                      {/* Display Tags */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {item.tags.map((tag, i) => (
                          <span 
                            key={i} 
                            className="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg border border-border"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Reporter Panel / CTA */}
                    <div className="pt-3 border-t border-border mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">Filed by</p>
                        <p className="text-[11px] font-black text-foreground">{item.reporter} · {item.room}</p>
                      </div>

                      <div className="flex gap-2">
                        {item.type !== 'recovered' && (
                          <>
                            {item.contact && (
                              <a 
                                href={`tel:${item.contact}`}
                                onClick={() => triggerToast(`📞 Dialing reporter: ${item.reporter}`)}
                                className="p-2 bg-secondary text-foreground hover:bg-muted rounded-xl text-xs font-bold transition flex items-center gap-1"
                                title={`Contact ${item.reporter}`}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </a>
                            )}
                            {user?.name === item.reporter && (
                              <button 
                                onClick={() => handleMarkAsRecovered(item.id)}
                                className="px-3.5 py-2 bg-emerald-500 text-white text-xs font-black rounded-xl hover:bg-emerald-600 active:scale-95 transition cursor-pointer"
                              >
                                Mark Recovered
                              </button>
                            )}
                          </>
                        )}
                        {item.type === 'recovered' && (
                          <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-xl flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Returned Safely
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </main>

      {/* Global Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-foreground text-background text-xs font-bold px-6 py-3.5 rounded-full shadow-2xl"
            >
              <span>{toastMessage}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 md:p-8 backdrop-blur-lg z-10 space-y-4 my-8"
            >
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-muted hover:bg-secondary transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">File detailed bulletin report</h3>
                  <p className="text-[10px] text-muted-foreground">Submit a missing/claimed product query to database</p>
                </div>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4 pt-2">
                
                {/* Switch Lost / Found */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Bulletin Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setReportForm(prev => ({ ...prev, type: 'lost' }))}
                      className={`flex-1 py-2 rounded-xl border text-xs font-black cursor-pointer transition ${
                        reportForm.type === 'lost' 
                          ? 'bg-rose-500 text-white border-rose-500' 
                          : 'bg-muted border-border text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      🚨 Lost Item
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportForm(prev => ({ ...prev, type: 'found' }))}
                      className={`flex-1 py-2 rounded-xl border text-xs font-black cursor-pointer transition ${
                        reportForm.type === 'found' 
                          ? 'bg-amber-500 text-black border-amber-500' 
                          : 'bg-muted border-border text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      🔍 Found Item
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Item Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Red Sony Headphones, Black Wallet"
                    value={reportForm.title}
                    onChange={handleInputChange}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  />
                  {liveTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[9px] text-rose-500 font-extrabold mr-1 flex items-center gap-0.5"><Tag className="w-2.5 h-2.5 animate-bounce" /> Live Tags:</span>
                      {liveTags.map((tag, idx) => (
                        <span key={idx} className="text-[8px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.5 rounded-md animate-pulse">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Detailed Description *</label>
                  <textarea
                    name="description"
                    required
                    rows="2.5"
                    placeholder="Mention unique indicators like scratches, screen protectors, phone covers, case branding..."
                    value={reportForm.description}
                    onChange={handleInputChange}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-semibold outline-none resize-none"
                  />
                </div>

                {/* Location & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Last Seen Area *</label>
                    <input
                      type="text"
                      name="location"
                      required
                      placeholder="e.g. Canteen yard"
                      value={reportForm.location}
                      onChange={handleInputChange}
                      className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Time & Date</label>
                    <input
                      type="text"
                      name="datetime"
                      placeholder="e.g. Today at 4 PM"
                      value={reportForm.datetime}
                      onChange={handleInputChange}
                      className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                {/* Photo Simulation */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Snap Screenshot (Simulated)</label>
                  {simulatedPhoto ? (
                    <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-xl">
                      <span className="text-[10px] font-black text-foreground">Selected: {simulatedPhoto}</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setReportForm(prev => ({ ...prev, image: '' }));
                          setSimulatedPhoto('');
                        }}
                        className="text-[9px] font-black text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSimulatingCamera(true)}
                      className="w-full flex flex-col items-center justify-center py-4 bg-muted/30 hover:bg-muted/50 border border-dashed border-border hover:border-rose-500/50 rounded-2xl cursor-pointer transition-all duration-200"
                    >
                      <UploadCloud className="w-6 h-6 text-muted-foreground" />
                      <span className="text-[10px] font-black mt-1 text-foreground">Choose from Simulated Campus Snaps</span>
                      <span className="text-[9px] text-muted-foreground mt-0.5">Click to simulate camera / gallery capture</span>
                    </button>
                  )}
                </div>

                {/* Reward slider if lost */}
                {reportForm.type === 'lost' && (
                  <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                        <input
                          type="checkbox"
                          name="hasReward"
                          checked={reportForm.hasReward}
                          onChange={handleInputChange}
                          className="w-3.5 h-3.5 accent-rose-500 rounded border-border"
                        />
                        Offer Finder Cash Reward
                      </label>
                      {reportForm.hasReward && (
                        <span className="text-xs font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/15">
                          ₹{reportForm.reward}
                        </span>
                      )}
                    </div>
                    
                    {reportForm.hasReward && (
                      <input
                        type="range"
                        name="reward"
                        min="100"
                        max="2000"
                        step="50"
                        value={reportForm.reward}
                        onChange={handleInputChange}
                        className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                    )}
                  </div>
                )}

                {/* Contacts & Room info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Mobile / Contact</label>
                    <input
                      type="text"
                      name="contact"
                      placeholder="e.g. +91 99999..."
                      value={reportForm.contact}
                      onChange={handleInputChange}
                      className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Return Address / Room</label>
                    <input
                      type="text"
                      name="room"
                      placeholder="e.g. Room 304, Satpura"
                      value={reportForm.room}
                      onChange={handleInputChange}
                      className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="py-2.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl border border-border hover:bg-muted transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="py-2.5 bg-rose-500 text-white text-xs font-black rounded-xl hover:bg-rose-600 transition cursor-pointer"
                  >
                    Filing Broadcast
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulated Camera Selection Modal */}
      <AnimatePresence>
        {isSimulatingCamera && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSimulatingCamera(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-3xl p-6 backdrop-blur-lg z-10 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-base text-foreground">Simulate Photo Capture</h3>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                Select a simulated image from the campus cameras / screenshots list to populate this report:
              </p>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleSimulatePhoto('https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60', 'Space grey iPad')}
                  className="w-full p-3 bg-muted/40 hover:bg-muted border border-border rounded-xl text-left text-xs font-bold flex items-center gap-3 transition cursor-pointer"
                >
                  <span className="text-xl">📱</span>
                  <div>
                    <span className="block text-foreground">iPad Pro snapshot</span>
                    <span className="block text-[9px] text-muted-foreground">Simulates local library desk photo</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulatePhoto('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60', 'Sony headphones')}
                  className="w-full p-3 bg-muted/40 hover:bg-muted border border-border rounded-xl text-left text-xs font-bold flex items-center gap-3 transition cursor-pointer"
                >
                  <span className="text-xl">🎧</span>
                  <div>
                    <span className="block text-foreground">Sony WH-1000XM4 headphones</span>
                    <span className="block text-[9px] text-muted-foreground">Simulates court seating view</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulatePhoto('https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&auto=format&fit=crop&q=60', 'Nike Lanyard room key')}
                  className="w-full p-3 bg-muted/40 hover:bg-muted border border-border rounded-xl text-left text-xs font-bold flex items-center gap-3 transition cursor-pointer"
                >
                  <span className="text-xl">🔑</span>
                  <div>
                    <span className="block text-foreground">Canteen lanyard key</span>
                    <span className="block text-[9px] text-muted-foreground">Simulates courtyard grass view</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulatePhoto('https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60', 'Dell adapter')}
                  className="w-full p-3 bg-muted/40 hover:bg-muted border border-border rounded-xl text-left text-xs font-bold flex items-center gap-3 transition cursor-pointer"
                >
                  <span className="text-xl">🔌</span>
                  <div>
                    <span className="block text-foreground">Dell Laptop Charger 65W</span>
                    <span className="block text-[9px] text-muted-foreground">Simulates Computer lab counter</span>
                  </div>
                </button>
              </div>

              <button 
                type="button"
                onClick={() => setIsSimulatingCamera(false)}
                className="w-full py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl border border-border hover:bg-muted transition mt-2 cursor-pointer"
              >
                Cancel Photo Simulator
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
