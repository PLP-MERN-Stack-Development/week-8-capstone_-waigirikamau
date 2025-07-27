const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
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
  farmName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    county: {
      type: String,
      required: true
    },
    town: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  farmSize: {
    type: Number,
    required: true
  },
  farmSizeUnit: {
    type: String,
    enum: ['acres', 'hectares'],
    default: 'acres'
  },
  farmingType: {
    type: String,
    enum: ['organic', 'conventional', 'mixed'],
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  profileImage: String,
  description: String,
  specialties: [String],
  certifications: [String],
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

module.exports = mongoose.model('Farmer', farmerSchema);