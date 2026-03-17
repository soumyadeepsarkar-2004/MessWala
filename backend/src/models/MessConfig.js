const mongoose = require('mongoose');

const messConfigSchema = new mongoose.Schema(
    {
        messName: {
            type: String,
            default: 'My Hostel Mess',
        },
        messDescription: {
            type: String,
            default: '',
        },
        messIcon: {
            type: String,
            default: '🍛', // emoji
        },
        messEmail: {
            type: String,
            default: '',
        },
        messPhone: {
            type: String,
            default: '',
        },
        // Expense categories configured by admin
        expenseCategories: [
            {
                value: String,
                label: String,
                emoji: String,
                color: String,
            },
        ],
        // Meal times configured by admin
        mealTimes: [
            {
                type: String, // breakfast, lunch, dinner
                emoji: String,
                label: String,
                startTime: String, // HH:MM
                endTime: String, // HH:MM
                color: String,
            },
        ],
        // Menu configuration
        menuDays: [String], // ['Mon', 'Tue', ...]
        isSetup: {
            type: Boolean,
            default: false,
        },
        setupCompletedAt: Date,
        setupCompletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('MessConfig', messConfigSchema);
