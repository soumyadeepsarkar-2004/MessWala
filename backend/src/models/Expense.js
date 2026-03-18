const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['vegetables', 'rice', 'gas', 'salary', 'dairy', 'spices', 'misc'],
      required: [true, 'Please specify expense category'],
    },
    amount: {
      type: Number,
      required: [true, 'Please specify expense amount'],
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

expenseSchema.index({ date: 1 });
expenseSchema.index({ category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
