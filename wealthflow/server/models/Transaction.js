const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Rent/Housing', 'Utilities', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Travel', 'Bills', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Scholarship', 'Interest', 'Gift', 'Other'];

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true, default: Date.now },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'], default: 'Other' },
    notes: String,
    recurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, category: 1 });

transactionSchema.statics.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
transactionSchema.statics.INCOME_CATEGORIES = INCOME_CATEGORIES;

module.exports = mongoose.model('Transaction', transactionSchema);
