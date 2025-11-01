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
  
  const categoryIcons = {
    'mens': '👔',
    'womens': '👗',
    'home': '🏠',
    'kids': '👶'
  };
  
  categories.forEach(category => {
    const section = document.createElement('div');
    section.className = 'category-section';
    
    const header = document.createElement('div');
    header.className = 'category-header';
    
    const icon = document.createElement('div');
    icon.className = 'category-icon';
    icon.textContent = categoryIcons[category.id] || '✨';
    
    const title = document.createElement('div');
    title.className = 'category-title';
    title.textContent = category.name;
    
    header.appendChild(icon);
    header.appendChild(title);
    
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
  
  // Add custom styling for items with price = 0
  if (item.price === 0) {
    card.classList.add('custom-price-card');
  }
  
  const itemHeader = document.createElement('div');
  itemHeader.className = 'item-header';
  
  const name = document.createElement('div');
  name.className = 'item-name';
  name.textContent = item.name;
  
  const priceDiv = document.createElement('div');
  priceDiv.className = 'item-price';
  
  if (item.price === 0) {
    const currency = document.createElement('span');
    currency.className = 'price-currency';
    currency.textContent = '💬';
    
    const amount = document.createElement('span');
    amount.textContent = 'Custom Quote';
    amount.style.fontSize = '1.3rem';
    
    priceDiv.appendChild(currency);
    priceDiv.appendChild(amount);
  } else {
    const currency = document.createElement('span');
    currency.className = 'price-currency';
    currency.textContent = '₹';
    
    const amount = document.createElement('span');
    amount.textContent = item.price;
    
    const dash = document.createElement('span');
    dash.className = 'price-unit';
    dash.textContent = '/-';
    
    priceDiv.appendChild(currency);
    priceDiv.appendChild(amount);
    priceDiv.appendChild(dash);
  }
  
  if (item.unit) {
    const unitSpan = document.createElement('div');
    unitSpan.className = 'price-unit';
    unitSpan.style.marginTop = '4px';
    unitSpan.textContent = item.unit;
    priceDiv.appendChild(unitSpan);
  }
  
  itemHeader.appendChild(name);
  itemHeader.appendChild(priceDiv);
  card.appendChild(itemHeader);
  
  if (item.note) {
    const note = document.createElement('div');
    note.className = 'item-note';
    note.textContent = `💡 ${item.note}`;
    card.appendChild(note);
  }
  
  const actions = document.createElement('div');
  actions.className = 'item-actions';
  
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
    addButton.innerHTML = '🛒 Add to Cart';
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
        addButton.innerHTML = '✓ Added to Cart!';
        addButton.classList.add('added');
        setTimeout(() => {
          addButton.innerHTML = '🛒 Add to Cart';
          addButton.classList.remove('added');
        }, 1500);
        
        // Reset quantity
        quantityInput.value = '1';
      }
    };
    
    actions.appendChild(quantityControl);
    actions.appendChild(addButton);
    card.appendChild(actions);
  } else {
    const contactNote = document.createElement('div');
    contactNote.className = 'contact-note';
    contactNote.innerHTML = '📞 Contact us for custom quote';
    actions.appendChild(contactNote);
    card.appendChild(actions);
  }
  
  return card;
}
