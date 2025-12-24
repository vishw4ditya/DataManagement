// Test Twilio Configuration
// Run: node server/scripts/testTwilio.js

require('dotenv').config();

async function testTwilio() {
  console.log('\n🧪 Testing Twilio Configuration...\n');
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  // Check if credentials are set
  console.log('📋 Configuration Check:');
  console.log(`   Account SID: ${accountSid ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Auth Token: ${authToken ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Phone Number: ${phoneNumber ? '✅ Set' : '❌ Missing'}`);
  
  if (!accountSid || !authToken || !phoneNumber) {
    console.log('\n❌ Twilio not fully configured!');
    console.log('   Please add credentials to .env file');
    console.log('   See TWILIO_SETUP_GUIDE.md for instructions\n');
    process.exit(1);
  }
  
  // Check if credentials are placeholders
  if (accountSid.includes('your_') || authToken.includes('your_') || phoneNumber.includes('1234567890')) {
    console.log('\n⚠️  Warning: Using placeholder values!');
    console.log('   Please replace with your actual Twilio credentials\n');
    process.exit(1);
  }
  
  // Test Twilio connection
  try {
    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);
    
    console.log('\n🔄 Testing Twilio connection...');
    
    // Get account info
    const account = await client.api.accounts(accountSid).fetch();
    console.log(`✅ Connected to Twilio!`);
    console.log(`   Account Name: ${account.friendlyName}`);
    console.log(`   Status: ${account.status}`);
    
    // Test phone number format
    console.log(`\n📱 Phone Number: ${phoneNumber}`);
    if (!phoneNumber.startsWith('+')) {
      console.log('⚠️  Warning: Phone number should start with + (country code)');
    }
    
    console.log('\n✅ Twilio is configured correctly!');
    console.log('   You can now send SMS OTPs\n');
    
  } catch (error) {
    console.error('\n❌ Twilio Connection Failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 20003) {
      console.error('   → Invalid Account SID or Auth Token');
      console.error('   → Check your .env file credentials');
    } else if (error.code === 20404) {
      console.error('   → Account not found');
      console.error('   → Verify your Account SID');
    } else {
      console.error('   → Check Twilio_SETUP_GUIDE.md for help');
    }
    console.log('');
    process.exit(1);
  }
}

testTwilio();

