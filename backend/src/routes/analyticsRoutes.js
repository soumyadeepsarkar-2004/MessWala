const express = require('express');
const router = express.Router();
const {
    getExpenseTrend,
    getCategoryBreakdown,
    getCostPerPlateTrend,
    getWastageEstimate,
    getTransparencyIndex,
    getPredictedCost,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/expense-trend', protect, getExpenseTrend);
router.get('/category-breakdown', protect, getCategoryBreakdown);
router.get('/cost-per-plate-trend', protect, getCostPerPlateTrend);
router.get('/wastage', protect, getWastageEstimate);
router.get('/transparency-index', protect, getTransparencyIndex);
router.get('/predicted-cost', protect, getPredictedCost);

module.exports = router;
