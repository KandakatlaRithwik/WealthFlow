const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const Notification = require('../models/Notification');
const { calculateStreak, periodKey } = require('../utils/streakEngine');

const MILESTONES = [7, 14, 30, 60, 100];

async function attachStreaks(habits) {
  const results = [];
  for (const habit of habits) {
    const completions = await HabitCompletion.find({ habitId: habit._id });
    const streak = calculateStreak(habit, completions);
    results.push({ ...habit.toObject(), ...streak });
  }
  return results;
}

async function listHabits(req, res, next) {
  try {
    const { active } = req.query;
    const filter = { userId: req.user._id };
    if (active !== undefined) filter.isActive = active === 'true';
    const habits = await Habit.find(filter).sort('-createdAt');
    res.json({ items: await attachStreaks(habits) });
  } catch (err) { next(err); }
}

async function createHabit(req, res, next) {
  try {
    const habit = await Habit.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ habit });
  } catch (err) { next(err); }
}

async function updateHabit(req, res, next) {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });
    res.json({ habit });
  } catch (err) { next(err); }
}

async function deleteHabit(req, res, next) {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });
    await HabitCompletion.deleteMany({ habitId: habit._id });
    res.json({ message: 'Habit deleted.' });
  } catch (err) { next(err); }
}

async function completeHabit(req, res, next) {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });

    const date = req.body.date ? new Date(req.body.date) : new Date();
    const normalized = new Date(periodKey(date, habit.frequency));

    const completion = await HabitCompletion.findOneAndUpdate(
      { habitId: habit._id, date: normalized },
      { habitId: habit._id, userId: req.user._id, date: normalized, value: req.body.value || 1 },
      { upsert: true, new: true }
    );

    const completions = await HabitCompletion.find({ habitId: habit._id });
    const streak = calculateStreak(habit, completions);

    if (MILESTONES.includes(streak.currentStreak)) {
      const unit = habit.frequency === 'daily' ? 'day' : habit.frequency === 'weekly' ? 'week' : 'month';
      await Notification.create({
        userId: req.user._id,
        type: 'streak_milestone',
        title: 'Streak milestone!',
        message: `You reached a ${streak.currentStreak}-${unit} streak on "${habit.title}".`,
      });
    }

    res.json({ completion, streak });
  } catch (err) { next(err); }
}

module.exports = { listHabits, createHabit, updateHabit, deleteHabit, completeHabit };
