const Task = require('../models/Task');
const { validateEnum, validateSortOrder } = require('../utils/validation');

// @desc    Create a task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assignedTo } = req.body;

        const task = await Task.create({
            title,
            description,
            priority: priority || 'medium',
            dueDate: dueDate || null,
            assignedTo: assignedTo || null,
            createdBy: req.user.id,
        });

        const populated = await Task.findById(task._id)
            .populate('createdBy', 'name')
            .populate('assignedTo', 'name');

        res.status(201).json({ success: true, task: populated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get all tasks with optional filters and sorting
// @route   GET /api/tasks?status=pending|completed|all&sort=dueDate|priority|createdAt&order=asc|desc
exports.getTasks = async (req, res) => {
    try {
        const { status, sort, order } = req.query;

        // Validate and build filter with safe status enum
        const filter = {};
        const validStatus = validateEnum(status, ['pending', 'completed', 'all'], 'pending');
        if (validStatus === 'completed') filter.completed = true;
        else if (validStatus === 'pending') filter.completed = false;
        // status === 'all' means no filter on completed

        // Validate sort field
        const validSortFields = ['dueDate', 'priority', 'createdAt'];
        const sortField = validSortFields.includes(sort) ? sort : 'createdAt';

        // Validate sort order
        const validSortOrder = validateSortOrder(order);
        const sortOrder = validSortOrder === 'asc' || validSortOrder === '1' ? 1 : -1;

        // Priority custom sort (high=1, medium=2, low=3)
        if (sortField === 'priority') {
            // MongoDB doesn't natively sort enums in custom order, so we use aggregation
            const tasks = await Task.aggregate([
                { $match: filter },
                {
                    $addFields: {
                        priorityOrder: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$priority', 'high'] }, then: 1 },
                                    { case: { $eq: ['$priority', 'medium'] }, then: 2 },
                                    { case: { $eq: ['$priority', 'low'] }, then: 3 },
                                ],
                                default: 2,
                            },
                        },
                    },
                },
                { $sort: { priorityOrder: sortOrder } },
            ]);

            // Populate after aggregation
            const populatedTasks = await Task.populate(tasks, [
                { path: 'createdBy', select: 'name' },
                { path: 'assignedTo', select: 'name' },
            ]);

            return res.json({ success: true, count: populatedTasks.length, tasks: populatedTasks });
        }

        const sortObj = {};
        sortObj[sortField] = sortOrder;

        const tasks = await Task.find(filter)
            .populate('createdBy', 'name')
            .populate('assignedTo', 'name')
            .sort(sortObj);

        res.json({ success: true, count: tasks.length, tasks });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assignedTo } = req.body;

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (assignedTo !== undefined) task.assignedTo = assignedTo;

        await task.save();

        const populated = await Task.findById(task._id)
            .populate('createdBy', 'name')
            .populate('assignedTo', 'name');

        res.json({ success: true, task: populated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Toggle task complete/incomplete
// @route   PATCH /api/tasks/:id/toggle
exports.toggleTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date() : null;
        await task.save();

        const populated = await Task.findById(task._id)
            .populate('createdBy', 'name')
            .populate('assignedTo', 'name');

        res.json({ success: true, task: populated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        await task.deleteOne();
        res.json({ success: true, message: 'Task permanently deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
