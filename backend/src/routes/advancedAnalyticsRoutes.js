const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const advancedAnalyticsController = require('../controllers/advancedAnalyticsController');

const router = express.Router();

// All advanced analytics routes require authentication
router.use(authMiddleware);

/**
 * GET /api/advanced-analytics/meal-preferences
 * Get meal preference analytics
 */
router.get('/meal-preferences', advancedAnalyticsController.getMealPreferences);

/**
 * GET /api/advanced-analytics/expense-trends
 * Get expense trends and anomalies
 */
router.get('/expense-trends', advancedAnalyticsController.getExpenseTrends);

/**
 * GET /api/advanced-analytics/cost-predictions
 * Get cost predictions for future days
 */
router.get('/cost-predictions', advancedAnalyticsController.getCostPredictions);

/**
 * GET /api/advanced-analytics/wastage
 * Get wastage analysis
 */
router.get('/wastage', advancedAnalyticsController.getWastageAnalysis);

/**
 * GET /api/advanced-analytics/satisfaction
 * Get satisfaction analytics
 */
router.get('/satisfaction', advancedAnalyticsController.getSatisfactionAnalytics);

/**
 * GET /api/advanced-analytics/dashboard
 * Get comprehensive analytics dashboard
 */
router.get('/dashboard', advancedAnalyticsController.getComprehensiveAnalytics);

module.exports = router;
