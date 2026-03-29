const Notification = require('../models/Notification');
const notificationService = require('../utils/notificationService');
const User = require('../models/User');

exports.getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getUnreadNotifications(
      req.user.id,
    );
    res.json({ success: true, count: notifications.length, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await notificationService.markAsRead(notificationId);
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getNotificationHistory = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateNotificationChannel = async (req, res) => {
  try {
    const { preferredNotificationChannel } = req.body;

    if (!['email', 'whatsapp', 'both'].includes(preferredNotificationChannel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification channel. Choose: email, whatsapp, or both',
      });
    }

    await User.findByIdAndUpdate(req.user.id, {
      preferredNotificationChannel,
    });

    res.json({
      success: true,
      message: 'Notification channel updated',
      channel: preferredNotificationChannel,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { notificationPreferences } = req.body;

    // Validate preferences
    const validKeys = [
      'mealReminders',
      'paymentDue',
      'monthlySummary',
      'discrepancyAlerts',
      'mealUpdates',
      'expenseAdded',
      'budgetExceeded',
    ];

    for (const key of Object.keys(notificationPreferences || {})) {
      if (!validKeys.includes(key)) {
        return res.status(400).json({
          success: false,
          error: `Invalid preference key: ${key}`,
        });
      }

      if (typeof notificationPreferences[key] !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: `Value for ${key} must be boolean`,
        });
      }
    }

    await User.findByIdAndUpdate(req.user.id, {
      notificationPreferences,
    });

    res.json({
      success: true,
      message: 'Notification preferences updated',
      preferences: notificationPreferences,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      'preferredNotificationChannel notificationPreferences phone',
    );

    res.json({
      success: true,
      channel: user.preferredNotificationChannel,
      preferences: user.notificationPreferences,
      phoneConfigured: !!user.phone,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Check notification system configuration
 * Admin/Debug endpoint to verify Twilio & Gmail setup
 */
exports.checkConfiguration = async (req, res) => {
  try {
    const config = {
      gmail: {
        configured: !!process.env.SMTP_EMAIL && !!process.env.SMTP_PASSWORD,
        email: process.env.SMTP_EMAIL ? process.env.SMTP_EMAIL.substring(0, 5) + '***' : 'NOT SET',
      },
      twilio: {
        configured:
          !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN,
        accountSid: process.env.TWILIO_ACCOUNT_SID
          ? process.env.TWILIO_ACCOUNT_SID.substring(0, 4) + '***'
          : 'NOT SET',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'NOT SET',
        testPhoneConfigured: !!process.env.TWILIO_TEST_PHONE,
      },
      whatsappSupported:
        !!process.env.TWILIO_ACCOUNT_SID &&
        !!process.env.TWILIO_AUTH_TOKEN &&
        !!process.env.TWILIO_PHONE_NUMBER,
    };

    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Send test notification to current user
 * Tests configured channels (email and/or WhatsApp)
 */
exports.sendTestNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { channel = user.preferredNotificationChannel || 'email' } = req.body;

    if (!['email', 'whatsapp', 'both'].includes(channel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid channel. Choose: email, whatsapp, or both',
      });
    }

    // Check if user has required contact info
    if ((channel === 'email' || channel === 'both') && !user.email) {
      return res.status(400).json({
        success: false,
        error: 'Email channel selected but email not found in profile',
      });
    }

    if ((channel === 'whatsapp' || channel === 'both') && !user.phone) {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp channel selected but phone number not found in profile',
      });
    }

    // Send test notification
    const result = await notificationService.sendNotification(user, {
      type: 'ATTENDANCE_CONFIRMATION',
      channel,
      title: '🧪 Test Notification - MessWala',
      content:
        'This is a test notification to verify your notification settings are working correctly. If you received this, notifications are properly configured!',
      metadata: { test: true, timestamp: new Date().toISOString() },
    });

    res.json({
      success: result.success,
      message: result.success
        ? 'Test notification sent successfully'
        : 'Failed to send test notification',
      details: result.results,
      fallbackUsed: result.fallbackUsed,
      error: result.error || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
