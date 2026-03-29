const express = require('express');
const router = express.Router();
const {
  getConfig,
  setupConfig,
  updateConfig,
  addMealTime,
  addExpenseCategory,
  getConfigStatus,
} = require('../controllers/messConfigController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get configuration
router.get('/', getConfig);

// Get configuration status
router.get('/status', getConfigStatus);

// Setup configuration (first-time setup)
router.post('/setup', setupConfig);

// Update entire configuration
router.put('/', updateConfig);

// Add meal time
router.post('/meal-times', addMealTime);

// Add expense category
router.post('/expense-categories', addExpenseCategory);

module.exports = router;
