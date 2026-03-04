import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineCheck, HiOutlineFilter, HiOutlineSortDescending, HiOutlineExclamation, HiOutlineCalendar, HiOutlineX, HiOutlineFlag } from 'react-icons/hi';

const PRIORITY_CONFIG = {
    high: { label: 'High', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800', dot: 'bg-red-500', ring: 'ring-red-500/20', stripe: 'from-red-500 to-rose-500' },
    medium: { label: 'Medium', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', ring: 'ring-amber-500/20', stripe: 'from-amber-500 to-orange-500' },
    low: { label: 'Low', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500', ring: 'ring-emerald-500/20', stripe: 'from-emerald-500 to-teal-500' },
};

// ── Confirmation Dialog ─────────────────────────────────────────────
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in border border-gray-200 dark:border-dark-600">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <HiOutlineExclamation className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onCancel} className="btn-secondary text-sm py-2 px-4" id="confirm-cancel-btn">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="btn-danger text-sm py-2 px-4" id="confirm-delete-btn">
                        Delete Permanently
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Animated Checkmark SVG ──────────────────────────────────────────
function AnimatedCheckmark({ visible }) {
    return (
        <svg
            className={`w-6 h-6 transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                cx="12" cy="12" r="10"
                className={`transition-all duration-500 ${visible ? 'fill-emerald-500 stroke-emerald-500' : 'fill-transparent stroke-gray-300 dark:stroke-dark-600'}`}
                strokeWidth="1.5"
            />
            <path
                d="M8 12.5l2.5 2.5 5-5"
                className={`transition-all duration-500 delay-200 ${visible ? 'stroke-white' : 'stroke-transparent'}`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                    strokeDasharray: 20,
                    strokeDashoffset: visible ? 0 : 20,
                    transition: 'stroke-dashoffset 0.5s ease-out 0.2s, stroke 0.3s',
                }}
            />
        </svg>
    );
}

// ── Task Form Modal ─────────────────────────────────────────────────
function TaskFormModal({ isOpen, onClose, onSubmit, initialData }) {
    const [form, setForm] = useState({
        title: '', description: '', priority: 'medium', dueDate: '',
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                title: initialData.title || '',
                description: initialData.description || '',
                priority: initialData.priority || 'medium',
                dueDate: initialData.dueDate || '',
            });
        } else {
            setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-scale-in border border-gray-200 dark:border-dark-600">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {initialData ? 'Edit Task' : 'New Task'}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                        <HiOutlineX className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
                        <input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g., Buy vegetables for next week"
                            className="input-field"
                            required
                            maxLength={200}
                            id="task-title-input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Add more details..."
                            className="input-field h-20 resize-none"
                            maxLength={1000}
                            id="task-desc-input"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                <HiOutlineFlag className="inline w-4 h-4 mr-1 -mt-0.5" />Priority
                            </label>
                            <div className="flex gap-2">
                                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setForm({ ...form, priority: key })}
                                        className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200 border ${form.priority === key
                                                ? `${cfg.color} ring-2 ${cfg.ring} scale-105`
                                                : 'bg-gray-50 dark:bg-dark-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-600'
                                            }`}
                                        id={`task-priority-${key}`}
                                    >
                                        {cfg.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                <HiOutlineCalendar className="inline w-4 h-4 mr-1 -mt-0.5" />Due Date
                            </label>
                            <input
                                type="date"
                                value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                className="input-field"
                                id="task-due-date-input"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary text-sm py-2 px-5">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary text-sm py-2 px-5" id="task-form-submit">
                            {initialData ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main TasksPage ──────────────────────────────────────────────────
export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');    // pending | completed | all
    const [sortBy, setSortBy] = useState('createdAt');  // createdAt | dueDate | priority
    const [sortOrder, setSortOrder] = useState('desc');  // asc | desc
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [recentlyCompleted, setRecentlyCompleted] = useState(new Set());

    const fetchTasks = useCallback(async () => {
        try {
            const res = await api.get('/tasks', {
                params: { status: filter, sort: sortBy, order: sortOrder },
            });
            setTasks(res.data.tasks);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filter, sortBy, sortOrder]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleCreate = async (form) => {
        try {
            await api.post('/tasks', form);
            toast.success('Task created! 📋');
            setShowForm(false);
            fetchTasks();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create task');
        }
    };

    const handleUpdate = async (form) => {
        try {
            await api.put(`/tasks/${editingTask._id}`, form);
            toast.success('Task updated!');
            setEditingTask(null);
            fetchTasks();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update task');
        }
    };

    const handleToggle = async (task) => {
        try {
            const res = await api.patch(`/tasks/${task._id}/toggle`);
            const updated = res.data.task;

            // Trigger completion animation
            if (updated.completed) {
                setRecentlyCompleted((prev) => new Set(prev).add(task._id));
                // Remove from animation set and move to completed after delay
                setTimeout(() => {
                    setRecentlyCompleted((prev) => {
                        const next = new Set(prev);
                        next.delete(task._id);
                        return next;
                    });
                    fetchTasks();
                }, 1200);
            } else {
                fetchTasks();
            }

            // Update inline immediately for instant feedback
            setTasks((prev) =>
                prev.map((t) => (t._id === task._id ? { ...t, completed: updated.completed, completedAt: updated.completedAt } : t))
            );

            toast.success(updated.completed ? 'Task completed! ✅' : 'Task reopened');
        } catch (err) {
            toast.error('Failed to update task');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/tasks/${deleteTarget._id}`);
            toast.success('Task deleted permanently');
            setDeleteTarget(null);
            fetchTasks();
        } catch (err) {
            toast.error('Failed to delete task');
        }
    };

    const getDueDateStatus = (dueDate) => {
        if (!dueDate) return null;
        const today = new Date().toISOString().split('T')[0];
        if (dueDate < today) return 'overdue';
        if (dueDate === today) return 'today';
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (dueDate === tomorrow.toISOString().split('T')[0]) return 'tomorrow';
        return 'upcoming';
    };

    const dueDateColors = {
        overdue: 'text-red-500 dark:text-red-400',
        today: 'text-amber-500 dark:text-amber-400',
        tomorrow: 'text-blue-500 dark:text-blue-400',
        upcoming: 'text-gray-400 dark:text-gray-500',
    };

    const taskCounts = {
        pending: tasks.filter((t) => !t.completed).length,
        completed: tasks.filter((t) => t.completed).length,
        all: tasks.length,
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="glass-card-solid p-5 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-dark-700" />
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-2/3 mb-2" />
                                    <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-1/3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 animate-fade-in">
                <div>
                    <h1 className="section-title mb-0">Mess Tasks</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage committee tasks and responsibilities</p>
                </div>
                <button
                    onClick={() => { setEditingTask(null); setShowForm(true); }}
                    className="btn-primary flex items-center gap-2 mt-4 sm:mt-0"
                    id="new-task-btn"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    New Task
                </button>
            </div>

            {/* Filters & Sort bar */}
            <div className="glass-card-solid p-4 mb-6 animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Status filter tabs */}
                    <div className="flex items-center gap-1">
                        <HiOutlineFilter className="w-4 h-4 text-gray-400 mr-2" />
                        {[
                            { key: 'pending', label: 'Pending' },
                            { key: 'completed', label: 'Completed' },
                            { key: 'all', label: 'All' },
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${filter === f.key
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                                    }`}
                                id={`filter-${f.key}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort options */}
                    <div className="flex items-center gap-2">
                        <HiOutlineSortDescending className="w-4 h-4 text-gray-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                            id="sort-select"
                        >
                            <option value="createdAt">Date Created</option>
                            <option value="dueDate">Due Date</option>
                            <option value="priority">Priority</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors text-gray-500 dark:text-gray-400"
                            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                            id="sort-order-btn"
                        >
                            <HiOutlineSortDescending className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Task list */}
            <div className="space-y-3">
                {tasks.length === 0 ? (
                    <div className="glass-card-solid p-12 text-center animate-fade-in">
                        <span className="text-4xl block mb-3">📋</span>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No tasks found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            {filter === 'completed' ? 'No completed tasks yet' : 'Click "New Task" to create one'}
                        </p>
                    </div>
                ) : (
                    tasks.map((task, i) => {
                        const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                        const dueDateStatus = getDueDateStatus(task.dueDate);
                        const isAnimating = recentlyCompleted.has(task._id);

                        return (
                            <div
                                key={task._id}
                                className={`glass-card-solid overflow-hidden transition-all duration-700 animate-slide-up ${isAnimating ? 'bg-emerald-50/80 dark:bg-emerald-900/10 scale-[0.98] opacity-80' : ''
                                    } ${task.completed && !isAnimating ? 'opacity-70' : ''}`}
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                {/* Priority stripe */}
                                <div className={`h-1 bg-gradient-to-r ${priority.stripe}`} />

                                <div className="p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Checkmark toggle */}
                                        <button
                                            onClick={() => handleToggle(task)}
                                            className="flex-shrink-0 mt-0.5 group"
                                            title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                                            id={`toggle-task-${task._id}`}
                                        >
                                            {task.completed || isAnimating ? (
                                                <AnimatedCheckmark visible={true} />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-dark-500 group-hover:border-emerald-400 dark:group-hover:border-emerald-500 transition-colors group-hover:scale-110 group-active:scale-90 duration-200" />
                                            )}
                                        </button>

                                        {/* Task content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className={`font-semibold text-gray-900 dark:text-white transition-all duration-500 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
                                                    }`}>
                                                    {task.title}
                                                </h3>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${priority.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                                                    {priority.label}
                                                </span>
                                            </div>

                                            {task.description && (
                                                <p className={`text-sm mt-1 transition-all duration-500 ${task.completed ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    {task.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 mt-2 text-xs">
                                                {task.dueDate && (
                                                    <span className={`flex items-center gap-1 font-medium ${dueDateColors[dueDateStatus] || 'text-gray-400'}`}>
                                                        <HiOutlineCalendar className="w-3.5 h-3.5" />
                                                        {dueDateStatus === 'overdue' && '⚠️ '}
                                                        {dueDateStatus === 'today' ? 'Due today' :
                                                            dueDateStatus === 'tomorrow' ? 'Due tomorrow' :
                                                                dueDateStatus === 'overdue' ? `Overdue: ${new Date(task.dueDate + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` :
                                                                    `Due ${new Date(task.dueDate + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                                                        }
                                                    </span>
                                                )}
                                                {task.completedAt && (
                                                    <span className="text-emerald-500 dark:text-emerald-400">
                                                        ✓ Completed {new Date(task.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                )}
                                                {task.createdBy?.name && (
                                                    <span className="text-gray-400 dark:text-gray-500">
                                                        by {task.createdBy.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => { setEditingTask(task); setShowForm(true); }}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                                title="Edit task"
                                                id={`edit-task-${task._id}`}
                                            >
                                                <HiOutlinePencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(task)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                title="Delete task"
                                                id={`delete-task-${task._id}`}
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modals */}
            <TaskFormModal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditingTask(null); }}
                onSubmit={editingTask ? handleUpdate : handleCreate}
                initialData={editingTask}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Delete Task?"
                message={`"${deleteTarget?.title}" will be permanently deleted. This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
