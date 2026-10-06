const { body } = require('express-validator');

const transactionRules = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense.'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  body('date').optional().isISO8601().withMessage('Enter a valid date.'),
];

module.exports = { transactionRules };
