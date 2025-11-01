const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  phone: {
    type: String,
    required: true
  },
  service: {
    type: String
  },
  pickupAddress: {
    type: String
  },
  deliveryAddress: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['order', 'inquiry', 'feedback'],
    default: 'inquiry'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'resolved'],
    default: 'new'
  },
  orderId: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
contactSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
