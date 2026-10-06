const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.use(protect);
router.get('/', ctrl.listNotifications);
router.put('/:id/read', ctrl.markRead);
router.put('/read-all', ctrl.markAllRead);
router.delete('/', ctrl.clearAll);

module.exports = router;
