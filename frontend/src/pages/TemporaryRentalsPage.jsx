import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  RotateCcw, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Info, 
  Clock, 
  Check, 
  Plus, 
  BookOpen, 
  Gamepad, 
  Tv, 
  Camera, 
  Music, 
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Mock high-value rental inventory
const RENTAL_INVENTORY = [
  {
    id: 'rent-1',
    title: 'Casio fx-991EX ClassWiz Calculator',
    category: 'Study Tools',
    icon: <BookOpen className="w-5 h-5 text-pink-500" />,
    dailyRate: 20,
    weeklyRate: 90,
    securityDeposit: 'Collateral ID Card',
    owner: 'Rohan Gupta',
    hostel: 'Satpura Block',
    room: 'Room 208',
    description: 'Perfect for engineering mathematics, matrices, and stats papers. Batteries are freshly replaced.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'rent-2',
    title: 'LG 24" IPS Full HD Gaming Monitor',
    category: 'Electronics',
    icon: <Tv className="w-5 h-5 text-violet-500" />,
    dailyRate: 150,
    weeklyRate: 600,
    securityDeposit: '₹1,500 Refundable Cash',
    owner: 'Sneha P.',
    hostel: 'Nilgiri Block',
    room: 'Room 412',
    description: '75Hz refresh rate screen with HDMI cord. Ideal for temporary gaming fests or late night coding hackathons.',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'rent-3',
    title: 'White Unisex Chemistry Lab Coat (L)',
    category: 'Lab Gear',
    icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
    dailyRate: 10,
    weeklyRate: 40,
    securityDeposit: 'No Deposit Required',
    owner: 'Priyanka Sen',
    hostel: 'Nilgiri Block',
    room: 'Room 204',
    description: 'Clean, ironed laboratory coat. Has dual pocket slots. Must return dry and clean.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'rent-4',
    title: 'Sony PlayStation 5 Console (Disc)',
    category: 'Gaming',
    icon: <Gamepad className="w-5 h-5 text-sky-500" />,
    dailyRate: 400,
    weeklyRate: 1800,
    securityDeposit: '₹4,000 Refundable Cash',
    owner: 'Vikram Aditya',
    hostel: 'Aravali Block',
    room: 'Room 108',
    description: 'Includes 2 DualSense wireless controllers, HDMI 2.1 cable, preloaded games like FIFA 24, Spider-Man 2.',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'rent-5',
    title: 'JBL PartyBox 110 Portable Speaker',
    category: 'Entertainment',
    icon: <Music className="w-5 h-5 text-rose-500" />,
    dailyRate: 250,
    weeklyRate: 1100,
    securityDeposit: 'College ID Card',
    owner: 'Rahul Sharma',
    hostel: 'Satpura Block',
    room: 'Room 102',
    description: '160W explosive sound with dynamic light show synced to beats. Batteries survive 12 hours.',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'rent-6',
    title: 'Canon EOS 1500D DSLR Camera',
    category: 'Electronics',
    icon: <Camera className="w-5 h-5 text-amber-500" />,
    dailyRate: 300,
    weeklyRate: 1200,
    securityDeposit: '₹3,000 Refundable Cash',
    owner: 'Gautam Kumar',
    hostel: 'Shivalik Block',
    room: 'Room 312',
    description: 'Equipped with 18-55mm IS II kit lens, 64GB ultra memory card, charger, and dynamic neck strap.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60'
  }
];

