const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  type: {
    type: String,
    required: true,
    enum: ['tech', 'kitchen', 'clothing', 'accessories', 'furniture', 'other']
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold'],
    default: 'available'
  },
  contactNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+265\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid Malawian phone number!`
    }
  },
  offers: [{
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\+265\d{9}$/.test(v);
        },
        message: props => `${props.value} is not a valid Malawian phone number!`
      }
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for highest offer
productSchema.virtual('highestOffer').get(function() {
  if (!this.offers || this.offers.length === 0) return null;
  return Math.max(...this.offers.map(offer => offer.amount));
});

// Method to add an offer
productSchema.methods.addOffer = async function(phoneNumber, amount) {
  this.offers.push({ phoneNumber, amount });
  return this.save();
};

// Method to mark as sold
productSchema.methods.markAsSold = async function() {
  this.status = 'sold';
  return this.save();
};

// Method to mark as pending
productSchema.methods.markAsPending = async function() {
  this.status = 'pending';
  return this.save();
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 