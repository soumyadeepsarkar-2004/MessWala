const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
    {
        date: {
            type: String, // YYYY-MM-DD
            required: true,
            unique: true,
        },
        breakfast: {
            type: String,
            default: '',
        },
        lunch: {
            type: String,
            default: '',
        },
        dinner: {
            type: String,
            default: '',
        },
        setBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Menu', menuSchema);
