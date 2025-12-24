# OTP Setup Guide

## Current Status

The OTP service is currently in **development mode**, which means:

- ✅ OTP codes are generated and stored
- ✅ OTP codes are displayed in the **server console** (terminal)
- ❌ OTP codes are **NOT sent via SMS** to your phone

## How to Get OTP (Current Setup)

1. **Request OTP** from the registration page
2. **Check your server console** (terminal where `npm run dev` is running)
3. Look for output like:
   ```
   ========================================
   📱 OTP FOR: 9519761670
   🔐 OTP CODE: 123456
   ⏰ Valid for 5 minutes
   ========================================
   ```
4. **Use that OTP code** to complete registration

## Enable Real SMS Sending (Twilio)

To send OTP codes via SMS to actual phone numbers, you need to set up Twilio:

### Step 1: Get Twilio Account

1. Sign up at https://www.twilio.com/try-twilio (free trial available)
2. Get your credentials:
   - Account SID
   - Auth Token
   - Phone Number (from Twilio)

### Step 2: Configure Environment Variables

Add these to your `.env` file in the root directory:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 3: Restart Server

After adding Twilio credentials, restart your server:

```bash
npm run dev
```

### Step 4: Test

1. Request OTP from registration page
2. You should receive SMS on your phone
3. OTP will also be logged in console (for backup)

## Alternative SMS Services

If you don't want to use Twilio, you can modify `server/utils/otpService.js` to use:

- **AWS SNS** (Amazon Simple Notification Service)
- **MessageBird**
- **Nexmo/Vonage**
- **TextLocal** (for India)
- **Any other SMS gateway**

## Development vs Production

- **Development Mode** (no Twilio configured):

  - OTP shown in console
  - OTP included in API response
  - Perfect for testing

- **Production Mode** (Twilio configured):
  - OTP sent via SMS
  - OTP NOT included in API response (security)
  - OTP still logged in console for debugging

## Troubleshooting

### OTP Not Showing in Console

- Check if server is running
- Look for the formatted output with `========================================`
- Check for any error messages

### Twilio Not Working

- Verify credentials in `.env` file
- Check Twilio account balance
- Verify phone number format (should include country code)
- Check Twilio console for error logs

### Phone Number Format

- Use international format: `+1234567890`
- Include country code (e.g., `+91` for India)
- No spaces or special characters

## Quick Test

To test if OTP generation is working:

1. Go to registration page
2. Enter phone number
3. Click "Send OTP"
4. Check server console immediately
5. You should see the OTP code

The OTP is valid for **5 minutes** only!
