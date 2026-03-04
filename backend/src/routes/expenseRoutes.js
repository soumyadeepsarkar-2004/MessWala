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
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('treasurer', 'admin'), addExpense);
router.get('/', protect, getExpenses);
router.get('/summary', protect, getMonthlySummary);
router.get('/cost-per-plate', protect, getCostPerPlate);
router.get('/export', protect, authorize('treasurer', 'admin'), exportCSV);
router.delete('/:id', protect, authorize('treasurer', 'admin'), deleteExpense);

module.exports = router;
