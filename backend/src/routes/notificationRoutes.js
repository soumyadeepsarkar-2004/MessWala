const express = require('express');
const router = express.Router();
const {
  getUnreadNotifications,
  markAsRead,
  getNotificationHistory,
  updateNotificationChannel,
  updateNotificationPreferences,
  getPreferences,
  sendTestNotification,
  checkConfiguration,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/unread', getUnreadNotifications);
router.get('/history', getNotificationHistory);
router.get('/preferences', getPreferences);
router.get('/config/check', checkConfiguration);
router.post('/:notificationId/read', markAsRead);
router.post('/preferences/channel', updateNotificationChannel);
router.post('/preferences/update', updateNotificationPreferences);
router.post('/test', sendTestNotification);

module.exports = router;
