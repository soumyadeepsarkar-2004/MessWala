const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getDailyHeadcount,
    getAttendanceHistory,
    getAttendanceTrend,
    getTodayAttendance,
} = require('../controllers/mealController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/mark', protect, markAttendance);
router.get('/today', protect, getTodayAttendance);
router.get('/headcount', protect, authorize('manager', 'admin'), getDailyHeadcount);
router.get('/history', protect, getAttendanceHistory);
router.get('/trend', protect, authorize('manager', 'admin'), getAttendanceTrend);

module.exports = router;
