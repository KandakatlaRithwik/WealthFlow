const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['Mutual Fund', 'Stocks', 'FD', 'Gold', 'Other'], required: true },
    investedAmount: { type: Number, required: true, min: 0.01 },
    currentValue: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Investment', investmentSchema);
