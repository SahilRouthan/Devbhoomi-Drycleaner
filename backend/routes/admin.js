const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Pricing = require('../models/Pricing');
const Contact = require('../models/Contact');
const Testimonial = require('../models/Testimonial');

// Simple auth middleware (you can enhance this with JWT later)
const adminAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === process.env.ADMIN_API_KEY) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// Apply auth to all admin routes
router.use(adminAuth);

// Get all orders with filters
router.get('/orders', async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    const query = status ? { orderStatus: status } : {};
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Order.countDocuments(query);

    res.json({ 
      success: true, 
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Update order status
router.patch('/orders/:orderId/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`
    });

    await order.save();

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    
    const revenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderId customerName total orderStatus createdAt');

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: revenue[0]?.total || 0,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// Manage pricing
router.get('/pricing', async (req, res) => {
  try {
    const pricing = await Pricing.find().sort({ category: 1, name: 1 });
    res.json({ success: true, pricing });
  } catch (error) {
    console.error('Pricing fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pricing' });
  }
});

router.post('/pricing', async (req, res) => {
  try {
    const pricing = new Pricing(req.body);
    await pricing.save();
    res.status(201).json({ success: true, pricing });
  } catch (error) {
    console.error('Pricing creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create pricing' });
  }
});

router.patch('/pricing/:id', async (req, res) => {
  try {
    const pricing = await Pricing.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    
    if (!pricing) {
      return res.status(404).json({ success: false, message: 'Pricing item not found' });
    }

    res.json({ success: true, pricing });
  } catch (error) {
    console.error('Pricing update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update pricing' });
  }
});

// Manage contacts
router.get('/contacts', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, contacts });
  } catch (error) {
    console.error('Contacts fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
  }
});

// Manage testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 });
    
    res.json({ success: true, testimonials });
  } catch (error) {
    console.error('Testimonials fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch testimonials' });
  }
});

router.patch('/testimonials/:id/approve', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    res.json({ success: true, testimonial });
  } catch (error) {
    console.error('Testimonial approval error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve testimonial' });
  }
});

module.exports = router;
