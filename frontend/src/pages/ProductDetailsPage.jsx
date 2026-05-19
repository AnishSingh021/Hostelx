import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, MessageCircle, ChevronLeft, Heart, Eye, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://hostelx-backend-a228.onrender.com/api/products/${id}`);
        const data = await response.json();
        setProduct(data);
        setLikeCount(data.likes?.length || 0);
        setLiked(data.likes?.some(l => l === user?._id || l?._id === user?._id || l?.toString() === user?._id));
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
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
    // Optimistic update — immediately flip the heart
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);

    try {
      const response = await fetch(`https://hostelx-backend-a228.onrender.com/api/products/${id}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!response.ok) {
        // Revert optimistic update if server rejected
        setLiked(prev => !prev);
        setLikeCount(prev => liked ? prev + 1 : prev - 1);
        const err = await response.json();
        console.error('Like error:', err.message);
        return;
      }
      const data = await response.json();
      // Confirm with real server values
      setLiked(data.liked);
      setLikeCount(data.likeCount ?? data.likes?.length ?? 0);
    } catch (error) {
      // Revert on network error
      setLiked(prev => !prev);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
      console.error('Like network error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-4xl p-8">
          <div className="animate-pulse bg-muted rounded-2xl h-80 w-full" />
          <div className="animate-pulse bg-muted rounded-xl h-6 w-1/2" />
          <div className="animate-pulse bg-muted rounded-xl h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (!product || product.message) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-muted-foreground">
        Product not found
      </div>
    );
  }

  const isSeller = product.seller._id === user?._id || product.seller._id?.toString() === user?._id;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/marketplace" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition cursor-pointer">
          <ChevronLeft className="w-5 h-5" /> Back
        </Link>
        <div className="flex items-center gap-2">
          {/* Like button */}
          <motion.button
            onClick={handleToggleLike}
            whileTap={{ scale: 0.8 }}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <motion.div animate={{ scale: liked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
              <Heart
                className={`w-6 h-6 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
              />
            </motion.div>
            {likeCount > 0 && <span className="text-sm font-medium">{likeCount}</span>}
          </motion.button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-muted border border-border">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                src={product.images[activeImage]}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition cursor-pointer ${activeImage === index ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium px-3 py-1 bg-secondary text-secondary-foreground rounded-full">
                {product.category}
              </span>
              <span className="text-sm font-medium px-3 py-1 bg-muted text-muted-foreground rounded-full capitalize">
                {product.condition}
              </span>
              {product.status === 'sold' && (
                <span className="text-sm font-medium px-3 py-1 bg-destructive/10 text-destructive rounded-full">
                  Sold
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-3xl font-extrabold text-primary">₹{product.price.toLocaleString()}</p>
            </div>

            {/* Stats row */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> {product.views || 0} views
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-400" /> {likeCount} saved
              </span>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-base mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-sm">
                {product.description}
              </p>
            </div>

            {/* Seller Card */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-base mb-4">Seller</h3>
              <div className="flex items-center gap-4 mb-5">
                <img
                  src={product.seller.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                  alt={product.seller.name}
                  className="w-14 h-14 rounded-full object-cover border border-border"
                />
                <div>
                  <h4 className="font-bold text-lg">{product.seller.name}</h4>
                  <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {product.seller.hostel}
                    {product.seller.room && ` · Room ${product.seller.room}`}
                  </p>
                </div>
              </div>

              {/* Only show Chat if not the seller */}
              {!isSeller ? (
                <button
                  onClick={handleStartChat}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" /> Chat with Seller
                </button>
              ) : (
                <Link
                  to={`/edit-item/${product._id}`}
                  className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-3 rounded-xl font-semibold hover:opacity-80 transition"
                >
                  Manage this Listing
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
