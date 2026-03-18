const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  getExpenseTrend,
  getCategoryBreakdown,
  getCostPerPlateTrend,
  getWastageEstimate,
  getTransparencyIndex,
  getPredictedCost,
} = require('../controllers/analyticsController');
const { protect, requireApproval } = require('../middleware/authMiddleware');

const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later' },
});

router.use(analyticsLimiter);

router.get('/expense-trend', protect, requireApproval, getExpenseTrend);
router.get('/category-breakdown', protect, requireApproval, getCategoryBreakdown);
router.get('/cost-per-plate-trend', protect, requireApproval, getCostPerPlateTrend);
router.get('/wastage', protect, requireApproval, getWastageEstimate);
router.get('/transparency-index', protect, requireApproval, getTransparencyIndex);
router.get('/predicted-cost', protect, requireApproval, getPredictedCost);

module.exports = router;
