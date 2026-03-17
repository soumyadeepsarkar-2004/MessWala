import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import { HiOutlineArrowRight, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

const PRESET_CATEGORIES = [
    { value: 'vegetables', label: '🥬 Vegetables', color: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { value: 'rice', label: '🍚 Rice & Flour', color: 'bg-amber-100 dark:bg-amber-900/30' },
    { value: 'gas', label: '🔥 Gas', color: 'bg-orange-100 dark:bg-orange-900/30' },
    { value: 'salary', label: '👨‍🍳 Salary', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { value: 'dairy', label: '🥛 Dairy', color: 'bg-sky-100 dark:bg-sky-900/30' },
    { value: 'spices', label: '🌶️ Spices', color: 'bg-red-100 dark:bg-red-900/30' },
    { value: 'misc', label: '📦 Misc', color: 'bg-gray-100 dark:bg-gray-800/50' },
];

const PRESET_MEALS = [
    { type: 'breakfast', emoji: '🌅', label: 'Breakfast', startTime: '07:30', endTime: '09:00', color: 'from-amber-400 to-orange-500' },
    { type: 'lunch', emoji: '☀️', label: 'Lunch', startTime: '12:30', endTime: '14:00', color: 'from-emerald-400 to-teal-500' },
    { type: 'dinner', emoji: '🌙', label: 'Dinner', startTime: '19:30', endTime: '21:00', color: 'from-indigo-400 to-purple-500' },
];

export default function AdminSetupPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const [messInfo, setMessInfo] = useState({
        messName: '',
        messDescription: '',
        messEmail: '',
        messPhone: '',
    });

    const [selectedCategories, setSelectedCategories] = useState(
        PRESET_CATEGORIES.map(cat => ({
            ...cat,
            emoji: cat.label.split(' ')[0],
        }))
    );

    const [selectedMeals, setSelectedMeals] = useState(
        PRESET_MEALS.map(meal => ({
            ...meal,
            emoji: meal.emoji,
        }))
    );

    const [customCategory, setCustomCategory] = useState({ value: '', label: '', emoji: '' });

    const handleAddCategory = () => {
        if (!customCategory.value || !customCategory.label) {
            toast.error('Please fill in category details');
            return;
        }
        setSelectedCategories([
            ...selectedCategories,
            { ...customCategory, color: 'bg-gray-100' },
        ]);
        setCustomCategory({ value: '', label: '', emoji: '' });
    };

    const handleRemoveCategory = (idx) => {
        setSelectedCategories(selectedCategories.filter((_, i) => i !== idx));
    };

    const handleToggleMeal = (idx) => {
        setSelectedMeals(selectedMeals.map((meal, i) =>
            i === idx ? { ...meal, enabled: !meal.enabled } : meal
        ));
    };

    const handleSubmit = async () => {
        if (!messInfo.messName.trim()) {
            toast.error('Mess name is required');
            return;
        }

        if (!selectedCategories.length) {
            toast.error('At least one expense category is required');
            return;
        }

        if (!selectedMeals.length) {
            toast.error('At least one meal time is required');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/admin/setup', {
                ...messInfo,
                expenseCategories: selectedCategories,
                mealTimes: selectedMeals.filter(m => m.enabled !== false),
                menuDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            });
            toast.success('Mess configured successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Setup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-950 dark:to-dark-900 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
                        Welcome, {user?.name}! 🎉
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">Let's set up your mess management system</p>
                </div>

                {/* Progress */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3].map(s => (
                        <div
                            key={s}
                            className={`h-2 flex-1 rounded-full transition-all ${
                                s <= step
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-400'
                                    : 'bg-gray-200 dark:bg-dark-700'
                            }`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="glass-card-solid p-8 mb-6">
                    {/* Step 1: Mess Info */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mess Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Mess Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. North Block Mess"
                                        value={messInfo.messName}
                                        onChange={(e) => setMessInfo({ ...messInfo, messName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        placeholder="Brief description of your mess"
                                        value={messInfo.messDescription}
                                        onChange={(e) => setMessInfo({ ...messInfo, messDescription: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none h-20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="mess@hostel.edu"
                                        value={messInfo.messEmail}
                                        onChange={(e) => setMessInfo({ ...messInfo, messEmail: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={messInfo.messPhone}
                                        onChange={(e) => setMessInfo({ ...messInfo, messPhone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Categories */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Expense Categories *</h2>
                            <div className="space-y-4">
                                {/* Selected */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {selectedCategories.map((cat, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg ${cat.color} flex justify-between items-center`}>
                                            <span className="text-sm font-medium">{cat.label}</span>
                                            <button
                                                onClick={() => handleRemoveCategory(idx)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Custom */}
                                <div className="p-4 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg">
                                    <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Add Custom Category</h3>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="emoji"
                                            maxLength="2"
                                            value={customCategory.emoji}
                                            onChange={(e) => setCustomCategory({ ...customCategory, emoji: e.target.value })}
                                            className="px-2 py-1 text-center rounded border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="key"
                                            value={customCategory.value}
                                            onChange={(e) => setCustomCategory({ ...customCategory, value: e.target.value.toLowerCase() })}
                                            className="px-2 py-1 rounded border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="label"
                                            value={customCategory.label}
                                            onChange={(e) => setCustomCategory({ ...customCategory, label: e.target.value })}
                                            className="px-2 py-1 rounded border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddCategory}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                                    >
                                        <HiOutlinePlus className="w-4 h-4" /> Add Category
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Meal Times */}
                    {step === 3 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Meal Times *</h2>
                            <div className="space-y-3">
                                {PRESET_MEALS.map((meal, idx) => (
                                    <label key={idx} className="flex items-center p-4 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            onChange={() => handleToggleMeal(idx)}
                                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {meal.emoji} {meal.label}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {meal.startTime} - {meal.endTime}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex gap-4">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors font-medium"
                        >
                            Back
                        </button>
                    )}
                    {step < 3 && (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-400 text-white rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all font-medium"
                        >
                            Next <HiOutlineArrowRight className="w-4 h-4" />
                        </button>
                    )}
                    {step === 3 && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-400 text-white rounded-lg hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                        >
                            {loading ? 'Setting up...' : 'Complete Setup'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
