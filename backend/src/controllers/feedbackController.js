const Feedback = require('../models/Feedback');
const Menu = require('../models/Menu');
const { validateDateString, validatePositiveInteger } = require('../utils/validation');

// @desc    Submit feedback for a meal
// @route   POST /api/feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { date, mealType, rating, comment, anonymous } = req.body;
        const feedbackDate = date || new Date().toISOString().split('T')[0];

        const feedback = await Feedback.findOneAndUpdate(
            { userId: req.user.id, date: feedbackDate, mealType },
            { rating, comment, anonymous: anonymous || false },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, feedback });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get feedback for a date
// @route   GET /api/feedback?date=YYYY-MM-DD
exports.getFeedback = async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];

        // Validate date format
        const validatedDate = validateDateString(date);
        if (!validatedDate) {
            return res.status(400).json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' });
        }

        const feedback = await Feedback.find({ date: validatedDate })
            .populate({
                path: 'userId',
                select: 'name roomNumber',
                // Hide user info for anonymous feedback
            })
            .sort({ mealType: 1 });

        // Mask anonymous feedback
        const sanitized = feedback.map((f) => ({
            ...f.toObject(),
            userId: f.anonymous ? { name: 'Anonymous', roomNumber: '' } : f.userId,
        }));

        res.json({ success: true, feedback: sanitized });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get weekly average ratings
// @route   GET /api/feedback/weekly?weeks=4
exports.getWeeklyRatings = async (req, res) => {
    try {
        const weeks = validatePositiveInteger(req.query.weeks, 4);
        if (weeks > 52) {
            return res.status(400).json({ success: false, error: 'Maximum 52 weeks allowed' });
        }

        const daysBack = weeks * 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        const start = startDate.toISOString().split('T')[0];

        const ratings = await Feedback.aggregate([
            { $match: { date: { $gte: start } } },
            {
                $group: {
                    _id: {
                        // Group by week number (approximate)
                        week: {
                            $subtract: [
                                { $toInt: { $divide: [{ $subtract: [{ $dateFromString: { dateString: '$date' } }, new Date(start)] }, 604800000] } },
                                0,
                            ],
                        },
                    },
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.week': 1 } },
        ]);

        res.json({ success: true, ratings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get satisfaction trend (daily avg ratings for last 30 days)
// @route   GET /api/feedback/trend
exports.getSatisfactionTrend = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];

        const trend = await Feedback.aggregate([
            { $match: { date: { $gte: startDate } } },
            {
                $group: {
                    _id: '$date',
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({ success: true, trend });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get most complained dishes (lowest rated)
// @route   GET /api/feedback/complaints
exports.getMostComplained = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];

        const complaints = await Feedback.aggregate([
            { $match: { date: { $gte: startDate }, rating: { $lte: 2 } } },
            {
                $group: {
                    _id: { date: '$date', mealType: '$mealType' },
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 },
                    comments: { $push: '$comment' },
                },
            },
            { $sort: { avgRating: 1 } },
            { $limit: 10 },
        ]);

        // Resolve actual dish names from Menu
        const enriched = await Promise.all(
            complaints.map(async (c) => {
                const menu = await Menu.findOne({ date: c._id.date });
                const dishName = menu ? menu[c._id.mealType] : null;
                return { ...c, dishName: dishName || `${c._id.mealType} on ${c._id.date}` };
            })
        );

        res.json({ success: true, complaints: enriched });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
