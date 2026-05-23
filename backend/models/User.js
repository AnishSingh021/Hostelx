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
    default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
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
