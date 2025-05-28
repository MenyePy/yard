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
  },  category: {
    type: String,
    required: true,
    enum: ['clothing', 'electronics', 'home-and-kitchen', 'health', 'outdoors', 'stationery', 'toys-and-games', 'automotive', 'other']
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
  },  coverImageIndex: {
    type: Number,
    default: 0,
    validate: {
      validator: function(v) {
        // Handle the case where images might not be loaded yet during validation
        if (!this.images) return v === 0;
        return v >= 0 && v < this.images.length;
      },
      message: 'Cover image index must be valid'
    }
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true // Add index for better query performance
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
