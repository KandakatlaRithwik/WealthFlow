const Transaction = require('../models/Transaction');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const SavingsGoal = require('../models/SavingsGoal');
const Asset = require('../models/Asset');
const Liability = require('../models/Liability');
const Investment = require('../models/Investment');
const { savings, savingsRate, netWorth, percentChange, goalCompletionPct } = require('../utils/finance');
const { calculateStreak } = require('../utils/streakEngine');
const { computeHabitScore } = require('../utils/habitScore');
const { generateInsights } = require('../utils/insights');
const { getNetWorthHistory } = require('../utils/snapshot');

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

async function getDashboardSummary(req, res, next) {
  try {
    const userId = req.user._id;
    const cur = monthRange(0);
    const prev = monthRange(1);

    const [totalIncome, totalExpenses, prevIncome, prevExpenses] = await Promise.all([
      sumTransactions(userId, 'income', cur.start, cur.end),
      sumTransactions(userId, 'expense', cur.start, cur.end),
      sumTransactions(userId, 'income', prev.start, prev.end),
      sumTransactions(userId, 'expense', prev.start, prev.end),
    ]);

    const totalSavings = savings(totalIncome, totalExpenses);
    const rate = savingsRate(totalIncome, totalExpenses);
    const prevRate = savingsRate(prevIncome, prevExpenses);

    const [assets, liabilities] = await Promise.all([
      Asset.find({ userId }), Liability.find({ userId }),
    ]);
    const totalAssets = assets.reduce((s, a) => s + a.currentValue, 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + l.outstandingAmount, 0);
    const currentNetWorth = netWorth(totalAssets, totalLiabilities);

    // Cash flow trend (income/expenses/savings) is exact — computed directly
    // from dated transactions, never approximated.
    const cashFlowTrend = [];
    for (let i = 5; i >= 0; i--) {
      const { start, end } = monthRange(i);
      const inc = await sumTransactions(userId, 'income', start, end);
      const exp = await sumTransactions(userId, 'expense', start, end);
      cashFlowTrend.push({ month: start.toLocaleString('default', { month: 'short' }), income: inc, expenses: exp, savings: savings(inc, exp) });
    }

    // Net worth history is real, persisted, point-in-time data (see utils/snapshot.js) —
    // not recomputed from current asset values applied retroactively. The
    // scheduler freezes each month's snapshot on the 1st of the following
    // month; we append today's live figure as the most recent point.
    const persistedHistory = await getNetWorthHistory(userId, 5);
    const netWorthHistory = [
      ...persistedHistory.map((s) => ({ month: monthLabelFromKey(s.month), netWorth: s.netWorth })),
      { month: 'Now', netWorth: currentNetWorth },
    ];
    const priorNetWorth = persistedHistory.length ? persistedHistory[persistedHistory.length - 1].netWorth : null;

    const spendingBreakdown = await categoryBreakdown(userId, 'expense', cur.start, cur.end);
    const prevSpendingBreakdown = await categoryBreakdown(userId, 'expense', prev.start, prev.end);

    const [goals, habits] = await Promise.all([
      SavingsGoal.find({ userId, status: 'active' }).sort('-createdAt').limit(5),
      Habit.find({ userId, isActive: true }),
    ]);

    const habitsWithStreaks = [];
    let totalCompletionRate = 0;
    const milestones = [];
    for (const h of habits) {
      const completions = await HabitCompletion.find({ habitId: h._id });
      const streak = calculateStreak(h, completions);
      totalCompletionRate += streak.completionRate;
      if ([7, 14, 30, 60, 100].includes(streak.currentStreak)) {
        milestones.push({ title: h.title, streak: streak.currentStreak, frequency: h.frequency });
      }
      habitsWithStreaks.push({ ...h.toObject(), ...streak });
    }
    const avgHabitCompletion = habits.length ? Math.round(totalCompletionRate / habits.length) : 0;

    const investments = await Investment.find({ userId });
    const investmentConsistency = investments.length ? 60 : 0; // simple proxy, documented decision

    const trackedDays = await Transaction.distinct('date', { userId, date: { $gte: cur.start, $lte: cur.end } });
    const daysInMonth = new Date(cur.end).getDate();
    const expenseTrackingPct = Math.min(100, Math.round((trackedDays.length / daysInMonth) * 100));

    const goalContributionPct = goals.length
      ? Math.round(goals.reduce((s, g) => s + goalCompletionPct(g.currentAmount, g.targetAmount), 0) / goals.length)
      : 0;

    const savingConsistencyPct = Math.min(100, Math.max(rate, 0));

    const habitScore = computeHabitScore({
      savingConsistencyPct,
      expenseTrackingPct,
      goalContributionPct,
      habitCompletionPct: avgHabitCompletion,
      investmentConsistencyPct: investmentConsistency,
    });

    const insights = generateInsights({
      income: totalIncome, expenses: totalExpenses, prevIncome, prevExpenses,
      savingsRate: rate, prevSavingsRate: prevRate,
      categoryTotals: spendingBreakdown, prevCategoryTotals: prevSpendingBreakdown,
      goals, habitMilestones: milestones,
    });

    const recentTransactions = await Transaction.find({ userId }).sort('-date').limit(8);

    res.json({
      netWorth: currentNetWorth,
      netWorthChangePct: priorNetWorth !== null ? percentChange(currentNetWorth, priorNetWorth) : null,
      totalIncome, totalExpenses, totalSavings,
      savingsRate: rate,
      incomeChangePct: percentChange(totalIncome, prevIncome),
      expenseChangePct: percentChange(totalExpenses, prevExpenses),
      savingsChangePct: percentChange(totalSavings, savings(prevIncome, prevExpenses)),
      financialHabitScore: habitScore,
      activeGoals: goals.map((g) => ({ ...g.toObject(), percentage: goalCompletionPct(g.currentAmount, g.targetAmount) })),
      activeHabits: habitsWithStreaks,
      recentTransactions,
      spendingBreakdown,
      cashFlowTrend,
      netWorthHistory,
      insights,
      wealthSnapshot: { totalAssets, totalLiabilities, netWorth: currentNetWorth },
    });
  } catch (err) { next(err); }
}

function monthLabelFromKey(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('default', { month: 'short' });
}

module.exports = { getDashboardSummary };
