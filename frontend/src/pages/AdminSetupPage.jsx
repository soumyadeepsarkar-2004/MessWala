import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCheck } from 'react-icons/hi';

/**
 * Dynamic Setup Page - No Static Data
 * Manager sets up their own mess configuration dynamically
 * All data is fetched from and saved to the server
 */
export default function AdminSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [existingConfig, setExistingConfig] = useState(null);

  const [messInfo, setMessInfo] = useState({
    messName: '',
    messDescription: '',
    messEmail: '',
    messPhone: '',
  });

  const [mealTimes, setMealTimes] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);

  const [newMeal, setNewMeal] = useState({
    type: '',
    label: '',
    emoji: '🍽️',
    startTime: '07:30',
    endTime: '09:00',
    color: 'from-amber-400 to-orange-500',
  });

  const [newCategory, setNewCategory] = useState({
    value: '',
    label: '',
    emoji: '📦',
    color: 'bg-gray-100',
  });

  // Check if already configured
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await api.get('/config/status');
        if (res.data.isConfigured) {
          setIsConfigured(true);
          setExistingConfig(res.data.config);
          // Load existing config
          if (res.data.config) {
            setMessInfo({
              messName: res.data.config.messName || '',
              messDescription: res.data.config.messDescription || '',
              messEmail: res.data.config.messEmail || '',
              messPhone: res.data.config.messPhone || '',
            });
            setMealTimes(res.data.config.mealTimes || []);
            setExpenseCategories(res.data.config.expenseCategories || []);
          }
        }
      } catch (err) {
        // User might not be a manager - that's okay
        console.log('Not a manager or no config found');
      }
    };

    checkConfig();
  }, []);

  const addMealTime = () => {
    if (!newMeal.type.trim()) {
      toast.error('Meal type is required');
      return;
    }
    if (!newMeal.label.trim()) {
      toast.error('Meal label is required');
      return;
    }
    if (mealTimes.some((m) => m.type === newMeal.type.trim())) {
      toast.error('Meal type already exists');
      return;
    }

    setMealTimes([...mealTimes, { ...newMeal, type: newMeal.type.trim() }]);
    setNewMeal({
      type: '',
      label: '',
      emoji: '🍽️',
      startTime: '07:30',
      endTime: '09:00',
      color: 'from-amber-400 to-orange-500',
    });
  };

  const removeMealTime = (idx) => {
    setMealTimes(mealTimes.filter((_, i) => i !== idx));
  };

  const addExpenseCategory = () => {
    if (!newCategory.value.trim()) {
      toast.error('Category value is required');
      return;
    }
    if (!newCategory.label.trim()) {
      toast.error('Category label is required');
      return;
    }
    if (expenseCategories.some((c) => c.value === newCategory.value.trim())) {
      toast.error('Category already exists');
      return;
    }

    setExpenseCategories([
      ...expenseCategories,
      { ...newCategory, value: newCategory.value.trim() },
    ]);
    setNewCategory({
      value: '',
      label: '',
      emoji: '📦',
      color: 'bg-gray-100',
    });
  };

  const removeExpenseCategory = (idx) => {
    setExpenseCategories(expenseCategories.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!messInfo.messName.trim()) {
      toast.error('Mess name is required');
      return;
    }

    if (mealTimes.length === 0) {
      toast.error('At least one meal time is required');
      return;
    }

    if (expenseCategories.length === 0) {
      toast.error('At least one expense category is required');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isConfigured ? '/config' : '/config/setup';
      const method = isConfigured ? 'put' : 'post';

      await api[method](endpoint, {
        messName: messInfo.messName.trim(),
        messDescription: messInfo.messDescription.trim(),
        messEmail: messInfo.messEmail.trim(),
        messPhone: messInfo.messPhone.trim(),
        mealTimes,
        expenseCategories,
      });

      toast.success(isConfigured ? 'Configuration updated!' : 'Setup completed successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-950 dark:to-dark-900 py-8 px-4'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-10'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2'>
            {isConfigured ? 'Update Configuration' : `Welcome, ${user?.name}! 🎉`}
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            {isConfigured
              ? 'Manage your mess settings dynamically'
              : 'Set up your mess management system'}
          </p>
        </div>

        {/* Progress */}
        <div className='flex justify-center gap-2 mb-8'>
          {[1, 2, 3].map((s) => (
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
        <div className='glass-card-solid p-8 mb-6'>
          {/* Step 1: Mess Info */}
          {step === 1 && (
            <div className='animate-fade-in'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
                Mess Information
              </h2>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2'>
                    Mess Name * (Required)
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. North Block Mess'
                    value={messInfo.messName}
                    onChange={(e) => setMessInfo({ ...messInfo, messName: e.target.value })}
                    className='w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2'>
                    Description
                  </label>
                  <textarea
                    placeholder='Brief description of your mess'
                    value={messInfo.messDescription}
                    onChange={(e) => setMessInfo({ ...messInfo, messDescription: e.target.value })}
                    className='w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none h-20'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2'>
                    Email
                  </label>
                  <input
                    type='email'
                    placeholder='mess@hostel.edu'
                    value={messInfo.messEmail}
                    onChange={(e) => setMessInfo({ ...messInfo, messEmail: e.target.value })}
                    className='w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2'>
                    Phone
                  </label>
                  <input
                    type='tel'
                    placeholder='+91 98765 43210'
                    value={messInfo.messPhone}
                    onChange={(e) => setMessInfo({ ...messInfo, messPhone: e.target.value })}
                    className='w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none'
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Meal Times */}
          {step === 2 && (
            <div className='animate-fade-in'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
                Meal Times * (At least one required)
              </h2>

              {/* Existing Meals */}
              <div className='space-y-2 mb-6'>
                {mealTimes.length === 0 ? (
                  <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                    No meal times added yet. Add one below.
                  </div>
                ) : (
                  mealTimes.map((meal, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg bg-gradient-to-r ${meal.color} flex justify-between items-center text-white`}
                    >
                      <div>
                        <div className='font-bold'>
                          {meal.emoji} {meal.label}
                        </div>
                        <div className='text-sm opacity-90'>
                          {meal.startTime} - {meal.endTime}
                        </div>
                      </div>
                      <button
                        onClick={() => removeMealTime(idx)}
                        className='text-white hover:scale-110 transition-transform'
                      >
                        <HiOutlineTrash className='w-5 h-5' />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Meal */}
              <div className='p-4 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg'>
                <h3 className='text-sm font-bold mb-4 text-gray-900 dark:text-white'>
                  Add Meal Time
                </h3>
                <div className='grid grid-cols-2 gap-3 mb-3'>
                  <input
                    type='text'
                    placeholder='Type (e.g. breakfast)'
                    value={newMeal.type}
                    onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value })}
                    className='px-3 py-2 rounded border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm'
                  />
                  <input
                    type='text'
                    placeholder='Label (e.g. Breakfast)'
                    value={newMeal.label}
                    onChange={(e) => setNewMeal({ ...newMeal, label: e.target.value })}
                    className='px-3 py-2 rounded border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm'
                  />
                  <input
                    type='text'
                    placeholder='Emoji'
                    maxLength='2'
                    value={newMeal.emoji}
                    onChange={(e) => setNewMeal({ ...newMeal, emoji: e.target.value })}
                    className='px-3 py-2 rounded border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm'
                  />
                  <input
                    type='time'
                    value={newMeal.startTime}
                    onChange={(e) => setNewMeal({ ...newMeal, startTime: e.target.value })}
                    className='px-3 py-2 rounded border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm'
                  />
                  <input
                    type='time'
                    value={newMeal.endTime}
                    onChange={(e) => setNewMeal({ ...newMeal, endTime: e.target.value })}
                    className='px-3 py-2 rounded border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm'
                  />
                </div>
                <button
                  onClick={addMealTime}
                  className='w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 rounded transition-colors flex items-center justify-center gap-2'
                >
                  <HiOutlinePlus className='w-5 h-5' />
                  Add Meal Time
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Expense Categories */}
          {step === 3 && (
            <div className='animate-fade-in'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
                Expense Categories * (At least one required)
              </h2>

              {/* Existing Categories */}
              <div className='grid grid-cols-2 gap-3 mb-6'>
                {expenseCategories.length === 0 ? (
                  <div className='col-span-2 text-center py-8 text-gray-500 dark:text-gray-400'>
                    No categories added yet. Add one below.
                  </div>
                ) : (
                  expenseCategories.map((cat, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${cat.color} flex justify-between items-center`}
                    >
                      <span className='text-sm font-medium dark:text-gray-900'>
                        {cat.emoji} {cat.label}
                      </span>
                      <button
                        onClick={() => removeExpenseCategory(idx)}
                        className='text-red-500 hover:text-red-700 transition-colors'
                      >
                        <HiOutlineTrash className='w-4 h-4' />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Category */}
              <div className='p-4 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg'>
                <h3 className='text-sm font-bold mb-4 text-gray-900 dark:text-white'>
                  Add Expense Category
                </h3>
                <div className='grid grid-cols-2 gap-3 mb-3'>
                  <input
                    type='text'
                    placeholder='Value (e.g. vegetables)'
                    value={newCategory.value}
                    onChange={(e) => setNewCategory({ ...newCategory, value: e.target.value })}
                    className='col-span-2 px-3 py-2 rounded border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm'
                  />
                  <input
                    type='text'
                    placeholder='Label (e.g. 🥬 Vegetables)'
                    value={newCategory.label}
                    onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                    className='px-3 py-2 rounded border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm'
                  />
                  <input
                    type='text'
                    placeholder='Emoji'
                    maxLength='2'
                    value={newCategory.emoji}
                    onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
                    className='px-3 py-2 rounded border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm'
                  />
                </div>
                <button
                  onClick={addExpenseCategory}
                  className='w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 rounded transition-colors flex items-center justify-center gap-2'
                >
                  <HiOutlinePlus className='w-5 h-5' />
                  Add Category
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className='flex justify-between gap-4'>
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className='px-6 py-3 rounded-lg border border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors disabled:opacity-50'
          >
            Previous
          </button>

          <button
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else handleSubmit();
            }}
            disabled={
              (step === 1 && !messInfo.messName) ||
              (step === 2 && mealTimes.length === 0) ||
              (step === 3 && expenseCategories.length === 0) ||
              loading
            }
            className='px-6 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2'
          >
            {loading ? 'Saving...' : step === 3 ? 'Complete' : 'Next'}
            {!loading && <HiOutlineCheck className='w-5 h-5' />}
          </button>
        </div>
      </div>
    </div>
  );
}
