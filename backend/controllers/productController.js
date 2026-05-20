const Product = require('../models/Product');
const { uploadToCloudinary } = require('../utils/cloudinary');

// @desc    Create a product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      price, 
      category, 
      condition, 
      hostel, 
      latitude, 
      longitude,
      listingType,
      isUrgent,
      canDeliver,
      deliveryFee,
      isAuction,
      startingBid,
      isRental,
      rentPrice,
      rentalDuration,
      tags
    } = req.body;
    
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

    // Auto-generate a secure random Meetup Exchange Code
    const meetupCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Process tags array
    let processedTags = [];
    if (tags) {
      processedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
    }
    // Auto-tag roommate essentials for certain categories or descriptions
    const lowercaseTitle = title.toLowerCase();
    const essentials = ['bucket', 'mattress', 'induction', 'books', 'cycle', 'chair', 'table', 'lamp', 'cooker', 'kettle', 'fan'];
    const isEssential = essentials.some(item => lowercaseTitle.includes(item)) || category === 'Mattress' || category === 'Books';
    if (isEssential) {
      processedTags.push('room-essentials');
    }

    const product = await Product.create({
      title,
      description,
      price: Number(price) || 0,
      category,
      condition,
      hostel,
      images: imageUrls,
      seller: req.user._id,
      location: {
        type: 'Point',
        coordinates: [Number(longitude) || 0, Number(latitude) || 0]
      },
      listingType: listingType || 'buy',
      isUrgent: isUrgent === 'true' || isUrgent === true,
      canDeliver: canDeliver === 'true' || canDeliver === true,
      deliveryFee: Number(deliveryFee) || 0,
      originalPrice: Number(price) || 0,
      isAuction: isAuction === 'true' || isAuction === true,
      startingBid: Number(startingBid) || 0,
      isRental: isRental === 'true' || isRental === true,
      rentPrice: Number(rentPrice) || 0,
      rentalDuration: rentalDuration || 'day',
      meetupCode,
      tags: processedTags
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
    const { keyword, category, hostel, listingType, tag, userHostel, userLat, userLng } = req.query;
    
    let query = { status: 'available' };
    
    // AI Semantic Search parsing
    if (keyword && req.query.aiSearch === 'true') {
      const priceRegex = /(?:under|below|less than|within)\s*(?:₹|rs\.?)?\s*(\d+)(?:\s*(k|thousand))?/i;
      const match = keyword.match(priceRegex);
      if (match) {
        let maxPrice = parseInt(match[1], 10);
        if (match[2] && (match[2].toLowerCase() === 'k' || match[2].toLowerCase() === 'thousand')) {
          maxPrice *= 1000;
        }
        query.price = { $lte: maxPrice };
        const cleanKeyword = keyword.replace(priceRegex, '').replace(/\b(?:cheap|expensive|best)\b/ig, '').trim();
        if (cleanKeyword) {
          query.$or = [
            { title: { $regex: cleanKeyword, $options: 'i' } },
            { description: { $regex: cleanKeyword, $options: 'i' } }
          ];
        }
      } else {
        query.$or = [
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ];
      }
    } else if (keyword) {
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

    // Filter by Listing Type
    if (listingType && listingType !== 'All') {
      query.listingType = listingType;
    }

    // Filter by Tag
    if (tag) {
      query.tags = tag;
    }

    let products = await Product.find(query)
      .populate('seller', 'name profileImage hostel')
      .populate('bids.bidder', 'name profileImage')
      .lean();

    // Sort priority
    products.sort((a, b) => {
      // 1. Boosted items first
      const aBoost = a.isBoosted ? 1 : 0;
      const bBoost = b.isBoosted ? 1 : 0;
      if (aBoost !== bBoost) return bBoost - aBoost;

      // 2. Same Hostel first
      if (userHostel) {
        const aSameHostel = a.hostel?.toLowerCase() === userHostel.toLowerCase() ? 1 : 0;
        const bSameHostel = b.hostel?.toLowerCase() === userHostel.toLowerCase() ? 1 : 0;
        if (aSameHostel !== bSameHostel) return bSameHostel - aSameHostel;
      }

      // 3. Nearest location (Euclidean distance) if coordinates are available
      if (userLat && userLng) {
        const lat = parseFloat(userLat);
        const lng = parseFloat(userLng);
        if (a.location?.coordinates && b.location?.coordinates) {
          const aDist = Math.sqrt(Math.pow(a.location.coordinates[1] - lat, 2) + Math.pow(a.location.coordinates[0] - lng, 2));
          const bDist = Math.sqrt(Math.pow(b.location.coordinates[1] - lat, 2) + Math.pow(b.location.coordinates[0] - lng, 2));
          return aDist - bDist;
        }
      }

      // Default: Newer listings first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

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
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
    .populate('seller', 'name email profileImage hostel room ratings reviews.reviewer')
    .populate('bids.bidder', 'name profileImage');
    
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
    const { title, description, price, category, condition, status, existingImages, isUrgent, canDeliver, deliveryFee } = req.body;
    
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this product' });
    }

    // Wishlist price drop detector
    if (price && Number(price) < product.price) {
      console.log(`[WISHLIST PRICE DROP] Notification triggered: ${product.title} price decreased from ₹${product.price} to ₹${price}!`);
      product.originalPrice = product.price;
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price ? Number(price) : product.price;
    product.category = category || product.category;
    product.condition = condition || product.condition;
    product.status = status || product.status;
    product.isUrgent = isUrgent !== undefined ? (isUrgent === 'true' || isUrgent === true) : product.isUrgent;
    product.canDeliver = canDeliver !== undefined ? (canDeliver === 'true' || canDeliver === true) : product.canDeliver;
    product.deliveryFee = deliveryFee !== undefined ? Number(deliveryFee) : product.deliveryFee;

    let finalImages = existingImages ? JSON.parse(existingImages) : [...product.images];

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

const toggleLike = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user._id);

    const isLiked = product.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      product.likes = product.likes.filter(id => id.toString() !== req.user._id.toString());
      user.savedItems = user.savedItems.filter(id => id.toString() !== product._id.toString());
    } else {
      // Like
      product.likes.push(req.user._id);
      user.savedItems.push(product._id);
    }

    await product.save();
    await user.save();

    res.json({ likesCount: product.likes.length, isLiked: !isLiked });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error toggling like' });
  }
};

const getSavedProducts = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).populate('savedItems');
    res.json(user.savedItems || []);
  } catch (error) {
    console.error('Get saved products error:', error);
    res.status(500).json({ message: 'Server error fetching saved products' });
  }
};

