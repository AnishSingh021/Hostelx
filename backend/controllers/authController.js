const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Mock Google Auth logic since Firebase is pending configuration
const googleLogin = async (req, res) => {
  const { name, email, profileImage } = req.body;

  try {
    // Define admin emails here
    const ADMIN_EMAILS = [
      'admin@hostelx.com',
      'anishsingh10121@gmail.com', // Added as a default based on repo/DB credentials
      // You can add your email here to automatically receive admin access!
    ];

    const shouldBeAdmin = ADMIN_EMAILS.includes(email?.toLowerCase());

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Dynamic upgrade to admin if user exists and their email is in the admin list
      if (shouldBeAdmin && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }

      // User exists, just log them in
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        college: user.college,
        hostel: user.hostel,
        room: user.room,
        wing: user.wing,
        floor: user.floor,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      // User doesn't exist, create new user
      user = await User.create({
        name,
        email,
        profileImage,
        role: shouldBeAdmin ? 'admin' : 'user',
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        token: generateToken(user._id),
        message: 'New user created. Please complete profile.'
      });
    }
  } catch (error) {
    console.error('Auth Error:', error.message);
    res.status(500).json({ message: error.message || 'Server Error in authentication' });
  }
};

const updateProfile = async (req, res) => {
  const { name, college, hostel, room, wing, floor } = req.body;
  const userId = req.user.id; // From authMiddleware

  try {
    const user = await User.findById(userId);

    if (user) {
      user.name = name || user.name;
      user.college = college || user.college;
      user.hostel = hostel || user.hostel;
      user.room = room !== undefined ? room : user.room;
      user.wing = wing !== undefined ? wing : user.wing;
      user.floor = floor !== undefined ? floor : user.floor;

      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        user.profileImage = result.secure_url;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        college: updatedUser.college,
        hostel: updatedUser.hostel,
        room: updatedUser.room,
        wing: updatedUser.wing,
        floor: updatedUser.floor,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile Update Error:', error.message);
    res.status(500).json({ message: error.message || 'Server Error during profile update' });
  }
};

const addReview = async (req, res) => {
  const { userId, rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Please provide a rating between 1 and 5' });
  }

  try {
    const userToReview = await User.findById(userId);
    if (!userToReview) {
      return res.status(404).json({ message: 'User to review not found' });
    }

    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    // Check if reviewer already reviewed
    const alreadyReviewedIndex = userToReview.reviews.findIndex(
      r => r.reviewer.toString() === req.user._id.toString()
    );

    if (alreadyReviewedIndex > -1) {
      userToReview.reviews[alreadyReviewedIndex].rating = Number(rating);
      userToReview.reviews[alreadyReviewedIndex].comment = comment || '';
      userToReview.reviews[alreadyReviewedIndex].date = new Date();
    } else {
      userToReview.reviews.push({
        reviewer: req.user._id,
        rating: Number(rating),
        comment: comment || ''
      });
    }

    // Recalculate average ratings
    const totalRating = userToReview.reviews.reduce((sum, r) => sum + r.rating, 0);
    userToReview.ratings = Number((totalRating / userToReview.reviews.length).toFixed(1));

    await userToReview.save();

    res.json({ 
      message: 'Review added successfully', 
      reviews: userToReview.reviews, 
      ratings: userToReview.ratings 
    });
  } catch (error) {
    console.error('Review Error:', error.message);
    res.status(500).json({ message: 'Server error adding review' });
  }
};

module.exports = { googleLogin, updateProfile, addReview };
