# Quick Start Guide - Backend Setup

## Step 1: Install Node.js

### Download and Install:
1. Go to: https://nodejs.org/
2. Download **LTS version** (v20.x or v18.x)
3. Run installer
4. Keep all default settings
5. Click "Next" → "Next" → "Install"
6. Restart PowerShell after installation

### Verify Installation:
```powershell
node --version
npm --version
```

Should show versions like:
```
v20.10.0
10.2.3
```

---

## Step 2: Setup MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended)

1. **Sign Up:**
   - Go to: https://cloud.mongodb.com
   - Click "Try Free"
   - Sign up with Google or Email

2. **Create Cluster:**
   - Choose FREE tier (M0)
   - Provider: AWS
   - Region: Mumbai (ap-south-1)
   - Cluster Name: DryCleanCluster
   - Click "Create"

3. **Create Database User:**
   - Security → Database Access
   - Click "Add New Database User"
   - Username: `drycleaner`
   - Password: Click "Autogenerate" (SAVE THIS PASSWORD!)
   - Built-in Role: "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP:**
   - Security → Network Access
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - IP: `0.0.0.0/0`
   - Click "Confirm"

5. **Get Connection String:**
   - Database → Connect
   - Choose "Connect your application"
   - Driver: Node.js
   - Version: 5.5 or later
   - Copy connection string:
   ```
   mongodb+srv://drycleaner:<password>@drycleancluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://drycleaner:PASSWORD@cluster.xxxxx.mongodb.net/dryclean`

---

## Step 3: Create .env File

1. **Copy template:**
```powershell
cd backend
Copy-Item .env.example .env
notepad .env
```

2. **Fill in credentials:**

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB - Your connection string from Step 2
MONGODB_URI=mongodb+srv://drycleaner:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/dryclean

# Razorpay - Use these test keys for now
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE

# Email - Your Gmail credentials
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=devbhoomidrycleaner38@gmail.com
EMAIL_PASSWORD=YOUR_APP_PASSWORD

# Admin
ADMIN_EMAIL=devbhoomidrycleaner38@gmail.com
ADMIN_PHONE=+919958843588
ADMIN_API_KEY=devbhoomi_secure_key_12345

# Frontend
FRONTEND_URL=http://127.0.0.1:5500
```

**Important:** 
- For `EMAIL_PASSWORD`, use Gmail App Password (not regular password)
- To get App Password: Google Account → Security → 2-Step Verification → App passwords

---

## Step 4: Install Dependencies

```powershell
cd backend
npm install
```

This will install:
- express (Web server)
- mongoose (MongoDB)
- razorpay (Payments)
- nodemailer (Emails)
- cors, helmet, dotenv, etc.

---

## Step 5: Import Pricing Data

```powershell
npm run seed
```

Expected output:
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

## Step 6: Start Backend Server

```powershell
npm run dev
```

Expected output:
```
✓ Server running on port 5000
✓ API available at http://localhost:5000/api
✓ MongoDB Connected
```

---

## Step 7: Test Backend

Open browser and visit:

1. **Health Check:**
   http://localhost:5000/api/health
   
   Should show:
   ```json
   {"status":"OK","timestamp":"2025-11-02T..."}
   ```

2. **Get Pricing:**
   http://localhost:5000/api/pricing/all
   
   Should show all 42 items grouped by category

---

## Troubleshooting

### "npm not found"
- Restart PowerShell after installing Node.js
- Or restart your computer

### "MongoDB connection error"
- Check MONGODB_URI in .env
- Ensure password has no special characters (or URL encode them)
- Verify IP whitelist includes 0.0.0.0/0

### "Email error"
- Use Gmail App Password (not regular password)
- Enable 2-Step Verification first

### "Port 5000 already in use"
- Change PORT in .env to 3000 or 8000

---

## Next Steps After Backend is Running

1. ✅ Backend API running
2. ✅ MongoDB connected
3. ✅ Pricing data imported
4. 📝 Update frontend to use API
5. 🚀 Deploy to production

---

## Quick Commands Reference

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Import pricing data
npm run seed

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Check Node version
node --version

# Check npm version
npm --version
```

---

## What to Do Now

1. **Install Node.js** from https://nodejs.org/
2. **Restart PowerShell**
3. **Create MongoDB Atlas account** and cluster
4. **Create .env file** with your credentials
5. **Run:** `npm install`
6. **Run:** `npm run seed`
7. **Run:** `npm run dev`

Then your backend will be live at http://localhost:5000/api

Need help with any step? Let me know!
