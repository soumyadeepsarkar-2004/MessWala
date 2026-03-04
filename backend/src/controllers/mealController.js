const MealAttendance = require('../models/MealAttendance');

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

        const headcount = await MealAttendance.aggregate([
            { $match: { date, present: true } },
            { $group: { _id: '$mealType', count: { $sum: 1 } } },
        ]);

        const result = { breakfast: 0, lunch: 0, dinner: 0 };
        headcount.forEach((h) => {
            result[h._id] = h.count;
        });

        res.json({ success: true, date, headcount: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get user attendance history
// @route   GET /api/meals/history?month=YYYY-MM
exports.getAttendanceHistory = async (req, res) => {
    try {
        const month = req.query.month || new Date().toISOString().slice(0, 7);
        const dateRegex = new RegExp(`^${month}`);

        const history = await MealAttendance.find({
            userId: req.user.id,
            date: { $regex: dateRegex },
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
