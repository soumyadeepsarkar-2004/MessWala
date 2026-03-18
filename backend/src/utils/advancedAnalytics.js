/**
 * Advanced Analytics Module
 * Provides advanced analytics, ML-ready predictions, and data insights
 */

/**
 * Calculate meal preference analytics
 @param {Array} meals - Array of meal records with dates and meal data
 * @return {Object} Meal preferences with frequency and ratings
 */
function analyzeMealPreferences(meals) {
  const preferences = {};
  const ratings = {};

  meals.forEach((meal) => {
    const items = meal.items || [];
    items.forEach((item) => {
      preferences[item] = (preferences[item] || 0) + 1;
      if (meal.rating) {
        if (!ratings[item]) {
          ratings[item] = { sum: 0, count: 0 };
        }
        ratings[item].sum += meal.rating;
        ratings[item].count += 1;
      }
    });
  });

  // Calculate average ratings
  const mealRatings = {};
  Object.keys(ratings).forEach((item) => {
    mealRatings[item] = (ratings[item].sum / ratings[item].count).toFixed(2);
  });

  return {
    frequency: preferences,
    averageRatings: mealRatings,
    topMeals: Object.entries(preferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([meal, freq]) => ({ meal, frequency: freq, rating: mealRatings[meal] })),
  };
}

/**
 * Calculate expense trends and anomalies
 * @param {Array} expenses - Array of expense records
 * @return {Object} Trends, anomalies, and forecasts
 */
function analyzeExpenseTrends(expenses) {
  if (expenses.length === 0) {
    return {};
  }

  // Sort by date
  const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate daily averages
  const dailyTotals = {};
  sorted.forEach((exp) => {
    const date = new Date(exp.date).toISOString().split('T')[0];
    dailyTotals[date] = (dailyTotals[date] || 0) + exp.amount;
  });

  const dailyValues = Object.values(dailyTotals);
  const avg = dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length;
  const variance =
    dailyValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / dailyValues.length;
  const stdDev = Math.sqrt(variance);

  // Detect anomalies (values beyond 2 standard deviations)
  const anomalies = [];
  Object.entries(dailyTotals).forEach(([date, total]) => {
    if (Math.abs(total - avg) > 2 * stdDev) {
      anomalies.push({
        date,
        amount: total,
        deviation: (((total - avg) / avg) * 100).toFixed(2) + '%',
      });
    }
  });

  // Category breakdown
  const categoryBreakdown = {};
  expenses.forEach((exp) => {
    const cat = exp.category || 'uncategorized';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + exp.amount;
  });

  // Calculate growth rate (week over week)
  const weeks = {};
  sorted.forEach((exp) => {
    const date = new Date(exp.date);
    const week = `${date.getFullYear()}-W${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)}`;
    weeks[week] = (weeks[week] || 0) + exp.amount;
  });

  const weekValues = Object.values(weeks);
  const growthRate =
    weekValues.length > 1
      ? (((weekValues[weekValues.length - 1] - weekValues[0]) / weekValues[0]) * 100).toFixed(2)
      : 0;

  return {
    averageDaily: avg.toFixed(2),
    standardDeviation: stdDev.toFixed(2),
    anomalies,
    categoryBreakdown,
    growthRate: growthRate + '%',
    totalExpenses: sorted.reduce((sum, e) => sum + e.amount, 0),
    period: {
      start: sorted[0].date,
      end: sorted[sorted.length - 1].date,
    },
  };
}

/**
 * Predict future meal costs based on historical data
 * @param {Array} expenses - Array of expense records
 * @param {Number} daysAhead - Number of days to predict ahead
 * @return {Array} Predicted daily costs
 */
function predictMealCosts(expenses, daysAhead = 30) {
  if (expenses.length < 10) {
    return [];
  }

  // Sort expenses by date
  const sorted = [...expenses]
    .filter((e) => e.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate daily totals
  const dailyTotals = {};
  sorted.forEach((exp) => {
    const date = new Date(exp.date).toISOString().split('T')[0];
    dailyTotals[date] = (dailyTotals[date] || 0) + exp.amount;
  });

  const dailyValues = Object.values(dailyTotals);
  const avg = dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length;
  const variance =
    dailyValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / dailyValues.length;
  const stdDev = Math.sqrt(variance);

  // Simple linear regression for trend
  const n = dailyValues.length;
  const sumX = (n * (n + 1)) / 2;
  const sumY = dailyValues.reduce((a, b) => a + b, 0);
  const sumXY = dailyValues.reduce((sum, val, i) => sum + (i + 1) * val, 0);
  const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate predictions
  const predictions = [];
  const lastDate = new Date(sorted[sorted.length - 1].date);

  for (let i = 1; i <= daysAhead; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);

    const predicted = intercept + slope * (n + i);
    const confidence = Math.max(0.7, 1 - (stdDev / avg) * 0.1); // Confidence between 0.7 and 1

    predictions.push({
      date: futureDate.toISOString().split('T')[0],
      predictedCost: Math.max(0, predicted.toFixed(2)), // Ensure non-negative
      confidence: (confidence * 100).toFixed(1) + '%',
      range: {
        min: Math.max(0, (predicted - stdDev).toFixed(2)),
        max: (predicted + stdDev).toFixed(2),
      },
    });
  }

  return predictions;
}

/**
 * Calculate wastage analytics based on attendance and meal variance
 * @param {Array} attendances - Attendance records
 * @param {Array} expenses - Expense records
 * @return {Object} Wastage insights
 */
