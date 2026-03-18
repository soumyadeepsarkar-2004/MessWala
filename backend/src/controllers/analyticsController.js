const Expense = require('../models/Expense');
const MealAttendance = require('../models/MealAttendance');
const Feedback = require('../models/Feedback');
const { validatePositiveInteger, validateMonthString } = require('../utils/validation');
const { linearRegression } = require('../utils/predictor');

// @desc    Get monthly expense trend (last 6 months)
// @route   GET /api/analytics/expense-trend
exports.getExpenseTrend = async (req, res) => {
  try {
    const months = validatePositiveInteger(req.query.months, 6);
    if (months > 60) {
      return res.status(400).json({ success: false, error: 'Maximum 60 months allowed' });
    }

    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toISOString().slice(0, 7);

      const agg = await Expense.aggregate([
        {
          $match: {
            date: {
              $gte: month + '-01',
              $lt: month + '-32',
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      results.push({
        month,
        total: agg.length > 0 ? agg[0].total : 0,
      });
    }

    res.json({ success: true, trend: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get expense category breakdown for a month
// @route   GET /api/analytics/category-breakdown?month=YYYY-MM
exports.getCategoryBreakdown = async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    // Validate month format
    const validatedMonth = validateMonthString(month);
    if (!validatedMonth) {
      return res.status(400).json({ success: false, error: 'Invalid month format. Use YYYY-MM' });
    }

    const breakdown = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: validatedMonth + '-01',
            $lt: validatedMonth + '-32',
          },
        },
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);

    res.json({ success: true, month: validatedMonth, breakdown });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get cost per plate trend (last 6 months)
// @route   GET /api/analytics/cost-per-plate-trend
exports.getCostPerPlateTrend = async (req, res) => {
  try {
    const months = validatePositiveInteger(req.query.months, 6);
    if (months > 60) {
      return res.status(400).json({ success: false, error: 'Maximum 60 months allowed' });
    }

    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toISOString().slice(0, 7);

      const expenseAgg = await Expense.aggregate([
        {
          $match: {
            date: {
              $gte: month + '-01',
              $lt: month + '-32',
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const totalExpense = expenseAgg.length > 0 ? expenseAgg[0].total : 0;

      const mealsServed = await MealAttendance.countDocuments({
        date: {
          $gte: month + '-01',
          $lt: month + '-32',
        },
        present: true,
      });

      results.push({
        month,
        costPerPlate: mealsServed > 0 ? Number((totalExpense / mealsServed).toFixed(2)) : 0,
        totalExpense,
        mealsServed,
      });
    }

    res.json({ success: true, trend: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get wastage estimate
// @route   GET /api/analytics/wastage?month=YYYY-MM
exports.getWastageEstimate = async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    // Validate month format (YYYY-MM)
    const validatedMonth = validateMonthString(month || '');
    if (!validatedMonth) {
      return res.status(400).json({ success: false, error: 'Invalid month format. Use YYYY-MM' });
    }

    // Total attendance records (present + absent)
    // Use string range comparison instead of regex to prevent NoSQL injection and ReDoS
    const totalRecords = await MealAttendance.countDocuments({
      date: {
        $gte: validatedMonth + '-01',
        $lt: validatedMonth + '-32',
      },
    });

    const presentCount = await MealAttendance.countDocuments({
      date: {
        $gte: validatedMonth + '-01',
        $lt: validatedMonth + '-32',
      },
      present: true,
    });

    const absentCount = totalRecords - presentCount;

    // Wastage percentage = meals prepared for absentees / total prepared
    // Assume meals prepared based on total records (could be smarter with forecasting)
    const wastagePercent =
      totalRecords > 0 ? Number(((absentCount / totalRecords) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      month,
      totalRecords,
      presentCount,
      absentCount,
      wastagePercent,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get Mess Transparency Index
// @route   GET /api/analytics/transparency-index
exports.getTransparencyIndex = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    // Factor 1: Expense entry frequency (days with expenses / 30)
    const expenseDays = await Expense.distinct('date', { date: { $gte: startDate } });
    const expenseScore = Math.min((expenseDays.length / 30) * 100, 100);

    // Factor 2: Attendance tracking (days with attendance records / 30)
    const attendanceDays = await MealAttendance.distinct('date', { date: { $gte: startDate } });
    const attendanceScore = Math.min((attendanceDays.length / 30) * 100, 100);

    // Factor 3: Feedback engagement (feedback count / expected based on attendance)
    const feedbackCount = await Feedback.countDocuments({ date: { $gte: startDate } });
    const totalMeals = await MealAttendance.countDocuments({
      date: { $gte: startDate },
      present: true,
    });
    const feedbackScore = totalMeals > 0 ? Math.min((feedbackCount / totalMeals) * 100, 100) : 0;

    // Weighted average
    const transparencyIndex = Number(
      (expenseScore * 0.4 + attendanceScore * 0.35 + feedbackScore * 0.25).toFixed(1),
    );

    res.json({
      success: true,
      transparencyIndex,
      factors: {
        expenseTracking: Number(expenseScore.toFixed(1)),
        attendanceTracking: Number(attendanceScore.toFixed(1)),
        feedbackEngagement: Number(feedbackScore.toFixed(1)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get predicted cost for next month
// @route   GET /api/analytics/predicted-cost
exports.getPredictedCost = async (req, res) => {
  try {
    const months = 6;
    const dataPoints = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toISOString().slice(0, 7);
      const dateRegex = new RegExp(`^${month}`);

      const agg = await Expense.aggregate([
        { $match: { date: { $regex: dateRegex } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      dataPoints.push(agg.length > 0 ? agg[0].total : 0);
    }

    const prediction = linearRegression(dataPoints);

    res.json({
      success: true,
      historicalData: dataPoints,
      predictedNextMonth: Number(Math.max(prediction, 0).toFixed(2)),
      confidence: dataPoints.filter((d) => d > 0).length >= 3 ? 'medium' : 'low',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
