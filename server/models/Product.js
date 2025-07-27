const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['cereals', 'vegetables', 'fruits', 'legumes', 'tubers', 'herbs'],
    required: true
  },
  subcategory: String,
  variety: String,
  description: String,
  images: [String],
  quantity: {
    amount: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['kg', 'tonnes', 'bags', 'pieces'],
      required: true
    }
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'KES'
  },
  harvestDate: Date,
  expectedHarvestDate: Date,
  isHarvested: {
    type: Boolean,
    default: false
  },
  qualityGrade: {
    type: String,
    enum: ['Grade A', 'Grade B', 'Grade C'],
    default: 'Grade A'
  },
  organicCertified: {
    type: Boolean,
    default: false
  },
  minimumOrder: {
    amount: Number,
    unit: String
  },
  availableUntil: Date,
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved', 'expired'],
    default: 'available'
  },
  location: {
    county: String,
    town: String
  },
  deliveryOptions: [String],
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  interested: [{
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer'
    },
    interestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);