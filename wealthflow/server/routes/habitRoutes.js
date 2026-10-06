const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/habitController');

router.use(protect);
router.get('/', ctrl.listHabits);
router.post('/', ctrl.createHabit);
router.put('/:id', ctrl.updateHabit);
router.delete('/:id', ctrl.deleteHabit);
router.post('/:id/complete', ctrl.completeHabit);

module.exports = router;
