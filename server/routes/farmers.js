const express = require('express');
const multer = require('multer');
const path = require('path');
const Farmer = require('../models/Farmer');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `farmer-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
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

// Create farmer profile
router.post('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmers only.' });
    }

    // Check if profile already exists
    const existingProfile = await Farmer.findOne({ userId: req.user.userId });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    const {
      firstName,
      lastName,
      phoneNumber,
      farmName,
      county,
      town,
      farmSize,
      farmSizeUnit,
      farmingType,
      experience,
      description,
      specialties,
      certifications
    } = req.body;

    const farmerProfile = new Farmer({
      userId: req.user.userId,
      firstName,
      lastName,
      phoneNumber,
      farmName,
      location: { county, town },
      farmSize: parseFloat(farmSize),
      farmSizeUnit,
      farmingType,
      experience: parseInt(experience),
      description,
      specialties: specialties ? specialties.split(',').map(s => s.trim()) : [],
      certifications: certifications ? certifications.split(',').map(c => c.trim()) : [],
      profileImage: req.file ? req.file.filename : null
    });

    await farmerProfile.save();

    res.status(201).json({
      message: 'Farmer profile created successfully',
      profile: farmerProfile
    });
  } catch (error) {
    console.error('Create farmer profile error:', error);
    res.status(500).json({ message: 'Server error creating profile' });
  }
});

// Get farmer profile
router.get('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmers only.' });
    }

    const profile = await Farmer.findOne({ userId: req.user.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update farmer profile
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmers only.' });
    }

    const updateData = { ...req.body };
    
    if (updateData.county && updateData.town) {
      updateData.location = { county: updateData.county, town: updateData.town };
      delete updateData.county;
      delete updateData.town;
    }
    
    if (updateData.specialties) {
      updateData.specialties = updateData.specialties.split(',').map(s => s.trim());
    }
    
    if (updateData.certifications) {
      updateData.certifications = updateData.certifications.split(',').map(c => c.trim());
    }
    
    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    const profile = await Farmer.findOneAndUpdate(
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
    console.error('Update farmer profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Get all farmers (for buyers to browse)
router.get('/', async (req, res) => {
  try {
    const { county, town, farmingType, specialties } = req.query;
    
    let filter = { isActive: true };
    
    if (county) filter['location.county'] = new RegExp(county, 'i');
    if (town) filter['location.town'] = new RegExp(town, 'i');
    if (farmingType) filter.farmingType = farmingType;
    if (specialties) filter.specialties = { $in: specialties.split(',') };

    const farmers = await Farmer.find(filter)
      .populate('userId', 'email isVerified')
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json(farmers);
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get farmer by ID
router.get('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id)
      .populate('userId', 'email isVerified');
    
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    res.json(farmer);
  } catch (error) {
    console.error('Get farmer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;