const mongoose = require('mongoose');

const liabilitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['Loan', 'Credit Card Balance', 'Education Loan', 'Other'], required: true },
    outstandingAmount: { type: Number, required: true, min: 0 },
    interestRate: Number,
    date: { type: Date, default: Date.now },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Liability', liabilitySchema);
