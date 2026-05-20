const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

// GET all products, POST new product (max 5 images)
router.route('/')
  .get(getProducts)
  .post(protect, upload.array('images', 5), createProduct);

// GET price suggestion for category/keyword
router.route('/price-suggestion').get(protect, getPriceSuggestion);

// GET logged in user's products
router.route('/my/listings').get(protect, getUserProducts);

// GET saved (liked) products
router.route('/saved').get(protect, getSavedProducts);

// GET single product
router.route('/:id')
  .get(getProductById)
  .put(protect, upload.array('images', 5), updateProduct)
  .delete(protect, deleteProduct);

// Like / Unlike a product
router.route('/:id/like').put(protect, toggleLike);

// Place a bid on an auction item
router.route('/:id/bid').post(protect, placeBid);

// Confirm meetup with Exchange Code
router.route('/:id/meetup-confirm').post(protect, confirmMeetup);

// Boost listing using credits
router.route('/:id/boost').post(protect, boostProduct);

module.exports = router;
