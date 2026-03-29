# Twilio WhatsApp + Gmail Setup Guide

This guide helps you set up WhatsApp notifications via Twilio with email (Gmail) as a fallback for the MessWala hostel management system.

## Overview

The notification system uses:
- **Primary Channel**: Twilio WhatsApp (when configured)
- **Fallback Channel**: Gmail/SMTP (automatic fallback if WhatsApp fails)
- **User Choice**: Users can select their preferred channel: `email`, `whatsapp`, or `both`

## Part 1: Gmail Setup (Email Notifications)

Gmail is used as the fallback and email notification channel.

### Step 1: Enable 2-Factor Authentication

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in the left sidebar
3. Enable **2-Step Verification** if not already enabled
   - Follow Google's prompts to verify your phone number

### Step 2: Generate App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select:
   - **App**: Mail
   - **Device**: Windows/Mac/Linux (whichever applies)
3. Click **Generate**
4. Google will display a 16-character password
5. Copy this password (you'll use it in `.env`)

### Step 3: Update Environment Variables

Add these to your `.env` file:

```env
# Gmail Configuration
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Your 16-character app password
```

### Step 4: Test Gmail

Run:
```bash
npm run health:check
```

Check the backend logs for "Email sent" messages, or use the test endpoint:

```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "email"}'
```

---

## Part 2: Twilio WhatsApp Setup

Twilio provides WhatsApp integration with both a free trial and production options.

### Step 1: Create a Twilio Account

1. Go to [twilio.com](https://www.twilio.com)
2. Click **Sign up** (free trial available)
3. Complete the account verification
4. Accept the Developer Terms

### Step 2: Get Twilio Credentials

1. Visit [Twilio Console](https://www.twilio.com/console)
2. Your **Account SID** and **Auth Token** are displayed on the main page
3. Copy these values (keep Auth Token private!)

### Step 3: Get a WhatsApp-Enabled Twilio Phone Number

**Option A: Use Twilio WhatsApp Sandbox (Free Trial)**

1. Go to [Twilio WhatsApp Sandbox](https://www.twilio.com/console/sms/whatsapp/sandbox)
2. You'll see a sandbox phone number like:
   ```
   Sandbox Number: +14155238886
   ```
3. The sandbox is pre-configured for development

**Option B: Get Production WhatsApp Number**

1. In Twilio Console, go to **Phone Numbers** → **Manage Numbers**
2. Click **Get started** or **Get a phone number**
3. Search for numbers in your country
4. Verify it supports WhatsApp
5. Purchase the number

### Step 4: Add Test Phone Number to Sandbox

**For Twilio Sandbox Only (Development)**

1. Go to [WhatsApp Sandbox](https://www.twilio.com/console/sms/whatsapp/sandbox)
2. Scroll to "Sandbox Participants"
3. Send a message from your personal WhatsApp to the sandbox number:
   ```
   join <unique-code>
   ```
   (The unique code is shown in the Sandbox page, e.g., `join flying-ocean`)

4. You'll receive a confirmation. You're now registered!

### Step 5: Update Environment Variables

Add these to your `.env` file:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+14155238886

# Your test phone number (for sandbox development)
TWILIO_TEST_PHONE=+91xxxxxxxxxx
```

**For Production (After Moving Off Sandbox)**

Remove `TWILIO_TEST_PHONE` and ensure `TWILIO_PHONE_NUMBER` is your purchased production number.

### Step 6: Update User Phone Numbers

Users must provide phone numbers in their profiles for WhatsApp:

**Frontend Form**:
```javascript
// User must input phone in format: +91-XXXXXXXXXX or 10-digit number
// System automatically formats to E.164 format (+91XXXXXXXXXX)
```

**API Endpoint**:
```bash
curl -X POST http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

---

## Part 3: Testing the Setup

### 1. Check Configuration

```bash
curl http://localhost:5000/api/notifications/config/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "config": {
    "gmail": {
      "configured": true,
      "email": "your***"
    },
    "twilio": {
      "configured": true,
      "accountSid": "ACxx***",
      "phoneNumber": "+14155238886",
      "testPhoneConfigured": true
    },
    "whatsappSupported": true
  }
}
```

### 2. Send Test Notification

Test email channel:
```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "email"}'
```

Test WhatsApp channel:
```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "whatsapp"}'
```

Test both channels (with automatic fallback):
```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "both"}'
```

### 3. Expected Behavior

**Email Channel**:
- ✅ You receive an email at SMTP_EMAIL address
- ✅ Email contains formatted HTML template with MessWala styling

**WhatsApp Channel**:
- ✅ You receive a WhatsApp message at your configured phone
- ✅ Message format: "Title\n\nContent"
- ⚠️ If WhatsApp fails (e.g., disabled account), falls back to email
- ✅ Fallback is logged in console

**Both Channel (Fallback)**:
- ✅ Tries WhatsApp first
- ✅ If WhatsApp fails, automatically sends via email
- ✅ Check logs for fallback messages:
  ```
  [warn] Failed to send whatsapp notification
  [info] Primary channel failed. Attempting fallback...
  [info] Fallback: Email sent successfully after WhatsApp failure
  ```

---

## Troubleshooting

### Issue: "Twilio not configured. WhatsApp notifications disabled."

**Solution**: Check environment variables
```bash
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
```

Ensure both are set in `.env` or system environment.

### Issue: WhatsApp Message Not Delivered (Sandbox)

**Solutions**:
1. **Not registered**: Send `join <code>` to sandbox number again
2. **Sandbox expired**: Sandbox numbers reset every 72 hours of inactivity
3. **Phone number not formateed**: Use format `+91XXXXXXXXXX` for India (no hyphens)

### Issue: "User phone number not available"

**Solution**: User must add phone number to profile first
```bash
curl -X POST http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer TOKEN" \
  -d '{"phone": "+919876543210"}'
```

### Issue: Gmail App Password Not Working

**Solutions**:
1. Ensure 2FA is enabled on Gmail account
2. Use the **16-character password** (without spaces) or **xxxx xxxx xxxx xxxx** format
3. Check password is copied correctly (no extra spaces)
4. Try regenerating the App Password in Google Account settings

### Issue: "WhatsApp: The number is not registered"

**For Sandbox**: Register your phone again with `join` command

**For Production**: Ensure:
1. Phone number is verified in Twilio
2. Phone is active and can receive WhatsApp
3. Number format is E.164 (`+` followed by country code)

---

## Fallback Mechanism (Automatic)

The system automatically falls back to email if WhatsApp fails:

```javascript
// When channel = 'both':
1. Try sending via WhatsApp
2. If WhatsApp fails:
   - Log warning about WhatsApp failure
   - Attempt email as fallback
   - Log success of fallback
3. Status: 'sent' if any channel succeeded
4. Notification includes: fallbackUsed: true
```

**Use Cases**:
- WhatsApp account disabled → Falls back to email ✅
- Phone number invalid → Falls back to email ✅
- Twilio rate limited → Falls back to email ✅
- Email disabled → Only WhatsApp is attempted

---

## Production Deployment

### Before Going Live:

1. **Move Off Sandbox**:
   - Purchase a verified WhatsApp number in Twilio Console
   - Remove `TWILIO_TEST_PHONE` from `.env`
   - Update `TWILIO_PHONE_NUMBER` to your production number

2. **WhatsApp Business Account** (Required for production):
   - Verify your business
   - Use WhatsApp Business API instead of sandbox
   - Configure message templates for compliance

3. **Set Environment**:
   ```env
   NODE_ENV=production
   ```

4. **Rate Limiting**:
   - Twilio free trial: 100 messages/month
   - Production: Pay per message (~$0.08 per message)
   - Implement rate limiting in NotificationScheduler

5. **Testing in Production**:
   ```bash
   npm run health:check
   # View logs, ensure no errors
   ```

---

## API Reference

### Check Configuration
```
GET /api/notifications/config/check
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "config": {
    "gmail": { "configured": true, ... },
    "twilio": { "configured": true, ... },
    "whatsappSupported": true
  }
}
```

### Send Test Notification
```
POST /api/notifications/test
Headers: Authorization: Bearer <token>
Body: { "channel": "email|whatsapp|both" }

Response:
{
  "success": true,
  "message": "Test notification sent successfully",
  "details": { "email": "sent", "whatsapp": "sent" },
  "fallbackUsed": false
}
```

### Get Preferences
```
GET /api/notifications/preferences
Response:
{
  "success": true,
  "channel": "both",
  "preferences": { "mealReminders": true, ... },
  "phoneConfigured": true
}
```

### Update Channel Preference
```
POST /api/notifications/preferences/channel
Body: { "preferredNotificationChannel": "email|whatsapp|both" }
```

---

## Notification Types

Supported notification types with their channels:

| Type | Email | WhatsApp | Use Case |
|------|-------|----------|----------|
| MEAL_REMINDER | ✅ | ✅ | Daily meal attendance reminder |
| PAYMENT_DUE | ✅ | ✅ | Payment deadline notification |
| COST_SUMMARY | ✅ | ❌ | Monthly cost breakdown |
| DISCREPANCY_ALERT | ✅ | ✅ | Attendance mismatch warning |
| MEAL_UPDATE | ✅ | ❌ | Meal count changes |
| EXPENSE_ADDED | ✅ | ❌ | New expense in system |
| BUDGET_EXCEEDED | ✅ | ✅ | Budget limit alert |
| ATTENDANCE_CONFIRMATION | ✅ | ✅ | Confirm attendance request |

---

## File Reference

- **Backend Models**: `src/models/Notification.js`
- **Notification Service**: `src/utils/notificationService.js`
- **Scheduler**: `src/utils/notificationScheduler.js`
- **Controller**: `src/controllers/notificationController.js`
- **Routes**: `src/routes/notificationRoutes.js`

---

## Additional Resources

- [Twilio Docs](https://www.twilio.com/docs/whatsapp)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [E.164 Phone Format](https://en.wikipedia.org/wiki/E.164)
- [Nodemailer Reddit Guide](https://www.reddit.com/r/node/comments/n7j7ro/using_nodemailer_to_send_emails/)

---

**Last Updated**: March 29, 2026
**Status**: ✅ Ready for Development & Production
