# Integration Guides

Learn how to integrate MessWala with popular third-party services and platforms.

## Table of Contents

- [Slack Integration](#slack-integration)
- [Google Sheets Integration](#google-sheets-integration)
- [Telegram Bot Integration](#telegram-bot-integration)
- [Webhooks](#webhooks)

---

## Slack Integration

### Setup

1. Create a Slack App at [https://api.slack.com/apps](https://api.slack.com/apps)
2. Enable Incoming Webhooks
3. Create a Webhook URL
4. Add the webhook URL to MessWala settings

### Features

- **Daily Menu Notifications** - Automatic menu updates to Slack channel
- **Expense Alerts** - Daily expense summary
- **Attendance Reminders** - Noon reminders for students to mark attendance
- **Admin Reports** - Weekly reports to admin channels

### Configuration

```json
{
  "slack": {
    "enabled": true,
    "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "notifications": {
      "dailyMenu": {
        "enabled": true,
        "channel": "#meal-updates",
        "time": "07:00"
      },
      "expenseSummary": {
        "enabled": true,
        "channel": "#expenses",
        "frequency": "daily"
      },
      "attendanceReminder": {
        "enabled": true,
        "channel": "#announcements",
        "time": "12:00"
      },
      "adminReport": {
        "enabled": true,
        "channel": "#admin-reports",
        "frequency": "weekly"
      }
    }
  }
}
```

### Custom Slash Commands

```javascript
// /messwala-menu - Get today's menu
// /messwala-expense - Submit expense
// /messwala-attendance - Mark attendance
// /messwala-balance - Check your balance
```

---

## Google Sheets Integration

### Setup

1. Enable Google Sheets API in Google Cloud Console
2. Create a Service Account
3. Generate and download JSON credentials
4. Share a Google Sheet with the service account email

### Features

- **Auto-Export Data** - Export expense and attendance data to Sheets
- **Template Sheets** - Pre-built expense templates
- **Real-time Sync** - Sync data in real-time
- **Custom Reports** - Generate custom reports

### Example

```javascript
const { MessWalaClient, GoogleSheetsSync } = require('@messwala/sdk');

const sync = new GoogleSheetsSync({
  credentials: process.env.GOOGLE_CREDENTIALS,
  spreadsheetId: 'your-spreadsheet-id',
});

// Auto-sync expenses to Sheet
await sync.setupExpenseSync({
  sheetName: 'Expenses',
  updateFrequency: 'hourly',
  columns: ['date', 'category', 'amount', 'description'],
});

// Export monthly report
const report = await sync.exportMonthlyReport({
  month: '2024-03',
  sheetName: 'March Report',
});
```

### Sheet Structure

```
| Date       | Category    | Amount | Description           | Added By |
|------------|-------------|--------|----------------------|----------|
| 2024-03-18 | groceries   | 5000   | Vegetables           | Admin    |
| 2024-03-18 | utilities   | 2000   | Water bill           | Admin    |
| 2024-03-18 | maintenance | 1500   | Cleaning supplies    | Admin    |
```

---

## Telegram Bot Integration

### Setup

1. Create a Telegram Bot via @BotFather
2. Get your Bot Token
3. Configure in MessWala settings
4. Add the bot to your Telegram group

### Features

- **Quick Attendance** - Mark attendance via Telegram
- **Menu Updates** - Daily menu notifications
- **Expense Reports** - Submit expenses via chat
- **Balance Inquiry** - Check account balance
- **Reminders** - Get regular reminders

### Commands

```
/start - Initialize bot
/menu - Get today's menu
/attendance - Mark attendance
/expense - Submit expense
/balance - Check balance
/report - Get monthly report
/settings - Configure preferences
/help - Get help
```

### Example Usage

```
User: /menu
Bot: 📋 Today's Menu (18-Mar-2024)

🌅 Breakfast:
  • Bread with butter
  • Boiled eggs
  • Tea

🍽️ Lunch:
  • Rice
  • Dal
  • Seasonal vegetables
  • Salad

🌙 Dinner:
  • Roti
  • Paneer curry
  • Green beans
```

---

## Webhooks

### Event Types

MessWala sends webhooks for the following events:

#### Expense Events

```
expense.created
expense.updated
expense.deleted
expense.approved
expense.rejected
```

#### Attendance Events

```
attendance.marked
attendance.updated
attendance.verified
```

#### User Events

```
user.created
user.updated
user.deleted
user.role_changed
```

#### Menu Events

```
menu.created
menu.updated
menu.deleted
```

### Webhook Payload

```json
{
  "event": "expense.created",
  "timestamp": "2024-03-18T10:30:00Z",
  "data": {
    "id": "exp_123456",
    "amount": 5000,
    "category": "groceries",
    "description": "Weekly vegetables",
    "date": "2024-03-18",
    "createdBy": "user_789"
  },
  "retry": 0,
  "version": "1.0"
}
```

### Setup Webhook Endpoint

```javascript
const express = require('express');
const app = express();

app.post('/webhooks/messwala', express.json(), (req, res) => {
  const { event, data, timestamp } = req.body;

  console.log(`Received event: ${event} at ${timestamp}`);

  // Handle different event types
  switch (event) {
    case 'expense.created':
      console.log('New expense:', data);
      // Do something with the expense data
      break;

    case 'attendance.marked':
      console.log('Attendance marked:', data);
      break;

    case 'menu.updated':
      console.log('Menu updated:', data);
      break;
  }

  // Always respond with 200 to acknowledge receipt
  res.status(200).json({ success: true });
});

app.listen(3000, () => console.log('Webhook server listening on port 3000'));
```

### Webhook Retries

- **Retry Policy**: Exponential backoff (1s, 2s, 4s, 8s, 16s)
- **Max Retries**: 5 attempts over ~30 minutes
- **Timeout**: 30 seconds per attempt

### Webhook Verification

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return hash === signature;
}

// In your webhook handler
app.post('/webhooks/messwala', express.json(), (req, res) => {
  const signature = req.headers['x-messwala-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook...
  res.status(200).json({ success: true });
});
```

---

## API Rate Limits

- **Authenticated Requests**: 1000 requests per hour
- **Webhook Deliveries**: 100 per minute
- **Batch Operations**: 50 items per request

---

## Support

For integration help:
- 📧 Email: integrations@messwala.dev
- 🐙 GitHub: [Report issues](https://github.com/soumyadeepsarkar-2004/MessWala/issues)
- 💬 Discussions: [Ask questions](https://github.com/soumyadeepsarkar-2004/MessWala/discussions)

---

**Last Updated**: March 18, 2024
