import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, MapPin, CheckCircle, Sparkles, AlertTriangle, Truck, Hourglass, Gavel, Radio, Info } from 'lucide-react';

export default function SellItemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    condition: 'used',
    hostel: user?.hostel || '',
    listingType: 'buy',
    isUrgent: false,
    canDeliver: false,
    deliveryFee: '',
    isAuction: false,
    startingBid: '',
    isRental: false,
    rentPrice: '',
    rentalDuration: 'day',
  });

  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const categories = ['Electronics', 'Books', 'Cycle', 'Mattress', 'Gaming', 'Kitchen', 'Fashion', 'Notes', 'Accessories', 'Others'];

  // Check if title or category changed to trigger price suggestions
  const handleTitleBlur = () => {
    triggerPriceSuggestion(formData.title, formData.category);
  };

  useEffect(() => {
    if (formData.title) {
      triggerPriceSuggestion(formData.title, formData.category);
    }
  }, [formData.category]);

  const triggerPriceSuggestion = async (titleVal, catVal) => {
    if (!titleVal || titleVal.length < 3) return;
    setSuggestionLoading(true);
    try {
      const res = await fetch(`https://hostelx-backend-a228.onrender.com/api/products/price-suggestion?category=${encodeURIComponent(catVal)}&keyword=${encodeURIComponent(titleVal)}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPriceSuggestion(data);
        // Pre-fill price with average if not set to help user
        if (!formData.price) {
          setFormData(prev => ({ ...prev, price: data.average }));
        }
      }
    } catch (e) {
      console.error('Failed to get price suggestion:', e);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('You can only upload a maximum of 5 images');
      return;
    }
    
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('Please upload at least one image.');
      return;
    }

    setLoading(true);
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('price', formData.listingType === 'rent' ? formData.rentPrice : formData.price);
    submitData.append('category', formData.category);
    submitData.append('condition', formData.condition);
    submitData.append('hostel', formData.hostel);
    submitData.append('listingType', formData.listingType);
    submitData.append('isUrgent', formData.isUrgent);
    submitData.append('canDeliver', formData.canDeliver);
    submitData.append('deliveryFee', formData.canDeliver ? formData.deliveryFee || 0 : 0);
    submitData.append('isAuction', formData.isAuction);
    submitData.append('startingBid', formData.isAuction ? formData.startingBid || 0 : 0);
    submitData.append('isRental', formData.listingType === 'rent');
    submitData.append('rentPrice', formData.listingType === 'rent' ? formData.rentPrice || 0 : 0);
    submitData.append('rentalDuration', formData.rentalDuration);
    
    // Append current user coordinates for real nearest search
    const lat = localStorage.getItem('userLat');
    const lng = localStorage.getItem('userLng');
    if (lat && lng) {
      submitData.append('latitude', lat);
      submitData.append('longitude', lng);
    }
    
    images.forEach(img => {
      submitData.append('images', img);
    });

    try {
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: submitData
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/marketplace');
        }, 2000);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to list product.');
    } finally {
      setLoading(false);
    }
  };

  // Checks if item name triggers Roommate Essentials auto-tagging
  const lowercaseTitle = formData.title.toLowerCase();
  const essentialsList = ['bucket', 'mattress', 'induction', 'books', 'cycle', 'chair', 'table', 'lamp', 'cooker', 'kettle', 'fan'];
  const isEssential = essentialsList.some(item => lowercaseTitle.includes(item)) || formData.category === 'Mattress' || formData.category === 'Books';

  return (
    <div className="min-h-screen bg-background text-foreground p-6 relative">
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card border border-border p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
              >
                <CheckCircle className="w-20 h-20 text-primary mb-4 animate-bounce" />
              </motion.div>
              <h2 className="text-2xl font-bold">Listing Created Successfully!</h2>
              <p className="text-muted-foreground mt-2">Your ad is now active in the hyper-local campus marketplace.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Create Listing</h1>
            <p className="text-muted-foreground text-sm mt-1">List your item or post a request across campus</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-card text-card-foreground border border-border rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
          
          {/* Listing Type Picker */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Listing Category Mode</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {[
                { type: 'buy', label: 'Sell Item', icon: <Sparkles className="w-4 h-4" /> },
                { type: 'rent', label: 'Rent Item', icon: <Hourglass className="w-4 h-4" /> },
                { type: 'lost', label: 'Lost Item', icon: <AlertTriangle className="w-4 h-4" /> },
                { type: 'found', label: 'Found Item', icon: <CheckCircle className="w-4 h-4" /> },
                { type: 'emergency', label: 'Emergency', icon: <Radio className="w-4 h-4 text-rose-500 animate-pulse" /> },
              ].map(opt => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    listingType: opt.type, 
                    isAuction: opt.type !== 'buy' ? false : formData.isAuction 
                  })}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border font-bold text-xs transition-all duration-200 cursor-pointer ${
                    formData.listingType === opt.type 
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25' 
                      : 'bg-muted/55 border-border hover:bg-muted hover:border-muted-foreground/35'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Product Images (Max 5)</label>
            <div className="flex flex-wrap gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border shadow-sm group">
                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="bg-destructive text-destructive-foreground p-1.5 rounded-full hover:scale-110 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-2xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all duration-300">
                  <UploadCloud className="w-7 h-7 text-muted-foreground mb-1 group-hover:text-primary" />
                  <span className="text-xs text-muted-foreground font-semibold">Upload</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          {/* Title & Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Listing Title</label>
              <input 
                type="text" required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                onBlur={handleTitleBlur}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm font-semibold"
                placeholder={
                  formData.listingType === 'emergency' 
                    ? "What do you urgently need?" 
                    : formData.listingType === 'lost' 
                    ? "Describe lost item name" 
                    : "e.g. Mattress, Cycle, Kettle"
                }
              />
              {isEssential && (
                <motion.span 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md"
                >
                  <Sparkles className="w-3 h-3" /> Auto-tagged: Roommate Essentials Category!
                </motion.span>
              )}
            </div>
            
            {/* Price Fields based on category */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {formData.listingType === 'rent' 
                  ? 'Rent Rate (₹)' 
                  : formData.listingType === 'lost' || formData.listingType === 'found' 
                  ? 'Reward / Incentive (Optional) (₹)' 
                  : formData.listingType === 'emergency' 
                  ? 'Your Budget Limit (₹)'
                  : 'Selling Price (₹)'}
              </label>
              <input 
                type="number" required={formData.listingType !== 'lost' && formData.listingType !== 'found'}
                value={formData.listingType === 'rent' ? formData.rentPrice : formData.price}
                onChange={(e) => {
                  const val = e.target.value;
                  if (formData.listingType === 'rent') {
                    setFormData({...formData, rentPrice: val});
                  } else {
                    setFormData({...formData, price: val});
                  }
                }}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm font-semibold"
                placeholder="e.g. 500"
              />
            </div>
          </div>

          {/* AI Price Suggestion Panel */}
          <AnimatePresence>
            {formData.title && priceSuggestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                    HostelX AI Pricing Advisor
                    {suggestionLoading && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono animate-pulse">Analyzing Campus Trends...</span>}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {priceSuggestion.message} for <span className="font-semibold text-foreground">"{formData.title}"</span> in <span className="font-semibold text-foreground">{formData.category}</span>:
                  </p>
                  <div className="flex gap-4 mt-2.5">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Fair Range</span>
                      <span className="text-sm font-bold text-foreground">₹{priceSuggestion.min} - ₹{priceSuggestion.max}</span>
                    </div>
                    <div className="border-l border-border pl-4">
                      <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Recommended Price</span>
                      <span className="text-sm font-bold text-emerald-500">₹{priceSuggestion.average}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.listingType === 'rent') {
                        setFormData(prev => ({ ...prev, rentPrice: priceSuggestion.average }));
                      } else {
                        setFormData(prev => ({ ...prev, price: priceSuggestion.average }));
                      }
                    }}
                    className="text-xs font-bold text-primary hover:underline mt-2 inline-block cursor-pointer"
                  >
                    Apply Recommended Price
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Description</label>
            <textarea 
              required rows="4"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm font-semibold"
              placeholder={
                formData.listingType === 'lost' 
                  ? "Describe when, where and how you lost it. Specify key details..."
                  : formData.listingType === 'emergency'
                  ? "What will this be used for? When do you need it returned or delivered?"
                  : "Detail usage history, specs, flaws, and where buyers can meet you..."
              }
            ></textarea>
          </div>

          {/* Category, Condition, Hostel Group */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm font-semibold"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Condition</label>
              <select 
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm font-semibold"
              >
                <option value="used">Used</option>
                <option value="new">Brand New</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Meetup Hostel location</label>
              <input 
                type="text" required
                value={formData.hostel}
                onChange={(e) => setFormData({...formData, hostel: e.target.value})}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm font-semibold"
              />
            </div>
          </div>

          {/* Rent and Auction Details */}
          {formData.listingType === 'rent' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-inner"
            >
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Hourglass className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: '8s' }} />
                Rental Settings
              </h3>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Rental Billing Cycle</label>
                <select
                  value={formData.rentalDuration}
                  onChange={(e) => setFormData({...formData, rentalDuration: e.target.value})}
                  className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-semibold"
                >
                  <option value="day">per Day</option>
                  <option value="week">per Week</option>
                  <option value="month">per Month</option>
                </select>
              </div>
            </motion.div>
          )}

          {formData.listingType === 'buy' && (
            <div className="border border-border p-5 rounded-2xl bg-muted/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-2">
                  <Gavel className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm">Run as Bidding Auction</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Let students compete and bid for this item</p>
                  </div>
                </div>
                <input 
                  type="checkbox"
                  checked={formData.isAuction}
                  onChange={(e) => setFormData({ ...formData, isAuction: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              {formData.isAuction && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-3 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Starting Bid (₹)</label>
                    <input 
                      type="number"
                      required={formData.isAuction}
                      value={formData.startingBid}
                      onChange={(e) => setFormData({...formData, startingBid: e.target.value})}
                      className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-semibold"
                      placeholder="e.g. 100"
                    />
                  </div>
                  <div className="flex items-center p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl gap-2">
                    <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-[10px] text-amber-500 font-semibold leading-relaxed">
                      Bid requests are visible in the Product Details dashboard. Bids must exceed this starting bid limit.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Student Delivery Option */}
          <div className="border border-border p-5 rounded-2xl bg-muted/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <Truck className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm">Student Delivery System</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Toggle if you are willing to deliver this item inside the campus</p>
                </div>
              </div>
              <input 
                type="checkbox"
                checked={formData.canDeliver}
                onChange={(e) => setFormData({ ...formData, canDeliver: e.target.checked })}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {formData.canDeliver && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-3 border-t border-border"
              >
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Campus Delivery Service Charge (₹)</label>
                <input 
                  type="number"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData({...formData, deliveryFee: e.target.value})}
                  className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-semibold"
                  placeholder="e.g. 50 (Keep it low for quick orders)"
                />
              </motion.div>
            )}
          </div>

          {/* Urgent Exit Listing Toggle */}
          <div className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
            <div className="flex items-start gap-2">
              <Radio className="w-5 h-5 text-rose-500 mt-0.5 animate-pulse" />
              <div>
                <h3 className="font-bold text-sm text-rose-500 flex items-center gap-1.5">
                  Mark as Urgent Sale! ⚡
                  <span className="text-[9px] bg-rose-500 text-white font-mono px-1 py-0.2 rounded uppercase tracking-wider animate-bounce">Boost Listing</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Highlight your item in bright orange with high priority sort</p>
              </div>
            </div>
            <input 
              type="checkbox"
              checked={formData.isUrgent}
              onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
              className="w-5 h-5 rounded border-rose-500/30 text-rose-500 focus:ring-rose-500 cursor-pointer"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold hover:bg-primary/95 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition duration-200 mt-4 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? 'Uploading Images & Creating Listing...' : 'Submit Listing & Post Ad 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
