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

    res.json({
      counts: {
        users: userCount,
        products: productCount,
        chats: chatCount
      },
      recentUsers,
      recentProducts
    });
  } catch (error) {
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
