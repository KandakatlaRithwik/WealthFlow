const Transaction = require('../models/Transaction');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const SavingsGoal = require('../models/SavingsGoal');
const Asset = require('../models/Asset');
const Liability = require('../models/Liability');
const { savings, savingsRate, netWorth, goalCompletionPct } = require('../utils/finance');
const { calculateStreak } = require('../utils/streakEngine');
const { generateInsights } = require('../utils/insights');
const { buildMonthlyReportPDF } = require('../utils/reportPdf');

function monthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59);
  return { start, end };
}

async function sumTransactions(userId, type, start, end) {
  const rows = await Transaction.find({ userId, type, date: { $gte: start, $lte: end } });
  return rows.reduce((s, r) => s + r.amount, 0);
}

async function categoryBreakdown(userId, type, start, end) {
  const rows = await Transaction.find({ userId, type, date: { $gte: start, $lte: end } });
  const map = {};
  rows.forEach((r) => { map[r.category] = (map[r.category] || 0) + r.amount; });
  return map;
}

async function downloadMonthlyReportPdf(req, res, next) {
  try {
    const userId = req.user._id;
    const cur = monthRange(0);

    const [totalIncome, totalExpenses, assets, liabilities, goals, habits] = await Promise.all([
      sumTransactions(userId, 'income', cur.start, cur.end),
      sumTransactions(userId, 'expense', cur.start, cur.end),
      Asset.find({ userId }),
      Liability.find({ userId }),
      SavingsGoal.find({ userId, status: 'active' }),
      Habit.find({ userId, isActive: true }),
    ]);

    const totalAssets = assets.reduce((s, a) => s + a.currentValue, 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + l.outstandingAmount, 0);

    const habitsWithStreaks = [];
    for (const h of habits) {
      const completions = await HabitCompletion.find({ habitId: h._id });
      habitsWithStreaks.push({ ...h.toObject(), ...calculateStreak(h, completions) });
    }

    const spendingBreakdown = await categoryBreakdown(userId, 'expense', cur.start, cur.end);
    const goalsWithPct = goals.map((g) => ({ ...g.toObject(), percentage: goalCompletionPct(g.currentAmount, g.targetAmount) }));

    const insights = generateInsights({
      income: totalIncome, expenses: totalExpenses,
      savingsRate: savingsRate(totalIncome, totalExpenses),
      categoryTotals: spendingBreakdown,
      goals: goalsWithPct,
    });

    const totals = {
      totalIncome, totalExpenses,
      totalSavings: savings(totalIncome, totalExpenses),
      savingsRate: savingsRate(totalIncome, totalExpenses),
      netWorth: netWorth(totalAssets, totalLiabilities),
    };

    const monthLabel = cur.start.toLocaleString('default', { month: 'long', year: 'numeric' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="wealthflow-report-${monthLabel.replace(' ', '-')}.pdf"`);

    const doc = buildMonthlyReportPDF({
      user: req.user, month: monthLabel, totals, spendingBreakdown,
      goals: goalsWithPct, habits: habitsWithStreaks, insights,
    });
    doc.pipe(res);
    doc.end();
  } catch (err) { next(err); }
}

module.exports = { downloadMonthlyReportPdf };
