const mongoose = require('mongoose');

/**
 * MessConfig Schema - Manager/Owner Configuration
 * Each hostel has ONE MessConfig managed by admin/coAdmins
 * Contains dynamic categories, meal times, and settings
 * No static/dummy data - fully manager-driven
 */
const messConfigSchema = new mongoose.Schema(
  {
    // Link to hostel this config belongs to
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
      unique: true,
    },

    // Basic mess info
    messName: {
      type: String,
      required: true,
      trim: true,
    },
    messDescription: {
      type: String,
      trim: true,
      default: '',
    },
    messIcon: {
      type: String,
      default: '🍛',
    },
    messEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    messPhone: {
      type: String,
      trim: true,
    },

    // Dynamic Expense Categories (manager-configured)
    expenseCategories: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        value: {
          type: String,
          required: true,
          trim: true,
        },
        label: {
          type: String,
          required: true,
          trim: true,
        },
        emoji: {
          type: String,
          default: '📦',
        },
        color: {
          type: String,
          default: 'bg-gray-100',
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Dynamic Meal Times (manager-configured)
    mealTimes: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        type: {
          type: String,
          required: true,
          trim: true,
        },
        emoji: {
          type: String,
          required: true,
        },
        label: {
          type: String,
          required: true,
          trim: true,
        },
        startTime: {
          type: String,
          required: true,
          match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
        },
        endTime: {
          type: String,
          required: true,
          match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
        },
        color: {
          type: String,
          default: 'from-amber-400 to-orange-500',
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Menu configuration
    menuDays: [
      {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
    ],

    // Setup status
    isSetup: {
      type: Boolean,
      default: false,
    },
    setupCompletedAt: Date,
    setupCompletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    setupVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for fast lookups (hostel index already created by unique: true)
messConfigSchema.index({ isSetup: 1 });

module.exports = mongoose.model('MessConfig', messConfigSchema);
