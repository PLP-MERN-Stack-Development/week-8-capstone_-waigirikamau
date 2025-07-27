const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessType: {
    type: String,
    enum: ['retailer', 'wholesaler', 'processor', 'exporter', 'restaurant', 'other'],
    required: true
  },
  businessRegistration: String,
  location: {
    county: {
      type: String,
      required: true
    },
    town: {
      type: String,
      required: true
    },
    address: String
  },
  description: String,
  profileImage: String,
  interestedProducts: [String],
  preferredDeliveryMethods: [String],
  paymentMethods: [String],
  rating: {
    type: Number,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Buyer', buyerSchema);