const express = require('express');
const router = express.Router();
const Pricing = require('../models/Pricing');
const fs = require('fs');
const path = require('path');

// Helper: load fallback pricing from local JSON file (used when DB is not available)
function loadStaticPricing() {
  try {
    const filePath = path.join(__dirname, '..', 'src', '..', 'src', 'data', 'pricing.json');
    // try common locations if repo layout differs
    let resolvedPath = filePath;
    if (!fs.existsSync(resolvedPath)) {
      // fallback to project root src/data
      resolvedPath = path.join(__dirname, '..', '..', 'src', 'data', 'pricing.json');
    }
    if (!fs.existsSync(resolvedPath)) return null;
    const raw = fs.readFileSync(resolvedPath, 'utf8');
    const json = JSON.parse(raw);
    // Convert to the shape expected by the frontend (/pricing/all)
    const categories = json.categories.map(c => ({
      name: c.name,
      key: c.id,
      items: (c.items || []).map(it => ({
        id: it.id,
        name: it.name,
        price: it.price || 0,
        unit: it.unit || undefined,
        note: it.note || undefined
      }))
    }));
    return categories;
  } catch (e) {
    console.error('Failed to load static pricing:', e);
    return null;
  }
}

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
    // Try to return static pricing as a graceful fallback
    const fallback = loadStaticPricing();
    if (fallback) {
      // convert grouped format from categories
      const grouped = { mens: [], womens: [], home: [], kids: [] };
      fallback.forEach(cat => {
        const key = cat.key;
        if (grouped[key]) grouped[key] = cat.items.map(i => ({
          id: i.id,
          category: key,
          name: i.name,
          price: i.price,
          unit: i.unit,
          note: i.note,
          isActive: true
        }));
      });
      return res.json({ success: true, pricing: grouped });
    }

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
    // Fallback to static JSON when DB is not available
    const fallback = loadStaticPricing();
    if (fallback) {
      return res.json({ success: true, categories: fallback });
    }

    res.status(500).json({ success: false, message: 'Failed to fetch pricing' });
  }
});

module.exports = router;
