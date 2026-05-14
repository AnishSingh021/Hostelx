const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
    res.status(500).json({ message: 'Server Error in authentication' });
  }
};

const updateProfile = async (req, res) => {
  const { college, hostel, room } = req.body;
  const userId = req.user.id; // From authMiddleware

  try {
    const user = await User.findById(userId);

    if (user) {
      user.college = college || user.college;
      user.hostel = hostel || user.hostel;
      user.room = room || user.room;

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
    res.status(500).json({ message: 'Server Error during profile update' });
  }
};

module.exports = { googleLogin, updateProfile };
