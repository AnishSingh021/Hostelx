const Product = require('../models/Product');
const { uploadToCloudinary } = require('../utils/cloudinary');

// @desc    Create a product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, hostel, latitude, longitude } = req.body;
    
    // Handle image uploads
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        imageUrls.push(result.secure_url);
      }
    }

    if (imageUrls.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      condition,
      hostel,
      images: imageUrls,
      seller: req.user._id,
      location: {
        type: 'Point',
        coordinates: [Number(longitude) || 0, Number(latitude) || 0]
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// @desc    Get all products (with filtering & distance sorting)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { keyword, category, hostel, sort } = req.query;
    
    let query = { status: 'available' };
    
    // Search
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by Hostel
    if (hostel) {
      query.hostel = hostel;
    }

    let products = await Product.find(query).populate('seller', 'name profileImage hostel').sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc    Get product by ID (and increment view count)
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    // Atomically increment views and return the updated document
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('seller', 'name email profileImage hostel room');
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching product details' });
  }
};

// @desc    Get logged in user products
// @route   GET /api/products/my-listings
// @access  Private
const getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user products' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, status, existingImages } = req.body;
    
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Make sure user is the seller
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this product' });
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price ? Number(price) : product.price;
    product.category = category || product.category;
    product.condition = condition || product.condition;
    product.status = status || product.status;

    // Start with the existing images the user kept
    let finalImages = existingImages ? JSON.parse(existingImages) : [...product.images];

    // Upload any new images to Cloudinary
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        imageUrls.push(result.secure_url);
      }
      finalImages = [...finalImages, ...imageUrls];
    }

    product.images = finalImages;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Make sure user is the seller
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

module.exports = { createProduct, getProducts, getProductById, getUserProducts, updateProduct, deleteProduct };

// @desc    Toggle like/save on a product
// @route   PUT /api/products/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    // First check if already liked
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyLiked = product.likes.some(
      l => l.toString() === req.user._id.toString()
    );

    // Use atomic $pull or $addToSet to avoid race conditions
    const update = alreadyLiked
      ? { $pull: { likes: req.user._id } }
      : { $addToSet: { likes: req.user._id } };

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    res.json({
      liked: !alreadyLiked,
      likeCount: updated.likes.length,
      likes: updated.likes
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error toggling like' });
  }
};

// @desc    Get all products liked/saved by the current user
// @route   GET /api/products/saved
// @access  Private
const getSavedProducts = async (req, res) => {
  try {
    const products = await Product.find({ likes: req.user._id })
      .populate('seller', 'name profileImage hostel')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching saved products' });
  }
};

module.exports = { createProduct, getProducts, getProductById, getUserProducts, updateProduct, deleteProduct, toggleLike, getSavedProducts };
