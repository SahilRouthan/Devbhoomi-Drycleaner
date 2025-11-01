const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['mens', 'womens', 'home', 'kids']
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'piece'
  },
  note: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
pricingSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Pricing', pricingSchema);
