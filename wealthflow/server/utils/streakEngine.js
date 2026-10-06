// Real streak calculation based on stored HabitCompletion records.
// Rules: consecutive required periods (day/week/month depending on habit
// frequency) increase the streak; a missed required period breaks it.

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 = Sunday
  x.setDate(x.getDate() - day);
  return x;
}

function startOfMonth(d) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function periodKey(date, frequency) {
  if (frequency === 'daily') return startOfDay(date).getTime();
  if (frequency === 'weekly') return startOfWeek(date).getTime();
  return startOfMonth(date).getTime();
}

function previousPeriodStart(date, frequency) {
  const d = new Date(date);
  if (frequency === 'daily') d.setDate(d.getDate() - 1);
  else if (frequency === 'weekly') d.setDate(d.getDate() - 7);
  else d.setMonth(d.getMonth() - 1);
  return d;
}

/**
 * completions: array of HabitCompletion docs (each has `date`)
 * habit: { frequency, startDate, endDate, isActive }
 * Returns { currentStreak, longestStreak, completionRate, totalCompletions, missedPeriods }
 */
function calculateStreak(habit, completions) {
  const frequency = habit.frequency;
  const completedKeys = new Set(completions.map((c) => periodKey(c.date, frequency)));
  const totalCompletions = completedKeys.size;

  // Build the full list of required periods from startDate to today (or endDate).
  const start = periodKey(habit.startDate, frequency);
  const end = periodKey(habit.endDate || new Date(), frequency);
  const step = frequency === 'daily' ? 1 : frequency === 'weekly' ? 7 : null;

  const requiredPeriods = [];
  let cursor = new Date(start);
  while (periodKey(cursor, frequency) <= end) {
    requiredPeriods.push(periodKey(cursor, frequency));
    if (frequency === 'monthly') cursor.setMonth(cursor.getMonth() + 1);
    else cursor.setDate(cursor.getDate() + step);
  }

  const missedPeriods = requiredPeriods.filter((p) => !completedKeys.has(p)).length;
  const completionRate = requiredPeriods.length
    ? Math.round((totalCompletions / requiredPeriods.length) * 100)
    : 0;

  // Current streak counts consecutive completed periods ending at "today" if
  // today is already done, or ending at "yesterday" if today isn't done yet —
  // an active streak shouldn't zero out just because the day/week/month isn't
  // over. It only actually breaks once a required period is missed entirely.
  let currentStreak = 0;
  let anchorKey = periodKey(new Date(), frequency);
  if (!completedKeys.has(anchorKey)) {
    anchorKey = periodKey(previousPeriodStart(new Date(anchorKey), frequency), frequency);
  }
  let cursorKey = anchorKey;
  while (completedKeys.has(cursorKey)) {
    currentStreak += 1;
    cursorKey = periodKey(previousPeriodStart(new Date(cursorKey), frequency), frequency);
  }

  // Longest streak: scan all required periods in order.
  let longestStreak = 0;
  let running = 0;
  for (const p of requiredPeriods) {
    if (completedKeys.has(p)) {
      running += 1;
      longestStreak = Math.max(longestStreak, running);
    } else {
      running = 0;
    }
  }

  return { currentStreak, longestStreak, completionRate, totalCompletions, missedPeriods };
}

module.exports = { calculateStreak, periodKey, startOfDay, startOfWeek, startOfMonth };
