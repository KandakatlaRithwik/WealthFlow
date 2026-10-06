const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/wealthController');

router.use(protect);
router.get('/', ctrl.getWealthSummary);
router.post('/assets', ctrl.addAsset);
router.put('/assets/:id', ctrl.updateAsset);
router.delete('/assets/:id', ctrl.deleteAsset);
router.post('/liabilities', ctrl.addLiability);
router.put('/liabilities/:id', ctrl.updateLiability);
router.delete('/liabilities/:id', ctrl.deleteLiability);
router.post('/investments', ctrl.addInvestment);
router.put('/investments/:id', ctrl.updateInvestment);
router.delete('/investments/:id', ctrl.deleteInvestment);

module.exports = router;
