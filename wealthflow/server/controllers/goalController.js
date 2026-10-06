const SavingsGoal = require('../models/SavingsGoal');
const Notification = require('../models/Notification');
const { goalCompletionPct, goalRemaining, suggestedMonthlyContribution } = require('../utils/finance');

function enrich(goal) {
  const obj = goal.toObject();
  obj.percentage = goalCompletionPct(obj.currentAmount, obj.targetAmount);
  obj.remaining = goalRemaining(obj.currentAmount, obj.targetAmount);
  obj.suggestedMonthlyContribution = suggestedMonthlyContribution(obj.remaining, obj.targetDate);
  return obj;
}

async function listGoals(req, res, next) {
  try {
    const { status, priority } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    const goals = await SavingsGoal.find(filter).sort('-createdAt');
    res.json({ items: goals.map(enrich) });
  } catch (err) { next(err); }
}

async function createGoal(req, res, next) {
  try {
    const goal = await SavingsGoal.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ goal: enrich(goal) });
  } catch (err) { next(err); }
}

async function updateGoal(req, res, next) {
  try {
    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json({ goal: enrich(goal) });
  } catch (err) { next(err); }
}

async function deleteGoal(req, res, next) {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json({ message: 'Goal deleted.' });
  } catch (err) { next(err); }
}

async function contribute(req, res, next) {
  try {
    const { amount, note } = req.body;
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    const prevPct = goalCompletionPct(goal.currentAmount, goal.targetAmount);
    goal.contributions.push({ amount, note, date: new Date() });
    goal.currentAmount += Number(amount);
    if (goal.currentAmount >= goal.targetAmount) goal.status = 'completed';
    await goal.save();

    const newPct = goalCompletionPct(goal.currentAmount, goal.targetAmount);
    if (newPct >= 100 && prevPct < 100) {
      await Notification.create({ userId: req.user._id, type: 'goal_milestone', title: 'Goal reached!', message: `You reached your "${goal.name}" goal.` });
    } else if (newPct >= 80 && prevPct < 80) {
      await Notification.create({ userId: req.user._id, type: 'goal_milestone', title: 'Almost there', message: `Your "${goal.name}" goal is ${newPct}% complete.` });
    }

    res.json({ goal: enrich(goal) });
  } catch (err) { next(err); }
}

module.exports = { listGoals, createGoal, updateGoal, deleteGoal, contribute };
