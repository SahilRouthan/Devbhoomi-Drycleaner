const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const { sendOrderConfirmationEmail, sendAdminNotification } = require('../utils/email');
const { 
  sendCustomerOrderSMS, 
  sendServiceProviderOrderSMS, 
  sendOrderStatusUpdateSMS 
} = require('../utils/sms');

// Create new order
router.post('/', [
  body('items').isArray().notEmpty(),
  body('customerName').trim().notEmpty(),
  body('customerPhone').trim().notEmpty(),
  body('pickupAddress').trim().notEmpty(),
  body('paymentMethod').isIn(['cod', 'online'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      items,
      subtotal,
      discount,
      total,
      customerName,
      customerPhone,
      customerEmail,
      pickupAddress,
      deliveryAddress,
      paymentMethod,
      paymentId,
      razorpayOrderId,
      notes
    } = req.body;

    // Generate unique order ID
    const orderId = Date.now().toString().slice(-6);

    const order = new Order({
      orderId,
      items,
      subtotal,
      discount: discount || 0,
      total,
      customerName,
      customerPhone,
      customerEmail,
      pickupAddress,
      deliveryAddress: deliveryAddress || pickupAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' && paymentId ? 'paid' : 'pending',
      paymentId,
      razorpayOrderId,
      notes,
      orderStatus: 'pending',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order placed'
      }]
    });

    await order.save();

    // Send confirmation emails
    try {
      await sendOrderConfirmationEmail(order);
      await sendAdminNotification(order);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the order if email fails
    }

    // Send SMS notifications
    try {
      // Format order data for SMS
      const smsOrderData = {
        orderId: order.orderId,
        customerDetails: {
          name: order.customerName,
          phone: order.customerPhone,
          address: order.pickupAddress,
          city: order.deliveryAddress.split(',')[0] || 'N/A',
          pincode: 'N/A' // Extract from address if available
        },
        items: order.items,
        totalAmount: order.total,
        pickupDate: new Date(order.createdAt).toLocaleDateString('en-IN'),
        paymentMethod: order.paymentMethod.toUpperCase()
      };

      // Send SMS to customer
      await sendCustomerOrderSMS(smsOrderData);
      
      // Send SMS to service provider
      await sendServiceProviderOrderSMS(smsOrderData);
      
      console.log('SMS notifications sent successfully');
    } catch (smsError) {
      console.error('SMS sending failed:', smsError.message);
      // Don't fail the order if SMS fails
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        orderId: order.orderId,
        total: order.total,
        paymentMethod: order.paymentMethod,
        orderStatus: order.orderStatus
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

// Get orders by phone number (for customer to track their orders)
router.get('/customer/:phone', async (req, res) => {
  try {
    const orders = await Order.find({ customerPhone: req.params.phone })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

module.exports = router;
