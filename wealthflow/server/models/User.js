const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },

    // optional profile
    age: Number,
    occupation: String,
    monthlyIncomeRange: String,
    primaryFinancialGoal: String,
    currency: { type: String, default: 'INR' },
    country: { type: String, default: 'India' },
    phone: String,

    // financial preferences
    monthlyIncomeTarget: { type: Number, default: 0 },
    monthlySavingsTarget: { type: Number, default: 0 },

    notificationPreferences: {
      habitReminders: { type: Boolean, default: true },
      goalReminders: { type: Boolean, default: true },
      monthlyReports: { type: Boolean, default: true },
    },

    onboardingCompleted: { type: Boolean, default: false },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
