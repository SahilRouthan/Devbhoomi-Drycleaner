require('dotenv').config();
const mongoose = require('mongoose');
const Pricing = require('../models/Pricing');
const pricingData = require('../../src/data/pricing.json');

async function seedPricing() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing pricing
    await Pricing.deleteMany({});
    console.log('✓ Cleared existing pricing data');

    // Transform and insert pricing data
    const pricingItems = [];
    
    pricingData.categories.forEach(category => {
      const categoryKey = category.name.toLowerCase().includes('men') && !category.name.includes('women') ? 'mens' :
                         category.name.toLowerCase().includes('women') ? 'womens' :
                         category.name.toLowerCase().includes('home') ? 'home' :
                         'kids';

      category.items.forEach(item => {
        pricingItems.push({
          id: item.id,
          category: categoryKey,
          name: item.name,
          price: item.price,
          unit: item.unit || 'piece',
          note: item.note || '',
          isActive: true
        });
      });
    });

    await Pricing.insertMany(pricingItems);
    console.log(`✓ Inserted ${pricingItems.length} pricing items`);

    // Display summary
    const counts = await Pricing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    console.log('\nPricing Summary:');
    counts.forEach(c => {
      console.log(`  ${c._id}: ${c.count} items`);
    });

    console.log('\n✓ Pricing data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding pricing data:', error);
    process.exit(1);
  }
}

seedPricing();
