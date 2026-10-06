const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

function sanitizeUser(user) {
  const obj = user.toObject();
  delete obj.passwordHash;
  return obj;
}

async function register(req, res, next) {
  try {
    const { name, email, password, age, occupation, monthlyIncomeRange, primaryFinancialGoal, currency, country } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email: email.toLowerCase(), passwordHash,
      age, occupation, monthlyIncomeRange, primaryFinancialGoal,
      currency: currency || 'INR', country: country || 'India',
    });

    const token = generateToken(user._id);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
    if (user.status === 'disabled') return res.status(403).json({ message: 'This account has been disabled.' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = generateToken(user._id);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) { next(err); }
}

async function me(req, res) {
  res.json({ user: req.user });
}

async function logout(req, res) {
  // Stateless JWT — logout is handled client-side by discarding the token.
  res.json({ message: 'Logged out.' });
}

module.exports = { register, login, me, logout, sanitizeUser };
