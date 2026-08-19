const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
  },
  size: {
    type: String,
    required: true,
  },
  occasion: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  rentPrice: {
    type: Number,
    required: true,
  },
  securityDeposit: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  gallery: [{
    type: String,
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Outfit', outfitSchema);
