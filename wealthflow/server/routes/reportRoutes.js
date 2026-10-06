const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { downloadMonthlyReportPdf } = require('../controllers/reportController');

router.get('/pdf', protect, downloadMonthlyReportPdf);

module.exports = router;
