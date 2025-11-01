const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    category: String
  }],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String
  },
  pickupAddress: {
    type: String,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  razorpayOrderId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'picked_up', 'in_process', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ orderId: 1 });
orderSchema.index({ customerPhone: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
