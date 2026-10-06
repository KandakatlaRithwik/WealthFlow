const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getDashboardSummary } = require('../controllers/dashboardController');

router.get('/summary', protect, getDashboardSummary);

module.exports = router;
