const express = require('express');
const router = express.Router();
const { setMenu, getTodayMenu, getMenu } = require('../controllers/menuController');
const { protect, authorize, requireApproval } = require('../middleware/authMiddleware');

router.post('/', protect, requireApproval, authorize('manager', 'admin'), setMenu);
router.get('/today', protect, requireApproval, getTodayMenu);
router.get('/', protect, requireApproval, getMenu);

module.exports = router;
