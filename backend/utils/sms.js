const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send SMS to customer when order is placed
 */
async function sendCustomerOrderSMS(orderData) {
  try {
    const message = `✅ Order Confirmed!

Hello ${orderData.customerDetails.name},

Your order #${orderData.orderId} has been received.

📦 Items: ${orderData.items.length} items
💰 Total: ₹${orderData.totalAmount}
📅 Pickup: ${orderData.pickupDate}
📍 Address: ${orderData.customerDetails.address}

${orderData.paymentMethod === 'COD' 
  ? '💵 Payment: Cash on Delivery' 
  : '✅ Payment: Paid Online'}

We'll contact you soon for pickup!

- Devbhoomi Dry Cleans
Call: ${process.env.BUSINESS_PHONE || '1234567890'}`;

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formatPhoneNumber(orderData.customerDetails.phone)
    });

    console.log('Customer SMS sent:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending customer SMS:', error.message);
    throw error;
  }
}

/**
 * Send SMS to service provider (admin) when order is received
 */
async function sendServiceProviderOrderSMS(orderData) {
  try {
    const message = `🔔 NEW ORDER!

Order #${orderData.orderId}

👤 Customer: ${orderData.customerDetails.name}
📞 Phone: ${orderData.customerDetails.phone}
📦 Items: ${orderData.items.length} items
💰 Total: ₹${orderData.totalAmount}
📅 Pickup: ${orderData.pickupDate}
💳 Payment: ${orderData.paymentMethod}

📍 Address:
${orderData.customerDetails.address}
${orderData.customerDetails.city}, ${orderData.customerDetails.pincode}

Check admin panel for details.`;

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formatPhoneNumber(process.env.ADMIN_PHONE_NUMBER)
    });

    console.log('Service provider SMS sent:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending service provider SMS:', error.message);
    throw error;
  }
}

/**
 * Send order status update SMS to customer
 */
async function sendOrderStatusUpdateSMS(orderData, newStatus) {
  try {
    let statusMessage = '';
    
    switch(newStatus) {
      case 'confirmed':
        statusMessage = '✅ Your order has been confirmed. We will collect your items soon.';
        break;
      case 'picked-up':
        statusMessage = '📦 Your items have been picked up and are being processed.';
        break;
      case 'in-process':
        statusMessage = '🧺 Your items are being cleaned and processed.';
        break;
      case 'ready':
        statusMessage = '✨ Great news! Your items are ready for delivery.';
        break;
      case 'delivered':
        statusMessage = '🎉 Your order has been delivered. Thank you for choosing us!';
        break;
      case 'cancelled':
        statusMessage = '❌ Your order has been cancelled. Contact us for details.';
        break;
      default:
        statusMessage = `📋 Order status updated to: ${newStatus}`;
    }

    const message = `Order Update - #${orderData.orderId}

Hi ${orderData.customerDetails.name},

${statusMessage}

Track your order: ${process.env.WEBSITE_URL || 'https://devbhoomidryc leans.com'}

- Devbhoomi Dry Cleans
Call: ${process.env.BUSINESS_PHONE || '1234567890'}`;

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formatPhoneNumber(orderData.customerDetails.phone)
    });

    console.log('Status update SMS sent:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending status update SMS:', error.message);
    throw error;
  }
}

/**
 * Send delivery reminder SMS to customer
 */
async function sendDeliveryReminderSMS(orderData, deliveryDate) {
  try {
    const message = `📅 Delivery Reminder

Hi ${orderData.customerDetails.name},

Your order #${orderData.orderId} is scheduled for delivery on ${deliveryDate}.

Please be available at:
${orderData.customerDetails.address}

💰 Amount: ₹${orderData.totalAmount}
${orderData.paymentMethod === 'COD' ? '💵 Cash on Delivery - Please keep exact change' : '✅ Already paid'}

- Devbhoomi Dry Cleans
Call: ${process.env.BUSINESS_PHONE || '1234567890'}`;

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formatPhoneNumber(orderData.customerDetails.phone)
    });

    console.log('Delivery reminder SMS sent:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending delivery reminder SMS:', error.message);
    throw error;
  }
}

/**
 * Format phone number to international format (+91 for India)
 */
function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If number doesn't start with country code, add +91 (India)
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  } else {
    return `+${cleaned}`;
  }
}

/**
 * Send bulk SMS to multiple customers (for promotional messages)
 */
async function sendBulkSMS(phoneNumbers, message) {
  try {
    const results = [];
    
    for (const phone of phoneNumbers) {
      const response = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formatPhoneNumber(phone)
      });
      
      results.push({
        phone,
        sid: response.sid,
        status: 'sent'
      });
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Bulk SMS sent to ${results.length} recipients`);
    return results;
  } catch (error) {
    console.error('Error sending bulk SMS:', error.message);
    throw error;
  }
}

module.exports = {
  sendCustomerOrderSMS,
  sendServiceProviderOrderSMS,
  sendOrderStatusUpdateSMS,
  sendDeliveryReminderSMS,
  sendBulkSMS,
  formatPhoneNumber
};