function analyzeWastage(attendances, expenses) {
  if (attendances.length === 0 || expenses.length === 0) {
    return {};
  }

  // Calculate expected vs actual attendance
  const attendanceByDate = {};
  attendances.forEach((att) => {
    const date = new Date(att.date).toISOString().split('T')[0];
    attendanceByDate[date] = (attendanceByDate[date] || 0) + 1;
  });

  // Calculate expense variation vs attendance
  const dailyExpenses = {};
  expenses.forEach((exp) => {
    const date = new Date(exp.date).toISOString().split('T')[0];
    dailyExpenses[date] = (dailyExpenses[date] || 0) + exp.amount;
  });

  const wastageAnalysis = [];
  const avgAttendance =
    Object.values(attendanceByDate).reduce((a, b) => a + b, 0) /
    Object.keys(attendanceByDate).length;

  Object.entries(dailyExpenses).forEach(([date, expense]) => {
    const attendance = attendanceByDate[date] || 0;
    const costPerPerson = attendance > 0 ? (expense / attendance).toFixed(2) : 0;

    // Flag as potential wastage if cost per person is high relative to average
    const isHighVariance = costPerPerson > avgAttendance * 1.5;

    if (isHighVariance) {
      wastageAnalysis.push({
        date,
        attendance,
        totalExpense: expense,
        costPerPerson,
        variance:
          (((costPerPerson - avgAttendance * 1.5) / (avgAttendance * 1.5)) * 100).toFixed(2) + '%',
        potentialWastage: true,
      });
    }
  });

  return {
    averageAttendance: avgAttendance.toFixed(0),
    potentialWastageInstances: wastageAnalysis.length,
    details: wastageAnalysis,
    recommendations: generateWastageRecommendations(wastageAnalysis),
  };
}

/**
 * Generate recommendations to reduce wastage
 * @param {Array} wastageAnalysis - Wastage analysis data
 * @return {Array} Recommendations
 */
function generateWastageRecommendations(wastageAnalysis) {
  const recommendations = [];

  if (wastageAnalysis.length === 0) {
    return ['Great job! No significant wastage detected.'];
  }

  const highVarianceDays = wastageAnalysis.filter((w) => w.potentialWastage).length;
  const avgVariance =
    wastageAnalysis.reduce((sum, w) => sum + parseFloat(w.variance), 0) / wastageAnalysis.length;

  if (highVarianceDays > wastageAnalysis.length * 0.5) {
    recommendations.push(
      'Consider reviewing meal portions - high variance detected on more than 50% of days',
    );
  }

  if (avgVariance > 50) {
    recommendations.push('Implement portion control guidelines to reduce per-person cost variance');
  }

  recommendations.push('Track daily attendance more accurately for better meal planning');
  recommendations.push('Consider implementing a feedback system for meal quality');

  return recommendations;
}

/**
 * Calculate satisfaction metrics from feedback data
 * @param {Array} feedback - Feedback records
 * @return {Object} Satisfaction metrics
 */
function analyzeSatisfaction(feedback) {
  if (feedback.length === 0) {
    return {};
  }

  const ratings = feedback.map((f) => f.rating).filter((r) => typeof r === 'number');
  const avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);

  // Distribution
  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  ratings.forEach((r) => {
    if (Object.prototype.hasOwnProperty.call(distribution, r)) {
      distribution[r] += 1;
    }
  });

  // Sentiment analysis (simple positive/negative keywords)
  const positiveKeywords = ['good', 'great', 'excellent', 'delicious', 'tasty', 'fresh'];
  const negativeKeywords = ['bad', 'poor', 'terrible', 'stale', 'cold', 'late'];

  let positiveCount = 0;
  let negativeCount = 0;

  feedback.forEach((f) => {
    if (f.comment) {
      const comment = f.comment.toLowerCase();
      positiveKeywords.forEach((kw) => {
        if (comment.includes(kw)) {
          positiveCount += 1;
        }
      });
      negativeKeywords.forEach((kw) => {
        if (comment.includes(kw)) {
          negativeCount += 1;
        }
      });
    }
  });

  return {
    averageRating: parseFloat(avgRating),
    totalResponses: feedback.length,
    distribution,
    sentiment: {
      positive: positiveCount,
      negative: negativeCount,
      neutral: feedback.length - positiveCount - negativeCount,
    },
    recommendations: generateSatisfactionRecommendations(
      parseFloat(avgRating),
      positiveCount,
      negativeCount,
    ),
  };
}

/**
 * Generate recommendations based on satisfaction metrics
 * @param {Number} avgRating - Average rating
 * @param {Number} positiveCount - Count of positive comments
 * @param {Number} negativeCount - Count of negative comments
 * @return {Array} Recommendations
 */
function generateSatisfactionRecommendations(avgRating, positiveCount, negativeCount) {
  const recommendations = [];

  if (avgRating < 3) {
    recommendations.push('Low satisfaction detected - urgent review needed');
    recommendations.push('Consider conducting student interviews to identify issues');
  } else if (avgRating < 4) {
    recommendations.push('Moderate satisfaction - there is room for improvement');
  } else {
    recommendations.push('High satisfaction - maintain current standards');
  }

  if (negativeCount > positiveCount) {
    recommendations.push('Negative feedback exceeds positive - address common complaints');
  }

  if (avgRating >= 4.5) {
    recommendations.push('Excellent service! Continue best practices');
  }

  return recommendations;
}

module.exports = {
  analyzeMealPreferences,
  analyzeExpenseTrends,
  predictMealCosts,
  analyzeWastage,
  generateWastageRecommendations,
  analyzeSatisfaction,
  generateSatisfactionRecommendations,
};
