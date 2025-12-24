# Quick Twilio Setup (3 Steps)

## ✅ Step 1: Get Twilio Credentials

1. **Sign Up**: https://www.twilio.com/try-twilio
2. **Get Account SID**: Dashboard → Copy "Account SID"
3. **Get Auth Token**: Dashboard → Click "Show" next to Auth Token
4. **Get Phone Number**:
   - Phone Numbers → Manage → Get a number
   - Copy the number (format: +1234567890)

## ✅ Step 2: Add to .env File

Open `.env` file and replace these lines:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_actual_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Replace with your actual values from Step 1!**

## ✅ Step 3: Test & Restart

### Test Configuration:

```bash
node server/scripts/testTwilio.js
```

If test passes, restart server:

```bash
npm run dev
```

## 🎯 Done!

Now OTP will be sent via SMS to phone numbers!

## 📝 Important Notes

- **Phone Number Format**: Must include country code with +

  - India: `+91xxxxxxxxxx`
  - US: `+1xxxxxxxxxx`
  - UK: `+44xxxxxxxxxx`

- **Verified Numbers**: Free trial can only send to verified numbers initially

  - Add your number in Twilio Console → Verified Caller IDs

- **Testing**: Use the test script to verify setup before using

## 🆘 Need Help?

See `TWILIO_SETUP_GUIDE.md` for detailed instructions.
