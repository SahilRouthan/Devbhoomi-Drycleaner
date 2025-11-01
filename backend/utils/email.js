const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send order confirmation to customer
async function sendOrderConfirmationEmail(order) {
  const itemsList = order.items.map(item => 
    `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
  ).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .order-id { font-size: 24px; font-weight: bold; color: #667eea; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f5f5f5; padding: 10px; text-align: left; }
        .total-row { font-weight: bold; font-size: 18px; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Order Confirmed!</h1>
          <p>Thank you for choosing Devbhoomi DryCleans</p>
        </div>
        <div class="content">
          <p>Dear ${order.customerName},</p>
          <p>Your order has been confirmed successfully.</p>
          
          <div class="order-id">Order ID: #${order.orderId}</div>
          
          <h3>Order Details:</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
              ${order.discount > 0 ? `
              <tr>
                <td colspan="2" style="padding: 8px; text-align: right;">Discount:</td>
                <td style="padding: 8px; text-align: right; color: green;">-₹${order.discount.toFixed(2)}</td>
              </tr>` : ''}
              <tr class="total-row">
                <td colspan="2" style="padding: 12px; text-align: right;">Total Amount:</td>
                <td style="padding: 12px; text-align: right;">₹${order.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <h3>Pickup Address:</h3>
          <p style="background: #f9f9f9; padding: 15px; border-left: 3px solid #667eea;">
            ${order.pickupAddress}
          </p>
          
          <h3>Payment Method:</h3>
          <p><strong>${order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '✓ Paid Online'}</strong></p>
          
          <div style="background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>What's Next?</strong><br>
            We'll contact you at <strong>${order.customerPhone}</strong> within 24 hours to schedule the pickup.
          </div>
          
          <p>If you have any questions, feel free to contact us:</p>
          <p>
            📞 Phone: <a href="tel:+919958843588">+91 99588 43588</a><br>
            📧 Email: <a href="mailto:devbhoomidrycleaner38@gmail.com">devbhoomidrycleaner38@gmail.com</a><br>
            💬 WhatsApp: <a href="https://wa.me/919958843588">Chat with us</a>
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0; color: #666;">
            <strong>Devbhoomi DryCleans</strong><br>
            B-70, Sashi Garden, Shiv Mandir Road, Mayur Vihar, Phase-1, Delhi-110091<br>
            Mon–Sat • 10:00 — 21:00
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Devbhoomi DryCleans" <${process.env.EMAIL_USER}>`,
    to: order.customerEmail || process.env.ADMIN_EMAIL,
    subject: `Order Confirmed #${order.orderId} - Devbhoomi DryCleans`,
    html: emailHtml
  };

  return transporter.sendMail(mailOptions);
}

// Send notification to admin
async function sendAdminNotification(order) {
  const itemsList = order.items.map(item => 
    `- ${item.name} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  const emailText = `
NEW ORDER RECEIVED!

Order ID: #${order.orderId}
Date: ${new Date(order.createdAt).toLocaleString('en-IN')}

CUSTOMER DETAILS:
Name: ${order.customerName}
Phone: ${order.customerPhone}
Email: ${order.customerEmail || 'Not provided'}

PICKUP ADDRESS:
${order.pickupAddress}

ORDER ITEMS:
${itemsList}

Subtotal: ₹${order.subtotal.toFixed(2)}
Discount: -₹${order.discount.toFixed(2)}
TOTAL: ₹${order.total.toFixed(2)}

Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
Payment Status: ${order.paymentStatus}

---
Please contact the customer to schedule pickup.
  `;

  const mailOptions = {
    from: `"Devbhoomi DryCleans System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🔔 New Order #${order.orderId} - ₹${order.total}`,
    text: emailText
  };

  return transporter.sendMail(mailOptions);
}

// Send contact form confirmation
async function sendContactConfirmationEmail(contact) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; }
        .content { background: #fff; padding: 20px; border: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Thank You for Contacting Us!</h2>
        </div>
        <div class="content">
          <p>Dear ${contact.name},</p>
          <p>We have received your message and will get back to you within 24 hours.</p>
          <p><strong>Your Message:</strong><br>${contact.message}</p>
          <p>If urgent, please call us at <a href="tel:+919958843588">+91 99588 43588</a></p>
          <p>Best regards,<br><strong>Devbhoomi DryCleans Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Devbhoomi DryCleans" <${process.env.EMAIL_USER}>`,
    to: contact.email,
    subject: 'We received your message - Devbhoomi DryCleans',
    html: emailHtml
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendOrderConfirmationEmail,
  sendAdminNotification,
  sendContactConfirmationEmail
};
