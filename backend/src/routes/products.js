const express = require('express');
const { body, validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'yardsale',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

const upload = multer({ storage: storage });

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { type, sort, status = 'available' } = req.query;
    let query = { status };

    if (type) {
      query.type = type;
    }

    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await Product.find(query).sort(sortOption);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (admin only)
router.post('/', auth, adminOnly, upload.array('images', 6), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('type').isIn(['tech', 'kitchen', 'clothing', 'accessories', 'furniture', 'other'])
    .withMessage('Invalid product type'),
  body('contactNumber').matches(/^\+265\d{9}$/).withMessage('Invalid phone number format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    const product = new Product({
      ...req.body,
      images
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', auth, adminOnly, upload.array('images', 6), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle image updates if new images are uploaded
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const image of product.images) {
        await cloudinary.uploader.destroy(image.publicId);
      }

      // Add new images
      product.images = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'images') {
        product[key] = req.body[key];
      }
    });

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add offer to product (public)
router.post('/:id/offers', [
  body('phoneNumber').matches(/^\+265\d{9}$/).withMessage('Invalid phone number format'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'available') {
      return res.status(400).json({ message: 'Product is not available for offers' });
    }

    await product.addOffer(req.body.phoneNumber, req.body.amount);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product status (admin only)
router.patch('/:id/status', auth, adminOnly, [
  body('status').isIn(['available', 'pending', 'sold']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = req.body.status;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 