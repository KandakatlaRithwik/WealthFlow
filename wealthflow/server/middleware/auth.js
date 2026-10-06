const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    let token;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) token = header.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authenticated. Please log in.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'User no longer exists.' });
    if (user.status === 'disabled') return res.status(403).json({ message: 'Account disabled. Contact support.' });

    user.lastActivityAt = new Date();
    user.save().catch(() => {});

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
}

module.exports = { protect, requireAdmin };
