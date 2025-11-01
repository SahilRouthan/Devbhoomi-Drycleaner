# Cash on Delivery (COD) Order Flow

## Customer Journey

### Step 1: Browse & Add Items (pricing.html)
- Customer browses pricing table
- Uses search/filter to find items
- Clicks +/- buttons to add items to cart
- Cart badge updates in header

### Step 2: Review Cart (cart.html)
- Customer clicks cart icon in header
- Reviews all items in cart
- Can adjust quantities or remove items
- Sees automatic discount applied:
  - ₹250 off at ₹1,000
  - ₹500 off at ₹2,000
  - ₹750 off at ₹3,000
  - ₹1,000 off at ₹4,000
- Selects "Cash on Delivery" payment method
- Clicks "Place Order" button

### Step 3: Provide Details (contact.html)
- Redirected to contact page with order summary
- Order summary shows:
  - All items with quantities
  - Discount amount (if applicable)
  - Total amount
  - Payment method: Cash on Delivery
- Customer fills required fields:
  - **Name** (required)
  - **Mobile Number** (required) - for pickup coordination
  - **Email** (optional)
  - **Pickup/Delivery Address** (required) - full address with PIN
  - Service type (auto-filled: "Pickup & Delivery")
  - Message (auto-filled with order details)

### Step 4: Order Confirmation
- Customer submits form
- Order is confirmed with:
  - Unique Order ID
  - Customer details
  - Pickup address
  - All order items
  - Payment method: COD
- Success message displayed
- Order saved to order history
- Cart cleared automatically
- Redirected to homepage

## Technical Implementation

### Data Flow

1. **Cart Storage** (`localStorage: dryCleaningCart`)
   - Array of items with: id, name, price, quantity

2. **Pending Order** (`localStorage: pendingOrder`)
   - Created when "Place Order" clicked
   - Contains: items, subtotal, discount, total, paymentMethod, timestamp

3. **Order Confirmation** (`localStorage: orderHistory`)
   - Array of confirmed orders
   - Includes: all order data + customer details (name, phone, email, address)

### Key Files

- `cart.html` - Cart management and payment selection
- `js/cart.js` - Cart class with add/remove/update methods
- `contact.html` - Order confirmation form
- `js/contact-form.js` - Form validation and order processing

### Payment Methods

1. **Cash on Delivery (COD)**
   - No payment gateway needed
   - Customer provides details
   - Payment collected on delivery

2. **Pay Online (Razorpay)**
   - Opens Razorpay payment modal
   - Supports UPI, Cards, NetBanking, Wallets
   - On success: stores payment ID, then collects address
   - On cancel: returns to cart page

## Future Enhancements

- [ ] Backend API integration for order storage
- [ ] SMS/Email notifications on order confirmation
- [ ] Real-time order tracking
- [ ] Admin dashboard for order management
- [ ] Pickup scheduling with date/time selection
- [ ] Order history page for customers
- [ ] WhatsApp order confirmation integration
