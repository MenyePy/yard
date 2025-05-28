const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', productController.getProduct);
router.get('/search', productController.searchProducts);

// Reserve product
router.post('/:id/reserve',
  [body('phoneNumber').notEmpty().trim()],
  productController.reserveProduct
);

// Make offer
router.post('/:id/offer',
  [
    body('phoneNumber').notEmpty().trim(),
    body('offerPrice').isNumeric().toFloat()
  ],
  productController.makeOffer
);

// Admin routes
router.post('/',
  auth,
  upload.array('images', 5),
  [    body('name').notEmpty().trim(),
    body('category').notEmpty().isIn(['clothing', 'electronics', 'home-and-kitchen', 'health', 'outdoors', 'stationery', 'toys-and-games', 'automotive', 'other']),
    body('price').isNumeric().toFloat(),
    body('contactNumber').notEmpty().trim()
  ],
  productController.createProduct
);

router.post('/:id/unreserve',
  auth,
  productController.unreserveProduct
);

router.delete('/:id',
  auth,
  productController.deleteProduct
);

router.put('/:id',
  auth,
  [    body('name').optional().notEmpty().trim(),
    body('category').optional().isIn(['clothing', 'electronics', 'home-and-kitchen', 'health', 'outdoors', 'stationery', 'toys-and-games', 'automotive', 'other']),
    body('price').optional().isNumeric().toFloat(),
    body('contactNumber').optional().notEmpty().trim(),
    body('description').optional().trim()
  ],
  productController.updateProduct
);

router.post('/:id/toggle-featured',
  auth,
  productController.toggleFeatured
);

router.post('/:id/images',
  auth,
  upload.array('images', 5),
  productController.addImages
);

router.delete('/:id/images/:imageIndex',
  auth,
  productController.removeImage
);

module.exports = router;
