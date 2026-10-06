const mongoose = require('mongoose');

// One record per user per month, used to chart net worth history reliably
// instead of recomputing from scratch every time.
const financialSnapshotSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    month: { type: String, required: true }, // "YYYY-MM"
    totalIncome: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    totalSavings: { type: Number, default: 0 },
    totalAssets: { type: Number, default: 0 },
    totalLiabilities: { type: Number, default: 0 },
    netWorth: { type: Number, default: 0 },
  },
  { timestamps: true }
);

financialSnapshotSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('FinancialSnapshot', financialSnapshotSchema);
