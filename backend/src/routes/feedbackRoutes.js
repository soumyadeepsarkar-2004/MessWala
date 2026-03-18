const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getFeedback,
  getWeeklyRatings,
  getSatisfactionTrend,
  getMostComplained,
} = require('../controllers/feedbackController');
const { protect, authorize, requireApproval } = require('../middleware/authMiddleware');

router.post('/', protect, requireApproval, submitFeedback);
router.get('/', protect, requireApproval, getFeedback);
router.get('/weekly', protect, requireApproval, getWeeklyRatings);
router.get('/trend', protect, requireApproval, getSatisfactionTrend);
router.get(
  '/complaints',
  protect,
  requireApproval,
  authorize('manager', 'admin'),
  getMostComplained,
);

module.exports = router;
