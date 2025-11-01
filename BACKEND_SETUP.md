# 🚀 Complete Backend Setup Guide

Your backend is ready! Follow these steps to make your website fully dynamic.

## 📋 What We Built

✅ **Complete REST API** with Express.js  
✅ **MongoDB Database** for data storage  
✅ **Razorpay Integration** for online payments  
✅ **Email Notifications** for orders  
✅ **Admin APIs** for order management  
✅ **Security** with rate limiting and validation  

---

## 🛠️ Setup Steps

### Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

This will install all required packages (Express, Mongoose, Razorpay, Nodemailer, etc.)

---

### Step 2: Setup MongoDB Database

**Option A: MongoDB Atlas (Cloud - Recommended)**

1. Go to https://cloud.mongodb.com
2. Click "Sign Up" (it's FREE)
3. Create a **FREE M0 Cluster**:
   - Provider: AWS
   - Region: Mumbai (ap-south-1)
   - Cluster Name: DryCleanCluster
4. Create Database User:
   - Username: `drycleaner`
   - Password: Generate strong password (save it!)
5. Network Access:
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
6. Get Connection String:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `dryclean`

Example:
```
mongodb+srv://drycleaner:YOUR_PASSWORD@drycleancluster.xxxxx.mongodb.net/dryclean
```

**Option B: Local MongoDB (Development Only)**

Download and install from https://www.mongodb.com/try/download/community

Connection string: `mongodb://localhost:27017/dryclean`

---

### Step 3: Setup Razorpay

1. Go to https://razorpay.com
2. Click "Sign Up" → Business Account
3. Complete verification
4. Go to **Settings** → **API Keys**
5. Generate **Test Keys** (for development)
6. Copy:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret**

---

### Step 4: Setup Gmail for Emails

1. Go to Google Account: https://myaccount.google.com
2. Enable **2-Step Verification**:
   - Security → 2-Step Verification → Turn On
3. Create **App Password**:
   - Security → App passwords
   - Select app: **Mail**
   - Select device: **Other** → Type "DryClean Backend"
   - Click **Generate**
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

---

### Step 5: Configure Environment Variables

Create `.env` file in `backend` folder:

```powershell
cd backend
Copy-Item .env.example .env
notepad .env
```

Fill in your credentials:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (from Step 2)
MONGODB_URI=mongodb+srv://drycleaner:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/dryclean

# Razorpay (from Step 3)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Email (from Step 4)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=devbhoomidrycleaner38@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop

# Admin
ADMIN_EMAIL=devbhoomidrycleaner38@gmail.com
ADMIN_PHONE=+919958843588
ADMIN_API_KEY=generate_a_random_secure_key_123456

# Frontend
FRONTEND_URL=http://127.0.0.1:5500
```

**Generate Admin API Key:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 6: Import Pricing Data

```powershell
cd backend
npm run seed
```

This imports all 42 items from `src/data/pricing.json` into MongoDB.

Output:
```
✓ Connected to MongoDB
✓ Cleared existing pricing data
✓ Inserted 42 pricing items

Pricing Summary:
  mens: 12 items
  womens: 13 items
  home: 9 items
  kids: 8 items

✓ Pricing data seeded successfully!
```

---

### Step 7: Start Backend Server

```powershell
cd backend
npm run dev
```

You should see:
```
✓ Server running on port 5000
✓ API available at http://localhost:5000/api
✓ MongoDB Connected
```

---

### Step 8: Test Backend

Open browser and visit:

- http://localhost:5000/api/health - Should show `{"status":"OK"}`
- http://localhost:5000/api/pricing/all - Should show all pricing data

---

## 🌐 Deploy Backend (Make it Live)

### Option A: Render.com (Recommended - Free)

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository: `Devbhoomi-Drycleaner`
5. Configure:
   - **Name**: `devbhoomi-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
6. Add Environment Variables:
   - Click "Environment" tab
   - Add all variables from `.env` (except PORT)
7. Click "Create Web Service"
8. Wait 3-5 minutes for deployment
9. Copy your URL: `https://devbhoomi-backend.onrender.com`

### Option B: Railway.app (Easy - Free)

1. Go to https://railway.app
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select `Devbhoomi-Drycleaner`
5. Click "Add variables" → Paste all from `.env`
6. Railway auto-detects Node.js
7. Get your URL from "Settings" → "Domains"

---

## 🔗 Connect Frontend to Backend

### Step 1: Update API Configuration

Edit `js/config.js`:

```javascript
const API_CONFIG = {
  BASE_URL: 'https://your-backend-url.onrender.com/api',  // Change this!
  RAZORPAY_KEY_ID: 'rzp_test_xxxxxxxxxxxxx',  // Your Razorpay Key
  // ... rest stays same
};
```

### Step 2: Test Live Backend

Visit: https://your-backend-url.onrender.com/api/health

Should return: `{"status":"OK","timestamp":"..."}`

---

## 📊 Admin Panel (Coming Soon)

For now, use these tools to manage:

### View Orders via API:

```javascript
// In browser console
fetch('https://your-backend-url/api/admin/orders', {
  headers: { 'x-api-key': 'your_admin_api_key_from_env' }
})
.then(r => r.json())
.then(data => console.table(data.orders))
```

### Update Order Status:

```javascript
fetch('https://your-backend-url/api/admin/orders/123456/status', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your_admin_api_key'
  },
  body: JSON.stringify({
    status: 'picked_up',
    note: 'Items collected from customer'
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

---

## 🐛 Troubleshooting

### "MongoDB connection error"
- Check MONGODB_URI is correct
- Ensure IP whitelist: 0.0.0.0/0
- Verify username/password

### "Email not sending"
- Use App Password, not regular password
- Enable 2FA first on Google Account
- Check EMAIL_USER and EMAIL_PASSWORD

### "Razorpay errors"
- Verify keys are correct
- Use test keys for development
- Check Razorpay dashboard for logs

### "Port 5000 already in use"
Change in `.env`:
```env
PORT=3000
```

---

## 📁 Backend Structure

```
backend/
├── models/              # Database schemas
│   ├── Order.js         # Order model
│   ├── Pricing.js       # Pricing model
│   ├── Contact.js       # Contact form
│   └── Testimonial.js   # Reviews
├── routes/              # API endpoints
│   ├── orders.js        # Order APIs
│   ├── pricing.js       # Pricing APIs
│   ├── payment.js       # Razorpay APIs
│   ├── contact.js       # Contact form API
│   ├── testimonials.js  # Testimonial APIs
│   └── admin.js         # Admin APIs
├── utils/
│   └── email.js         # Email functions
├── scripts/
│   └── seedPricing.js   # Import pricing data
├── server.js            # Main server
├── package.json
├── .env                 # Your credentials (don't commit!)
└── .env.example         # Template
```

---

## ✅ Checklist

Before going live, ensure:

- [ ] MongoDB connected successfully
- [ ] All pricing data imported (42 items)
- [ ] Razorpay test payment works
- [ ] Email notifications received
- [ ] Backend deployed and live
- [ ] Frontend updated with backend URL
- [ ] Test order placed successfully
- [ ] Admin can view orders

---

## 🎉 You're Done!

Your backend is now:
- ✅ Storing orders in database
- ✅ Processing payments via Razorpay
- ✅ Sending email confirmations
- ✅ Ready for production!

Next steps:
1. Test the complete order flow
2. Update Razorpay to live keys (when ready)
3. Build admin dashboard (optional)

---

## 📞 Support

Need help? Contact:
- Email: devbhoomidrycleaner38@gmail.com
- Phone: +91 99588 43588

**Backend successfully created! 🚀**
