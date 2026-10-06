require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const SavingsGoal = require('../models/SavingsGoal');
const Asset = require('../models/Asset');
const Liability = require('../models/Liability');
const Investment = require('../models/Investment');
const Notification = require('../models/Notification');
const FinancialSnapshot = require('../models/FinancialSnapshot');
const { monthKey } = require('./snapshot');

const EXPENSE_PLAN = [
  { category: 'Rent/Housing', amount: 15000, day: 1 },
  { category: 'Food', amount: 6500, day: 5, split: 4 },
  { category: 'Transport', amount: 3000, day: 3, split: 3 },
  { category: 'Utilities', amount: 2500, day: 7 },
  { category: 'Entertainment', amount: 2000, day: 15, split: 2 },
  { category: 'Education', amount: 3000, day: 10 },
];

function monthsAgo(n, day = 1) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(day);
  d.setHours(10, 0, 0, 0);
  return d;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing existing demo data...');

  await Promise.all([
    User.deleteMany({ email: { $in: ['arjun.rao@example.com', 'admin@wealthflow.app'] } }),
  ]);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const user = await User.create({
    name: 'Arjun Rao',
    email: 'arjun.rao@example.com',
    passwordHash,
    role: 'user',
    occupation: 'Software Engineer',
    age: 26,
    monthlyIncomeRange: '₹50,000 - ₹75,000',
    primaryFinancialGoal: 'Build an emergency fund and start investing consistently',
    currency: 'INR',
    country: 'India',
    monthlyIncomeTarget: 65000,
    monthlySavingsTarget: 15000,
    onboardingCompleted: true,
  });

  const admin = await User.create({
    name: 'Priya Menon',
    email: 'admin@wealthflow.app',
    passwordHash,
    role: 'admin',
    occupation: 'Platform Administrator',
    onboardingCompleted: true,
  });

  console.log('Seeding 6 months of transactions...');
  const txDocs = [];
  for (let m = 5; m >= 0; m--) {
    // Salary
    txDocs.push({
      userId: user._id, type: 'income', category: 'Salary', amount: 65000 + (5 - m) * 500,
      description: 'Monthly salary', date: monthsAgo(m, 1), paymentMethod: 'Bank Transfer', recurring: true,
    });
    if (m % 2 === 0) {
      txDocs.push({
        userId: user._id, type: 'income', category: 'Freelance', amount: 4000 + Math.round(Math.random() * 3000),
        description: 'Freelance web project', date: monthsAgo(m, 18), paymentMethod: 'UPI',
      });
    }
    EXPENSE_PLAN.forEach((plan) => {
      const variance = 1 + (Math.random() * 0.16 - 0.08);
      const splits = plan.split || 1;
      for (let s = 0; s < splits; s++) {
        txDocs.push({
          userId: user._id, type: 'expense', category: plan.category,
          amount: Math.round((plan.amount / splits) * variance),
          description: `${plan.category} expense`,
          date: monthsAgo(m, Math.min(28, plan.day + s * 6)),
          paymentMethod: ['Card', 'UPI', 'Cash'][s % 3],
        });
      }
    });
  }
  await Transaction.insertMany(txDocs);

  console.log('Seeding habits + completions...');
  const habitDefs = [
    { title: 'Save ₹100 every day', frequency: 'daily', category: 'Saving', targetValue: 100 },
    { title: 'Track expenses daily', frequency: 'daily', category: 'Tracking', targetValue: 1 },
    { title: 'Review budget every Sunday', frequency: 'weekly', category: 'Planning', targetValue: 1 },
    { title: 'Invest ₹2,000 monthly', frequency: 'monthly', category: 'Investing', targetValue: 2000 },
  ];

  for (const def of habitDefs) {
    const habit = await Habit.create({
      userId: user._id, ...def, startDate: monthsAgo(2, 1), isActive: true,
      reminderTime: '20:00',
    });

    const completions = [];
    const periods = def.frequency === 'daily' ? 60 : def.frequency === 'weekly' ? 9 : 2;
    for (let i = 0; i < periods; i++) {
      // ~85% completion rate, skip randomly to keep streak calc realistic
      if (Math.random() < 0.85) {
        const d = new Date();
        if (def.frequency === 'daily') d.setDate(d.getDate() - i);
        else if (def.frequency === 'weekly') d.setDate(d.getDate() - i * 7);
        else d.setMonth(d.getMonth() - i);
        completions.push({ habitId: habit._id, userId: user._id, date: d, value: def.targetValue });
      }
    }
    // guarantee an unbroken recent streak for demo polish
    for (let i = 0; i < (def.frequency === 'daily' ? 12 : def.frequency === 'weekly' ? 3 : 1); i++) {
      const d = new Date();
      if (def.frequency === 'daily') d.setDate(d.getDate() - i);
      else if (def.frequency === 'weekly') d.setDate(d.getDate() - i * 7);
      else d.setMonth(d.getMonth() - i);
      completions.push({ habitId: habit._id, userId: user._id, date: d, value: def.targetValue });
    }
    try {
      await HabitCompletion.insertMany(completions, { ordered: false });
    } catch (e) { /* duplicate period keys are expected & ignored */ }
  }

  console.log('Seeding savings goals...');
  await SavingsGoal.create([
    {
      userId: user._id, name: 'Emergency Fund', category: 'Emergency Fund',
      targetAmount: 100000, currentAmount: 72000, priority: 'high',
      targetDate: monthsAgo(-6, 1),
      contributions: [
        { amount: 15000, date: monthsAgo(3, 2) },
        { amount: 15000, date: monthsAgo(2, 2) },
        { amount: 20000, date: monthsAgo(1, 2) },
        { amount: 22000, date: monthsAgo(0, 2) },
      ],
    },
    {
      userId: user._id, name: 'New Laptop', category: 'Laptop',
      targetAmount: 90000, currentAmount: 28000, priority: 'medium',
      targetDate: monthsAgo(-4, 1),
      contributions: [{ amount: 15000, date: monthsAgo(2, 10) }, { amount: 13000, date: monthsAgo(1, 10) }],
    },
    {
      userId: user._id, name: 'Goa Vacation', category: 'Vacation',
      targetAmount: 40000, currentAmount: 12000, priority: 'low',
      targetDate: monthsAgo(-3, 1),
      contributions: [{ amount: 12000, date: monthsAgo(1, 20) }],
    },
  ]);

  console.log('Seeding wealth data...');
  await Asset.create([
    { userId: user._id, name: 'HDFC Savings Account', type: 'Savings Account', currentValue: 145000, purchaseValue: 145000 },
    { userId: user._id, name: 'Fixed Deposit - SBI', type: 'Fixed Deposit', currentValue: 100000, purchaseValue: 90000 },
    { userId: user._id, name: 'Gold (8g)', type: 'Gold', currentValue: 58000, purchaseValue: 48000 },
  ]);
  await Liability.create([
    { userId: user._id, name: 'Education Loan', type: 'Education Loan', outstandingAmount: 180000, interestRate: 8.5 },
    { userId: user._id, name: 'Credit Card', type: 'Credit Card Balance', outstandingAmount: 12000, interestRate: 32 },
  ]);
  await Investment.create([
    { userId: user._id, name: 'Nifty Index Fund SIP', type: 'Mutual Fund', investedAmount: 48000, currentValue: 55200, purchaseDate: monthsAgo(5, 5) },
    { userId: user._id, name: 'Reliance Industries', type: 'Stocks', investedAmount: 20000, currentValue: 18400, purchaseDate: monthsAgo(3, 12) },
  ]);

  console.log('Freezing 5 months of net worth snapshots (demo history)...');
  const liveAssets = await Asset.find({ userId: user._id });
  const liveLiabilities = await Liability.find({ userId: user._id });
  const liveTotalAssets = liveAssets.reduce((s, a) => s + a.currentValue, 0);
  const liveTotalLiabilities = liveLiabilities.reduce((s, l) => s + l.outstandingAmount, 0);
  const liveNetWorth = liveTotalAssets - liveTotalLiabilities;

  // Backfill a plausible upward ramp for the 5 CLOSED months (current month
  // stays live/un-snapshotted, matching real scheduler behavior — it only
  // freezes a month once it has actually ended).
  const rampFractions = [0.72, 0.79, 0.85, 0.90, 0.95];
  for (let i = 5; i >= 1; i--) {
    const monthDate = monthsAgo(i, 1);
    const fraction = rampFractions[5 - i];
    const netWorthAtTime = Math.round(liveNetWorth * fraction);
    const monthIncome = 65000 + (5 - i) * 500;
    const monthExpenses = 32000 + Math.round(Math.random() * 3000);
    await FinancialSnapshot.findOneAndUpdate(
      { userId: user._id, month: monthKey(monthDate) },
      {
        userId: user._id, month: monthKey(monthDate),
        totalIncome: monthIncome, totalExpenses: monthExpenses,
        totalSavings: monthIncome - monthExpenses,
        totalAssets: Math.round(liveTotalAssets * fraction),
        totalLiabilities: Math.round(liveTotalLiabilities * (0.8 + (5 - i) * 0.04)),
        netWorth: netWorthAtTime,
      },
      { upsert: true }
    );
  }

  console.log('Seeding notifications...');
  await Notification.create([
    { userId: user._id, type: 'streak_milestone', title: 'Streak milestone!', message: 'You reached a 7-day streak on "Save ₹100 every day".' },
    { userId: user._id, type: 'goal_milestone', title: 'Almost there', message: 'Your Emergency Fund goal is 72% complete.' },
    { userId: user._id, type: 'habit_reminder', title: 'Log today\'s expenses', message: 'Don\'t forget to track today\'s spending.', isRead: true },
  ]);

  console.log('\nSeed complete.');
  console.log('Demo user login: arjun.rao@example.com / Password123!');
  console.log('Admin login:     admin@wealthflow.app / Password123!');

  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
