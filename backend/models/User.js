const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  profileImage: {
    type: String,
    default: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='none'><circle cx='50' cy='50' r='50' fill='%23e2e8f0'/><circle cx='50' cy='38' r='18' fill='%2394a3b8'/><path d='M20 80 C 20 62, 35 55, 50 55 C 65 55, 80 62, 80 80' stroke='%2394a3b8' stroke-width='6' stroke-linecap='round'/></svg>"
  },
  college: {
    type: String,
  },
  hostel: {
    type: String,
  },
  room: {
    type: String,
  },
  wing: {
    type: String,
  },
  floor: {
    type: String,
  },
  savedItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  ratings: {
    type: Number,
    default: 0
  },
  reviews: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  boostCredits: {
    type: Number,
    default: 5
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
