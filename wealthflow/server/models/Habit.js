const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: String,
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    targetValue: { type: Number, default: 1 },
    category: { type: String, default: 'General' },
    reminderTime: String, // "HH:mm"
    startDate: { type: Date, required: true, default: Date.now },
    endDate: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
