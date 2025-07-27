const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `product-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
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

// Create product (farmers only)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmers only.' });
    }

    // Get farmer profile
    const farmer = await Farmer.findOne({ userId: req.user.userId });
    if (!farmer) {
      return res.status(400).json({ message: 'Farmer profile not found. Please create your profile first.' });
    }

    const {
      name,
      category,
      subcategory,
      variety,
      description,
      quantityAmount,
      quantityUnit,
      pricePerUnit,
      harvestDate,
      expectedHarvestDate,
      isHarvested,
      qualityGrade,
      organicCertified,
      minimumOrderAmount,
      minimumOrderUnit,
      availableUntil,
      deliveryOptions,
      tags
    } = req.body;

    const product = new Product({
      farmerId: farmer._id,
      name,
      category,
      subcategory,
      variety,
      description,
      images: req.files ? req.files.map(file => file.filename) : [],
      quantity: {
        amount: parseFloat(quantityAmount),
        unit: quantityUnit
      },
      pricePerUnit: parseFloat(pricePerUnit),
      harvestDate: harvestDate ? new Date(harvestDate) : null,
      expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
      isHarvested: isHarvested === 'true',
      qualityGrade,
      organicCertified: organicCertified === 'true',
      minimumOrder: minimumOrderAmount ? {
        amount: parseFloat(minimumOrderAmount),
        unit: minimumOrderUnit
      } : null,
      availableUntil: availableUntil ? new Date(availableUntil) : null,
      location: {
        county: farmer.location.county,
        town: farmer.location.town
      },
      deliveryOptions: deliveryOptions ? deliveryOptions.split(',').map(d => d.trim()) : [],
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });

    await product.save();

    // Populate farmer details for response
    await product.populate('farmerId', 'farmName firstName lastName location profileImage');

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const {
      category,
      county,
      town,
      minPrice,
      maxPrice,
      isHarvested,
      organicCertified,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    let filter = { status: 'available' };

    if (category) filter.category = category;
    if (county) filter['location.county'] = new RegExp(county, 'i');
    if (town) filter['location.town'] = new RegExp(town, 'i');
    if (minPrice) filter.pricePerUnit = { ...filter.pricePerUnit, $gte: parseFloat(minPrice) };
    if (maxPrice) filter.pricePerUnit = { ...filter.pricePerUnit, $lte: parseFloat(maxPrice) };
    if (isHarvested !== undefined) filter.isHarvested = isHarvested === 'true';
    if (organicCertified !== undefined) filter.organicCertified = organicCertified === 'true';
    
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(filter)
      .populate('farmerId', 'farmName firstName lastName location profileImage rating')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get products by farmer
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const products = await Product.find({ 
      farmerId: req.params.farmerId,
      status: { $in: ['available', 'reserved'] }
    })
    .populate('farmerId', 'farmName firstName lastName location profileImage')
    .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get farmer products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get farmer's own products
router.get('/my-products', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmers only.' });
    }

    const farmer = await Farmer.findOne({ userId: req.user.userId });
    if (!farmer) {
      return res.status(400).json({ message: 'Farmer profile not found' });
    }

    const products = await Product.find({ farmerId: farmer._id })
      .populate('farmerId', 'farmName firstName lastName location profileImage')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmerId', 'farmName firstName lastName location profileImage phoneNumber rating reviewsCount');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (farmers only)
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmers only.' });
    }

    const farmer = await Farmer.findOne({ userId: req.user.userId });
    if (!farmer) {
      return res.status(400).json({ message: 'Farmer profile not found' });
    }

    const product = await Product.findOne({ _id: req.params.id, farmerId: farmer._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or access denied' });
    }

    const updateData = { ...req.body };
    
    if (updateData.quantityAmount && updateData.quantityUnit) {
      updateData.quantity = {
        amount: parseFloat(updateData.quantityAmount),
        unit: updateData.quantityUnit
      };
      delete updateData.quantityAmount;
      delete updateData.quantityUnit;
    }

    if (updateData.minimumOrderAmount && updateData.minimumOrderUnit) {
      updateData.minimumOrder = {
        amount: parseFloat(updateData.minimumOrderAmount),
        unit: updateData.minimumOrderUnit
      };
      delete updateData.minimumOrderAmount;
      delete updateData.minimumOrderUnit;
    }

    if (updateData.pricePerUnit) {
      updateData.pricePerUnit = parseFloat(updateData.pricePerUnit);
    }

    if (updateData.deliveryOptions) {
      updateData.deliveryOptions = updateData.deliveryOptions.split(',').map(d => d.trim());
    }

    if (updateData.tags) {
      updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }

    if (req.files && req.files.length > 0) {
      updateData.images = [...(product.images || []), ...req.files.map(file => file.filename)];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('farmerId', 'farmName firstName lastName location profileImage');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// Delete product (farmers only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmers only.' });
    }

    const farmer = await Farmer.findOne({ userId: req.user.userId });
    if (!farmer) {
      return res.status(400).json({ message: 'Farmer profile not found' });
    }

    const product = await Product.findOneAndDelete({ _id: req.params.id, farmerId: farmer._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or access denied' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

// Express interest in product (buyers only)
router.post('/:id/interest', auth, async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Access denied. Buyers only.' });
    }

    const buyer = await Buyer.findOne({ userId: req.user.userId });
    if (!buyer) {
      return res.status(400).json({ message: 'Buyer profile not found' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already interested
    const alreadyInterested = product.interested.some(
      interest => interest.buyerId.toString() === buyer._id.toString()
    );

    if (alreadyInterested) {
      return res.status(400).json({ message: 'Already expressed interest in this product' });
    }

    product.interested.push({ buyerId: buyer._id });
    await product.save();

    res.json({ message: 'Interest expressed successfully' });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;