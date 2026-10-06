const router = require('express').Router();
const { protect, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.use(protect, requireAdmin);
router.get('/users', ctrl.listUsers);
router.put('/users/:id/status', ctrl.updateUserStatus);
router.delete('/users/:id', ctrl.deleteUser);
router.get('/analytics', ctrl.platformAnalytics);
router.get('/feedback', ctrl.listFeedback);
router.put('/feedback/:id', ctrl.updateFeedback);

module.exports = router;
