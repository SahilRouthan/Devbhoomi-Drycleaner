const express = require('express');
const router = express.Router();
const Pricing = require('../models/Pricing');

// Get all pricing (active items only for public)
router.get('/', async (req, res) => {
  try {
    const pricing = await Pricing.find({ isActive: true }).sort({ category: 1, name: 1 });
    
    // Group by category
    const grouped = {
      mens: [],
      womens: [],
      home: [],
      kids: []
    };

    pricing.forEach(item => {
      if (grouped[item.category]) {
        grouped[item.category].push(item);
      }
    });

    res.json({ success: true, pricing: grouped });
  } catch (error) {
    console.error('Pricing fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pricing' });
  }
});

// Get all categories as flat array (for compatibility with existing frontend)
router.get('/all', async (req, res) => {
  try {
    const pricing = await Pricing.find({ isActive: true }).sort({ category: 1, name: 1 });
    
    const categories = [
      { name: "Men's Wear", key: 'mens', items: [] },
      { name: "Women's Wear", key: 'womens', items: [] },
      { name: "Home Items", key: 'home', items: [] },
      { name: "Kids Wear", key: 'kids', items: [] }
    ];

    pricing.forEach(item => {
      const category = categories.find(c => c.key === item.category);
      if (category) {
        category.items.push({
          id: item.id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          note: item.note
        });
      }
    });

    res.json({ success: true, categories });
  } catch (error) {
    console.error('Pricing fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pricing' });
  }
});

module.exports = router;
