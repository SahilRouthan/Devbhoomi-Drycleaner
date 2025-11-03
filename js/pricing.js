// Pricing Page JavaScript
let allCategories = [];
let currentCategory = 'all';
let itemQuantities = {}; // Track quantities: {itemId: quantity}

document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Try to fetch pricing from backend API first. If that fails (e.g. GitHub Pages can't reach localhost),
    // fall back to the static JSON bundled with the site (`src/data/pricing.json`).
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/pricing/all`);
      const data = await response.json();
      if (response.ok && data && data.success) {
        allCategories = data.categories;
        console.log('Pricing loaded from API');
        setPricingBanner('api', 'Pricing loaded from server');
      } else {
        throw new Error('API returned no pricing');
      }
    } catch (apiErr) {
      console.warn('API pricing fetch failed, loading static pricing.json as fallback:', apiErr.message);
      // Load local static JSON (works on GitHub Pages and static hosts)
      try {
        const staticRes = await fetch('./src/data/pricing.json');
        const staticJson = await staticRes.json();
        allCategories = staticJson.categories || [];
        console.log('Pricing loaded from static JSON');
        setPricingBanner('static', 'Showing cached prices (static fallback)');
      } catch (staticErr) {
        console.error('Failed to load static pricing.json fallback:', staticErr);
        throw staticErr; // let outer catch display error to user
      }
    }
    
    // Load existing cart quantities
    loadCartQuantities();
    
    // Render category tabs
    renderCategoryTabs();
    
    // Render items
    renderItems();
    
    // Setup search
    setupSearch();
  } catch (error) {
    console.error('Error loading pricing data:', error);
    setPricingBanner('error', 'Error loading pricing. Please refresh the page.');
    document.getElementById('pricingTableBody').innerHTML = 
      '<tr><td colspan="3" style="text-align:center;color:#ef4444;padding:40px;">Error loading pricing. Please refresh the page.</td></tr>';
  }
});

// Display a small banner indicating source of pricing data
function setPricingBanner(type, message) {
  const banner = document.getElementById('pricingBanner');
  if (!banner) return;
  banner.style.display = 'block';
  banner.textContent = message || '';
  banner.classList.remove('api', 'static', 'error');
  if (type === 'api') banner.classList.add('api');
  else if (type === 'static') banner.classList.add('static');
  else banner.classList.add('error');
}

function loadCartQuantities() {
  const cartItems = cart.getItems();
  cartItems.forEach(item => {
    itemQuantities[item.id] = item.quantity;
  });
}

function renderCategoryTabs() {
  const tabsContainer = document.getElementById('categoryTabs');
  const categoryIcons = {
    'all': '📋',
    'mens': '👔',
    'womens': '👗',
    'home': '🏠',
    'kids': '👶'
  };
  
  const allTab = document.createElement('button');
  allTab.className = 'category-tab active';
  allTab.innerHTML = `${categoryIcons['all']} All Items`;
  allTab.onclick = () => switchCategory('all', allTab);
  tabsContainer.appendChild(allTab);
  
  allCategories.forEach(category => {
    const tab = document.createElement('button');
    tab.className = 'category-tab';
    const catKey = category.key || category.id;
    tab.innerHTML = `${categoryIcons[catKey] || '✨'} ${category.name}`;
    tab.onclick = () => switchCategory(catKey, tab);
    tabsContainer.appendChild(tab);
  });
}

function switchCategory(categoryId, clickedTab) {
  currentCategory = categoryId;
  
  // Update active tab
  document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
  clickedTab.classList.add('active');
  
  // Re-render items
  renderItems();
}

function renderItems(searchQuery = '') {
  const tbody = document.getElementById('pricingTableBody');
  tbody.innerHTML = '';
  
  let itemsToShow = [];
  
  if (currentCategory === 'all') {
    allCategories.forEach(cat => {
      const catKey = cat.key || cat.id;
      itemsToShow = itemsToShow.concat(cat.items.map(item => ({...item, categoryId: catKey})));
    });
  } else {
    const category = allCategories.find(c => (c.key || c.id) === currentCategory);
    if (category) {
      itemsToShow = category.items.map(item => ({...item, categoryId: (category.key || category.id)}));
    }
  }
  
  // Filter by search
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    itemsToShow = itemsToShow.filter(item => 
      item.name.toLowerCase().includes(query)
    );
  }
  
  if (itemsToShow.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3"><div class="empty-state"><div class="empty-state-icon">🔍</div><div>No items found</div></div></td></tr>';
    return;
  }
  
  itemsToShow.forEach(item => {
    const row = createItemRow(item);
    tbody.appendChild(row);
  });
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    renderItems(e.target.value);
  });
}

function createItemRow(item) {
  const row = document.createElement('tr');
  const qty = itemQuantities[item.id] || 0;
  
  if (qty > 0) {
    row.classList.add('in-cart');
  }
  
  // Item name cell
  const nameCell = document.createElement('td');
  const nameDiv = document.createElement('div');
  nameDiv.className = 'item-name-cell';
  nameDiv.textContent = item.name;
  nameCell.appendChild(nameDiv);
  
  if (item.note) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'item-note-text';
    noteDiv.textContent = `💡 ${item.note}`;
    nameCell.appendChild(noteDiv);
  }
  
  // Price cell
  const priceCell = document.createElement('td');
  const priceDiv = document.createElement('div');
  priceDiv.className = 'item-price-cell';
  
  if (item.price === 0) {
    priceDiv.innerHTML = '<span class="custom-quote">Contact for quote</span>';
  } else {
    priceDiv.textContent = `₹${item.price}/-`;
    if (item.unit) {
      const unitSpan = document.createElement('div');
      unitSpan.style.fontSize = '0.8rem';
      unitSpan.style.color = '#64748b';
      unitSpan.style.fontWeight = 'normal';
      unitSpan.textContent = item.unit;
      priceDiv.appendChild(unitSpan);
    }
  }
  priceCell.appendChild(priceDiv);
  
  // Quantity controls cell
  const controlsCell = document.createElement('td');
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'quick-controls';
  
  if (item.price > 0) {
    const minusBtn = document.createElement('button');
    minusBtn.className = 'qty-btn';
    minusBtn.textContent = '−';
    minusBtn.disabled = qty === 0;
    minusBtn.onclick = () => decreaseQuantity(item, row);
    
    const qtyDisplay = document.createElement('div');
    qtyDisplay.className = 'qty-display';
    qtyDisplay.textContent = qty;
    qtyDisplay.id = `qty-${item.id}`;
    
    const plusBtn = document.createElement('button');
    plusBtn.className = 'qty-btn';
    plusBtn.textContent = '+';
    plusBtn.onclick = () => increaseQuantity(item, row);
    
    controlsDiv.appendChild(minusBtn);
    controlsDiv.appendChild(qtyDisplay);
    controlsDiv.appendChild(plusBtn);
  } else {
    controlsDiv.innerHTML = '<span style="color:#f59e0b;font-size:0.9rem;">Custom</span>';
  }
  
  controlsCell.appendChild(controlsDiv);
  
  row.appendChild(nameCell);
  row.appendChild(priceCell);
  row.appendChild(controlsCell);
  
  return row;
}

function increaseQuantity(item, row) {
  const currentQty = itemQuantities[item.id] || 0;
  const newQty = currentQty + 1;
  
  if (currentQty === 0) {
    // Add new item to cart
    cart.addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.categoryId
    }, 1);
  } else {
    // Update existing item
    cart.updateQuantity(item.id, newQty);
  }
  
  itemQuantities[item.id] = newQty;
  updateRowDisplay(item.id, newQty, row);
}

function decreaseQuantity(item, row) {
  const currentQty = itemQuantities[item.id] || 0;
  if (currentQty === 0) return;
  
  const newQty = currentQty - 1;
  
  if (newQty === 0) {
    cart.removeItem(item.id);
    delete itemQuantities[item.id];
  } else {
    cart.updateQuantity(item.id, newQty);
    itemQuantities[item.id] = newQty;
  }
  
  updateRowDisplay(item.id, newQty, row);
}

function updateRowDisplay(itemId, qty, row) {
  const qtyDisplay = document.getElementById(`qty-${itemId}`);
  if (qtyDisplay) {
    qtyDisplay.textContent = qty;
  }
  
  const minusBtn = row.querySelector('.qty-btn:first-child');
  if (minusBtn) {
    minusBtn.disabled = qty === 0;
  }
  
  if (qty > 0) {
    row.classList.add('in-cart');
  } else {
    row.classList.remove('in-cart');
  }
}
