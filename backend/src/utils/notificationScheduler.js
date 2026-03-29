const { getLogger } = require('./logger');
const notificationService = require('./notificationService');
const User = require('../models/User');
const MealAttendance = require('../models/MealAttendance');
const Expense = require('../models/Expense');

const logger = getLogger('NotificationScheduler');

class NotificationScheduler {
  /**
   * Send daily meal reminders at specific times
   */
  async sendDailyMealReminders() {
    try {
      const users = await User.find({ isApproved: true }).select(
        'name email phone preferredNotificationChannel notificationPreferences',
      );

      const today = new Date().toISOString().split('T')[0];
      const mealTimes = [
        { type: 'breakfast', hour: 7 },
        { type: 'lunch', hour: 12 },
        { type: 'dinner', hour: 19 },
      ];

      for (const user of users) {
        for (const meal of mealTimes) {
          // Check if user hasn't marked attendance for this meal
          const attendance = await MealAttendance.findOne({
            userId: user._id,
            date: today,
            mealType: meal.type,
          });

          if (!attendance) {
            await notificationService.sendMealReminder(user, meal.type);
          }
        }
      }

      logger.info('Daily meal reminders sent');
    } catch (err) {
      logger.error('Daily meal reminder error', err);
    }
  }

  /**
   * Send weekly attendance summary
   */
  async sendWeeklySummary() {
    try {
      const users = await User.find({ isApproved: true });
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      for (const user of users) {
        const attendance = await MealAttendance.countDocuments({
          userId: user._id,
          date: { $gte: lastWeek },
          present: true,
        });

        const totalPossible = 21; // 3 meals * 7 days
        const percentage = Math.round((attendance / totalPossible) * 100);

        const content = `📅 Weekly Attendance Summary:\n• Meals Attended: ${attendance}/21\n• Attendance Rate: ${percentage}%\n\nKeep up your meal attendance for accurate cost calculation!`;

        await notificationService.sendNotification(user, {
          type: 'MEAL_UPDATE',
          channel: 'email',
          title: 'Weekly Attendance Summary',
          content,
          metadata: { attendance, percentage },
        });
      }

      logger.info('Weekly summaries sent');
    } catch (err) {
      logger.error('Weekly summary error', err);
    }
  }

  /**
   * Send monthly cost summary at end of month
   */
  async sendMonthlyCostSummary() {
    try {
      const users = await User.find({ isApproved: true });
      const month = new Date().toISOString().slice(0, 7);

      for (const user of users) {
        // Get monthly summary data
        const expenses = await Expense.aggregate([
          {
            $match: {
              date: {
                $gte: month + '-01',
                $lt: month + '-32',
              },
            },
          },
          {
            $group: {
              _id: '$category',
              total: { $sum: '$amount' },
            },
          },
          { $sort: { total: -1 } },
        ]);

        const totalExpense = expenses.reduce((sum, e) => sum + e.total, 0);

        const mealsServed = await MealAttendance.countDocuments({
          date: {
            $gte: month + '-01',
            $lt: month + '-32',
          },
          present: true,
        });

        const costPerPlate = mealsServed > 0 ? (totalExpense / mealsServed).toFixed(2) : 0;

        await notificationService.sendCostSummary(user, {
          month,
          totalExpense,
          mealsServed,
          costPerPlate,
          breakdown: expenses,
        });
      }

      logger.info('Monthly cost summaries sent');
    } catch (err) {
      logger.error('Monthly cost summary error', err);
    }
  }

  /**
   * Check and alert on discrepancies
   */
  async checkAttendanceDiscrepancies() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const users = await User.find({ isApproved: true });

      for (const user of users) {
        const marked = await MealAttendance.countDocuments({
          userId: user._id,
          date: today,
        });

        // If user hasn't marked any meals by 8 PM, send alert
        const hour = new Date().getHours();
        if (hour >= 20 && marked < 3) {
          await notificationService.sendAttendanceConfirmation(user, today);
        }
      }

      logger.info('Discrepancy checks completed');
    } catch (err) {
      logger.error('Discrepancy check error', err);
    }
  }

  /**
   * Detect spending anomalies and send alerts
   */
  async checkBudgetExceeded() {
    try {
      const month = new Date().toISOString().slice(0, 7);
      const users = await User.find({ isApproved: true });

      const baseBudget = 5000; // Default monthly budget per person

      for (const user of users) {
        const expenses = await Expense.aggregate([
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

        const totalSpent = expenses[0]?.total || 0;
        const mealsServed = await MealAttendance.countDocuments({
          date: {
            $gte: month + '-01',
            $lt: month + '-32',
          },
          present: true,
        });

        const userShare = mealsServed > 0 ? totalSpent / mealsServed : 0;
        const percentage = Math.round((userShare / baseBudget) * 100);

        if (percentage > 80) {
          await notificationService.sendBudgetExceeded(user, {
            month,
            budget: baseBudget,
            currentSpent: userShare,
            percentage,
          });
        }
      }

      logger.info('Budget checks completed');
    } catch (err) {
      logger.error('Budget check error', err);
    }
  }
}

module.exports = new NotificationScheduler();
