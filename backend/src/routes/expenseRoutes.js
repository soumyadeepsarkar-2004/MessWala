const express = require('express');
const router = express.Router();
const {
    addExpense,
    getExpenses,
    getMonthlySummary,
    getCostPerPlate,
    exportCSV,
    deleteExpense,
} = require('../controllers/expenseController');
const { protect, authorize, requireApproval } = require('../middleware/authMiddleware');

router.post('/', protect, requireApproval, authorize('treasurer', 'admin'), addExpense);
router.get('/', protect, requireApproval, getExpenses);
router.get('/summary', protect, requireApproval, getMonthlySummary);
router.get('/cost-per-plate', protect, requireApproval, getCostPerPlate);
router.get('/export', protect, requireApproval, authorize('treasurer', 'admin'), exportCSV);
router.delete('/:id', protect, requireApproval, authorize('treasurer', 'admin'), deleteExpense);

module.exports = router;
