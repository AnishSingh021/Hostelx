const Outfit = require('../models/Outfit');
const RentalRequest = require('../models/RentalRequest');
const { uploadToCloudinary } = require('../utils/cloudinary');
const mongoose = require('mongoose');

// @desc    Upload a new outfit
// @route   POST /api/outfits
// @access  Private
const uploadOutfit = async (req, res) => {
  try {
    const { title, brand, size, occasion, gender, rentPrice, securityDeposit, description } = req.body;
    
    // Upload image to cloudinary
    let imageUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    } else if (req.body.image) {
      imageUrl = req.body.image; // fallback for data URLs if they send it that way
    }

    const newOutfit = await Outfit.create({
      title,
      brand,
      size,
      occasion,
      gender,
      rentPrice: Number(rentPrice),
      securityDeposit: Number(securityDeposit),
      description,
      image: imageUrl,
      owner: req.user.id
    });

    const populatedOutfit = await Outfit.findById(newOutfit._id).populate('owner', 'name profileImage hostel college');

    res.status(201).json(populatedOutfit);
  } catch (error) {
    console.error('Upload Outfit Error:', error);
    res.status(500).json({ message: 'Failed to upload outfit' });
  }
};

// @desc    Get all outfits (with filters)
// @route   GET /api/outfits
// @access  Public (or Private)
const getOutfits = async (req, res) => {
  try {
    const filter = { availability: true };
    // Optionally add query filters for size, occasion, etc here if passed via req.query
    
    const outfits = await Outfit.find(filter)
      .populate('owner', 'name profileImage hostel college')
      .sort({ createdAt: -1 });
      
    res.json(outfits);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch outfits' });
  }
};

// @desc    Request to rent an outfit
// @route   POST /api/outfits/:id/rent
// @access  Private
const requestRental = async (req, res) => {
  try {
    const outfitId = req.params.id;
    const { message } = req.body;
    
    const outfit = await Outfit.findById(outfitId);
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }
    
    if (outfit.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot rent your own outfit' });
    }

    const newRequest = await RentalRequest.create({
      outfit: outfitId,
      renter: req.user.id,
      owner: outfit.owner,
      message,
    });

    res.status(201).json({ message: 'Rental request sent!', request: newRequest });
  } catch (error) {
    console.error('Rent Request Error:', error);
    res.status(500).json({ message: 'Failed to send rental request' });
  }
};

// @desc    Get rental requests for the current user (incoming and outgoing)
// @route   GET /api/outfits/requests
// @access  Private
const getMyRequests = async (req, res) => {
  try {
    const incoming = await RentalRequest.find({ owner: req.user.id })
      .populate('renter', 'name profileImage hostel')
      .populate('outfit', 'title image')
      .sort({ createdAt: -1 });
      
    const outgoing = await RentalRequest.find({ renter: req.user.id })
      .populate('owner', 'name profileImage hostel')
      .populate('outfit', 'title image')
      .sort({ createdAt: -1 });

    res.json({ incoming, outgoing });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

// @desc    Update rental request status
// @route   PUT /api/outfits/requests/:id
// @access  Private
const updateRequestStatus = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body; // 'accepted', 'rejected', 'completed'

    const request = await RentalRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only owner can accept/reject
    if (request.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
      // Mark outfit as unavailable
      await Outfit.findByIdAndUpdate(request.outfit, { availability: false });
    } else if (status === 'completed') {
      // Mark outfit as available again
      await Outfit.findByIdAndUpdate(request.outfit, { availability: true });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update request' });
  }
};

module.exports = {
  uploadOutfit,
  getOutfits,
  requestRental,
  getMyRequests,
  updateRequestStatus
};
