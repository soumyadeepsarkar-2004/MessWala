const express = require('express');
const router = express.Router();
const { setMenu, getTodayMenu, getMenu } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('manager', 'admin'), setMenu);
router.get('/today', protect, getTodayMenu);
router.get('/', protect, getMenu);

module.exports = router;
