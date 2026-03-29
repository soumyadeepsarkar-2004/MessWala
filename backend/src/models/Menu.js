const mongoose = require('mongoose');

/**
 * Menu Schema - Dynamic Menu Management
 * Managers set menus per day with meals based on their configured MealTimes
 * Linked to hostel for multi-hostel support
 */
const menuSchema = new mongoose.Schema(
  {
    // Link to hostel this menu belongs to
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
    },

    // Date of this menu (YYYY-MM-DD)
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    // Meals for this date
    // Structure: { [mealType]: { content: string, notes: string } }
    meals: [
      {
        type: {
          type: String, // From manager's configured meal times
          required: true,
          trim: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
        },
        notes: {
          type: String,
          trim: true,
          default: '',
        },
        allergy_warnings: {
          type: String,
          trim: true,
          default: '',
        },
      },
    ],

    // Manager who created this menu
    setBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Status tracking
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },

    // Editing history
    editHistory: [
      {
        editedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        editedAt: {
          type: Date,
          default: Date.now,
        },
        changes: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Compound index for faster lookups
menuSchema.index({ hostel: 1, date: 1 });
menuSchema.index({ date: 1 });
menuSchema.index({ hostel: 1, status: 1 });

// Ensure unique menu per hostel per date
menuSchema.index({ hostel: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Menu', menuSchema);
