import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, ShieldCheck } from 'lucide-react';

export default function OutfitCard({ outfit, onRentClick }) {
  const [isSaved, setIsSaved] = useState(false);

  // Check saved state from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedFits') || '[]');
    setIsSaved(saved.includes(outfit.id));
  }, [outfit.id]);

  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const saved = JSON.parse(localStorage.getItem('savedFits') || '[]');
    let updated;
    if (isSaved) {
      updated = saved.filter(id => id !== outfit.id);
    } else {
      updated = [...saved, outfit.id];
    }
    localStorage.setItem('savedFits', JSON.stringify(updated));
    setIsSaved(!isSaved);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col h-full bg-card/40 dark:bg-card/30 border border-border/60 hover:border-primary/50 rounded-[2rem] overflow-hidden backdrop-blur-md transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/5"
    >
      {/* Visual Image container */}
      <div className="aspect-[4/5] relative overflow-hidden w-full bg-muted">
        <img
          src={outfit.image}
          alt={outfit.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
        />

        {/* Card overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent opacity-80 z-[1]" />

        {/* Top Floating Badges */}
        <div className="absolute top-4 left-4 z-[2] flex flex-col gap-2">
          {/* Size Pill */}
          <span className="px-3 py-1 text-[10px] font-black bg-background/90 text-foreground border border-border/80 rounded-full shadow-md">
            SIZE {outfit.size}
          </span>
          {/* Occasion/Style Pill */}
          <span className="px-3 py-1 text-[10px] font-extrabold bg-primary/20 text-primary border border-primary/30 rounded-full backdrop-blur-md shadow-md">
            {outfit.occasion}
          </span>
        </div>

        {/* Wishlist Icon */}
        <button
          onClick={toggleSave}
          className="absolute top-4 right-4 z-[2] p-2.5 rounded-full bg-background/90 text-foreground hover:text-rose-500 hover:bg-background shadow-md border border-border/50 active:scale-90 transition cursor-pointer"
          title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <motion.div
            animate={{ scale: isSaved ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`}
            />
          </motion.div>
        </button>

        {/* Availability Marker */}
        {outfit.availability ? (
          <div className="absolute bottom-4 left-4 z-[2] flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Available Now
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 z-[2] flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Rented Out
          </div>
        )}
      </div>

      {/* Detail Content */}
      <div className="p-5 flex-1 flex flex-col justify-between relative z-[2] bg-gradient-to-b from-transparent to-card/60">
        <div>
          {/* Owner details */}
          <div className="flex items-center gap-2 mb-2.5">
            <img
              src={outfit.ownerAvatar}
              alt={outfit.ownerName}
              className="w-5.5 h-5.5 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div className="flex items-center gap-1 min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground truncate max-w-[80px]">
                {outfit.ownerName}
              </p>
              <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            </div>
            
            <div className="flex items-center gap-0.5 ml-auto flex-shrink-0 text-amber-500 font-extrabold text-[10px]">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{outfit.rating}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-sm sm:text-base text-foreground line-clamp-1 leading-snug group-hover:text-primary transition-colors duration-200">
            {outfit.title}
          </h3>

          {/* Brand Info */}
          <p className="text-[10px] font-bold tracking-wide uppercase text-muted-foreground mt-0.5">
            {outfit.brand || 'Premium Brand'}
          </p>

          {/* Price Tags */}
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent tracking-tight">
              ₹{outfit.rentPrice}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">/ day</span>
            
            <span className="ml-auto text-[9px] text-muted-foreground font-semibold bg-muted/60 border border-border/80 px-2 py-0.5 rounded-md">
              Dep: ₹{outfit.securityDeposit}
            </span>
          </div>
        </div>

        {/* Footer location and CTA */}
        <div className="border-t border-border/40 pt-3 mt-4 flex items-center justify-between gap-2">
          {/* Hostel location */}
          <div className="flex items-center gap-0.5 text-muted-foreground text-[10px] font-medium min-w-0">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary/70" />
            <span className="truncate">{outfit.hostel}</span>
          </div>

          {/* Rent Button */}
          {outfit.availability ? (
            <button
              onClick={() => onRentClick(outfit)}
              className="px-4 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl shadow-md shadow-primary/10 active:scale-95 transition cursor-pointer"
            >
              Rent Fit
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-1.5 bg-muted text-muted-foreground text-xs font-bold rounded-xl cursor-not-allowed border border-border/40"
            >
              Waiting
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
