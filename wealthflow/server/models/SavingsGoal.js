const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false }
);

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: String,
    category: { type: String, default: 'General Savings' },
    targetAmount: { type: Number, required: true, min: 1 },
    currentAmount: { type: Number, default: 0, min: 0 },
    targetDate: Date,
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    contributions: [contributionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
