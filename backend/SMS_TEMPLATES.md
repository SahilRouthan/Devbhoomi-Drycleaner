# SMS Templates - User Friendly Messages 📱

These are the actual SMS messages your customers and service provider will receive.

## 📨 Customer Messages

### 1. Order Confirmation (Immediate)

**When:** Customer places an order  
**Sent to:** Customer's phone number

```
✅ Order Confirmed!

Hello [Customer Name],

Your order #123456 has been received.

📦 Items: 3 items
💰 Total: ₹180
📅 Pickup: 02-Nov-2025
📍 Address: 123 Test Street, Dehradun

💵 Payment: Cash on Delivery

We'll contact you soon for pickup!

- Devbhoomi Dry Cleans
Call: 9958843588
```

---

### 2. Order Confirmed by Admin

**When:** Admin confirms the order  
**Sent to:** Customer

```
Order Update - #123456

Hi [Customer Name],

✅ Your order has been confirmed. We will collect your items soon.

Track your order: https://sahilrouthan.github.io/Devbhoomi-Drycleaner

- Devbhoomi Dry Cleans
Call: 9958843588
```

---

### 3. Items Picked Up

**When:** Driver picks up items from customer  
**Sent to:** Customer

```
Order Update - #123456

Hi [Customer Name],

📦 Your items have been picked up and are being processed.

Track your order: https://sahilrouthan.github.io/Devbhoomi-Drycleaner

- Devbhoomi Dry Cleans
Call: 9958843588
```

---

### 4. Items in Processing

**When:** Items are being cleaned  
**Sent to:** Customer

```
Order Update - #123456

Hi [Customer Name],

🧺 Your items are being cleaned and processed.

Track your order: https://sahilrouthan.github.io/Devbhoomi-Drycleaner

- Devbhoomi Dry Cleans
Call: 9958843588
```

---

### 5. Items Ready for Delivery

**When:** Cleaning completed, ready to deliver  
**Sent to:** Customer

```
Order Update - #123456

Hi [Customer Name],

✨ Great news! Your items are ready for delivery.

Track your order: https://sahilrouthan.github.io/Devbhoomi-Drycleaner

- Devbhoomi Dry Cleans
Call: 9958843588
```

---

### 6. Order Delivered

**When:** Items delivered to customer  
**Sent to:** Customer

```
Order Update - #123456

Hi [Customer Name],

🎉 Your order has been delivered. Thank you for choosing us!

Track your order: https://sahilrouthan.github.io/Devbhoomi-Drycleaner

- Devbhoomi Dry Cleans
Call: 9958843588
```

---

### 7. Delivery Reminder

**When:** Scheduled 1 day before delivery  
**Sent to:** Customer

```
📅 Delivery Reminder

Hi [Customer Name],

Your order #123456 is scheduled for delivery on 03-Nov-2025.

Please be available at:
123 Test Street, Dehradun

💰 Amount: ₹180
💵 Cash on Delivery - Please keep exact change

- Devbhoomi Dry Cleans
Call: 9958843588
```

---

## 🔔 Service Provider (Admin) Messages

### 1. New Order Alert

**When:** Customer places an order  
**Sent to:** Service provider/admin phone

```
🔔 NEW ORDER!

Order #123456

👤 Customer: Sahil Routhan
📞 Phone: 9958843588
📦 Items: 3 items
💰 Total: ₹180
📅 Pickup: 02-Nov-2025
💳 Payment: COD

📍 Address:
123 Test Street, Dehradun
Dehradun, 248001

Check admin panel for details.
```

---

## 🎨 Customization Options

You can customize these messages by editing `backend/utils/sms.js`:

### Add Emojis for Better Engagement

Current emojis used:
- ✅ Confirmation
- 📦 Package/Items
- 💰 Money/Payment
- 📅 Date/Calendar
- 📍 Location/Address
- 💵 Cash on Delivery
- 🔔 Notification/Alert
- 👤 Person/Customer
- 📞 Phone
- ✨ Sparkles/Ready
- 🎉 Celebration/Delivered
- 🧺 Laundry/Processing

### Add Business Branding

Include:
- Business name
- Contact number
- Website URL
- Social media handles (optional)

### Personalization

Each message includes:
- Customer name
- Order ID
- Order amount
- Item count
- Delivery address

### Language Support

Currently in English. To add Hindi/local language:

```javascript
// Example: Hindi message
const hindiMessage = `✅ ऑर्डर कन्फर्म!

नमस्ते ${orderData.customerDetails.name},

आपका ऑर्डर #${orderData.orderId} प्राप्त हो गया है।

📦 वस्तुएं: ${orderData.items.length} आइटम
💰 कुल: ₹${orderData.totalAmount}

