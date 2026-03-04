const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getDailyHeadcount,
    getAttendanceHistory,
    getAttendanceTrend,
    getTodayAttendance,
    getForecast,
} = require('../controllers/mealController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/mark', protect, markAttendance);
router.get('/today', protect, getTodayAttendance);
router.get('/headcount', protect, getDailyHeadcount);
router.get('/history', protect, getAttendanceHistory);
router.get('/trend', protect, authorize('manager', 'admin'), getAttendanceTrend);
router.get('/forecast', protect, getForecast);

module.exports = router;
