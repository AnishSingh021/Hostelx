import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Shield, CreditCard, CheckCircle2, QrCode } from 'lucide-react';

export default function RentOutfitModal({ outfit, onClose, onRentSuccess }) {
  const [rentDays, setRentDays] = useState(1);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Dynamic calculations
  const rentalFee = outfit.rentPrice * rentDays;
  const securityDeposit = outfit.securityDeposit;
  const totalAmount = rentalFee + securityDeposit;

  const handleCheckout = () => {
    if (!agreedToPolicy) return;
    setIsProcessing(true);
    
    // Simulate transaction processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (onRentSuccess) {
        onRentSuccess(outfit.id);
      }
    }, 2000);
  };

  const dayOptions = [
    { label: '1 Day', value: 1 },
    { label: '3 Days', value: 3, discount: '5% off' },
    { label: '5 Days', value: 5, discount: '10% off' },
    { label: '7 Days', value: 7, discount: '15% off' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !isProcessing && onClose()}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        className="relative w-full max-w-lg bg-card/95 border border-border shadow-2xl rounded-3xl p-6 md:p-8 backdrop-blur-xl z-10 overflow-hidden"
      >
        {/* Glowing floating decorative ambient lights */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

        {/* Close Button */}
        {!isProcessing && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="checkout-flow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header Title */}
              <div>
                <span className="px-3 py-1 text-[9px] font-black text-primary bg-primary/15 border border-primary/20 rounded-full tracking-wider uppercase">
                  Direct Student Exchange
                </span>
                <h3 className="text-2xl font-black tracking-tight mt-2 text-foreground">
                  Rent Your Vibe
                </h3>
              </div>

              {/* Item preview */}
              <div className="flex gap-4 p-3 bg-muted/40 border border-border/60 rounded-2xl">
                <img
                  src={outfit.image}
                  alt={outfit.title}
                  className="w-16 h-20 rounded-xl object-cover border border-border/80 flex-shrink-0"
                />
                <div className="min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-foreground line-clamp-1 leading-snug">
                      {outfit.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">
                      {outfit.brand} · Size {outfit.size}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Listed by <span className="font-bold text-foreground">{outfit.ownerName}</span> from <span className="font-bold text-foreground">{outfit.hostel}</span>
                  </p>
                </div>
              </div>

              {/* Day selection */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Select Rental Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {dayOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRentDays(opt.value)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition duration-200 cursor-pointer ${
                        rentDays === opt.value
                          ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {opt.discount && (
                        <span className={`text-[8px] font-bold px-1 py-0.2 rounded mt-1 ${
                          rentDays === opt.value
                            ? 'bg-white/20 text-white'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {opt.discount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Calculation details */}
              <div className="space-y-2 border-t border-border/40 pt-4">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Direct Rental rate ({rentDays} {rentDays === 1 ? 'day' : 'days'})</span>
                  <span className="font-bold text-foreground">₹{outfit.rentPrice} × {rentDays} = ₹{rentalFee}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    Direct Refundable Deposit
                    <Shield className="w-3.5 h-3.5 text-emerald-500" title="Settled directly between students at handover" />
                  </span>
                  <span className="font-bold text-foreground">₹{securityDeposit}</span>
                </div>
                
                {/* Total box */}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/5 to-indigo-500/5 border border-primary/10 rounded-2xl mt-2.5">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Settlement Amount at Meetup</p>
                    <p className="text-[9px] text-emerald-500 font-extrabold mt-0.5">Includes Rent (₹{rentalFee}) + Direct Deposit (₹{securityDeposit})</p>
                  </div>
                  <span className="text-2xl font-black text-foreground">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {/* Damage & Care Policy */}
              <label className="flex items-start gap-3 p-3 bg-muted/30 border border-border/40 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="w-4 h-4 rounded mt-0.5 text-primary border-border focus:ring-primary/20 accent-primary cursor-pointer"
                />
                <span className="text-xs text-muted-foreground leading-normal">
                  I agree that transactions and deposits are settled directly between students. I will return the outfit clean and on time as per handover terms.
                </span>
              </label>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                disabled={!agreedToPolicy || isProcessing}
                className={`w-full py-4 rounded-2xl text-sm font-black tracking-wide transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  agreedToPolicy && !isProcessing
                    ? 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-primary/20 active:scale-98'
                    : 'bg-muted text-muted-foreground border border-border/40 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                    Securing Vibe...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Confirm Booking & Reserve Vibe
                  </>
                )}
              </button>

              <div className="flex justify-center items-center gap-2.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                <span>🛡️ Verified Student Seller</span>
                <span>•</span>
                <span>🤝 Direct Peer Handover</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6 space-y-6"
            >
              {/* Success Badge */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/25"
                >
                  <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-foreground">
                  Drip Secured! 🎉
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your outfit reservation has been completed. A secure meetup request has been dispatched to {outfit.ownerName}.
                </p>
              </div>

              {/* Visual Ticket Info */}
              <div className="bg-muted/40 border border-border/80 rounded-3xl p-5 text-left space-y-4 max-w-sm mx-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl -z-10" />
                
                <div className="flex justify-between items-start border-b border-border/50 pb-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Meetup Location</p>
                    <p className="text-sm font-extrabold text-foreground mt-0.5">{outfit.hostel}</p>
                    <p className="text-[10px] text-emerald-500 font-bold mt-0.5">Seller: {outfit.ownerName}</p>
                  </div>
                  
                  {/* QR code logo */}
                  <div className="p-2 bg-background border border-border rounded-xl">
                    <QrCode className="w-7 h-7 text-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Duration</p>
                    <p className="text-foreground mt-0.5">{rentDays} Days</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Handover Code</p>
                    <p className="text-primary font-black mt-0.5 uppercase">FIT-{Math.floor(1000 + Math.random() * 9000)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-primary bg-primary/10 border border-primary/20 p-2.5 rounded-xl font-bold">
                  <Shield className="w-4 h-4 flex-shrink-0 animate-pulse" />
                  <span>Dry-cleaning & hygiene checked! Rent with complete peace of mind.</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl border border-border hover:bg-muted active:scale-95 transition cursor-pointer"
              >
                Close Receipt
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
