const router = require('express').Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { goalRules, contributionRules } = require('../validators/goalValidators');
const ctrl = require('../controllers/goalController');

router.use(protect);
router.get('/', ctrl.listGoals);
router.post('/', goalRules, validate, ctrl.createGoal);
router.put('/:id', ctrl.updateGoal);
router.delete('/:id', ctrl.deleteGoal);
router.post('/:id/contribute', contributionRules, validate, ctrl.contribute);

module.exports = router;
