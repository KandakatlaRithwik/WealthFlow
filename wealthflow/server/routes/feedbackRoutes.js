const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/feedbackController');

router.use(protect);
router.post('/', ctrl.submitFeedback);
router.get('/mine', ctrl.myFeedback);

module.exports = router;
