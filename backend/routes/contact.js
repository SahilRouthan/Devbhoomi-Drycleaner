const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { sendContactConfirmationEmail } = require('../utils/email');

// Submit contact form
router.post('/', [
  body('name').trim().notEmpty(),
  body('phone').trim().notEmpty(),
  body('message').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      name,
      email,
      phone,
      service,
      pickupAddress,
      deliveryAddress,
      message,
      type,
      orderId
    } = req.body;

    const contact = new Contact({
      name,
      email,
      phone,
      service,
      pickupAddress,
      deliveryAddress,
      message,
      type: type || 'inquiry',
      orderId,
      status: 'new'
    });

    await contact.save();

    // Send confirmation email if email provided
    if (email) {
      try {
        await sendContactConfirmationEmail(contact);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message received. We will contact you soon!'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit message' });
  }
});

module.exports = router;
