// Transparent, rule-based "Financial Habit Score" (0-100). NOT a credit score.
// Weighting matches the spec: saving 30, expense tracking 25, goal
// contributions 20, habit completion 15, investment consistency 10.

function computeHabitScore({ savingConsistencyPct, expenseTrackingPct, goalContributionPct, habitCompletionPct, investmentConsistencyPct }) {
  const clamp = (n) => Math.max(0, Math.min(100, n || 0));

  const breakdown = {
    savingConsistency: Math.round(clamp(savingConsistencyPct) * 0.3),
    expenseTracking: Math.round(clamp(expenseTrackingPct) * 0.25),
    goalContributions: Math.round(clamp(goalContributionPct) * 0.2),
    habitCompletion: Math.round(clamp(habitCompletionPct) * 0.15),
    investmentConsistency: Math.round(clamp(investmentConsistencyPct) * 0.1),
  };

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    total: Math.min(total, 100),
    breakdown,
    maxima: { savingConsistency: 30, expenseTracking: 25, goalContributions: 20, habitCompletion: 15, investmentConsistency: 10 },
  };
}

module.exports = { computeHabitScore };
