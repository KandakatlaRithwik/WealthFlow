const Notification = require('../models/Notification');

async function listNotifications(req, res, next) {
  try {
    const items = await Notification.find({ userId: req.user._id }).sort('-createdAt').limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ items, unreadCount });
  } catch (err) { next(err); }
}

async function markRead(req, res, next) {
  try {
    const n = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true }, { new: true });
    if (!n) return res.status(404).json({ message: 'Notification not found.' });
    res.json({ notification: n });
  } catch (err) { next(err); }
}

async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) { next(err); }
}

async function clearAll(req, res, next) {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ message: 'Notifications cleared.' });
  } catch (err) { next(err); }
}

module.exports = { listNotifications, markRead, markAllRead, clearAll };
