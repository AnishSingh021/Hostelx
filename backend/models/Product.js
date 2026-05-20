const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    enum: ['new', 'used'],
    required: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hostel: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
    }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available',
  },
  views: {
    type: Number,
    default: 0,
  },
  listingType: {
    type: String,
    enum: ['buy', 'rent', 'lost', 'found', 'emergency'],
    default: 'buy',
  },
  isUrgent: {
    type: Boolean,
    default: false,
  },
  isBoosted: {
    type: Boolean,
    default: false,
  },
  boostedUntil: {
    type: Date,
  },
  canDeliver: {
    type: Boolean,
    default: false,
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  originalPrice: {
    type: Number,
  },
  isAuction: {
    type: Boolean,
    default: false,
  },
  startingBid: {
    type: Number,
    default: 0,
  },
  bids: [{
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: true
    },
    time: {
      type: Date,
      default: Date.now
    }
  }],
  isRental: {
    type: Boolean,
    default: false,
  },
  rentPrice: {
    type: Number,
    default: 0,
  },
  rentalDuration: {
    type: String,
    enum: ['day', 'week', 'month'],
    default: 'day',
  },
  meetupCode: {
    type: String,
  },
  meetupConfirmed: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