हम जल्द ही आपसे संपर्क करेंगे!

- देवभूमि ड्राई क्लीनर्स`;
```

---

## 📏 Message Length Guidelines

### SMS Length & Cost
- **1 SMS** = Up to 160 characters
- **2 SMS** = 161-306 characters
- **3 SMS** = 307-459 characters

### Current Message Lengths
- Order confirmation: ~200 chars (2 SMS)
- Status update: ~150 chars (1 SMS)
- New order alert: ~250 chars (2 SMS)

### Tips to Save Costs
1. Remove emojis (saves 2 chars each)
2. Use short URLs (bit.ly)
3. Use abbreviations:
   - "Qty" instead of "Quantity"
   - "COD" instead of "Cash on Delivery"
   - "Del" instead of "Delivery"

---

## 🎯 Trigger Points

### Automatic SMS (No Manual Action)

1. **Order Placed** → Customer + Admin SMS
2. **Payment Received** → Customer confirmation

### Manual SMS (Admin Action Required)

3. **Order Confirmed** → Customer SMS
4. **Items Picked Up** → Customer SMS
5. **In Processing** → Customer SMS
6. **Ready for Delivery** → Customer SMS
7. **Delivered** → Customer SMS

### Scheduled SMS

8. **Delivery Reminder** → 1 day before delivery

---

## 🚫 When NOT to Send SMS

### Avoid SMS Spam

- Don't send multiple messages within 5 minutes
- Don't send promotional content in transactional messages
- Don't send SMS after 9 PM (respect customer time)
- Get consent for promotional messages

### Respect DND (Do Not Disturb)

- Transactional SMS (order updates): ✅ Allowed
- Promotional SMS (offers, discounts): ❌ Not allowed to DND numbers

---

## 💬 SMS Response Handling

### Customer Queries via SMS

If customers reply to SMS, they'll reach your Twilio number. You can:

1. **Forward to Admin** - Auto-forward replies to admin phone
2. **Auto-reply** - Send automated response
3. **Ignore** - SMS is one-way only

### Setup Auto-Reply

```javascript
// In backend/routes/sms-webhook.js
router.post('/sms-reply', (req, res) => {
  const { From, Body } = req.body;
  
  // Send auto-reply
  client.messages.create({
    body: 'Thank you for your message! For urgent queries, please call 9958843588.',
    to: From,
    from: process.env.TWILIO_PHONE_NUMBER
  });
  
  res.status(200).send('OK');
});
```

---

## 📊 SMS Analytics

### Track Performance

Monitor in Twilio dashboard:
- **Delivery Rate** - How many SMS reached customers
- **Response Time** - Average delivery time
- **Failed Messages** - Identify issues
- **Cost Analysis** - Monthly spending

### Success Metrics

Good SMS performance:
- 📈 Delivery rate: >95%
- ⚡ Delivery time: <10 seconds
- 📱 Open rate: ~98% (people read SMS!)
- 💰 ROI: High (direct communication)

---

## 🔐 Privacy & Compliance

### Data Protection

- Store phone numbers securely
- Don't share customer data
- Allow opt-out from promotional SMS
- Follow TRAI (India) regulations

### Message Footer

Always include:
- Business name
- Contact number for opt-out
- Clear call-to-action

---

## ✨ Pro Tips

### 1. Timing Matters
- Send order confirmation immediately
- Send pickup/delivery SMS during business hours (9 AM - 7 PM)
- Avoid early morning (before 8 AM) or late night (after 9 PM)

### 2. Personalization Works
- Use customer's name
- Reference specific order details
- Make it conversational

### 3. Clear Call-to-Action
- Include phone number to call
- Add website link for tracking
- Make next steps obvious

### 4. Professional Tone
- Friendly but professional
- Use proper grammar
- Avoid excessive abbreviations

### 5. Test Everything
- Test with your own phone first
- Verify all phone numbers
- Check message formatting on different phones

---

## 🆘 Troubleshooting

### Customer Says "Didn't Receive SMS"

1. Check delivery status in Twilio dashboard
2. Verify phone number format (+91 prefix)
3. Check if number has DND activated
4. Resend SMS manually

### Message Shows Strange Characters

- Avoid special Unicode characters
- Test emojis (some may not display on all phones)
- Use standard English characters

### SMS Delayed

- Network congestion (peak hours)
- Twilio rate limits
- Customer phone off/no signal

---

## 🎯 Next Steps

1. ✅ Review all message templates
2. ✅ Customize messages with your branding
3. ✅ Test SMS with your phone number
4. ✅ Configure Twilio account
5. 📱 Start sending SMS to customers!

---

**Need Help?** Contact support or check [SMS_SETUP.md](./SMS_SETUP.md) for technical setup.

