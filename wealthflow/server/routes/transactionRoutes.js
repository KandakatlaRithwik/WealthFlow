const router = require('express').Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { transactionRules } = require('../validators/transactionValidators');
const ctrl = require('../controllers/transactionController');

router.use(protect);
router.get('/', ctrl.listTransactions);
router.post('/', transactionRules, validate, ctrl.createTransaction);
router.put('/:id', transactionRules, validate, ctrl.updateTransaction);
router.delete('/:id', ctrl.deleteTransaction);

module.exports = router;
