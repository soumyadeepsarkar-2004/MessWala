const express = require('express');
const router = express.Router();
const { setMenu, getTodayMenu, getMenu, deleteMenu } = require('../controllers/menuController');
const { protect, authorize, requireApproval } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);
router.use(requireApproval);

// Get today's menu
router.get('/today', getTodayMenu);

// Get menu for date range (default: current week)
router.get('/', getMenu);

// Set/update menu for a date (manager/admin only)
router.post('/', authorize('manager', 'admin'), setMenu);

// Delete/archive menu (manager/admin only)
router.delete('/:date', authorize('manager', 'admin'), deleteMenu);

module.exports = router;
