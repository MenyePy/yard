const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', productController.getAllProducts);
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
  [
    body('name').notEmpty().trim(),
    body('category').notEmpty().isIn(['clothing', 'technology', 'other']),
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
  [
    body('name').optional().notEmpty().trim(),
    body('category').optional().isIn(['clothing', 'technology', 'other']),
    body('price').optional().isNumeric().toFloat(),
    body('contactNumber').optional().notEmpty().trim(),
    body('description').optional().trim()
  ],
  productController.updateProduct
);

module.exports = router;
