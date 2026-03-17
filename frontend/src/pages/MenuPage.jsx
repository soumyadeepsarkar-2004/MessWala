import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlinePencil } from 'react-icons/hi';

export default function MenuPage() {
    const { isRole } = useAuth();
    const { config } = useConfig();
    const [todayMenu, setTodayMenu] = useState(null);
    const [weeklyMenu, setWeeklyMenu] = useState([]);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ date: '', breakfast: '', lunch: '', dinner: '' });
    const [loading, setLoading] = useState(true);
    const canManage = isRole('manager', 'admin');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [todayRes, weekRes] = await Promise.all([
                api.get('/menu/today'),
                api.get('/menu'),
            ]);
            setTodayMenu(todayRes.data.menu);
            setWeeklyMenu(weekRes.data.menus);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/menu', form);
            toast.success('Menu updated! 📋');
            setEditing(false);
            fetchData();
        } catch (err) {
            toast.error('Failed to update menu');
        }
    };

    const startEdit = (menu) => {
        setForm({
            date: menu?.date || new Date().toISOString().split('T')[0],
            breakfast: menu?.breakfast || '',
            lunch: menu?.lunch || '',
            dinner: menu?.dinner || '',
        });
        setEditing(true);
    };

    const getMealEmoji = (mealType) => {
        return config?.mealTimes?.find(m => m.type === mealType)?.emoji || '🍽️';
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="glass-card-solid p-8 animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-dark-700 rounded w-1/3" />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <h1 className="section-title mb-0">Mess Menu</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">What's cooking today?</p>
                </div>
                {canManage && !editing && (
                    <button onClick={() => startEdit(todayMenu)} className="btn-primary flex items-center gap-2" id="edit-menu-btn">
                        <HiOutlinePencil className="w-4 h-4" />
                        Edit Menu
                    </button>
                )}
            </div>

            {/* Edit Form */}
            {editing && (
                <div className="glass-card-solid p-6 mb-8 animate-scale-in">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Set Menu</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="input-field"
                                id="menu-date"
                            />
                        </div>
                        {config?.mealTimes?.map((meal) => (
                            <div key={meal.type}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {meal.emoji} {meal.label}
                                </label>
                                <input
                                    value={form[meal.type] || ''}
                                    onChange={(e) => setForm({ ...form, [meal.type]: e.target.value })}
                                    placeholder={`Enter ${meal.label.toLowerCase()} menu...`}
                                    className="input-field"
                                    id={`menu-${meal.type}`}
                                />
                            </div>
                        ))}
                        <div className="flex gap-3">
                            <button type="submit" className="btn-primary" id="menu-save">Save Menu</button>
                            <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Today's Menu Hero */}
            <div className="glass-card-solid overflow-hidden mb-8 animate-slide-up">
                <div className="h-2 bg-gradient-to-r from-primary-400 via-orange-400 to-red-400" />
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <HiOutlineCalendar className="w-5 h-5 text-primary-500" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today's Menu</h3>
                        <span className="text-sm text-gray-400 ml-auto">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['breakfast', 'lunch', 'dinner'].map((meal) => (
                            <div key={meal} className="group relative p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-dark-700/50 dark:to-dark-800/50 border border-gray-100 dark:border-dark-600 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                                <span className="text-3xl block mb-2">{mealEmoji[meal]}</span>
                                <h4 className="font-bold text-gray-900 dark:text-white capitalize mb-1">{meal}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{todayMenu?.[meal] || 'Not set yet'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Weekly Menu */}
            <div className="glass-card-solid p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">This Week's Menu</h3>
                {weeklyMenu.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-dark-700">
                                    <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Day</th>
                                    <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">🌅 Breakfast</th>
                                    <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">☀️ Lunch</th>
                                    <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">🌙 Dinner</th>
                                    {canManage && <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {weeklyMenu.map((m) => {
                                    const dateObj = new Date(m.date + 'T00:00');
                                    const isToday = m.date === new Date().toISOString().split('T')[0];
                                    return (
                                        <tr
                                            key={m.date}
                                            className={`border-b border-gray-50 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors ${isToday ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                                                }`}
                                        >
                                            <td className="py-3 px-4">
                                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                                    {dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </span>
                                                {isToday && <span className="ml-2 badge bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300">Today</span>}
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{m.breakfast || '—'}</td>
                                            <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{m.lunch || '—'}</td>
                                            <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{m.dinner || '—'}</td>
                                            {canManage && (
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => startEdit(m)}
                                                        className="text-primary-500 hover:text-primary-600 text-xs font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">No menu set for this week</p>
                )}
            </div>
        </div>
    );
}
