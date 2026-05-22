import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, MapPin, CheckCircle, Sparkles, AlertTriangle, Truck, Hourglass, Gavel, Radio, Info, Camera, TrendingDown } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';

export default function SellItemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [showCamera, setShowCamera] = useState(false);

  const handleCameraCapture = (file) => {
    if (images.length + 1 > 5) {
      alert('You can only upload a maximum of 5 images');
      return;
    }
    setImages(prev => [...prev, file]);
    setPreviewUrls(prev => [...prev, URL.createObjectURL(file)]);
  };
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    condition: 'good',
    usageDuration: '3-6m',
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
    rentType: 'offer',
  });

  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const categories = ['Electronics', 'Books', 'Cycle', 'Mattress', 'Gaming', 'Kitchen', 'Fashion', 'Notes', 'Accessories', 'Others'];

  // Check if title or category/condition/duration changed to trigger price suggestions
  const handleTitleBlur = () => {
    triggerPriceSuggestion(formData.title, formData.category, formData.condition, formData.usageDuration);
  };

  useEffect(() => {
    if (formData.title && formData.title.length >= 3) {
      triggerPriceSuggestion(formData.title, formData.category, formData.condition, formData.usageDuration);
    }
  }, [formData.category, formData.condition, formData.usageDuration]);

  const triggerPriceSuggestion = async (titleVal, catVal, conditionVal, durationVal) => {
    if (!titleVal || titleVal.length < 3) return;
    setSuggestionLoading(true);
    try {
      const params = new URLSearchParams({
        category: catVal,
        keyword: titleVal,
        ...(conditionVal && { condition: conditionVal }),
        ...(durationVal && { usageDuration: durationVal })
      });
      const res = await fetch(`https://hostelx-backend-a228.onrender.com/api/products/price-suggestion?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPriceSuggestion(data);
        // Pre-fill price with suggested value if field is empty
        if (formData.listingType === 'rent') {
          if (!formData.rentPrice) {
            setFormData(prev => ({ ...prev, rentPrice: data.suggestedPrice }));
          }
        } else {
          if (!formData.price) {
            setFormData(prev => ({ ...prev, price: data.suggestedPrice }));
          }
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
    const isNeedRequest = formData.listingType === 'emergency' || (formData.listingType === 'rent' && formData.rentType === 'seek') || formData.listingType === 'lost';
    if (!isNeedRequest && images.length === 0) {
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
    submitData.append('canDeliver', 'false');
    submitData.append('deliveryFee', '0');
    submitData.append('isAuction', formData.isAuction);
    submitData.append('startingBid', formData.isAuction ? formData.startingBid || 0 : 0);
    submitData.append('isRental', formData.listingType === 'rent');
    submitData.append('rentType', formData.listingType === 'rent' ? formData.rentType : 'offer');
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
  
  const isNeedRequest = formData.listingType === 'emergency' || (formData.listingType === 'rent' && formData.rentType === 'seek') || formData.listingType === 'lost';

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

            {formData.listingType === 'rent' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-muted/20 border border-border p-4.5 rounded-2xl space-y-3 mt-4"
              >
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Hourglass className="w-3.5 h-3.5 text-primary" />
                  Select Rental Intent
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, rentType: 'offer' })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                      formData.rentType === 'offer'
                        ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                        : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-xs font-bold">Rent Out (Offer Item)</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">I have an item to offer for rent (Requires image upload)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, rentType: 'seek' })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                      formData.rentType === 'seek'
                        ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                        : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-xs font-bold">Ask for Rent (Seek Need)</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">I need an item on rent (Bypasses image upload)</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Product Images (Max 5)
              {isNeedRequest && (
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded ml-2">
                  Optional (Unsplash campus graphics will be assigned)
                </span>
              )}
            </label>
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
                <div className="flex gap-4">
                  <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-2xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all duration-300">
                    <UploadCloud className="w-7 h-7 text-muted-foreground mb-1 group-hover:text-primary" />
                    <span className="text-xs text-muted-foreground font-semibold">Upload</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  
                  <button 
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all duration-300 cursor-pointer group"
                  >
                    <Camera className="w-7 h-7 text-muted-foreground mb-1 group-hover:text-primary" />
                    <span className="text-xs text-muted-foreground font-semibold font-semibold">Camera</span>
                  </button>
                </div>
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
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative overflow-hidden bg-card/65 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-2xl space-y-5"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold tracking-tight text-foreground flex items-center gap-2">
                        HostelX AI Pricing Advisor
                        <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">v3.0</span>
                      </h4>
                      {priceSuggestion.globalRetailPrice ? (
                        <p className="text-xs text-muted-foreground">
                          Original Retail: <span className="line-through decoration-rose-400 text-foreground font-bold">₹{priceSuggestion.globalRetailPrice.toLocaleString('en-IN')}</span>
                          <span className="text-rose-400 font-bold ml-1.5">{Math.round((1 - priceSuggestion.suggestedPrice / priceSuggestion.globalRetailPrice) * 100)}% below retail</span>
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Context-aware valuation for hostel liquidations</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {suggestionLoading && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" /> Recalculating...
                      </span>
                    )}
                    {priceSuggestion.highDemand && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                        <Radio className="w-3.5 h-3.5" /> High Campus Demand
                      </span>
                    )}
                  </div>
                </div>

                {/* Body: 4 chips + Confidence + SVG Graph */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {/* Left: 4 Strategy Chips */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Choose Your Trading Strategy</span>
                    {[
                      { type: 'quick', title: 'Quick Liquidation', desc: 'Sells in hours — best for clearing rooms fast.', val: priceSuggestion.quickSalePrice, badge: 'Fast Sell', badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20', hover: 'hover:border-rose-500/40 hover:bg-rose-500/5' },
                      { type: 'hostel', title: 'Hostel Resale Value', desc: 'Optimal campus peer-to-peer trade price.', val: priceSuggestion.hostelResaleValue, badge: 'Campus Fair', badgeClass: 'bg-teal-500/10 text-teal-400 border-teal-500/20', hover: 'hover:border-teal-500/40 hover:bg-teal-500/5' },
                      { type: 'suggested', title: 'Recommended Price', desc: 'Best balance of speed and maximum profit.', val: priceSuggestion.suggestedPrice, badge: 'Best Balance', badgeClass: 'bg-primary/10 text-primary border-primary/20', hover: 'hover:border-primary/40 hover:bg-primary/5' },
                      { type: 'premium', title: 'Premium Market Value', desc: 'For patient sellers — maximise returns.', val: priceSuggestion.bestMarketValue, badge: 'Top Yield', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', hover: 'hover:border-emerald-500/40 hover:bg-emerald-500/5' },
                    ].map((chip) => {
                      const cur = formData.listingType === 'rent' ? formData.rentPrice : formData.price;
                      const isSelected = Number(cur) === chip.val;
                      return (
                        <motion.button
                          key={chip.type} type="button"
                          whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                          onClick={() => formData.listingType === 'rent'
                            ? setFormData(p => ({ ...p, rentPrice: chip.val }))
                            : setFormData(p => ({ ...p, price: chip.val }))}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${isSelected ? 'bg-primary/10 border-primary shadow-[0_0_18px_rgba(59,130,246,0.15)]' : `bg-muted/25 border-border/60 ${chip.hover}`}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${chip.badgeClass}`}>{chip.badge}</span>
                            <div>
                              <p className="text-xs font-extrabold text-foreground">{chip.title}</p>
                              <p className="text-[10px] text-muted-foreground">{chip.desc}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <span className="text-sm font-black text-foreground">₹{chip.val?.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] text-muted-foreground block mt-0.5">{isSelected ? '✓ Selected' : 'Apply'}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Right: Confidence + Dynamic SVG Trend */}
                  <div className="flex flex-col space-y-4">
                    {/* Confidence Meter */}
                    <div className="bg-muted/20 border border-border/40 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Valuation Confidence</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md font-mono ${priceSuggestion.confidence > 85 ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : priceSuggestion.confidence > 65 ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'}`}>
                          {priceSuggestion.confidence || 75}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-muted/60 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${priceSuggestion.confidence || 75}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${priceSuggestion.confidence > 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : priceSuggestion.confidence > 65 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-rose-500 to-orange-400'}`}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Based on brand, condition, usage duration, and live campus listings.</p>
                    </div>

                    {/* Dynamic Depreciation Trend Graph */}
                    <div className="bg-muted/20 border border-border/40 rounded-2xl p-4 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Resale Depreciation
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground">Semester Timeline</span>
                      </div>
                      {(() => {
                        const td = priceSuggestion.trendData || [];
                        if (td.length < 2) return null;
                        const maxVal = Math.max(...td.map(d => d.value));
                        const H = 60, W = 280, pad = 10;
                        const xStep = (W - pad * 2) / (td.length - 1);
                        const getY = (v) => H - pad - ((v / maxVal) * (H - pad * 2));
                        const pts = td.map((d, i) => ({ x: pad + i * xStep, y: getY(d.value), ...d }));
                        const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
                        const areaD = pathD + ` L ${pts[pts.length-1].x.toFixed(1)} ${H} L ${pts[0].x.toFixed(1)} ${H} Z`;
                        return (
                          <div>
                            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="trendAreaG" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              <path d={areaD} fill="url(#trendAreaG)" />
                              <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              {pts.map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="3.5"
                                  fill={i === 0 ? '#3b82f6' : i === pts.length-1 ? '#10b981' : '#6366f1'}
                                  stroke="white" strokeWidth="1.5"
                                />
                              ))}
                            </svg>
                            <div className="flex justify-between mt-1">
                              {pts.map((p, i) => (
                                <div key={i} className="text-center">
                                  <p className="text-[9px] font-black text-foreground">₹{(p.value/1000).toFixed(1)}k</p>
                                  <p className="text-[8px] text-muted-foreground">{p.label}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Recommendation chip */}
                {priceSuggestion.recommendation && (
                  <div className="pt-3 border-t border-border/40">
                    <span className="text-xs font-semibold text-foreground bg-primary/5 border border-primary/15 rounded-xl px-3 py-2 block">
                      {priceSuggestion.recommendation}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{priceSuggestion.message}</span>
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
                <option value="new">🌟 Brand New (Sealed)</option>
                <option value="like-new">✨ Like New (Barely Used)</option>
                <option value="good">👍 Good (Normal Wear)</option>
                <option value="worn">🔧 Worn (Visible Use)</option>
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

          {/* Usage Duration Picker */}
          {formData.listingType !== 'lost' && formData.listingType !== 'emergency' && (
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                How Long Have You Used It? <span className="text-primary font-mono text-[10px] ml-1">Affects AI Pricing ↑</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: '<3m', label: '< 3 Months', icon: '🆕' },
                  { val: '3-6m', label: '3–6 Months', icon: '🟢' },
                  { val: '6-12m', label: '6–12 Months', icon: '🟡' },
                  { val: '1y+', label: '1+ Year', icon: '🔴' },
                ].map(opt => (
                  <button
                    key={opt.val} type="button"
                    onClick={() => setFormData(p => ({ ...p, usageDuration: opt.val }))}
                    className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all duration-150 cursor-pointer ${
                      formData.usageDuration === opt.val
                        ? 'bg-primary/10 border-primary text-primary shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                        : 'bg-muted/30 border-border/60 text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span className="text-[10px] font-bold leading-tight">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

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

      <CameraCapture 
        isOpen={showCamera} 
        onClose={() => setShowCamera(false)} 
        onCapture={handleCameraCapture} 
      />
    </div>
  );
}
