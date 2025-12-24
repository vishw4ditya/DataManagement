const twilio = require('twilio');

/**
 * Send an SMS message using Twilio
 * @param {string} to - Recipient phone number
 * @param {string} body - Message body
 * @returns {Promise<object>} - Result of the send operation
 */
async function sendSMS(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  const isConfigured = accountSid && authToken && from;

  if (!isConfigured) {
    console.log('\n========================================');
    console.log('⚠️  SMS NOT SENT (Twilio not configured)');
    console.log(`To: ${to}`);
    console.log(`Body: ${body}`);
    console.log('========================================\n');
    return { success: false, message: 'Twilio not configured' };
  }

  try {
    const client = twilio(accountSid, authToken);
    
    // Ensure phone number starts with +
    const formattedTo = to.startsWith('+') ? to : `+${to}`;
    
    const message = await client.messages.create({
      body,
      to: formattedTo,
      from
    });

    console.log(`✅ SMS sent successfully! SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('❌ Error sending SMS via Twilio:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendSMS };

