const Feedback = require('../models/Feedback');

async function submitFeedback(req, res, next) {
  try {
    const fb = await Feedback.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ feedback: fb });
  } catch (err) { next(err); }
}

async function myFeedback(req, res, next) {
  try {
    const items = await Feedback.find({ userId: req.user._id }).sort('-createdAt');
    res.json({ items });
  } catch (err) { next(err); }
}

module.exports = { submitFeedback, myFeedback };
