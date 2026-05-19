import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, MapPin, CheckCircle } from 'lucide-react';


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
  });

  const categories = ['Electronics', 'Books', 'Cycle', 'Mattress', 'Gaming', 'Kitchen', 'Fashion', 'Notes', 'Accessories', 'Others'];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('You can only upload a maximum of 5 images');
      return;
    }
    
    setImages(prev => [...prev, ...files]);
    
    // Create preview URLs
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
    submitData.append('price', formData.price);
    submitData.append('category', formData.category);
    submitData.append('condition', formData.condition);
    submitData.append('hostel', formData.hostel);
    
    images.forEach(img => {
      submitData.append('images', img);
    });

    try {
      const response = await fetch('https://hostelx-backend.onrender.com/api/products', {
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
        }, 2000); // Wait 2 seconds so the user can see the animation
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
              className="bg-card border border-border p-8 rounded-3xl shadow-2xl flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
              >
                <CheckCircle className="w-24 h-24 text-primary mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold">Ad Posted Successfully!</h2>
              <p className="text-muted-foreground mt-2">Redirecting to marketplace...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sell an Item</h1>
        
        <form onSubmit={handleSubmit} className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-sm space-y-6">
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Product Images (Max 5)</label>
            <div className="flex flex-wrap gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground rounded-xl cursor-pointer hover:bg-muted/50 transition">
                  <UploadCloud className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input 
                type="text" required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. MacBook Air M1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input 
                type="number" required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. 50000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              required rows="4"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
              placeholder="Describe the item, condition, and any defects..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <select 
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hostel</label>
              <input 
                type="text" required
                value={formData.hostel}
                onChange={(e) => setFormData({...formData, hostel: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition mt-4"
          >
            {loading ? 'Uploading & Listing...' : 'Post Ad'}
          </button>
        </form>
      </div>
    </div>
  );
}
