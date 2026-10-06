// Persists a point-in-time FinancialSnapshot for a user/month. This is what
// makes net worth history real: once a month closes, its numbers are frozen
// here and never recomputed, even if the user edits an asset's value later.
const Transaction = require('../models/Transaction');
const Asset = require('../models/Asset');
const Liability = require('../models/Liability');
const FinancialSnapshot = require('../models/FinancialSnapshot');
const { savings, netWorth } = require('./finance');

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

async function buildSnapshotForMonth(userId, monthDate) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

  const [incomeRows, expenseRows, assets, liabilities] = await Promise.all([
    Transaction.find({ userId, type: 'income', date: { $gte: start, $lte: end } }),
    Transaction.find({ userId, type: 'expense', date: { $gte: start, $lte: end } }),
    Asset.find({ userId }),
    Liability.find({ userId }),
  ]);

  const totalIncome = incomeRows.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenseRows.reduce((s, r) => s + r.amount, 0);
  const totalAssets = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.outstandingAmount, 0);

  return FinancialSnapshot.findOneAndUpdate(
    { userId, month: monthKey(start) },
    {
      userId, month: monthKey(start),
      totalIncome, totalExpenses,
      totalSavings: savings(totalIncome, totalExpenses),
      totalAssets, totalLiabilities,
      netWorth: netWorth(totalAssets, totalLiabilities),
    },
    { upsert: true, new: true }
  );
}

async function getNetWorthHistory(userId, months = 6) {
  const snapshots = await FinancialSnapshot.find({ userId }).sort('-month').limit(months);
  return snapshots.reverse();
}

module.exports = { buildSnapshotForMonth, getNetWorthHistory, monthKey };
