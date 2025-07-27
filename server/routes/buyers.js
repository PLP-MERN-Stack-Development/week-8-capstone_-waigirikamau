const express = require('express');
const multer = require('multer');
const path = require('path');
const Buyer = require('../models/Buyer');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `buyer-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Create buyer profile
router.post('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Access denied. Buyers only.' });
    }

    // Check if profile already exists
    const existingProfile = await Buyer.findOne({ userId: req.user.userId });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    const {
      firstName,
      lastName,
      phoneNumber,
      businessName,
      businessType,
      businessRegistration,
      county,
      town,
      address,
      description,
      interestedProducts,
      preferredDeliveryMethods,
      paymentMethods
    } = req.body;

    const buyerProfile = new Buyer({
      userId: req.user.userId,
      firstName,
      lastName,
      phoneNumber,
      businessName,
      businessType,
      businessRegistration,
      location: { county, town, address },
      description,
      interestedProducts: interestedProducts ? interestedProducts.split(',').map(p => p.trim()) : [],
      preferredDeliveryMethods: preferredDeliveryMethods ? preferredDeliveryMethods.split(',').map(d => d.trim()) : [],
      paymentMethods: paymentMethods ? paymentMethods.split(',').map(p => p.trim()) : [],
      profileImage: req.file ? req.file.filename : null
    });

    await buyerProfile.save();

    res.status(201).json({
      message: 'Buyer profile created successfully',
      profile: buyerProfile
    });
  } catch (error) {
    console.error('Create buyer profile error:', error);
    res.status(500).json({ message: 'Server error creating profile' });
  }
});

// Get buyer profile
router.get('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Access denied. Buyers only.' });
    }

    const profile = await Buyer.findOne({ userId: req.user.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get buyer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update buyer profile
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Access denied. Buyers only.' });
    }

    const updateData = { ...req.body };
    
    if (updateData.county && updateData.town) {
      updateData.location = { 
        county: updateData.county, 
        town: updateData.town,
        address: updateData.address 
      };
      delete updateData.county;
      delete updateData.town;
      delete updateData.address;
    }
    
    if (updateData.interestedProducts) {
      updateData.interestedProducts = updateData.interestedProducts.split(',').map(p => p.trim());
    }
    
    if (updateData.preferredDeliveryMethods) {
      updateData.preferredDeliveryMethods = updateData.preferredDeliveryMethods.split(',').map(d => d.trim());
    }
    
    if (updateData.paymentMethods) {
      updateData.paymentMethods = updateData.paymentMethods.split(',').map(p => p.trim());
    }
    
    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    const profile = await Buyer.findOneAndUpdate(
      { userId: req.user.userId },
      updateData,
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update buyer profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Get all buyers (for farmers to see potential customers)
router.get('/', async (req, res) => {
  try {
    const { county, town, businessType, interestedProducts } = req.query;
    
    let filter = { isActive: true };
    
    if (county) filter['location.county'] = new RegExp(county, 'i');
    if (town) filter['location.town'] = new RegExp(town, 'i');
    if (businessType) filter.businessType = businessType;
    if (interestedProducts) filter.interestedProducts = { $in: interestedProducts.split(',') };

    const buyers = await Buyer.find(filter)
      .populate('userId', 'email isVerified')
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json(buyers);
  } catch (error) {
    console.error('Get buyers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get buyer by ID
router.get('/:id', async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id)
      .populate('userId', 'email isVerified');
    
    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }

    res.json(buyer);
  } catch (error) {
    console.error('Get buyer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;