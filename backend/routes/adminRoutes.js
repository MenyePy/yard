const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Login route
router.post('/login',
  [
    body('username').notEmpty().trim(),
    body('password').notEmpty()
  ],
  adminController.login
);

// Protected routes
router.post('/create',
  auth,
  [
    body('username').notEmpty().trim(),
    body('password').isLength({ min: 6 })
  ],
  adminController.createAdmin
);

router.post('/change-password',
  auth,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  adminController.changePassword
);

module.exports = router;
