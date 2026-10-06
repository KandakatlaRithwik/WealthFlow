// Habit reminder + monthly summary scheduler, powered by node-cron.
// Runs entirely in-process — fine for a single-instance deployment; for
// multi-instance deployments, guard this behind a leader-election check.
const cron = require('node-cron');
const Habit = require('../models/Habit');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('./email');
const { buildSnapshotForMonth } = require('./snapshot');

function currentHHMM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

async function runHabitReminders() {
  const hhmm = currentHHMM();
  const habits = await Habit.find({ isActive: true, reminderTime: hhmm }).populate('userId');
  for (const habit of habits) {
    const user = habit.userId;
    if (!user || !user.notificationPreferences?.habitReminders) continue;

    await Notification.create({
      userId: user._id,
      type: 'habit_reminder',
      title: 'Habit reminder',
      message: `Time to complete "${habit.title}".`,
    });

    if (user.notificationPreferences?.habitReminders) {
      sendEmail({ to: user.email, subject: 'WealthFlow reminder', text: `Time to complete "${habit.title}".` }).catch(() => {});
    }
  }
}

async function runMonthlySummary() {
  const today = new Date();
  if (today.getDate() !== 1) return; // fire once, on the 1st of the month
  const users = await User.find({ 'notificationPreferences.monthlyReports': true });
  for (const user of users) {
    await Notification.create({
      userId: user._id,
      type: 'monthly_summary',
      title: 'Your monthly summary is ready',
      message: 'Your WealthFlow monthly financial report is ready to view in Reports.',
    });
  }
}

async function runMonthlySnapshots() {
  const today = new Date();
  if (today.getDate() !== 1) return; // freeze the month that just ended, on its 1st day
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const users = await User.find({});
  for (const user of users) {
    await buildSnapshotForMonth(user._id, lastMonth).catch((err) => console.error(`Snapshot failed for ${user._id}:`, err.message));
  }
}

function startScheduler() {
  // Every minute: check for due habit reminders.
  cron.schedule('* * * * *', () => {
    runHabitReminders().catch((err) => console.error('Reminder job failed:', err.message));
  });

  // Once a day at 08:00: monthly summary notification + freeze last month's snapshot.
  cron.schedule('0 8 * * *', () => {
    runMonthlySummary().catch((err) => console.error('Monthly summary job failed:', err.message));
    runMonthlySnapshots().catch((err) => console.error('Monthly snapshot job failed:', err.message));
  });

  console.log('Reminder scheduler started.');
}

module.exports = { startScheduler, runHabitReminders, runMonthlySummary, runMonthlySnapshots };
