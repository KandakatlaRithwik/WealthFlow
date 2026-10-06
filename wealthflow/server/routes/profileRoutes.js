const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/profileController');

router.use(protect);
router.put('/', ctrl.updateProfile);
router.put('/password', ctrl.changePassword);

module.exports = router;
