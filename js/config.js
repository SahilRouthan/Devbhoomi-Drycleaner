// API Configuration
// Update API_BASE_URL after deploying backend

const API_CONFIG = {
  // Backend API URL
  BASE_URL: 'http://localhost:5000/api', // Change to production URL after deployment
  
  // Razorpay Configuration
  RAZORPAY_KEY_ID: 'rzp_test_YOUR_KEY_HERE', // Your Razorpay Key ID
  
  // Endpoints
  ENDPOINTS: {
    // Pricing
    PRICING: '/pricing/all',
    
    // Orders
    CREATE_ORDER: '/orders',
    GET_ORDER: '/orders', // + /:orderId
    CUSTOMER_ORDERS: '/orders/customer', // + /:phone
    
    // Payment
    CREATE_RAZORPAY_ORDER: '/payment/create-order',
    VERIFY_PAYMENT: '/payment/verify-payment',
    
    // Contact
    SUBMIT_CONTACT: '/contact',
    
    // Testimonials
    GET_TESTIMONIALS: '/testimonials',
    SUBMIT_TESTIMONIAL: '/testimonials'
  }
};

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
  window.apiCall = apiCall;
}
