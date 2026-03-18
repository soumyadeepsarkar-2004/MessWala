/**
 * Advanced Analytics Controller
 * Provides ML-ready analytics and advanced insights
 */

const {
  analyzeMealPreferences,
  analyzeExpenseTrends,
  predictMealCosts,
  analyzeWastage,
  analyzeSatisfaction,
} = require('../utils/advancedAnalytics');

const Expense = require('../models/Expense');
const MealAttendance = require('../models/MealAttendance');
const Feedback = require('../models/Feedback');

/**
 * GET /api/advanced-analytics/meal-preferences
 * Get detailed meal preference analytics
 */
async function getMealPreferences(req, res) {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const meals = await MealAttendance.find(query);
    const preferences = analyzeMealPreferences(meals);

    res.json({
      success: true,
      data: preferences,
      period: { startDate, endDate },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/advanced-analytics/expense-trends
 * Get expense trends and anomalies
 */
async function getExpenseTrends(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: 1 });
    const trends = analyzeExpenseTrends(expenses);

    res.json({
      success: true,
      data: trends,
      period: { startDate, endDate },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/advanced-analytics/cost-predictions
 * Predict future meal costs
 */
async function getCostPredictions(req, res) {
  try {
    const { daysAhead = 30, startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: 1 });
    const predictions = predictMealCosts(expenses, parseInt(daysAhead));

    res.json({
      success: true,
      data: predictions,
      daysAhead: parseInt(daysAhead),
      generatedAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/advanced-analytics/wastage
 * Analyze meal wastage
 */
async function getWastageAnalysis(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const [attendances, expenses] = await Promise.all([
      MealAttendance.find(query),
      Expense.find(query),
    ]);

    const wastage = analyzeWastage(attendances, expenses);

    res.json({
      success: true,
      data: wastage,
      period: { startDate, endDate },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/advanced-analytics/satisfaction
 * Analyze satisfaction trends from feedback
 */
async function getSatisfactionAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const feedback = await Feedback.find(query);
    const satisfaction = analyzeSatisfaction(feedback);

    res.json({
      success: true,
      data: satisfaction,
      period: { startDate, endDate },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/advanced-analytics/dashboard
 * Get comprehensive analytics dashboard
 */
async function getComprehensiveAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const [expenses, attendances, feedback] = await Promise.all([
      Expense.find(query),
      MealAttendance.find(query),
      Feedback.find({ createdAt: query.date || {} }),
    ]);

    const dashboard = {
      mealPreferences: analyzeMealPreferences(attendances),
      expenseTrends: analyzeExpenseTrends(expenses),
      costPredictions: predictMealCosts(expenses, 7), // 7-day forecast
      wastageAnalysis: analyzeWastage(attendances, expenses),
      satisfaction: analyzeSatisfaction(feedback),
      summaryMetrics: {
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        totalAttendance: attendances.length,
        totalFeedback: feedback.length,
        periodStart: startDate || 'N/A',
        periodEnd: endDate || 'N/A',
      },
    };

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getMealPreferences,
  getExpenseTrends,
  getCostPredictions,
  getWastageAnalysis,
  getSatisfactionAnalytics,
  getComprehensiveAnalytics,
};
