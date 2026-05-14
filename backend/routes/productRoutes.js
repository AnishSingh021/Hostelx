const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, getUserProducts, updateProduct, deleteProduct, toggleLike, getSavedProducts } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

// GET all products, POST new product (max 5 images)
router.route('/')
  .get(getProducts)
  .post(protect, upload.array('images', 5), createProduct);

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

module.exports = router;
