// Pricing Page JavaScript
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const response = await fetch('src/data/pricing.json');
    const data = await response.json();
    renderPricing(data.categories);
  } catch (error) {
    console.error('Error loading pricing data:', error);
    document.getElementById('pricing-content').innerHTML = 
      '<p style="text-align:center;color:#ef4444;">Error loading pricing. Please refresh the page.</p>';
  }
});

function renderPricing(categories) {
  const container = document.getElementById('pricing-content');
  
  categories.forEach(category => {
    const section = document.createElement('div');
    section.className = 'category-section';
    
    const header = document.createElement('div');
    header.className = 'category-header';
    header.textContent = category.name;
    
    const grid = document.createElement('div');
    grid.className = 'items-grid';
    
    category.items.forEach(item => {
      const card = createItemCard(item, category.id);
      grid.appendChild(card);
    });
    
    section.appendChild(header);
    section.appendChild(grid);
    container.appendChild(section);
  });
}

function createItemCard(item, categoryId) {
  const card = document.createElement('div');
  card.className = 'item-card';
  
  const name = document.createElement('div');
  name.className = 'item-name';
  name.textContent = item.name;
  
  const priceDiv = document.createElement('div');
  priceDiv.className = 'item-price';
  
  if (item.price === 0) {
    priceDiv.textContent = 'Custom Quote';
    priceDiv.style.fontSize = '1.2rem';
  } else {
    priceDiv.textContent = `₹${item.price}/-`;
  }
  
  if (item.unit) {
    const unitSpan = document.createElement('span');
    unitSpan.style.fontSize = '0.8rem';
    unitSpan.style.fontWeight = 'normal';
    unitSpan.style.color = '#6b7280';
    unitSpan.textContent = ` ${item.unit}`;
    priceDiv.appendChild(unitSpan);
  }
  
  card.appendChild(name);
  card.appendChild(priceDiv);
  
  if (item.note) {
    const note = document.createElement('div');
    note.className = 'item-note';
    note.textContent = `* ${item.note}`;
    card.appendChild(note);
  }
  
  // Skip cart functionality for items with custom pricing
  if (item.price > 0) {
    const quantityControl = document.createElement('div');
    quantityControl.className = 'quantity-control';
    
    const decreaseBtn = document.createElement('button');
    decreaseBtn.textContent = '−';
    decreaseBtn.onclick = () => {
      const input = quantityControl.querySelector('input');
      const newValue = Math.max(1, parseInt(input.value) - 1);
      input.value = newValue;
    };
    
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.value = '1';
    quantityInput.min = '1';
    quantityInput.max = '99';
    
    const increaseBtn = document.createElement('button');
    increaseBtn.textContent = '+';
    increaseBtn.onclick = () => {
      const input = quantityControl.querySelector('input');
      const newValue = Math.min(99, parseInt(input.value) + 1);
      input.value = newValue;
    };
    
    quantityControl.appendChild(decreaseBtn);
    quantityControl.appendChild(quantityInput);
    quantityControl.appendChild(increaseBtn);
    
    const addButton = document.createElement('button');
    addButton.className = 'add-to-cart-btn';
    addButton.textContent = '🛒 Add to Cart';
    addButton.onclick = () => {
      const quantity = parseInt(quantityInput.value);
      if (quantity > 0) {
        cart.addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          category: categoryId
        }, quantity);
        
        // Visual feedback
        addButton.textContent = '✓ Added!';
        addButton.classList.add('added');
        setTimeout(() => {
          addButton.textContent = '🛒 Add to Cart';
          addButton.classList.remove('added');
        }, 1500);
        
        // Reset quantity
        quantityInput.value = '1';
      }
    };
    
    card.appendChild(quantityControl);
    card.appendChild(addButton);
  } else {
    const contactNote = document.createElement('div');
    contactNote.style.fontSize = '0.9rem';
    contactNote.style.color = '#667eea';
    contactNote.style.marginTop = '10px';
    contactNote.innerHTML = '<strong>Contact us for quote</strong>';
    card.appendChild(contactNote);
  }
  
  return card;
}
