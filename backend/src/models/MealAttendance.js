const mongoose = require('mongoose');

const mealAttendanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: String, // YYYY-MM-DD format for easy querying
            required: true,
        },
        mealType: {
            type: String,
            enum: ['breakfast', 'lunch', 'dinner'],
            required: true,
        },
        present: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure one record per user per meal per day
mealAttendanceSchema.index({ userId: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('MealAttendance', mealAttendanceSchema);
