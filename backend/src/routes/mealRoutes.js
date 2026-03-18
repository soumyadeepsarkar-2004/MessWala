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
const { protect, authorize, requireApproval } = require('../middleware/authMiddleware');

router.post('/mark', protect, requireApproval, markAttendance);
router.get('/today', protect, requireApproval, getTodayAttendance);
router.get('/headcount', protect, requireApproval, getDailyHeadcount);
router.get('/history', protect, requireApproval, getAttendanceHistory);
router.get('/trend', protect, requireApproval, authorize('manager', 'admin'), getAttendanceTrend);
router.get('/forecast', protect, requireApproval, getForecast);

module.exports = router;
