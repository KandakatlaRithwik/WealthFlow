const Transaction = require('../models/Transaction');

async function listTransactions(req, res, next) {
  try {
    const { type, category, search, startDate, endDate, page = 1, limit = 20, sort = '-date' } = req.query;
    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (search) filter.description = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Transaction.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
}

async function createTransaction(req, res, next) {
  try {
    const tx = await Transaction.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ transaction: tx });
  } catch (err) { next(err); }
}

async function updateTransaction(req, res, next) {
  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!tx) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ transaction: tx });
  } catch (err) { next(err); }
}

async function deleteTransaction(req, res, next) {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!tx) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ message: 'Transaction deleted.' });
  } catch (err) { next(err); }
}

module.exports = { listTransactions, createTransaction, updateTransaction, deleteTransaction };
