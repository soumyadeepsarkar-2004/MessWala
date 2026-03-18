import { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

export default function AttendancePage() {
  const { config } = useConfig();
  const [attendance, setAttendance] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Initialize attendance object with meal types from config
    if (config?.mealTimes?.length > 0) {
      const init = {};
      config.mealTimes.forEach((meal) => {
        init[meal.type] = null;
      });
      setAttendance(init);
    }
  }, [config]);

  const fetchData = async () => {
    try {
      const [todayRes, historyRes] = await Promise.all([
        api.get('/meals/today'),
        api.get('/meals/history'),
      ]);
      setAttendance(todayRes.data.attendance);
      setHistory(historyRes.data.history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (mealType) => {
    const newStatus = attendance[mealType] === true ? false : true;
    try {
      await api.post('/meals/mark', { mealType, present: newStatus });
      setAttendance((prev) => ({ ...prev, [mealType]: newStatus }));
      toast.success(newStatus ? `Marked present for ${mealType} ✅` : `Skipped ${mealType} ❌`);
    } catch (err) {
      toast.error('Failed to update attendance');
    }
  };

  // Group history by date
  const historyByDate = history.reduce((acc, h) => {
    if (!acc[h.date]) acc[h.date] = {};
    acc[h.date][h.mealType] = h.present;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className='page-container'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='glass-card-solid p-8 animate-pulse'>
              <div className='h-16 bg-gray-200 dark:bg-dark-700 rounded-2xl mb-4' />
              <div className='h-6 bg-gray-200 dark:bg-dark-700 rounded w-1/2' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='page-container'>
      <div className='mb-8 animate-fade-in'>
        <h1 className='section-title'>Meal Attendance</h1>
        <p className='text-gray-500 dark:text-gray-400 -mt-4'>Mark your meals for today</p>
      </div>

      {/* Meal toggle cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
        {config?.mealTimes?.map((meal, i) => {
          const isPresent = attendance[meal.type] === true;
          const isSkipped = attendance[meal.type] === false;

          return (
            <div
              key={meal.type}
              className='glass-card-solid overflow-hidden animate-slide-up'
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className={`h-2 bg-gradient-to-r ${meal.color || 'from-primary-400 to-primary-500'}`}
              />
              <div className='p-6'>
                <div className='text-center mb-6'>
                  <span className='text-4xl block mb-2'>{meal.emoji}</span>
                  <h3 className='text-xl font-bold text-gray-900 dark:text-white'>{meal.label}</h3>
                  <p className='text-sm text-gray-400 dark:text-gray-500'>
                    {meal.startTime} - {meal.endTime}
                  </p>
                </div>

                <div className='flex gap-3'>
                  <button
                    onClick={() => toggleAttendance(meal.type)}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                      isPresent
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'
                    }`}
                    id={`attendance-present-${meal.type}`}
                  >
                    <HiOutlineCheck className='w-5 h-5' />
                    {isPresent ? 'Present ✓' : 'Mark Present'}
                  </button>

                  {isPresent && (
                    <button
                      onClick={() => toggleAttendance(meal.type)}
                      className='px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all'
                      title='Skip meal'
                    >
                      <HiOutlineX className='w-5 h-5' />
                    </button>
                  )}
                </div>

                {isSkipped && (
                  <p className='text-center text-sm text-red-400 mt-3 animate-fade-in'>
                    Skipped this meal
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* History */}
      <div className='glass-card-solid p-6 animate-slide-up' style={{ animationDelay: '300ms' }}>
        <h2 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>Attendance History</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-100 dark:border-dark-700'>
                <th className='text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium'>
                  Date
                </th>
                <th className='text-center py-3 px-4 text-gray-500 dark:text-gray-400 font-medium'>
                  🌅 Breakfast
                </th>
                <th className='text-center py-3 px-4 text-gray-500 dark:text-gray-400 font-medium'>
                  ☀️ Lunch
                </th>
                <th className='text-center py-3 px-4 text-gray-500 dark:text-gray-400 font-medium'>
                  🌙 Dinner
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(historyByDate)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 14)
                .map(([date, meals]) => (
                  <tr
                    key={date}
                    className='border-b border-gray-50 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors'
                  >
                    <td className='py-3 px-4 font-medium text-gray-700 dark:text-gray-200'>
                      {new Date(date + 'T00:00').toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    {['breakfast', 'lunch', 'dinner'].map((m) => (
                      <td key={m} className='text-center py-3 px-4'>
                        {meals[m] === true && (
                          <span className='inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs'>
                            ✓
                          </span>
                        )}
                        {meals[m] === false && (
                          <span className='inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 text-xs'>
                            ✗
                          </span>
                        )}
                        {meals[m] === undefined && (
                          <span className='text-gray-300 dark:text-dark-600'>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
