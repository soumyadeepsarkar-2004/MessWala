const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  toggleTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, requireApproval } = require('../middleware/authMiddleware');

router.post('/', protect, requireApproval, createTask);
router.get('/', protect, requireApproval, getTasks);
router.put('/:id', protect, requireApproval, updateTask);
router.patch('/:id/toggle', protect, requireApproval, toggleTask);
router.delete('/:id', protect, requireApproval, deleteTask);

module.exports = router;
