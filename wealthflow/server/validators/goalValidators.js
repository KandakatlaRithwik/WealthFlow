const { body } = require('express-validator');

const goalRules = [
  body('name').trim().notEmpty().withMessage('Goal name is required.'),
  body('targetAmount').isFloat({ gt: 0 }).withMessage('Target amount must be greater than zero.'),
];

const contributionRules = [
  body('amount').isFloat({ gt: 0 }).withMessage('Contribution amount must be greater than zero.'),
];

module.exports = { goalRules, contributionRules };
