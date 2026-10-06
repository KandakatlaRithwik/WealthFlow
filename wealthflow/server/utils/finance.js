// Central place for every financial formula in the app.
// All functions guard against divide-by-zero / NaN / Infinity per spec section 47-48.

function safeDiv(numerator, denominator) {
  if (!denominator || Number.isNaN(denominator)) return 0;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : 0;
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function savings(income, expenses) {
  return round2(income - expenses);
}

function savingsRate(income, expenses) {
  return round2(safeDiv(savings(income, expenses), income) * 100);
}

function netWorth(totalAssets, totalLiabilities) {
  return round2(totalAssets - totalLiabilities);
}

function investmentGain(currentValue, investedAmount) {
  return round2(currentValue - investedAmount);
}

function investmentReturnPct(currentValue, investedAmount) {
  return round2(safeDiv(investmentGain(currentValue, investedAmount), investedAmount) * 100);
}

function goalCompletionPct(currentAmount, targetAmount) {
  const pct = safeDiv(currentAmount, targetAmount) * 100;
  return round2(Math.min(pct, 100));
}

function goalRemaining(currentAmount, targetAmount) {
  return round2(Math.max(targetAmount - currentAmount, 0));
}

function suggestedMonthlyContribution(remainingAmount, targetDate) {
  if (!targetDate) return 0;
  const now = new Date();
  const target = new Date(targetDate);
  const months = Math.max(
    1,
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  );
  return round2(safeDiv(remainingAmount, months));
}

function percentChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return round2(safeDiv(current - previous, Math.abs(previous)) * 100);
}

module.exports = {
  round2,
  safeDiv,
  savings,
  savingsRate,
  netWorth,
  investmentGain,
  investmentReturnPct,
  goalCompletionPct,
  goalRemaining,
  suggestedMonthlyContribution,
  percentChange,
};
