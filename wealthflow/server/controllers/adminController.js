const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const SavingsGoal = require('../models/SavingsGoal');
const Feedback = require('../models/Feedback');

async function listUsers(req, res, next) {
  try {
    const { status, role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
}

async function updateUserStatus(req, res, next) {
  try {
    const { status, role } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (role) updates.role = role;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) { next(err); }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (err) { next(err); }
}

async function platformAnalytics(req, res, next) {
  try {
    const [totalUsers, activeUsers, totalTransactions, totalHabits, totalCompletions, totalGoals, completedGoals] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      Transaction.countDocuments(),
      Habit.countDocuments(),
      HabitCompletion.countDocuments(),
      SavingsGoal.countDocuments(),
      SavingsGoal.countDocuments({ status: 'completed' }),
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newRegistrations = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const registrationTrend = await User.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    res.json({
      totalUsers, activeUsers, newRegistrations, totalTransactions,
      avgTransactionsPerUser: totalUsers ? Math.round(totalTransactions / totalUsers) : 0,
      habitCompletionRate: totalHabits ? Math.round((totalCompletions / totalHabits)) : 0,
      goalCompletionRate: totalGoals ? Math.round((completedGoals / totalGoals) * 100) : 0,
      registrationTrend: registrationTrend.map((r) => ({ month: r._id, count: r.count })),
    });
  } catch (err) { next(err); }
}

async function listFeedback(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const items = await Feedback.find(filter).populate('userId', 'name email').sort('-createdAt');
    res.json({ items });
  } catch (err) { next(err); }
}

async function updateFeedback(req, res, next) {
  try {
    const { status, adminResponse } = req.body;
    const fb = await Feedback.findByIdAndUpdate(req.params.id, { status, adminResponse }, { new: true });
    if (!fb) return res.status(404).json({ message: 'Feedback not found.' });
    res.json({ feedback: fb });
  } catch (err) { next(err); }
}

module.exports = { listUsers, updateUserStatus, deleteUser, platformAnalytics, listFeedback, updateFeedback };
