/**
 * Test SMS functionality
 * 
 * Usage: node test-sms.js
 * 
 * Make sure to:
 * 1. Configure TWILIO credentials in .env
 * 2. Verify phone numbers (for trial accounts)
 * 3. Replace test phone number with your verified number
 */

require('dotenv').config();
const { 
  sendCustomerOrderSMS, 
  sendServiceProviderOrderSMS,
  sendOrderStatusUpdateSMS,
  formatPhoneNumber 
} = require('./utils/sms');

// Test data
const testOrderData = {
  orderId: '123456',
  customerDetails: {
    name: 'Sahil Routhan',
    phone: '+919958843588', // Replace with your verified phone number
    address: '123 Test Street, Dehradun',
    city: 'Dehradun',
    pincode: '248001'
  },
  items: [
    { name: 'Shirt', quantity: 2, price: 50 },
    { name: 'Trouser', quantity: 1, price: 80 }
  ],
  totalAmount: 180,
  pickupDate: new Date().toLocaleDateString('en-IN'),
  paymentMethod: 'COD'
};

console.log('🧪 Testing SMS Functionality...\n');

// Test 1: Customer Order SMS
async function testCustomerOrderSMS() {
  console.log('📱 Test 1: Sending Customer Order Confirmation SMS...');
  try {
    const result = await sendCustomerOrderSMS(testOrderData);
    console.log('✅ Customer SMS sent successfully!');
    console.log('   Message SID:', result.sid);
    console.log('   Status:', result.status);
    console.log('   To:', result.to);
    console.log('');
  } catch (error) {
    console.error('❌ Failed to send customer SMS:', error.message);
    console.log('');
  }
}

// Test 2: Service Provider SMS
async function testServiceProviderSMS() {
  console.log('📱 Test 2: Sending Service Provider Notification SMS...');
  try {
    const result = await sendServiceProviderOrderSMS(testOrderData);
    console.log('✅ Service provider SMS sent successfully!');
    console.log('   Message SID:', result.sid);
    console.log('   Status:', result.status);
    console.log('   To:', result.to);
    console.log('');
  } catch (error) {
    console.error('❌ Failed to send service provider SMS:', error.message);
    console.log('');
  }
}

// Test 3: Status Update SMS
async function testStatusUpdateSMS() {
  console.log('📱 Test 3: Sending Order Status Update SMS...');
  try {
    const result = await sendOrderStatusUpdateSMS(testOrderData, 'ready');
    console.log('✅ Status update SMS sent successfully!');
    console.log('   Message SID:', result.sid);
    console.log('   Status:', result.status);
    console.log('   To:', result.to);
    console.log('');
  } catch (error) {
    console.error('❌ Failed to send status update SMS:', error.message);
    console.log('');
  }
}

// Test 4: Phone Number Formatting
function testPhoneFormatting() {
  console.log('📱 Test 4: Testing Phone Number Formatting...');
  
  const testNumbers = [
    '9999999999',
    '+919999999999',
    '919999999999',
    '09999999999'
  ];
  
  testNumbers.forEach(num => {
    const formatted = formatPhoneNumber(num);
    console.log(`   ${num} → ${formatted}`);
  });
  console.log('');
}

// Run all tests
async function runAllTests() {
  console.log('=' .repeat(50));
  console.log('SMS FUNCTIONALITY TEST SUITE');
  console.log('=' .repeat(50));
  console.log('');
  
  // Check if Twilio credentials are configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.error('❌ ERROR: Twilio credentials not configured!');
    console.log('');
    console.log('Please add the following to your .env file:');
    console.log('  TWILIO_ACCOUNT_SID=your_account_sid');
    console.log('  TWILIO_AUTH_TOKEN=your_auth_token');
    console.log('  TWILIO_PHONE_NUMBER=+1234567890');
    console.log('  ADMIN_PHONE_NUMBER=+919958843588');
    console.log('');
    console.log('See SMS_SETUP.md for detailed setup instructions.');
    process.exit(1);
  }
  
  console.log('✅ Twilio credentials found');
  console.log('   Account SID:', process.env.TWILIO_ACCOUNT_SID.substring(0, 10) + '...');
  console.log('   Twilio Phone:', process.env.TWILIO_PHONE_NUMBER);
  console.log('   Admin Phone:', process.env.ADMIN_PHONE_NUMBER);
  console.log('');
  
  // Test phone formatting (no API calls)
  testPhoneFormatting();
  
  // Confirm before sending actual SMS
  console.log('⚠️  IMPORTANT: The following tests will send actual SMS messages.');
  console.log('   This will use your Twilio credits.');
  console.log('');
  console.log('   For trial accounts, ensure the recipient numbers are verified.');
  console.log('   Visit: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
  console.log('');
  
  // Wait a bit to let user see the warning
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Run SMS tests sequentially (to avoid rate limiting)
  await testCustomerOrderSMS();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testServiceProviderSMS();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testStatusUpdateSMS();
  
  console.log('=' .repeat(50));
  console.log('TEST SUITE COMPLETED');
  console.log('=' .repeat(50));
  console.log('');
  console.log('📊 Check your Twilio dashboard for delivery details:');
  console.log('   https://console.twilio.com/us1/monitor/logs/sms');
  console.log('');
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('');
  console.error('❌ Unhandled error:', error.message);
  console.error('');
  process.exit(1);
});

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
