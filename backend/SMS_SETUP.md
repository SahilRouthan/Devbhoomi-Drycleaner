# SMS Notification Setup Guide 📱

This guide will help you set up SMS notifications for your dry cleaning website using Twilio.

## 🌟 Features

Your customers will receive SMS for:
- ✅ Order confirmation (immediately after placing order)
- 📦 Order status updates (picked-up, in-process, ready, delivered)
- 📅 Delivery reminders
- 🎉 Promotional messages

Service provider (admin) will receive SMS for:
- 🔔 New order notifications with customer details
- 💰 Payment confirmations

## 📋 Prerequisites

- A Twilio account (free trial available)
- Indian phone number for testing (or your country's number)

## 🚀 Setup Steps

### Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number
4. You'll get **$15 free credit** for testing!

### Step 2: Get Your Credentials

After signing up, you'll see your dashboard:

1. **Account SID** - Copy this (looks like: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
2. **Auth Token** - Click to reveal and copy
3. **Phone Number** - Get a free trial phone number:
   - Click "Get a Trial Number"
   - Choose a number (preferably with SMS capability)
   - For India: You may need to buy a number (~$1/month)

### Step 3: Configure Environment Variables

Update your `backend/.env` file with Twilio credentials:

```bash
# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Admin Phone (where service provider gets notifications)
ADMIN_PHONE_NUMBER=+919958843588

# Business Phone (shown in customer SMS)
BUSINESS_PHONE=9958843588

# Website URL (for order tracking links)
WEBSITE_URL=https://sahilrouthan.github.io/Devbhoomi-Drycleaner
```

### Step 4: Verify Phone Numbers (Trial Account)

⚠️ **Important for Trial Accounts:**

Twilio trial accounts can only send SMS to **verified phone numbers**. To verify:

1. Go to Twilio Console → Phone Numbers → Verified Caller IDs
2. Click "Add a new Caller ID"
3. Enter the phone number (customer's number for testing)
4. Verify using the code sent via SMS

**For production**, upgrade to a paid account (no verification needed).

## 🇮🇳 Using Indian Phone Numbers

### Option 1: Twilio (Recommended)

**Pros:**
- Global reach
- Reliable delivery
- Easy setup
- Good documentation

**Cons:**
- Requires international number (~$1/month)
- DND (Do Not Disturb) restrictions in India

**Setup:**
1. Buy an Indian phone number from Twilio (~₹70/month)
2. Or use US number (works but shows international sender)

### Option 2: Alternative Indian SMS Gateways

For better India-specific support, consider these alternatives:

#### A) MSG91 (Popular in India)

```javascript
// Install: npm install msg91-nodejs
const MSG91 = require("msg91-nodejs");

const msg91 = new MSG91("YOUR_AUTH_KEY");

msg91.send(
  "SENDER_ID",
  ["9999999999"],
  "Your order has been confirmed!",
  (err, response) => {
    console.log(response);
  }
);
```

**Setup:**
1. Sign up at [https://msg91.com](https://msg91.com)
2. Get free credits for testing
3. Very affordable (~₹0.15 per SMS)

#### B) Fast2SMS

```javascript
// Using axios for API calls
const axios = require('axios');

axios.get('https://www.fast2sms.com/dev/bulkV2', {
  params: {
    authorization: 'YOUR_API_KEY',
    sender_id: 'FSTSMS',
    message: 'Your order is confirmed',
    route: 'v3',
    numbers: '9999999999'
  }
});
```

**Setup:**
1. Sign up at [https://www.fast2sms.com](https://www.fast2sms.com)
2. Get API key
3. Very cheap (~₹0.10 per SMS)

#### C) TextLocal (India)

```javascript
const axios = require('axios');

axios.post('https://api.textlocal.in/send/', {
  apikey: 'YOUR_API_KEY',
  numbers: '9999999999',
  sender: 'TXTLCL',
  message: 'Your order is confirmed'
});
```

## 🔄 Switching to MSG91 (Indian Gateway)

If you prefer MSG91 over Twilio:

1. **Install MSG91 package:**
```bash
npm install msg91-nodejs
```

2. **Create new SMS utility** (`backend/utils/sms-msg91.js`):
```javascript
const MSG91 = require('msg91-nodejs');

const msg91 = new MSG91(process.env.MSG91_AUTH_KEY);

async function sendCustomerOrderSMS(orderData) {
  const message = `Order Confirmed! #${orderData.orderId}
Total: ₹${orderData.totalAmount}
We'll pickup soon!
- Devbhoomi Dry Cleans`;

  return msg91.send(
    process.env.MSG91_SENDER_ID,
    [orderData.customerDetails.phone],
    message
  );
}

module.exports = { sendCustomerOrderSMS };
```

3. **Update .env:**
```bash
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=DRYCEL
```

## 📱 SMS Message Templates

### Customer Order Confirmation
```
✅ Order Confirmed!

Hello [Name],

Your order #[OrderID] has been received.

📦 Items: X items
💰 Total: ₹XXX
📅 Pickup: [Date]

💵 Payment: Cash on Delivery

We'll contact you soon!

- Devbhoomi Dry Cleans
Call: [Phone]
```

### Service Provider Alert
```
🔔 NEW ORDER!

Order #[OrderID]

👤 Customer: [Name]
📞 Phone: [Phone]
📦 Items: X items
💰 Total: ₹XXX
📅 Pickup: [Date]

📍 Address:
[Full Address]

Check admin panel for details.
```

### Status Update
```
Order Update - #[OrderID]

Hi [Name],

✨ Great news! Your items are ready for delivery.

Track your order: [Website Link]

- Devbhoomi Dry Cleans
Call: [Phone]
```

## 🧪 Testing

### Test SMS Sending

1. **Start your backend server:**
```bash
cd backend
npm start
```

2. **Place a test order** through your website

3. **Check console logs** for SMS status:
```
Customer SMS sent: SM1234567890abcdef
Service provider SMS sent: SM0987654321fedcba
```

4. **Check Twilio dashboard** for delivery status

### Manual Test via Node.js

Create `backend/test-sms.js`:

```javascript
require('dotenv').config();
const { sendCustomerOrderSMS } = require('./utils/sms');

const testOrder = {
  orderId: '123456',
  customerDetails: {
    name: 'Test Customer',
    phone: '+919999999999', // Use your verified number
    address: 'Test Address, Delhi',
    city: 'Delhi',
    pincode: '110001'
  },
  items: [{ name: 'Shirt', quantity: 2 }],
  totalAmount: 150,
  pickupDate: new Date().toLocaleDateString('en-IN'),
  paymentMethod: 'COD'
};

sendCustomerOrderSMS(testOrder)
  .then(() => console.log('SMS sent!'))
  .catch(err => console.error('Error:', err));
```

Run: `node backend/test-sms.js`

## 💰 Pricing Comparison

| Service | Cost per SMS | Free Credits | Best For |
|---------|-------------|--------------|----------|
| **Twilio** | $0.0079 (~₹0.65) | $15 trial | International, Reliable |
| **MSG91** | ₹0.15 | ₹20 signup | India-focused, Cheap |
| **Fast2SMS** | ₹0.10 | ₹10 signup | Budget-friendly |
| **TextLocal** | ₹0.18 | ₹100 signup | Promotional SMS |

## 🚨 Important Notes

### DND (Do Not Disturb) in India

- **Transactional SMS** (order updates): Can be sent to DND numbers ✅
- **Promotional SMS** (offers): Cannot be sent to DND numbers ❌
- Use transactional routes for order-related messages
- Use promotional routes only for offers/marketing

### Message Length

- **160 characters** = 1 SMS credit
- **306 characters** = 2 SMS credits
- Keep messages concise to save costs!

### Delivery Time

- Most SMS deliver within **5-10 seconds**
- During network issues, may take up to **1 minute**
- Check delivery reports in your SMS provider dashboard

## 🔐 Security Best Practices

1. **Never commit credentials** to Git
2. **Use environment variables** for all secrets
3. **Rotate API keys** regularly
4. **Monitor usage** to detect unusual activity
5. **Set spending limits** in SMS provider dashboard

## 📊 Monitoring & Analytics

### Track SMS Delivery

All SMS services provide dashboards to track:
- Delivery rate
- Failed messages
- Cost analysis
- Response time

### Common Failure Reasons

1. **Invalid phone number** - Verify format (+91XXXXXXXXXX)
2. **Network issues** - SMS provider will retry
3. **DND restrictions** - Use transactional templates
4. **Insufficient credits** - Top up your account
5. **Blocked sender ID** - Contact support

## 🆘 Troubleshooting

### SMS Not Received?

1. **Check console logs** for error messages
2. **Verify phone number format** (+91 for India)
3. **Check SMS provider dashboard** for delivery status
4. **Ensure phone is verified** (trial accounts)
5. **Check network connectivity**

### Error: "Authentication failed"

- Double-check `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
- Ensure no extra spaces in .env file
- Restart backend server after updating .env

### Error: "Unable to create record"

- Phone number must include country code (+91)
- Use format: `+919999999999` (no spaces or dashes)

## 📞 Support

- **Twilio Support:** [https://support.twilio.com](https://support.twilio.com)
- **MSG91 Support:** [https://msg91.com/help](https://msg91.com/help)
- **Developer Documentation:** Check respective service docs

## 🎯 Next Steps

1. ✅ Set up Twilio account
2. ✅ Configure environment variables
3. ✅ Test SMS sending
4. 📱 Upgrade to paid account (when ready for production)
5. 🇮🇳 Consider switching to Indian SMS gateway for lower costs
6. 📊 Monitor SMS delivery and costs
7. 🎨 Customize SMS templates as needed

---

**Pro Tip:** Start with Twilio for testing (easy setup), then switch to MSG91 or Fast2SMS for production in India (much cheaper)!

