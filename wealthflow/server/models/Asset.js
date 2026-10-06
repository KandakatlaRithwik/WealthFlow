const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['Cash', 'Savings Account', 'Fixed Deposit', 'Mutual Funds', 'Stocks', 'Gold', 'Property', 'Other'], required: true },
    currentValue: { type: Number, required: true, min: 0 },
    purchaseValue: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
