const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { verifyFirebaseToken } = require('../utils/firebaseAdmin');

if (!process.env.JWT_SECRET) {
  // Fail loudly instead of silently signing tokens with a public
  // fallback string that anyone could forge.
  throw new Error('JWT_SECRET is not set. Refusing to start without it.');
}

// Admin allow-list, kept out of source control. Set as a comma
// separated string, e.g. ADMIN_EMAILS="a@x.com,b@y.com"
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const userResponse = (user) => ({
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

// Real login: the client sends a Firebase ID token obtained from an
// actual Google Sign-In / email-password sign-in on the frontend.
// We verify it with firebase-admin, so the email in play is *proven*,
// not just whatever the request body claims.
const googleLogin = async (req, res) => {
  const { idToken, profileImage } = req.body;

  try {
    console.log('[Google Auth] Request received');
    console.log('[Google Auth] Firebase token received:', !!idToken);
    
    const decoded = await verifyFirebaseToken(idToken);
    const email = decoded.email;
    const name = decoded.name || 'HostelX Student';
    
    console.log('[Google Auth] Verified email:', email);
    console.log('[Google Auth] MongoDB readyState:', require('mongoose').connection.readyState);

    if (!email) {
      return res.status(400).json({ message: 'Token did not contain a verified email' });
    }

    if (!email.endsWith('@cuchd.in')) {
      return res.status(403).json({ message: 'Access restricted to Chandigarh University students only. Please use your @cuchd.in email.' });
    }

    const shouldBeAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

    let user = await User.findOne({ email });

    if (user) {
      if (shouldBeAdmin && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
      return res.json(userResponse(user));
    }

    user = await User.create({
      name,
      email,
      profileImage,
      googleId: decoded.uid,
      role: shouldBeAdmin ? 'admin' : 'user',
    });

    res.status(201).json({
      ...userResponse(user),
      message: 'New user created. Please complete profile.',
    });
  } catch (error) {
    console.error('========== GOOGLE LOGIN ERROR ==========');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================');
    
    const status = error.statusCode || 500;
    // Temporarily return the actual error message for debugging
    res.status(status).json({ message: error.message });
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
