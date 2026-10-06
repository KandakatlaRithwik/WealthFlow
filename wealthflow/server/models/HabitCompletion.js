const mongoose = require('mongoose');

const habitCompletionSchema = new mongoose.Schema(
  {
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true }, // normalized to the period start (day/week/month)
    value: { type: Number, default: 1 },
  },
  { timestamps: true }
);

habitCompletionSchema.index({ habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HabitCompletion', habitCompletionSchema);
