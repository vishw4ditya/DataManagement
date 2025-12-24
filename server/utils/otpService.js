const { sendSMS } = require('./smsService');
const otpStore = new Map();

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP with expiration (5 minutes)
function storeOTP(phoneNumber, otp) {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  otpStore.set(phoneNumber, {
    code: otp,
    expiresAt: expiresAt
  });
  
  // Clean up expired OTPs
  setTimeout(() => {
    otpStore.delete(phoneNumber);
  }, 5 * 60 * 1000);
}

// Verify OTP
function verifyOTP(phoneNumber, otp) {
  const stored = otpStore.get(phoneNumber);
  if (!stored) {
    return { valid: false, message: 'OTP not found or expired' };
  }
  
  if (new Date() > stored.expiresAt) {
    otpStore.delete(phoneNumber);
    return { valid: false, message: 'OTP expired' };
  }
  
  if (stored.code !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  // OTP verified, remove it
  otpStore.delete(phoneNumber);
  return { valid: true, message: 'OTP verified' };
}

// Send OTP - Supports both Twilio (production) and console (development)
async function sendOTP(phoneNumber) {
  try {
    const otp = generateOTP();
    storeOTP(phoneNumber, otp);
    
    const messageBody = `Your OTP code is: ${otp}. Valid for 5 minutes.`;
    const result = await sendSMS(phoneNumber, messageBody);
    
    if (result.success) {
      console.log(`🔐 OTP CODE: ${otp} (also logged for backup)`);
      return { 
        success: true, 
        message: 'OTP sent successfully to your phone number!',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      };
    } else {
      // Fallback/Development mode
      console.log('\n========================================');
      console.log(`📱 OTP FOR: ${phoneNumber}`);
      console.log(`🔐 OTP CODE: ${otp}`);
      console.log(`⏰ Valid for 5 minutes`);
      console.log('========================================');
      
      if (result.message === 'Twilio not configured') {
        console.log('💡 To enable SMS sending, configure Twilio in .env file\n');
        return { 
          success: true, 
          message: 'OTP generated! Check server console for OTP code (SMS not configured).',
          otp: otp
        };
      } else {
        return { 
          success: true, 
          message: 'OTP generated! Check server console for OTP code (SMS service unavailable).',
          otp: otp
        };
      }
    }
  } catch (error) {
    console.error('❌ Error in sendOTP:', error);
    throw error;
  }
}

module.exports = {
  sendOTP,
  verifyOTP,
  generateOTP
};

