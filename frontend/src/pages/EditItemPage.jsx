import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { UploadCloud, X, CheckCircle, ChevronLeft } from 'lucide-react';

export default function EditItemPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  
  const [existingImages, setExistingImages] = useState([]); // URLs from DB
  const [newImages, setNewImages] = useState([]); // File objects
  const [previewUrls, setPreviewUrls] = useState([]); // local blob URLs
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    status: ''
  });

  const categories = ['Electronics', 'Books', 'Cycle', 'Mattress', 'Gaming', 'Kitchen', 'Fashion', 'Notes', 'Accessories', 'Others'];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          // If not the seller, redirect
          if (data.seller._id !== user._id) {
            navigate('/my-listings');
            return;
          }
          
          setFormData({
            title: data.title,
            description: data.description,
            price: data.price,
            category: data.category,
            condition: data.condition,
            status: data.status
          });
          setExistingImages(data.images || []);
        }
      } catch (error) {
        console.error('Error fetching product for edit:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id, user._id, navigate]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newImages.length + existingImages.length > 5) {
      alert('You can only upload a maximum of 5 images total.');
      return;
    }
    
    setNewImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingImages.length === 0 && newImages.length === 0) {
      alert('Please have at least one image.');
      return;
    }

    setLoading(true);
    
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('condition', formData.condition);
      submitData.append('status', formData.status);
      // Pass existing image URLs so the backend can preserve them
      submitData.append('existingImages', JSON.stringify(existingImages));
      // Append any new image files
      newImages.forEach(img => submitData.append('images', img));

      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: submitData
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/my-listings'), 2000);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 relative">
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-card border border-border p-8 rounded-3xl shadow-2xl flex flex-col items-center"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}>
                <CheckCircle className="w-24 h-24 text-primary mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold">Updated Successfully!</h2>
              <p className="text-muted-foreground mt-2">Redirecting to your listings...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto">
        <Link to="/my-listings" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to My Listings
        </Link>
        <h1 className="text-3xl font-bold mb-8">Edit Listing</h1>
        
        <form onSubmit={handleSubmit} className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-sm space-y-6">
          
          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">Product Images (Max 5)</label>
            <div className="flex flex-wrap gap-4">
              {/* Existing Images */}
              {existingImages.map((url, index) => (
                <div key={`exist-${index}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border opacity-80">
                  <img src={url} alt="Existing" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full shadow-sm">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {/* New Previews */}
              {previewUrls.map((url, index) => (
                <div key={`new-${index}`} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-primary">
                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full shadow-sm">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {(existingImages.length + newImages.length) < 5 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground rounded-xl cursor-pointer hover:bg-muted/50 transition">
                  <UploadCloud className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea required rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <select value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none">
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-primary font-semibold">
                <option value="available">Available</option>
                <option value="sold">Mark as Sold</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition mt-4">
            {loading ? 'Saving Changes...' : 'Update Ad'}
          </button>
        </form>
      </div>
    </div>
  );
}
