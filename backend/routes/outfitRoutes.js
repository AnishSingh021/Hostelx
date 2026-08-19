const express = require('express');
const router = express.Router();
const { uploadOutfit, getOutfits, requestRental, getMyRequests, updateRequestStatus } = require('../controllers/outfitController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

router.get('/', getOutfits);
router.post('/', protect, upload.single('image'), uploadOutfit);

router.get('/requests', protect, getMyRequests);
router.put('/requests/:id', protect, updateRequestStatus);

router.post('/:id/rent', protect, requestRental);

module.exports = router;
