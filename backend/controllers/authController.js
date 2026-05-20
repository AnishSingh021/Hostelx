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
    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists, just log them in
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        college: user.college,
        hostel: user.hostel,
        room: user.room,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      // User doesn't exist, create new user
      user = await User.create({
        name,
        email,
        profileImage,
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
  const { name, college, hostel, room } = req.body;
  const userId = req.user.id; // From authMiddleware

  try {
    const user = await User.findById(userId);

    if (user) {
      user.name = name || user.name;
      user.college = college || user.college;
      user.hostel = hostel || user.hostel;
      user.room = room !== undefined ? room : user.room;

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

module.exports = { googleLogin, updateProfile };
