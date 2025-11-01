const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');

// Get approved testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ 
      isApproved: true, 
      isActive: true 
    })
    .sort({ createdAt: -1 })
    .limit(20);

    res.json({ success: true, testimonials });
  } catch (error) {
    console.error('Testimonials fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch testimonials' });
  }
});

// Submit new testimonial
router.post('/', async (req, res) => {
  try {
    const { name, text, rating } = req.body;

    if (!name || !text) {
      return res.status(400).json({ success: false, message: 'Name and message are required' });
    }

    const testimonial = new Testimonial({
      name,
      text,
      rating: rating || 5,
      isApproved: false // Requires admin approval
    });

    await testimonial.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! It will be reviewed and published soon.'
    });
  } catch (error) {
    console.error('Testimonial creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit testimonial' });
  }
});

module.exports = router;