export default function TemporaryRentalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [toastMessage, setToastMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Rental Calculation State
  const [rentDays, setRentDays] = useState(3);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // Returns warnings list
  const RENTAL_ALERTS = [
    {
      id: 'a-1',
      type: 'warning',
      text: '⚠️ Midterm exams ending soon! Ensure all Casio scientific calculators are returned by next Friday to prevent collateral lock issues.'
    },
    {
      id: 'a-2',
      type: 'promo',
      text: '🎮 Weekend campus cultural fests incoming! Pre-book JBL PartyBox speakers 48 hours early to avoid dynamic peak surcharges.'
    }
  ];

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Helper to calculate pricing dynamically
  // If days >= 7, calculate week bundles first then remaining days
  const calculateTotalCost = (item, days) => {
    if (!item) return 0;
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    
    // Check if week-tier is cheaper or standard calculation
    const total = (weeks * item.weeklyRate) + (remainingDays * item.dailyRate);
    return total;
  };

  const handleOpenRentalCalculator = (item) => {
    setSelectedItem(item);
    setRentDays(3);
  };

  const handleConfirmRentalOrder = () => {
    const cost = calculateTotalCost(selectedItem, rentDays);
    triggerToast(`🎉 Booking request submitted! Total: ₹${cost} for ${rentDays} days. Owner ${selectedItem.owner} alerted.`);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative pb-16">
      {/* Pink styling gradient ambient */}
      <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-pink-500/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-violet-500/5 rounded-full blur-[100px] -z-10" />

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
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Temporary Rentals
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 bg-pink-500/10 text-pink-500 border border-pink-500/20 rounded-full">
                HIRE DEPOT
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold">Scientific calculators, monitors, gaming and equipment hire</p>
          </div>
        </div>

        <Link 
          to="/sell?listingType=rent"
          className="flex items-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-pink-500/20 cursor-pointer active:scale-95 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          List Rental
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Dynamic Alerts Banner Stack */}
        <div className="space-y-2.5">
          {RENTAL_ALERTS.map((alert) => (
            <div 
              key={alert.id}
              className={`p-3.5 border rounded-2xl text-[11px] font-bold flex items-center gap-2.5 shadow-sm ${
                alert.type === 'warning' 
                  ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' 
                  : 'bg-pink-500/10 border-pink-500/25 text-pink-400'
              }`}
            >
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{alert.text}</span>
            </div>
          ))}
        </div>

        {/* Main Concept Header */}
        <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-pink-950/20 via-card to-indigo-950/10 border border-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              Duration-Based Rentals
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Rent Gadgets & Equipment</h1>
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed font-medium">
              Don't shell out thousands for a scientific calculator you only need for one semester exam, or a PS5 for just a weekend wing gathering. Rent securely from fellow campus mates on a daily or weekly basis.
            </p>
          </div>

          <div className="bg-card border border-border/80 p-4.5 rounded-2xl flex items-center gap-3.5 max-w-xs self-start md:self-auto shadow-sm">
            <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl flex-shrink-0">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-foreground font-sans">Collateral Secure Lock</h4>
              <p className="text-[9px] text-muted-foreground leading-normal font-semibold">
                Rentals specify security requirements (refundable deposits or student IDs) for maximum asset protection.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Selection Matrix Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
            <div>
              <h3 className="font-extrabold text-xl tracking-tight">Active Campus Rentals</h3>
              <p className="text-xs text-muted-foreground">Select high-necessity items with standard daily / weekly rental structures</p>
            </div>
            <span className="text-[10px] font-bold text-pink-500 bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-lg">RATE MATRIX</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RENTAL_INVENTORY.map((item) => (
              <div 
                key={item.id}
                className="bg-card border border-border rounded-3xl p-5 shadow-md flex flex-col justify-between hover:shadow-xl hover:border-pink-500/25 transition-all duration-300 group"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-muted/40 border border-border mb-4">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-500" 
                    />
                    
                    {/* Security Deposit preference tag */}
                    <span className="absolute top-3 left-3 bg-card/90 backdrop-blur text-[8.5px] font-black px-2 py-0.5 rounded-lg border border-border text-foreground uppercase flex items-center gap-1 shadow-sm">
                      🛡️ Deposit: {item.securityDeposit}
                    </span>
                  </div>

                  {/* Header info */}
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 bg-muted rounded-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-foreground group-hover:text-pink-500 transition line-clamp-1">{item.title}</h4>
                      <p className="text-[9px] text-muted-foreground font-bold">{item.hostel} · Room {item.room}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mt-3.5 font-semibold">{item.description}</p>
                  
                  {/* Rate comparison metrics */}
                  <div className="grid grid-cols-2 gap-3 mt-4 bg-muted/40 border border-border p-3 rounded-2xl">
                    <div className="text-center border-r border-border">
                      <p className="text-[8.5px] text-muted-foreground uppercase font-black">Daily Rate</p>
                      <p className="text-base font-black text-foreground mt-0.5">₹{item.dailyRate}<span className="text-[10px] text-muted-foreground font-semibold">/day</span></p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8.5px] text-muted-foreground uppercase font-black">Weekly Tier</p>
                      <p className="text-base font-black text-pink-500 mt-0.5">₹{item.weeklyRate}<span className="text-[10px] text-pink-500 font-semibold">/week</span></p>
                    </div>
                  </div>
                </div>

                {/* Footer details */}
                <div className="pt-4 border-t border-border mt-5.5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Owner</p>
                    <p className="text-xs font-black text-foreground">{item.owner}</p>
                  </div>

                  <button 
                    onClick={() => handleOpenRentalCalculator(item)}
                    className="px-4.5 py-2.5 bg-foreground text-background hover:opacity-95 text-xs font-black rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" /> Book & Plan
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

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

      {/* Booking Calendar Cost Calculator Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-3xl p-6 backdrop-blur-lg z-10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-500/15 text-pink-500 rounded-xl">
                  <Calendar className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Booking Rental Planner</h3>
                  <p className="text-[10px] text-muted-foreground">Select days & estimate dynamic tier fees</p>
                </div>
              </div>

              <div className="border-t border-b border-border py-4.5 space-y-4 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset Selected:</span>
                  <span className="text-foreground">{selectedItem.title}</span>
                </div>
                
                {/* Form selectors */}
                <div className="space-y-3 bg-muted/40 p-4 rounded-2xl border border-border">
                  
                  {/* Start Date */}
                  <div>
                    <label className="block text-[8.5px] font-black uppercase text-muted-foreground mb-1">Select Rental Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
                    />
                  </div>

                  {/* Hire duration */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8.5px] font-black text-muted-foreground uppercase">
                      <span>Rent Duration</span>
                      <span className="text-pink-500 font-extrabold">{rentDays} Days</span>
                    </div>
                    
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={rentDays}
                      onChange={(e) => setRentDays(Number(e.target.value))}
                      className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                    
                    <div className="flex justify-between text-[8.5px] text-muted-foreground font-black tracking-wider uppercase">
                      <span>1 Day</span>
                      <span>7 Days (Week Discount)</span>
                      <span>30 Days (Max)</span>
                    </div>
                  </div>

                </div>

                {/* Rental calculations */}
                <div className="space-y-2 border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rental Cost:</span>
                    <span className="text-foreground font-extrabold">₹{calculateTotalCost(selectedItem, rentDays)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security Deposit:</span>
                    <span className="text-foreground font-extrabold">{selectedItem.securityDeposit}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-border">
                    <span className="text-sm font-black text-foreground">Total Estimate:</span>
                    <span className="text-xl font-black text-pink-500">₹{calculateTotalCost(selectedItem, rentDays)}</span>
                  </div>
                </div>

              </div>

              {/* Warning Alert */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl text-[9px] font-black leading-relaxed flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Return reminder is automatically configured. Rented assets must be returned in the original working condition to unlock collateral or cash deposits.</span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="py-2.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl border border-border hover:bg-muted transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmRentalOrder}
                  className="py-2.5 bg-pink-500 text-white text-xs font-black rounded-xl hover:bg-pink-600 transition cursor-pointer"
                >
                  Book Hire
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
