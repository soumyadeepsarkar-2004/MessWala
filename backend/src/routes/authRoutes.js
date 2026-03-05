const express = require('express');
const router = express.Router();
const { googleAuth, getProfile, getUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/google', googleAuth);
router.get('/profile', protect, getProfile);
router.get('/users', protect, authorize('admin'), getUsers);

module.exports = router;
