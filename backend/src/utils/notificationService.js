const nodemailer = require('nodemailer');
const { getLogger } = require('./logger');
const Notification = require('../models/Notification');

const logger = getLogger('Notifications');

class NotificationService {
  constructor() {
    // Gmail/SMTP Configuration
    this.emailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Twilio WhatsApp Configuration (optional)
    this.whatsappClient = null;
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        this.whatsappClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      } catch (err) {
        logger.warn('Twilio not available. WhatsApp notifications disabled.');
      }
    }

    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+14155238886';
  }

  /**
   * Send meal reminder notification
   */
  async sendMealReminder(user, mealType) {
    if (!user.notificationPreferences?.mealReminders) {
      return { success: false, reason: 'User disabled meal reminders' };
    }

    const content = `🍽️ Don't forget to mark your ${mealType} attendance for today! Click to mark now.`;
    const title = `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Reminder`;

    return this.sendNotification(user, {
      type: 'MEAL_REMINDER',
      channel: user.preferredNotificationChannel || 'email',
      title,
      content,
      metadata: { mealType },
    });
  }

  /**
   * Send payment due notification
   */
  async sendPaymentDue(user, amount, month) {
    if (!user.notificationPreferences?.paymentDue) {
      return { success: false, reason: 'User disabled payment notifications' };
    }

    const content = `💰 Your mess bill for ${month} is due! Amount: ₹${amount.toFixed(2)}. Please settle as soon as possible.`;
    const title = `Payment Due - ₹${amount.toFixed(2)}`;

    return this.sendNotification(user, {
      type: 'PAYMENT_DUE',
      channel: user.preferredNotificationChannel || 'both',
      title,
      content,
      metadata: { amount, month },
    });
  }

  /**
   * Send monthly cost summary
   */
  async sendCostSummary(user, summaryData) {
    if (!user.notificationPreferences?.monthlySummary) {
      return { success: false, reason: 'User disabled cost summary' };
    }

    const { month, totalExpense, mealsServed, costPerPlate, breakdown } = summaryData;

    const breakdownText = breakdown
      .map((item) => `${item._id}: ₹${item.total.toFixed(2)}`)
      .join('\n');

    const content = `📊 Monthly Summary for ${month}:\nTotal Cost: ₹${totalExpense.toFixed(2)}\nMeals Served: ${mealsServed}\nCost per Plate: ₹${costPerPlate}\n\nBreakdown:\n${breakdownText}`;
    const title = `Monthly Cost Summary - ${month}`;

    return this.sendNotification(user, {
      type: 'COST_SUMMARY',
      channel: 'email',
      title,
      content,
      metadata: { month, amount: totalExpense, mealsServed, costPerPlate },
    });
  }

  /**
   * Send discrepancy alert
   */
  async sendDiscrepancyAlert(user, discrepancyData) {
    if (!user.notificationPreferences?.discrepancyAlerts) {
      return { success: false, reason: 'User disabled discrepancy alerts' };
    }

    const { expected, actual, date, type } = discrepancyData;
    const difference = expected - actual;

    const content = `⚠️ Discrepancy Detected on ${date}:\nExpected: ${expected} meals\nActual: ${actual} meals\nDifference: ${difference} meals\nPlease verify ${type} attendance.`;
    const title = `Attendance Discrepancy Alert - ${date}`;

    return this.sendNotification(user, {
      type: 'DISCREPANCY_ALERT',
      channel: user.preferredNotificationChannel || 'both',
      title,
      content,
      metadata: { expected, actual, difference },
    });
  }

  /**
   * Send meal count update notification
   */
  async sendMealUpdate(user, mealData) {
    if (!user.notificationPreferences?.mealUpdates) {
      return { success: false, reason: 'User disabled meal updates' };
    }

    const { date, mealType, headcount } = mealData;
    const content = `📈 Head count for ${mealType} on ${date}: ${headcount} people. Cost per plate may be affected.`;
    const title = `Meal Update - ${mealType} (${date})`;

    return this.sendNotification(user, {
      type: 'MEAL_UPDATE',
      channel: 'email',
      title,
      content,
      metadata: { date, mealType, headcount },
    });
  }

  /**
   * Send expense added notification
   */
  async sendExpenseAdded(user, expenseData) {
    if (!user.notificationPreferences?.expenseAdded) {
      return { success: false, reason: 'User disabled expense notifications' };
    }

    const { category, amount, date, description } = expenseData;
    const content = `💸 New Expense Added:\nCategory: ${category}\nAmount: ₹${amount.toFixed(2)}\nDate: ${date}\nDescription: ${description || 'N/A'}`;
    const title = `New Expense - ₹${amount.toFixed(2)}`;

    return this.sendNotification(user, {
      type: 'EXPENSE_ADDED',
      channel: 'email',
      title,
      content,
      metadata: { category, amount, date },
    });
  }

  /**
   * Send budget exceeded alert
   */
  async sendBudgetExceeded(user, budgetData) {
    if (!user.notificationPreferences?.budgetExceeded) {
      return { success: false, reason: 'User disabled budget alerts' };
    }

    const { month, budget, currentSpent, percentage } = budgetData;
    const content = `🚨 Budget Alert!\nMonth: ${month}\nBudget: ₹${budget.toFixed(2)}\nCurrent Spent: ₹${currentSpent.toFixed(2)} (${percentage}%)\nYou have exceeded your budget!`;
    const title = `Budget Exceeded - ${percentage}% of ₹${budget}`;

    return this.sendNotification(user, {
      type: 'BUDGET_EXCEEDED',
      channel: user.preferredNotificationChannel || 'both',
      title,
      content,
      metadata: { month, budget, currentSpent, percentage },
    });
  }

  /**
   * Send attendance confirmation request
   */
  async sendAttendanceConfirmation(user, date) {
    const content = `📋 Confirm your meal attendance for ${date}. Tap here to mark your meals.`;
    const title = `Confirm Attendance - ${date}`;

    return this.sendNotification(user, {
      type: 'ATTENDANCE_CONFIRMATION',
      channel: user.preferredNotificationChannel || 'both',
      title,
      content,
      metadata: { date },
    });
  }

  /**
   * Core notification sending logic with fallback support
   * WhatsApp → Email fallback for 'both' channel
   */
  async sendNotification(user, notificationData) {
    try {
      // Save to database
      const notification = await Notification.create({
        userId: user._id,
        type: notificationData.type,
        channel: notificationData.channel,
        title: notificationData.title,
        content: notificationData.content,
        metadata: notificationData.metadata,
      });

      // Determine channels to use
      let channels = [];
      let fallbackChannels = [];

      if (notificationData.channel === 'both') {
        // Try WhatsApp first, then fall back to email
        channels = ['whatsapp'];
        fallbackChannels = ['email'];
      } else {
        channels = [notificationData.channel];
      }

      const results = {};
      let anyChannelSucceeded = false;

      // Try primary channels
      for (const channel of channels) {
        try {
          if (channel === 'email') {
            await this.sendEmail(user, notificationData);
            results.email = 'sent';
            anyChannelSucceeded = true;
          } else if (channel === 'whatsapp') {
            await this.sendWhatsApp(user, notificationData);
            results.whatsapp = 'sent';
            anyChannelSucceeded = true;
          }
        } catch (error) {
          logger.warn(`Failed to send ${channel} notification`, {
            userId: user._id,
            error: error.message,
          });
          results[channel] = 'failed';
        }
      }

      // If WhatsApp failed and we have fallback channels, try them
      if (!anyChannelSucceeded && fallbackChannels.length > 0) {
        logger.info(`Primary channel failed. Attempting fallback...`, {
          userId: user._id,
          primaryChannel: notificationData.channel,
          fallbackChannels: fallbackChannels.join(', '),
        });

        for (const channel of fallbackChannels) {
          try {
            if (channel === 'email') {
              await this.sendEmail(user, notificationData);
              results.email = 'sent-via-fallback';
              anyChannelSucceeded = true;
              logger.info(`Fallback: Email sent successfully after WhatsApp failure`, {
                userId: user._id,
                notificationType: notificationData.type,
              });
            }
          } catch (fallbackError) {
            logger.error(`Fallback channel also failed`, {
              userId: user._id,
              channel,
              error: fallbackError.message,
            });
            results[channel] = 'failed';
          }
        }
      }

      // Update notification status based on results
      const updatedStatus = anyChannelSucceeded ? 'sent' : 'failed';
      const failureReason = anyChannelSucceeded
        ? null
        : `All channels failed: ${Object.entries(results)
            .filter(([_, status]) => status === 'failed')
            .map(([channel]) => channel)
            .join(', ')}`;

      await Notification.findByIdAndUpdate(notification._id, {
        status: updatedStatus,
        sentAt: new Date(),
        attempts: 1,
        failureReason,
      });

      return {
        success: anyChannelSucceeded,
        notification,
        results,
        fallbackUsed:
          !anyChannelSucceeded || Object.values(results).some((r) => r.includes('fallback')),
      };
    } catch (err) {
      logger.error('Notification send error', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(user, notificationData) {
    if (!user.email) {
      throw new Error('User email not available');
    }

    const emailTemplate = this.getEmailTemplate(
      notificationData.title,
      notificationData.content,
      notificationData.type,
    );

    const mailOptions = {
      from: `"MessWala" <${process.env.SMTP_EMAIL}>`,
      to: user.email,
      subject: notificationData.title,
      html: emailTemplate,
    };

    await this.emailTransport.sendMail(mailOptions);
    logger.info(`Email sent to ${user.email}`, { type: notificationData.type });
  }

  /**
   * Send WhatsApp notification via Twilio
   */
  async sendWhatsApp(user, notificationData) {
    if (!this.whatsappClient) {
      throw new Error('WhatsApp not configured');
    }

    if (!user.phone) {
      throw new Error('User phone number not available');
    }

    const phoneNumber = this.formatPhoneNumber(user.phone);

    const message = await this.whatsappClient.messages.create({
      from: `whatsapp:${this.twilioPhoneNumber}`,
      to: `whatsapp:${phoneNumber}`,
      body: `${notificationData.title}\n\n${notificationData.content}`,
    });

    logger.info(`WhatsApp sent to ${phoneNumber}`, { messageSid: message.sid });
  }

  /**
   * Get HTML email template
   */
  getEmailTemplate(title, content, notificationType) {
    const icon = this.getNotificationIcon(notificationType);

    return `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 16px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px;">${icon}</span>
          <h2 style="margin: 8px 0 0; color: #1f2937;">MessWala</h2>
        </div>
        <h3 style="color: #374151; font-size: 18px; margin: 16px 0;">${title}</h3>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${content}</p>
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">You're receiving this because you're part of the MessWala community. Manage your notification preferences in your account settings.</p>
          <p style="color: #d1d5db; font-size: 11px; text-align: center; margin-top: 12px;">© MessWala 2026</p>
        </div>
      </div>
    `;
  }

  /**
   * Get emoji icon based on notification type
   */
  getNotificationIcon(type) {
    const icons = {
      MEAL_REMINDER: '🍽️',
      PAYMENT_DUE: '💰',
      COST_SUMMARY: '📊',
      DISCREPANCY_ALERT: '⚠️',
      MEAL_UPDATE: '📈',
      EXPENSE_ADDED: '💸',
      BUDGET_EXCEEDED: '🚨',
      ATTENDANCE_CONFIRMATION: '📋',
    };
    return icons[type] || '📢';
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // If it starts with 91 (India), keep it; otherwise add it
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return '+' + cleaned;
    } else if (!cleaned.startsWith('91') && cleaned.length === 10) {
      return '+91' + cleaned;
    } else if (cleaned.startsWith('91')) {
      return '+' + cleaned;
    } else {
      return '+91' + cleaned;
    }
  }

  /**
   * Get user's unread notifications
   */
  async getUnreadNotifications(userId) {
    return Notification.find({
      userId,
      status: { $ne: 'read' },
    })
      .sort({ createdAt: -1 })
      .limit(10);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    return Notification.findByIdAndUpdate(
      notificationId,
      { status: 'read', readAt: new Date() },
      { new: true },
    );
  }

  /**
   * Retry failed notifications
   */
  async retryFailedNotifications() {
    const failedNotifications = await Notification.find({
      status: 'failed',
      attempts: { $lt: 3 },
    }).populate('userId');

    for (const notification of failedNotifications) {
      try {
        const result = await this.sendNotification(notification.userId, {
          type: notification.type,
          channel: notification.channel,
          title: notification.title,
          content: notification.content,
          metadata: notification.metadata,
        });

        if (result.success) {
          await Notification.findByIdAndUpdate(notification._id, {
            status: 'sent',
            attempts: notification.attempts + 1,
          });
        }
      } catch (err) {
        logger.error('Retry failed', err);
        await Notification.findByIdAndUpdate(notification._id, {
          attempts: notification.attempts + 1,
        });
      }
    }
  }
}

module.exports = new NotificationService();
