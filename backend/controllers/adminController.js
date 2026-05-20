const User = require('../models/User');
const Product = require('../models/Product');
const Chat = require('../models/Chat');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const chatCount = await Chat.countDocuments();

    // Get recent users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    
    // Get recent products
    const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5).populate('seller', 'name email');

    // Category Distribution Aggregation
    const categoryData = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Hostel Distribution Aggregation
    const hostelData = await Product.aggregate([
      { $group: { _id: '$hostel', count: { $sum: 1 } } }
    ]);

    // Premium Features Stats
    const boostedCount = await Product.countDocuments({ isBoosted: true });
    const urgentCount = await Product.countDocuments({ isUrgent: true });
    
    // Bidding transaction stats
    const totalBidsCount = await Product.aggregate([
      { $unwind: "$bids" },
      { $count: "count" }
    ]);
    const bidsCount = totalBidsCount.length > 0 ? totalBidsCount[0].count : 0;

    // Delivery metrics
    const deliveryEnabledCount = await Product.countDocuments({ canDeliver: true });

    // Calculate a simulated total platform revenue (e.g. ₹199 per boost, ₹99 per urgent listing)
    const simulatedRevenue = (boostedCount * 199) + (urgentCount * 99);

    res.json({
      counts: {
        users: userCount,
        products: productCount,
        chats: chatCount,
        boosted: boostedCount,
        urgent: urgentCount,
        bids: bidsCount,
        delivery: deliveryEnabledCount,
        revenue: simulatedRevenue
      },
      categoryData,
      hostelData,
      recentUsers,
      recentProducts
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
};

// @desc    Delete a product (Admin)
// @route   DELETE /api/admin/product/:id
// @access  Private/Admin
const deleteProductAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
};

module.exports = { getAdminStats, deleteProductAdmin };
