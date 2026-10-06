// Lightweight assertion-based test runner (no DB required) for the pure
// calculation logic: finance formulas, streak engine, habit score.
const assert = require('assert');
const finance = require('../utils/finance');
const { calculateStreak, periodKey } = require('../utils/streakEngine');
const { computeHabitScore } = require('../utils/habitScore');
const { buildMonthlyReportPDF } = require('../utils/reportPdf');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}\n    ${e.message}`); }
}

console.log('finance.js');
test('savingsRate handles zero income without NaN/Infinity', () => {
  assert.strictEqual(finance.savingsRate(0, 0), 0);
  assert.strictEqual(Number.isFinite(finance.savingsRate(0, 500)), true);
});
test('goalCompletionPct caps at 100 on overfunding', () => {
  assert.strictEqual(finance.goalCompletionPct(150000, 100000), 100);
});
test('investmentReturnPct basic case', () => {
  assert.strictEqual(finance.investmentReturnPct(55200, 48000), 15);
});
test('netWorth subtracts liabilities from assets', () => {
  assert.strictEqual(finance.netWorth(300000, 190000), 110000);
});
test('percentChange from zero previous does not divide by zero', () => {
  assert.strictEqual(finance.percentChange(500, 0), 100);
  assert.strictEqual(finance.percentChange(0, 0), 0);
});
test('suggestedMonthlyContribution guards missing targetDate', () => {
  assert.strictEqual(finance.suggestedMonthlyContribution(10000, null), 0);
});

console.log('\nstreakEngine.js');
test('daily streak: unbroken run up to and including today', () => {
  const habit = { frequency: 'daily', startDate: daysAgo(10), endDate: null };
  const completions = [0,1,2,3,4].map((n) => ({ date: daysAgo(n) })); // today..4 days ago
  const { currentStreak, longestStreak } = calculateStreak(habit, completions);
  assert.strictEqual(currentStreak, 5);
  assert.strictEqual(longestStreak, 5);
});
test('daily streak: today not yet logged should NOT zero out an active streak', () => {
  const habit = { frequency: 'daily', startDate: daysAgo(10), endDate: null };
  const completions = [1,2,3,4].map((n) => ({ date: daysAgo(n) })); // yesterday back to 4 days ago, NOT today
  const { currentStreak } = calculateStreak(habit, completions);
  assert.strictEqual(currentStreak, 4, `expected 4 (streak alive until day ends), got ${currentStreak}`);
});
test('daily streak: a real gap breaks the streak', () => {
  const habit = { frequency: 'daily', startDate: daysAgo(10), endDate: null };
  const completions = [0,1,3,4].map((n) => ({ date: daysAgo(n) })); // missing 2 days ago
  const { currentStreak } = calculateStreak(habit, completions);
  assert.strictEqual(currentStreak, 2, `expected 2 (today+yesterday), got ${currentStreak}`);
});
test('weekly streak: consecutive weeks counted correctly', () => {
  const habit = { frequency: 'weekly', startDate: weeksAgo(6), endDate: null };
  const completions = [0,1,2].map((n) => ({ date: weeksAgo(n) }));
  const { currentStreak } = calculateStreak(habit, completions);
  assert.strictEqual(currentStreak, 3);
});
test('completion rate never exceeds 100 and has no NaN', () => {
  const habit = { frequency: 'daily', startDate: daysAgo(5), endDate: null };
  const { completionRate } = calculateStreak(habit, []);
  assert.strictEqual(Number.isNaN(completionRate), false);
  assert.ok(completionRate >= 0 && completionRate <= 100);
});

console.log('\nhabitScore.js');
test('habit score never exceeds 100 and breakdown sums correctly', () => {
  const s = computeHabitScore({ savingConsistencyPct: 100, expenseTrackingPct: 100, goalContributionPct: 100, habitCompletionPct: 100, investmentConsistencyPct: 100 });
  assert.strictEqual(s.total, 100);
});
test('habit score handles all-zero input without NaN', () => {
  const s = computeHabitScore({});
  assert.strictEqual(s.total, 0);
  assert.strictEqual(Number.isNaN(s.total), false);
});

console.log('\nreportPdf.js');
test('monthly report PDF renders to exactly one page, even with full data', () => {
  const doc = buildMonthlyReportPDF({
    user: { name: 'Test User', currency: 'INR' },
    month: 'October 2026',
    totals: { totalIncome: 65000, totalExpenses: 42500, totalSavings: 22500, savingsRate: 35, netWorth: 311000 },
    spendingBreakdown: { Food: 6500, Rent: 15000 },
    goals: [{ name: 'Emergency Fund', currentAmount: 72000, targetAmount: 100000, percentage: 72 }],
    habits: [{ title: 'Save daily', currentStreak: 12, completionRate: 85 }],
    insights: [{ tone: 'positive', text: 'Your savings rate improved this month.' }],
  });
  const range = doc.bufferedPageRange();
  assert.strictEqual(range.count, 1, `expected exactly 1 page, got ${range.count} (regression: footer draw near page bottom can trigger phantom blank pages)`);
});
test('monthly report PDF handles an all-empty / new-user dataset without throwing', () => {
  assert.doesNotThrow(() => {
    const doc = buildMonthlyReportPDF({
      user: { name: 'New User', currency: 'INR' },
      month: 'October 2026',
      totals: { totalIncome: 0, totalExpenses: 0, totalSavings: 0, savingsRate: 0, netWorth: 0 },
      spendingBreakdown: {}, goals: [], habits: [], insights: [],
    });
    assert.strictEqual(doc.bufferedPageRange().count, 1);
  });
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function weeksAgo(n) { const d = new Date(); d.setDate(d.getDate() - n * 7); return d; }
