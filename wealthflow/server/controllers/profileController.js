const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function updateProfile(req, res, next) {
  try {
    const allowed = ['name', 'phone', 'occupation', 'currency', 'country', 'monthlyIncomeTarget', 'monthlySavingsTarget', 'notificationPreferences', 'onboardingCompleted', 'primaryFinancialGoal', 'age', 'monthlyIncomeRange'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-passwordHash');
    res.json({ user });
  } catch (err) { next(err); }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect.' });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated.' });
  } catch (err) { next(err); }
}

module.exports = { updateProfile, changePassword };
