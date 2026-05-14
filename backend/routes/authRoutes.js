const express = require('express');
const router = express.Router();
const { googleLogin, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/google', googleLogin);
router.put('/profile', protect, updateProfile);

module.exports = router;
