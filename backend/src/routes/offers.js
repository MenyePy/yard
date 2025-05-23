const express = require('express');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all offers for a product (admin only)
router.get('/product/:productId', auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Sort offers by amount in descending order
    const sortedOffers = [...product.offers].sort((a, b) => b.amount - a.amount);
    res.json(sortedOffers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get highest offer for a product (public)
router.get('/product/:productId/highest', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const highestOffer = product.highestOffer;
    res.json({ highestOffer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an offer (admin only)
router.delete('/product/:productId/offer/:offerId', auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const offerIndex = product.offers.findIndex(
      offer => offer._id.toString() === req.params.offerId
    );

    if (offerIndex === -1) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    product.offers.splice(offerIndex, 1);
    await product.save();

    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 