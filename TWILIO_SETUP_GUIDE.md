# Complete Twilio SMS Setup Guide

## Step 1: Get Twilio Account & Credentials

### 1.1 Sign Up for Twilio

1. Go to: https://www.twilio.com/try-twilio
2. Click "Start Free Trial"
3. Fill in your details:
   - Email address
   - Password
   - Phone number (for verification)
4. Verify your email and phone number

### 1.2 Get Your Credentials

After signing up, you'll land on the Twilio Console Dashboard:

1. **Account SID**:

   - Found on the dashboard homepage
   - Looks like: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Copy this value

2. **Auth Token**:

   - Click "Show" next to Auth Token on dashboard
   - Looks like: `your_auth_token_here`
   - Copy this value (keep it secret!)

3. **Phone Number**:
   - Go to "Phone Numbers" → "Manage" → "Active Numbers"
   - If you don't have one, click "Get a number"
   - Choose a number (free trial numbers available)
   - Format: `+1234567890` (with country code and + sign)
   - Copy this number

### 1.3 Verify Your Phone (For Testing)

- In Twilio Console, go to "Verified Caller IDs"
- Add your phone number to receive test messages
- Verify it via SMS/call

## Step 2: Configure Environment Variables

### 2.1 Create .env File

I'll create a template for you. You need to fill in your actual Twilio credentials.

### 2.2 Add Twilio Credentials

Open the `.env` file and add:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Important:**

- Replace `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual Account SID
- Replace `your_auth_token_here` with your actual Auth Token
- Replace `+1234567890` with your Twilio phone number (must include + and country code)

## Step 3: Restart Server

After adding credentials:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Testing

1. Go to registration page
2. Enter your **verified phone number** (the one you added in Twilio)
3. Click "Send OTP"
4. You should receive SMS on your phone!
5. Check server console for confirmation

## Troubleshooting

### "Invalid phone number"

- Make sure phone number includes country code
- Format: `+1234567890` (not `1234567890`)
- For India: `+91xxxxxxxxxx`
- For US: `+1xxxxxxxxxx`

### "Unauthorized" Error

- Check if Account SID and Auth Token are correct
- Make sure there are no extra spaces in .env file
- Restart server after changing .env

### "Unverified number" Error

- Add your phone number to "Verified Caller IDs" in Twilio Console
- Or use your Twilio trial number for testing

### SMS Not Received

- Check Twilio Console → Logs → Debugger for errors
- Verify phone number format
- Check Twilio account balance (free trial has limits)
- Make sure number is verified in Twilio

## Free Trial Limits

Twilio free trial includes:

- Limited SMS credits
- Can only send to verified numbers (initially)
- After verification, can send to any number

## Cost Information

- Twilio free trial: ~$15.50 credit
- SMS cost: ~$0.0075 per message (varies by country)
- You can send ~2000 messages with free trial credit

## Next Steps After Setup

1. Test with your verified number
2. Once working, you can verify more numbers
3. For production, upgrade Twilio account
4. Set up webhook for delivery status (optional)
