const express = require('express');
const router = express.Router();
const {
    submitFeedback,
    getFeedback,
    getWeeklyRatings,
    getSatisfactionTrend,
    getMostComplained,
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, submitFeedback);
router.get('/', protect, getFeedback);
router.get('/weekly', protect, getWeeklyRatings);
router.get('/trend', protect, getSatisfactionTrend);
router.get('/complaints', protect, authorize('manager', 'admin'), getMostComplained);

module.exports = router;
