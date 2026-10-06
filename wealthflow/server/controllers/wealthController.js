const Asset = require('../models/Asset');
const Liability = require('../models/Liability');
const Investment = require('../models/Investment');
const { netWorth, investmentGain, investmentReturnPct } = require('../utils/finance');

async function getWealthSummary(req, res, next) {
  try {
    const userId = req.user._id;
    const [assets, liabilities, investments] = await Promise.all([
      Asset.find({ userId }).sort('-date'),
      Liability.find({ userId }).sort('-date'),
      Investment.find({ userId }).sort('-purchaseDate'),
    ]);

    const totalAssets = assets.reduce((s, a) => s + a.currentValue, 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + l.outstandingAmount, 0);
    const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
    const totalInvestmentValue = investments.reduce((s, i) => s + i.currentValue, 0);

    res.json({
      assets, liabilities,
      investments: investments.map((i) => ({
        ...i.toObject(),
        gain: investmentGain(i.currentValue, i.investedAmount),
        returnPct: investmentReturnPct(i.currentValue, i.investedAmount),
      })),
      totals: {
        totalAssets, totalLiabilities,
        netWorth: netWorth(totalAssets, totalLiabilities),
        totalInvested, totalInvestmentValue,
        totalInvestmentGain: investmentGain(totalInvestmentValue, totalInvested),
      },
    });
  } catch (err) { next(err); }
}

async function addAsset(req, res, next) {
  try {
    const asset = await Asset.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ asset });
  } catch (err) { next(err); }
}
async function updateAsset(req, res, next) {
  try {
    const asset = await Asset.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true, runValidators: true });
    if (!asset) return res.status(404).json({ message: 'Asset not found.' });
    res.json({ asset });
  } catch (err) { next(err); }
}
async function deleteAsset(req, res, next) {
  try {
    const asset = await Asset.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!asset) return res.status(404).json({ message: 'Asset not found.' });
    res.json({ message: 'Asset deleted.' });
  } catch (err) { next(err); }
}

async function addLiability(req, res, next) {
  try {
    const liability = await Liability.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ liability });
  } catch (err) { next(err); }
}
async function updateLiability(req, res, next) {
  try {
    const liability = await Liability.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true, runValidators: true });
    if (!liability) return res.status(404).json({ message: 'Liability not found.' });
    res.json({ liability });
  } catch (err) { next(err); }
}
async function deleteLiability(req, res, next) {
  try {
    const liability = await Liability.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!liability) return res.status(404).json({ message: 'Liability not found.' });
    res.json({ message: 'Liability deleted.' });
  } catch (err) { next(err); }
}

async function addInvestment(req, res, next) {
  try {
    const investment = await Investment.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ investment });
  } catch (err) { next(err); }
}
async function updateInvestment(req, res, next) {
  try {
    const investment = await Investment.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true, runValidators: true });
    if (!investment) return res.status(404).json({ message: 'Investment not found.' });
    res.json({ investment });
  } catch (err) { next(err); }
}
async function deleteInvestment(req, res, next) {
  try {
    const investment = await Investment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!investment) return res.status(404).json({ message: 'Investment not found.' });
    res.json({ message: 'Investment deleted.' });
  } catch (err) { next(err); }
}

module.exports = {
  getWealthSummary,
  addAsset, updateAsset, deleteAsset,
  addLiability, updateLiability, deleteLiability,
  addInvestment, updateInvestment, deleteInvestment,
};
