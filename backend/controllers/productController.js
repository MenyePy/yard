const Product = require('../models/Product');
const { validationResult } = require('express-validator');

exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    // Search in product name and description
    const searchResults = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ],
      reserved: false
    }).limit(10);

    // Get categories from search results
    const categories = [...new Set(searchResults.map(product => product.category))];
    
    // Find similar products from the same categories
    const similarProducts = await Product.find({
      category: { $in: categories },
      _id: { $nin: searchResults.map(p => p._id) },
      reserved: false
    }).limit(6);

    res.json({
      searchResults,
      similarProducts
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { sort, category, includeReserved } = req.query;
    const query = {};
    
    // Only filter by reserved status if not admin or not explicitly requesting reserved items
    if (!includeReserved) {
      query.reserved = false;
    }
    
    if (category) {
      query.category = category;
    }

    let sortOption = {};
    if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const products = await Product.find(query).sort(sortOption);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // First get the current product
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updates = { ...req.body };
    
    // Special handling for coverImageIndex
    if ('coverImageIndex' in updates) {
      // Ensure coverImageIndex is valid
      if (typeof updates.coverImageIndex !== 'number' || 
          updates.coverImageIndex < 0 || 
          updates.coverImageIndex >= currentProduct.images.length) {
        return res.status(400).json({ error: 'Invalid cover image index' });
      }
    }

    // Apply updates
    Object.assign(currentProduct, updates);
    await currentProduct.save(); // This will run the validators

    res.json(currentProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const images = req.files.map(file => file.path);
    const coverImageIndex = req.body.coverImageIndex || 0;
    
    // Validate coverImageIndex
    if (coverImageIndex < 0 || coverImageIndex >= images.length) {
      return res.status(400).json({ error: 'Invalid cover image index' });
    }
      // Validate category
    const { category } = req.body;
    if (!category || !Product.schema.path('category').enumValues.includes(category)) {
      return res.status(400).json({ error: 'Invalid category value' });
    }

    const product = new Product({
      ...req.body,
      images,
      coverImageIndex,
      price: parseFloat(req.body.price), // Ensure price is stored as a number
      category // Ensure category is explicitly set
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.reserveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.reserved) {
      return res.status(400).json({ error: 'Product is already reserved' });
    }

    product.reserved = true;
    product.reservedBy = {
      phoneNumber: req.body.phoneNumber,
      reservedAt: new Date()
    };
    
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.unreserveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.reserved = false;
    product.reservedBy = null;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.makeOffer = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.reserved) {
      return res.status(400).json({ error: 'Cannot make offers on reserved products' });
    }

    const offer = {
      phoneNumber: req.body.phoneNumber,
      offerPrice: req.body.offerPrice
    };

    product.offers.push(offer);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
