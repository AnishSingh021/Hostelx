import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, AlertCircle, Coins, Camera, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CameraCapture from '../CameraCapture';

export default function UploadOutfitModal({ onClose, onUploadSuccess }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('M');
  const [occasion, setOccasion] = useState('Fest');
  const [gender, setGender] = useState('Unisex');
  const [rentPrice, setRentPrice] = useState(199);
  const [securityDeposit, setSecurityDeposit] = useState(500);
  const [description, setDescription] = useState('');
  
  // Advanced multi-image upload state
  const [images, setImages] = useState([]); // Array of { file: File/Blob, url: string }
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sizing and occasion lists
  const sizes = ['S', 'M', 'L', 'XL', 'Free Size', 'UK 8', 'UK 9', 'UK 10'];
  const occasions = ['Fest', "Fresher's", 'Cultural Night', 'Formal', 'Casual', 'Party'];
  const genders = ['Men', 'Women', 'Unisex'];

  // Earnings estimation (rented 4 times a month)
  const monthlyEarnings = rentPrice * 4;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const addFiles = (files) => {
    setErrorMsg('');
    const validImageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validImageFiles.length === 0) {
      setErrorMsg('Please upload valid image files (PNG, JPG or JPEG).');
      return;
    }

    const newImages = validImageFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (indexToRemove) => {
    // Revoke the Object URL to prevent memory leaks
    URL.revokeObjectURL(images[indexToRemove].url);
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please fill in both title and description.');
      return;
    }
    if (images.length === 0) {
      setErrorMsg('Please upload or capture at least one outfit image.');
      return;
    }

    setLoading(true);
    
    // Create new custom outfit item
    const newFit = {
      id: `fit-custom-${Date.now()}`,
      title: title.trim(),
      brand: brand.trim() || 'Custom Label',
      size,
      occasion,
      gender,
      rentPrice: Number(rentPrice),
      securityDeposit: Number(securityDeposit),
      description: description.trim(),
      image: images[0].url,
      gallery: images.map(img => img.url),
      ownerName: user?.name || 'Self',
      ownerAvatar: user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      rating: 5.0,
      reviewsCount: 0,
      availability: true,
      college: user?.college || 'Chandigarh University',
      hostel: user?.hostel || 'Zakir Hussain Block',
      views: 1
    };

    setTimeout(() => {
      setLoading(false);
      onUploadSuccess(newFit);
    }, 1500);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Card container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          className="relative w-full max-w-2xl bg-card/95 border border-border shadow-2xl rounded-3xl p-6 md:p-8 backdrop-blur-xl z-10 overflow-y-auto max-h-[90vh] no-scrollbar"
        >
          {/* Ambient background glows */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-3xl -z-10" />
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="px-3 py-1 text-[9px] font-black text-primary bg-primary/15 border border-primary/20 rounded-full tracking-wider uppercase">
                Monetize Your Closet
              </span>
              <h3 className="text-2xl font-black tracking-tight mt-2 text-foreground">
                Share Your Drip
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-xs font-semibold text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Side fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Outfit Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vintage Oversized Varsity Jacket"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-semibold transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Brand / designer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tommy Hilfiger, H&M, Local Designer"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-semibold transition"
                  />
                </div>

                {/* Sizes Selector */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                    Size *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          size === s
                            ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10'
                            : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occasion / Category Selector */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                    Style Category *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {occasions.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setOccasion(o)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          occasion === o
                            ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10'
                            : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender target */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                    Wear Preference
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {genders.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          gender === g
                            ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10'
                            : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side fields */}
              <div className="space-y-4">
                {/* Rent Price & Deposit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                      Rent / Day (₹) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={rentPrice}
                      onChange={(e) => setRentPrice(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-black transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                      Deposit (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-[#181d28]/40 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-black transition"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Outfit Description *
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Tell students about the fabric quality, fitting details, cleaning guidelines, and when you can trade it..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs font-medium transition resize-none"
                  />
                </div>

                {/* Advanced Multi-Image Uploader Dropzone and Camera trigger */}
                <div className="space-y-3">
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    Outfit Media Gallery *
                  </label>

                  {/* Dropzone container */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 backdrop-blur-md flex flex-col items-center justify-center min-h-[140px] group ${
                      isDragging
                        ? 'border-primary bg-primary/5 scale-[0.98]'
                        : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition duration-300">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>

                    <p className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                      Drag & Drop or click to upload
                    </p>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                      PNG, JPG or JPEG (high-resolution recommended)
                    </p>
                  </div>

                  {/* Camera Capture triggers */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="flex-1 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition shadow-sm"
                    >
                      <Camera className="w-4 h-4 text-primary" />
                      Capture with Camera
                    </button>
                  </div>

                  {/* Multi-Image Thumbnails Grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border group"
                        >
                          <img
                            src={img.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-500 rounded-lg text-white transition duration-200 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {index === 0 && (
                            <div className="absolute inset-x-0 bottom-0 bg-primary/95 text-[8px] font-black uppercase tracking-wider text-primary-foreground py-0.5 text-center">
                              Cover Fit
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Earning potential HUD */}
            <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/15 rounded-2xl flex items-center gap-4.5 mt-2">
              <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-xl flex-shrink-0 animate-pulse">
                <Coins className="w-5.5 h-5.5" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider">Estimated Earning Potential</p>
                <h4 className="text-base font-black text-foreground mt-0.5">
                  Earn ₹{monthlyEarnings} / month
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Calculated by renting this outfit just 4 times inside your hostel block.</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-black rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                  Publishing Your Fit Vibe...
                </>
              ) : (
                <>
                  <Tag className="w-4.5 h-4.5" />
                  Publish Vibe to Campus Feed
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Camera Capture dialogue overlay */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => {
          const url = URL.createObjectURL(file);
          setImages(prev => [...prev, { file, url }]);
        }}
      />
    </>
  );
}
