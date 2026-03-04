const express = require('express');
const router = express.Router();
const {
    createTask,
    getTasks,
    updateTask,
    toggleTask,
    deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTask);
router.get('/', protect, getTasks);
router.put('/:id', protect, updateTask);
router.patch('/:id/toggle', protect, toggleTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
