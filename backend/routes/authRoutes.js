const express = require('express');
const router = express.Router();
const { googleLogin, updateProfile, addReview } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

router.post('/google', googleLogin);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.post('/review', protect, addReview);

module.exports = router;
