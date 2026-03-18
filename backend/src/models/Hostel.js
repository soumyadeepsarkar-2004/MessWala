const mongoose = require('mongoose');

/**
 * Hostel Schema for Multi-Hostel Support
 * Enables MessWala to support multiple hostels/organizations
 */

const hostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: String,
    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: 'India',
      },
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    totalStudents: {
      type: Number,
      default: 0,
    },
    settings: {
      currency: {
        type: String,
        default: 'INR',
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata',
      },
      language: {
        type: String,
        default: 'en',
      },
      maintenanceMode: {
        type: Boolean,
        default: false,
      },
    },
    stats: {
      totalExpenses: {
        type: Number,
        default: 0,
      },
      totalMembers: {
        type: Number,
        default: 0,
      },
      activeSince: {
        type: Date,
        default: Date.now,
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'pro', 'enterprise'],
        default: 'free',
      },
      validUntil: Date,
      features: {
        maxUsers: {
          type: Number,
          default: 50,
        },
        advancedAnalytics: {
          type: Boolean,
          default: false,
        },
        multiLanguage: {
          type: Boolean,
          default: false,
        },
        customization: {
          type: Boolean,
          default: false,
        },
        apiAccess: {
          type: Boolean,
          default: false,
        },
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
  },
  { timestamps: true },
);

// Index for faster queries
hostelSchema.index({ code: 1 });
hostelSchema.index({ admin: 1 });
hostelSchema.index({ status: 1 });

// Virtual for display name
hostelSchema.virtual('displayName').get(function () {
  return `${this.name} (${this.code})`;
});

module.exports = mongoose.model('Hostel', hostelSchema);
