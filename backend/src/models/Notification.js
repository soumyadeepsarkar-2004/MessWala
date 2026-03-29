const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'MEAL_REMINDER',
        'PAYMENT_DUE',
        'COST_SUMMARY',
        'DISCREPANCY_ALERT',
        'MEAL_UPDATE',
        'EXPENSE_ADDED',
        'BUDGET_EXCEEDED',
        'ATTENDANCE_CONFIRMATION',
      ],
      required: true,
    },
    channel: {
      type: String,
      enum: ['email', 'whatsapp', 'both'],
      default: 'email',
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      month: String,
      amount: Number,
      category: String,
      mealType: String,
      discrepancy: {
        expected: Number,
        actual: Number,
        difference: Number,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'read'],
      default: 'pending',
    },
    sentAt: Date,
    readAt: Date,
    failureReason: String,
    attempts: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ status: 1, type: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

module.exports = mongoose.model('Notification', notificationSchema);
