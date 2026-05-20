import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, MessageCircle, ChevronLeft, Heart, Eye, Sparkles, Truck, Clock, Hammer, ShieldCheck, Star, Send, ArrowRight, ShieldAlert, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Advanced features states
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [handoverCode, setHandoverCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [meetupSuccess, setMeetupSuccess] = useState(false);

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  const fetchProduct = async () => {
    try {
      const response = await fetch(`https://hostelx-backend-a228.onrender.com/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setLikeCount(data.likes?.length || 0);
        setLiked(data.likes?.some(l => l === user?._id || l?._id === user?._id || l?.toString() === user?._id));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id, user?._id]);

  const handleStartChat = async () => {
    try {
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ userId: product.seller._id, productId: product._id })
      });
      if (response.ok) navigate('/chat');
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const handleToggleLike = async () => {
    if (!user) return navigate('/auth');
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);

    try {
      const response = await fetch(`https://hostelx-backend-a228.onrender.com/api/products/${id}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!response.ok) {
        setLiked(prev => !prev);
        setLikeCount(prev => liked ? prev + 1 : prev - 1);
        return;
      }
      const data = await response.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount ?? data.likes?.length ?? 0);
    } catch (error) {
      setLiked(prev => !prev);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
      console.error('Like network error:', error);
    }
  };

  // Place a Bid (Auctions)
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!bidAmount || isNaN(bidAmount) || Number(bidAmount) <= 0) {
      alert('Please enter a valid positive number');
      return;
    }

    setBidLoading(true);
    try {
      const response = await fetch(`https://hostelx-backend-a228.onrender.com/api/products/${id}/bid`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ amount: Number(bidAmount) })
      });

      const data = await response.json();
      if (response.ok) {
        setProduct(data);
        setBidAmount('');
        alert('Bid placed successfully! 🔨');
      } else {
        alert(data.message || 'Failed to place bid');
      }
    } catch (error) {
      console.error('Bid submit error:', error);
      alert('Failed to submit bid due to connection issues.');
    } finally {
      setBidLoading(false);
    }
  };

  // Confirm Meetup Exchange
  const handleConfirmMeetup = async () => {
    if (!handoverCode || handoverCode.length !== 6) {
      alert('Please enter the complete 6-digit exchange code');
      return;
    }

    setVerifyingCode(true);
    try {
      const response = await fetch(`https://hostelx-backend-a228.onrender.com/api/products/${id}/meetup-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ code: handoverCode })
      });

      const data = await response.json();
      if (response.ok) {
        setMeetupSuccess(true);
        setProduct(prev => ({ ...prev, status: 'sold', meetupConfirmed: true }));
        setTimeout(() => setMeetupSuccess(false), 3000);
      } else {
        alert(data.message || 'Invalid exchange code. Try again!');
      }
    } catch (error) {
      console.error('Meetup verification error:', error);
      alert('Meetup confirmation failed.');
    } finally {
      setVerifyingCode(false);
    }
  };

  // Submit trust review for Seller
  const handleAddReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewSuccessMsg('');

    try {
      const response = await fetch('https://hostelx-backend-a228.onrender.com/api/auth/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          userId: product.seller._id,
          rating: Number(reviewRating),
          comment: reviewComment
        })
      });

      const data = await response.json();
      if (response.ok) {
        setReviewSuccessMsg('Trust rating posted successfully! Double stars updated.');
        setReviewComment('');
        // Refresh product to show updated ratings
        fetchProduct();
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Review submit error:', error);
      alert('Failed to save review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-4xl p-8">
          <div className="animate-pulse bg-muted rounded-3xl h-80 w-full" />
          <div className="animate-pulse bg-muted rounded-xl h-6 w-1/2" />
          <div className="animate-pulse bg-muted rounded-xl h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (!product || product.message) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-muted-foreground bg-background">
        Product not found
      </div>
    );
  }

  const isSeller = product.seller._id === user?._id || product.seller._id?.toString() === user?._id;
  const highestBid = product.bids?.length > 0 
    ? Math.max(...product.bids.map(b => b.amount))
    : product.startingBid;

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Handover Success Fireworks */}
      <AnimatePresence>
        {meetupSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card border border-border p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center"
            >
              <Award className="w-20 h-20 text-emerald-500 mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-emerald-500">Transaction Confirmed!</h2>
              <p className="text-muted-foreground mt-2">Secure handover verified. Listing has been marked as completed/sold!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky top bar */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/marketplace" className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition cursor-pointer">
          <ChevronLeft className="w-5 h-5" /> Browse Marketplace
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Like button */}
          <motion.button
            onClick={handleToggleLike}
            whileTap={{ scale: 0.8 }}
            className="flex items-center gap-1.5 cursor-pointer bg-card border border-border px-3 py-1.5 rounded-xl hover:bg-muted"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${liked ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`}
            />
            {likeCount > 0 && <span className="text-xs font-bold">{likeCount}</span>}
          </motion.button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Wishlist Price Drop Alert */}
        {product.originalPrice && product.originalPrice > product.price && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3 text-emerald-600 dark:text-emerald-400 mb-6"
          >
            <Sparkles className="w-5 h-5 mt-0.5 animate-pulse" />
            <div>
              <span className="text-sm font-bold block">Wishlist Price Drop Alert! 🔥</span>
              <span className="text-xs">
                This item is now listed for <strong className="text-foreground font-black">₹{product.price}</strong>, which is <strong>₹{product.originalPrice - product.price} cheaper</strong> than its original price of ₹{product.originalPrice}! Take advantage of this semester savings deal.
              </span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Column 1: Images */}
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-3xl overflow-hidden bg-muted border border-border relative">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                src={product.images[activeImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {product.isUrgent && (
                <span className="absolute top-4 left-4 bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider animate-pulse shadow-md z-[1]">
                  Urgent Sale ⚡
                </span>
              )}
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition cursor-pointer ${
                      activeImage === index ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Details & Panels */}
          <div className="space-y-6">
            
            {/* Headers, pricing */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-bold px-3 py-1.5 bg-primary/10 text-primary rounded-xl uppercase tracking-wider">
                  {product.category}
                </span>
                <span className="text-xs font-bold px-3 py-1.5 bg-muted text-muted-foreground rounded-xl capitalize">
                  Condition: {product.condition}
                </span>
                {product.status === 'sold' && (
                  <span className="text-xs font-bold px-3 py-1.5 bg-rose-500 text-white rounded-xl uppercase tracking-wide">
                    Sold / Completed
                  </span>
                )}
                {product.isAuction && (
                  <span className="text-xs font-bold px-3 py-1.5 bg-amber-500 text-white rounded-xl uppercase tracking-wide flex items-center gap-1">
                    <Hammer className="w-3.5 h-3.5" /> Bidding Live
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight leading-tight">{product.title}</h1>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-primary">₹{product.price}</span>
                  {product.listingType === 'rent' && (
                    <span className="text-sm font-bold text-muted-foreground">/ {product.rentalDuration}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-4 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> {product.views || 0} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" /> {likeCount} saves
                </span>
              </div>
            </div>

            {/* Support Systems (Delivery/Rental Guides) */}
            {(product.canDeliver || product.listingType === 'rent') && (
              <div className="space-y-2.5">
                {product.canDeliver && (
                  <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-2xl flex gap-3 text-sm">
                    <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-primary block">Student Delivery Available 📦</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        This seller offers to deliver the item right inside your hostel room for an additional campus service charge of <strong>₹{product.deliveryFee}</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {product.listingType === 'rent' && (
                  <div className="bg-sky-500/5 border border-sky-500/20 p-3.5 rounded-2xl flex gap-3 text-sm">
                    <Clock className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-sky-500 block">
                        {product.rentType === 'seek' ? 'Rental Request Active ⏱' : 'Rental Plan Active ⏱'}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {product.rentType === 'seek'
                          ? `This student is seeking this item on rent for ₹${product.price} per ${product.rentalDuration}. If you have it, you can chat with them directly to fix your deal!`
                          : `You can rent this item on a recurring ${product.rentalDuration}ly schedule. Handover return coordination and deposit options are handled inside the messenger.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2">Item Description</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-sm font-medium">
                {product.description}
              </p>
            </div>

            {/* Auction Bidding Console */}
            {product.isAuction && (
              <div className="bg-card border border-amber-500/20 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-bl-xl text-[10px] font-bold uppercase flex items-center gap-1">
                  <Hammer className="w-3.5 h-3.5 animate-bounce" />
                  Live Auction
                </div>
                
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Bidding Console</h3>
                
                <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border border-border">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Starting Bid</span>
                    <span className="text-lg font-black block">₹{product.startingBid}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-500 uppercase font-bold">Current Highest Bid</span>
                    <span className="text-lg font-black text-amber-500 block">₹{highestBid}</span>
                  </div>
                </div>

                {/* Place a Bid Form */}
                {product.status === 'available' && !isSeller && (
                  <form onSubmit={handlePlaceBid} className="flex gap-2">
                    <div className="relative flex-grow">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
                      <input 
                        type="number" 
                        required
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Min: ₹${highestBid + 1}`}
                        className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-bold"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={bidLoading}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      Place Bid
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}

                {/* Bids Log */}
                {product.bids?.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Bid Logs</span>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2">
                      {product.bids.slice().reverse().map((bid, index) => (
                        <div key={index} className="flex justify-between items-center bg-background/50 px-3 py-2 rounded-lg text-xs border border-border/40">
                          <div className="flex items-center gap-2">
                            <img src={bid.bidder.profileImage} alt="" className="w-5 h-5 rounded-full object-cover" />
                            <span className="font-bold text-foreground">{bid.bidder.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-amber-500">₹{bid.amount}</span>
                            <span className="text-[9px] text-muted-foreground block">{new Date(bid.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-2">No bids placed yet. Be the first one!</p>
                )}
              </div>
            )}

            {/* Secure Meetup & Exchange Code Handover Verification */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Secure Exchange Handover
              </h3>

              {product.status === 'sold' && product.meetupConfirmed ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-2.5 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold block">Secure Handover Confirmed!</span>
                    <span className="text-[11px] leading-normal text-muted-foreground">
                      This transaction is successfully locked and finalized. The secure meetup exchange code coordinates matched perfectly.
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {isSeller ? (
                    <div className="bg-muted/40 border border-border p-4 rounded-xl flex flex-col items-center text-center space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Exchange Code verification token</span>
                      
                      <div className="bg-white p-3 rounded-2xl border-2 border-primary/20 shadow-md">
                        {/* Interactive Vector Mockup QR code */}
                        <svg className="w-28 h-28 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="2" width="6" height="6" rx="1" />
                          <rect x="16" y="2" width="6" height="6" rx="1" />
                          <rect x="2" y="16" width="6" height="6" rx="1" />
                          <rect x="8" y="8" width="8" height="8" rx="1" />
                          <path d="M12 2v4M12 16v4M2 12h4M16 12h6M12 12h.01" strokeWidth="2.5" />
                        </svg>
                      </div>

                      <span className="text-xs font-mono font-black bg-primary/10 text-primary px-3.5 py-1.5 rounded-xl border border-primary/25">
                        EXCHANGE CODE: {product.meetupCode}
                      </span>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        Show this QR code to the buyer during exchange or give them this 6-digit code. Once they verify it on their device, the transaction completes automatically!
                      </p>
                    </div>
                  ) : (
                    <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block text-center">Verify Handover Securely</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength="6"
                          value={handoverCode}
                          onChange={(e) => setHandoverCode(e.target.value.replace(/\D/g, ''))}
                          className="flex-grow px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-center font-mono font-bold tracking-widest text-sm"
                          placeholder="6-digit exchange code"
                        />
                        <button
                          onClick={handleConfirmMeetup}
                          disabled={verifyingCode}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold hover:opacity-90 transition cursor-pointer text-xs"
                        >
                          {verifyingCode ? 'Confirming...' : 'Verify'}
                        </button>
                      </div>
                      <p className="text-[9px] text-muted-foreground text-center">
                        Ask the seller to show their secure exchange code. Input it here at handover to unlock the listing and secure your deal!
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Seller profile card & Review logger */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Seller Coordinates</h3>
              
              <div className="flex items-center gap-4 mb-2">
                <img
                  src={product.seller.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                  alt={product.seller.name}
                  className="w-14 h-14 rounded-full object-cover border border-border"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-lg leading-tight">{product.seller.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-primary flex items-center gap-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {product.seller.hostel} {product.seller.room && `(Room ${product.seller.room})`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      {product.seller.ratings || 0} trust ({product.seller.reviews?.length || 0} ratings)
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat action / Manage action */}
              {!isSeller ? (
                <button
                  onClick={handleStartChat}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" /> 
                  {product.listingType === 'rent' && product.rentType === 'seek' ? 'Offer my Item / Start Chat' : 'Chat with Seller'}
                </button>
              ) : (
                <Link
                  to={`/edit-item/${product._id}`}
                  className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-3 rounded-xl font-semibold hover:opacity-80 transition text-center"
                >
                  Manage this Listing
                </Link>
              )}

              {/* Leave a Seller Review Form */}
              {!isSeller && (
                <div className="border-t border-border pt-4 mt-2 space-y-3.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Rate Seller Trustworthiness</span>
                  
                  {reviewSuccessMsg && (
                    <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl text-center font-bold">
                      {reviewSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleAddReview} className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-muted-foreground mr-1">Trust Score:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/35'}`} />
                        </button>
                      ))}
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Add a trust comment..."
                        className="w-full px-3.5 py-2.5 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-semibold"
                      />
                      <button
                        type="submit"
                        disabled={reviewLoading}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-primary hover:text-primary/80 transition cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Seller Reviews Logs */}
              {product.seller.reviews?.length > 0 && (
                <div className="border-t border-border pt-4">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-2">Seller Trust Reviews</span>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {product.seller.reviews.slice().reverse().map((rev, index) => (
                      <div key={index} className="bg-muted/30 border border-border/40 p-2.5 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Verified Student Reviewer</span>
                          <span className="flex items-center text-[10px] font-bold text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                            {rev.rating}
                          </span>
                        </div>
                        <p className="text-muted-foreground font-medium">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
