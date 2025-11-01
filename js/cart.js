// Cart Management System
class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.listeners = [];
  }

  loadCart() {
    try {
      const saved = localStorage.getItem('dryCleaningCart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading cart:', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('dryCleaningCart', JSON.stringify(this.items));
      this.notifyListeners();
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }

  addItem(item, quantity = 1) {
    const existingIndex = this.items.findIndex(i => i.id === item.id);
    
    if (existingIndex >= 0) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        ...item,
        quantity: quantity
      });
    }
    
    this.saveCart();
    return true;
  }

  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.saveCart();
  }

  updateQuantity(itemId, quantity) {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(itemId);
      } else {
        item.quantity = quantity;
        this.saveCart();
      }
    }
  }

  getItems() {
    return this.items;
  }

  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getTotal() {
    return this.items.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      return total + (price * item.quantity);
    }, 0);
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.items));
  }
}

// Global cart instance
const cart = new ShoppingCart();

// Update cart badge across all pages
function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge, #cartBadge, .cart-count');
  const count = cart.getItemCount();
  
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', updateCartBadge);

// Listen for cart changes
cart.onChange(updateCartBadge);

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.cart = cart;
  window.updateCartBadge = updateCartBadge;
}
