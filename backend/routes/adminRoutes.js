const express = require('express');
const router = express.Router();
const { getAdminStats, deleteProductAdmin } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/stats').get(protect, admin, getAdminStats);
router.route('/product/:id').delete(protect, admin, deleteProductAdmin);

module.exports = router;
