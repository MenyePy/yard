const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['clothing', 'technology', 'other'] // Add more categories as needed
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: {
    type: [String],
    validate: [
      {
        validator: function(v) {
          return v.length >= 1 && v.length <= 5;
        },
        message: 'Product must have between 1 and 5 images'
      }
    ]
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  reserved: {
    type: Boolean,
    default: false
  },
  reservedBy: {
    phoneNumber: String,
    reservedAt: Date
  },
  offers: [{
    phoneNumber: {
      type: String,
      required: true
    },
    offerPrice: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add index for better query performance
productSchema.index({ category: 1, reserved: 1 });

module.exports = mongoose.model('Product', productSchema);