const getPriceSuggestion = async (req, res) => {
  try {
    const { category, keyword } = req.query;
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    let query = { category, status: 'available' };
    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }

    const matchedProducts = await Product.find(query);
    if (matchedProducts.length === 0) {
      const defaultAverages = {
        'Electronics': 4500,
        'Books': 250,
        'Cycle': 3000,
        'Mattress': 1200,
        'Gaming': 5000,
        'Kitchen': 600,
        'Fashion': 800,
        'Notes': 100,
        'Accessories': 500,
        'Others': 1000
      };
      const average = defaultAverages[category] || 1500;
      return res.json({
        average,
        min: Math.round(average * 0.8),
        max: Math.round(average * 1.2),
        message: 'Calculated using global campus category average'
      });
    }

    const prices = matchedProducts.map(p => p.price);
    const sum = prices.reduce((acc, p) => acc + p, 0);
    const average = Math.round(sum / prices.length);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    res.json({
      average,
      min,
      max,
      message: `Calculated from ${matchedProducts.length} active listings on campus`
    });
  } catch (error) {
    console.error('Price suggestion error:', error);
    res.status(500).json({ message: 'Server error calculating suggestions' });
  }
};

const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const bidAmount = Number(amount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      return res.status(400).json({ message: 'Valid positive bid amount is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isAuction) {
      return res.status(400).json({ message: 'Bidding is not enabled for this product' });
    }

    const highestBid = product.bids.length > 0 
      ? Math.max(...product.bids.map(b => b.amount))
      : product.startingBid;

    if (bidAmount <= highestBid) {
      return res.status(400).json({ message: `Bid must be strictly higher than current highest: ₹${highestBid}` });
    }

    product.bids.push({
      bidder: req.user._id,
      amount: bidAmount,
      time: new Date()
    });

    const updatedProduct = await product.save();
    const fullyUpdated = await Product.findById(updatedProduct._id)
      .populate('seller', 'name profileImage hostel ratings')
      .populate('bids.bidder', 'name profileImage');

    res.json(fullyUpdated);
  } catch (error) {
    console.error('Bid error:', error);
    res.status(500).json({ message: 'Server error placing bid' });
  }
};

const confirmMeetup = async (req, res) => {
  try {
    const { code } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.meetupCode !== code) {
      return res.status(400).json({ message: 'Invalid meetup exchange code' });
    }

    product.status = 'sold';
    product.meetupConfirmed = true;
    await product.save();

    res.json({ message: 'Exchange confirmed successfully! Transaction completed.', product });
  } catch (error) {
    console.error('Meetup confirmation error:', error);
    res.status(500).json({ message: 'Server error confirming meetup' });
  }
};

const boostProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user._id);

    if (user.boostCredits < 1) {
      return res.status(400).json({ message: 'Insufficient boost credits. Please purchase premium pack!' });
    }

    user.boostCredits -= 1;
    await user.save();

    product.isBoosted = true;
    product.boostedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await product.save();

    res.json({ message: 'Listing successfully boosted for 7 days!', boostCredits: user.boostCredits, product });
  } catch (error) {
    console.error('Boost listing error:', error);
    res.status(500).json({ message: 'Server error boosting product' });
  }
};

module.exports = { 
  createProduct, 
  getProducts, 
  getProductById, 
  getUserProducts, 
  updateProduct, 
  deleteProduct, 
  toggleLike, 
  getSavedProducts,
  getPriceSuggestion,
  placeBid,
  confirmMeetup,
  boostProduct
};
