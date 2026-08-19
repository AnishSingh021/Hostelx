const mongoose = require('mongoose');

const rentalRequestSchema = new mongoose.Schema({
  outfit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outfit',
    required: true,
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  message: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('RentalRequest', rentalRequestSchema);
