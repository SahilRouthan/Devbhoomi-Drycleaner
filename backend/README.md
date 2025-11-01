# Devbhoomi DryCleans - Backend API

Complete Node.js backend for the dry cleaning website with MongoDB and Razorpay integration.

## Features

✅ **Order Management** - Create, track, and manage orders  
✅ **Payment Integration** - Razorpay for online payments  
✅ **Email Notifications** - Automatic order confirmations  
✅ **Dynamic Pricing** - Database-driven pricing management  
✅ **Contact Form** - Customer inquiries and feedback  
✅ **Admin Dashboard** - Order tracking and management  
✅ **Testimonials** - Customer reviews with approval workflow  

## Tech Stack

- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **Razorpay** - Payment gateway
- **Nodemailer** - Email notifications
- **JWT** - Authentication (for admin)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend` folder:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB - Get from MongoDB Atlas (https://cloud.mongodb.com)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dryclean

# Razorpay - Get from Razorpay Dashboard (https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Email - Gmail App Password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=devbhoomidrycleaner38@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Admin
ADMIN_EMAIL=devbhoomidrycleaner38@gmail.com
ADMIN_PHONE=+919958843588
ADMIN_API_KEY=your_secure_random_key_here

# Frontend
FRONTEND_URL=https://sahilrouthan.github.io/Devbhoomi-Drycleaner
```

### 3. Setup MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to https://cloud.mongodb.com
2. Create free account
3. Create new cluster
4. Create database user
5. Whitelist IP: `0.0.0.0/0` (allow all)
6. Get connection string
7. Replace in `.env`

#### Option B: Local MongoDB

```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod
```

### 4. Setup Gmail for Emails

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password:
   - Go to Security → App passwords
   - Select "Mail" and "Other device"
   - Copy 16-character password
   - Use in `.env` as `EMAIL_PASSWORD`

### 5. Setup Razorpay

1. Sign up at https://razorpay.com
2. Go to Settings → API Keys
3. Generate Test/Live keys
4. Copy Key ID and Secret to `.env`

### 6. Seed Pricing Data

```bash
npm run seed
```

This imports all pricing from `src/data/pricing.json` into MongoDB.

### 7. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run at `http://localhost:5000`

## API Endpoints

### Public APIs

#### Pricing
- `GET /api/pricing` - Get all active pricing
- `GET /api/pricing/all` - Get pricing grouped by category

#### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:orderId` - Get order by ID
- `GET /api/orders/customer/:phone` - Get customer's orders

#### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify-payment` - Verify payment signature
- `GET /api/payment/payment/:paymentId` - Get payment details

#### Contact
- `POST /api/contact` - Submit contact form

#### Testimonials
- `GET /api/testimonials` - Get approved testimonials
- `POST /api/testimonials` - Submit new testimonial

### Admin APIs (Requires `x-api-key` header)

#### Dashboard
- `GET /api/admin/stats` - Get dashboard statistics

#### Orders
- `GET /api/admin/orders` - Get all orders (with filters)
- `PATCH /api/admin/orders/:orderId/status` - Update order status

#### Pricing
- `GET /api/admin/pricing` - Get all pricing items
- `POST /api/admin/pricing` - Create new pricing item
- `PATCH /api/admin/pricing/:id` - Update pricing item

#### Contacts
- `GET /api/admin/contacts` - Get all contact submissions

#### Testimonials
- `GET /api/admin/testimonials` - Get all testimonials
- `PATCH /api/admin/testimonials/:id/approve` - Approve testimonial

## API Usage Examples

### Create Order (COD)

```javascript
const response = await fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [
      { id: 'mens-1', name: 'Shirt', price: 120, quantity: 2, category: 'mens' }
    ],
    subtotal: 240,
    discount: 0,
    total: 240,
    customerName: 'Sahil Routhan',
    customerPhone: '+919958843588',
    customerEmail: 'customer@example.com',
    pickupAddress: 'B-70, Sashi Garden, Delhi-110091',
    deliveryAddress: 'Same as pickup',
    paymentMethod: 'cod'
  })
});

const data = await response.json();
console.log(data.order.orderId); // Order ID
```

### Create Order (Online Payment)

```javascript
// Step 1: Create Razorpay order
const orderResponse = await fetch('http://localhost:5000/api/payment/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 240, receipt: 'order_001' })
});

const { order } = await orderResponse.json();

// Step 2: Open Razorpay checkout (frontend)
const options = {
  key: 'rzp_test_xxxxx',
  amount: order.amount,
  currency: 'INR',
  order_id: order.id,
  handler: async function(response) {
    // Step 3: Verify payment
    const verifyResponse = await fetch('http://localhost:5000/api/payment/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      })
    });
    
    // Step 4: Create order with payment details
    // ... (same as COD but add paymentId and razorpayOrderId)
  }
};

const razorpay = new Razorpay(options);
razorpay.open();
```

### Admin: Get Orders

```javascript
const response = await fetch('http://localhost:5000/api/admin/orders?status=pending', {
  headers: {
    'x-api-key': 'your_admin_api_key'
  }
});

const { orders } = await response.json();
```

## Deployment

### Deploy to Render.com (Free)

1. Create account at https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Add environment variables from `.env`
5. Deploy!

### Deploy to Railway.app (Free)

1. Create account at https://railway.app
2. New Project → Deploy from GitHub
3. Select repository and `backend` folder
4. Add environment variables
5. Deploy!

### Deploy to Heroku

```bash
# Install Heroku CLI
heroku login
heroku create devbhoomi-backend

# Set environment variables
heroku config:set MONGODB_URI=xxx
heroku config:set RAZORPAY_KEY_ID=xxx
# ... set all env vars

# Deploy
git subtree push --prefix backend heroku main
```

## Frontend Integration

Update your frontend files to use the API:

1. Replace `localStorage` with API calls
2. Update `RAZORPAY_KEY_ID` in cart.html
3. Set `API_BASE_URL` in config

Example:
```javascript
// js/config.js
const API_BASE_URL = 'https://your-backend-url.com/api';
```

See `FRONTEND_INTEGRATION.md` for detailed instructions.

## Folder Structure

```
backend/
├── models/           # Mongoose schemas
│   ├── Order.js
│   ├── Pricing.js
│   ├── Contact.js
│   └── Testimonial.js
├── routes/           # API routes
│   ├── orders.js
│   ├── pricing.js
│   ├── payment.js
│   ├── contact.js
│   ├── testimonials.js
│   └── admin.js
├── utils/            # Helper functions
│   └── email.js
├── scripts/          # Setup scripts
│   └── seedPricing.js
├── server.js         # Main server file
├── package.json
├── .env.example
└── README.md
```

## Troubleshooting

### MongoDB Connection Error
- Check `MONGODB_URI` is correct
- Ensure IP whitelist includes your IP
- Verify database user credentials

### Email Not Sending
- Use Gmail App Password, not regular password
- Enable 2FA on Google account first
- Check EMAIL_USER and EMAIL_PASSWORD in .env

### Razorpay Errors
- Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
- Use test keys for development
- Check Razorpay dashboard for API errors

### Port Already in Use
```bash
# Change PORT in .env
PORT=3000
```

## Support

For issues or questions:
- Email: devbhoomidrycleaner38@gmail.com
- Phone: +91 99588 43588

## License

MIT License - feel free to use for your business!
