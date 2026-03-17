const MealAttendance = require('../models/MealAttendance');
const { validateDateString, validateMonthString } = require('../utils/validation');
const { linearRegression } = require('../utils/predictor');

// @desc    Mark meal attendance
// @route   POST /api/meals/mark
exports.markAttendance = async (req, res) => {
    try {
        const { date, mealType, present } = req.body;
        const mealDate = date || new Date().toISOString().split('T')[0];

        const attendance = await MealAttendance.findOneAndUpdate(
            { userId: req.user.id, date: mealDate, mealType },
            { present: present !== undefined ? present : true },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, attendance });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get daily headcount
// @route   GET /api/meals/headcount?date=YYYY-MM-DD
exports.getDailyHeadcount = async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];

        // Validate date format
        const validatedDate = validateDateString(date);
        if (!validatedDate) {
            return res.status(400).json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' });
        }

        const headcount = await MealAttendance.aggregate([
            { $match: { date: validatedDate, present: true } },
            { $group: { _id: '$mealType', count: { $sum: 1 } } },
        ]);

        const result = { breakfast: 0, lunch: 0, dinner: 0 };
        headcount.forEach((h) => {
            result[h._id] = h.count;
        });

        res.json({ success: true, date: validatedDate, headcount: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get user attendance history
// @route   GET /api/meals/history?month=YYYY-MM
exports.getAttendanceHistory = async (req, res) => {
    try {
        const month = req.query.month || new Date().toISOString().slice(0, 7);

        // Validate month format
        const validatedMonth = validateMonthString(month);
        if (!validatedMonth) {
            return res.status(400).json({ success: false, error: 'Invalid month format. Use YYYY-MM' });
        }

        const history = await MealAttendance.find({
            userId: req.user.id,
            date: {
                $gte: validatedMonth + '-01',
                $lt: validatedMonth + '-32'
            }
        }).sort({ date: -1, mealType: 1 });

        res.json({ success: true, count: history.length, history });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get attendance trend (last 30 days)
// @route   GET /api/meals/trend
exports.getAttendanceTrend = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];

        const trend = await MealAttendance.aggregate([
            { $match: { date: { $gte: startDate }, present: true } },
            {
                $group: {
                    _id: { date: '$date', mealType: '$mealType' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.date': 1 } },
        ]);

        res.json({ success: true, trend });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get user's today attendance
// @route   GET /api/meals/today
exports.getTodayAttendance = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const attendance = await MealAttendance.find({
            userId: req.user.id,
            date: today,
        });

        const result = { breakfast: null, lunch: null, dinner: null };
        attendance.forEach((a) => {
            result[a.mealType] = a.present;
        });

        res.json({ success: true, date: today, attendance: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Forecast next day attendance
// @route   GET /api/meals/forecast
exports.getForecast = async (req, res) => {
    try {
        const days = 14;
        const results = {};

        for (const mealType of ['breakfast', 'lunch', 'dinner']) {
            const dailyCounts = [];
            for (let i = days; i >= 1; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                const count = await MealAttendance.countDocuments({
                    date: dateStr,
                    mealType,
                    present: true,
                });
                dailyCounts.push(count);
            }

            const predicted = linearRegression(dailyCounts);
            results[mealType] = {
                predicted: Math.max(0, Math.round(predicted)),
                recentAvg: Math.round(dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length),
                trend: dailyCounts,
            };
        }

        res.json({ success: true, forecast: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
