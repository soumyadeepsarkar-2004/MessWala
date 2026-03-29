import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  HiOutlineUserGroup,
  HiOutlineCurrencyRupee,
  HiOutlineChartBar,
  HiOutlineStar,
  HiOutlineCalendar,
  HiOutlineTrendingUp,
  HiOutlineCog,
} from 'react-icons/hi';
import TaskListWidget from '../components/TaskListWidget';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [configStatus, setConfigStatus] = useState(null);

  // Check if user is manager/admin
  useEffect(() => {
    const checkManagerStatus = async () => {
      try {
        // User is manager if they have admin or manager role
        const isAdminOrManager =
          user?.role === 'admin' || user?.role === 'manager' || user?.role === 'co-admin';
        setIsManager(isAdminOrManager);

        // If manager, fetch configuration status
        if (isAdminOrManager) {
          const statusRes = await api.get('/config/status');
          setConfigStatus(statusRes.data);
        }
      } catch (err) {
        console.error('Manager status check error:', err);
      }
    };

    if (user) {
      checkManagerStatus();
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [headcountRes, costRes, menuRes, transparencyRes] = await Promise.all([
          api.get('/meals/headcount'),
          api.get('/expenses/cost-per-plate'),
          api.get('/menu/today'),
          api.get('/analytics/transparency-index'),
        ]);

        setStats({
          headcount: headcountRes.data.headcount,
          cost: costRes.data,
          transparency: transparencyRes.data,
        });
        setMenu(menuRes.data.menu);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='page-container'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='glass-card-solid p-6 animate-pulse'>
              <div className='h-4 bg-gray-200 dark:bg-dark-700 rounded w-1/2 mb-4' />
              <div className='h-8 bg-gray-200 dark:bg-dark-700 rounded w-3/4' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Today's Headcount",
      value: `${(stats?.headcount?.breakfast || 0) + (stats?.headcount?.lunch || 0) + (stats?.headcount?.dinner || 0)} meals`,
      sub: `B: ${stats?.headcount?.breakfast || 0} | L: ${stats?.headcount?.lunch || 0} | D: ${stats?.headcount?.dinner || 0}`,
      icon: HiOutlineUserGroup,
      color: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20',
    },
    {
      label: 'Cost Per Plate',
      value: `₹${stats?.cost?.costPerPlate || 0}`,
      sub: `${stats?.cost?.mealsServed || 0} meals this month`,
      icon: HiOutlineCurrencyRupee,
      color: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/20',
    },
    {
      label: 'Monthly Expense',
      value: `₹${(stats?.cost?.totalExpense || 0).toLocaleString()}`,
      sub: stats?.cost?.month || '',
      icon: HiOutlineTrendingUp,
      color: 'from-violet-500 to-violet-600',
      shadow: 'shadow-violet-500/20',
    },
    {
      label: 'Transparency Index',
      value: `${stats?.transparency?.transparencyIndex || 0}%`,
      sub: 'Last 30 days',
      icon: HiOutlineChartBar,
      color: 'from-primary-500 to-primary-600',
      shadow: 'shadow-primary-500/20',
    },
  ];

  return (
    <div className='page-container'>
      {/* Welcome */}
      <div className='mb-8 animate-fade-in'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Welcome back,{' '}
          <span className='bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent'>
            {user?.name?.split(' ')[0]}
          </span>{' '}
          👋
        </h1>
        <p className='text-gray-500 dark:text-gray-400 mt-1'>
          Here's what's happening in your mess today
        </p>
      </div>

      {/* Stat cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`stat-card animate-slide-up`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className='flex items-center justify-between mb-4'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{card.label}</p>
              <div
                className={`p-2 rounded-xl bg-gradient-to-br ${card.color} ${card.shadow} shadow-lg`}
              >
                <card.icon className='w-5 h-5 text-white' />
              </div>
            </div>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>{card.value}</p>
            <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Configuration Management Card - Manager Only */}
      {isManager && (
        <div
          className='glass-card-solid p-6 mb-8 animate-slide-up border-l-4 border-primary-500'
          style={{ animationDelay: '200ms' }}
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20'>
                <HiOutlineCog className='w-6 h-6 text-white' />
              </div>
              <div>
                <h2 className='text-lg font-bold text-gray-900 dark:text-white'>
                  Configuration Management
                </h2>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  {configStatus?.isSetup ? (
                    <>
                      <span className='text-emerald-600 dark:text-emerald-400 font-medium'>
                        ✓ Configured
                      </span>{' '}
                      — Update meal times, expense categories, and other mess settings
                    </>
                  ) : (
                    <>
                      <span className='text-amber-600 dark:text-amber-400 font-medium'>
                        ⚠ Not Configured
                      </span>{' '}
                      — Set up your mess configuration before managing operations
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/setup')}
              className='px-6 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300 hover:scale-105'
            >
              {configStatus?.isSetup ? 'Manage Settings' : 'Setup Now'}
            </button>
          </div>
        </div>
      )}

      {/* Today's Menu */}
      <div
        className='glass-card-solid p-6 mb-8 animate-slide-up'
        style={{ animationDelay: '400ms' }}
      >
        <div className='flex items-center gap-2 mb-4'>
          <HiOutlineCalendar className='w-5 h-5 text-primary-500' />
          <h2 className='text-lg font-bold text-gray-900 dark:text-white'>Today's Menu</h2>
        </div>
        {menu && Array.isArray(menu.meals) && menu.meals.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {menu.meals.map((meal, idx) => (
              <div
                key={idx}
                className='p-4 rounded-xl bg-gray-50 dark:bg-dark-700/50 border border-gray-100 dark:border-dark-600'
              >
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-2xl'>{meal.emoji || '🍽️'}</span>
                  <h3 className='font-semibold text-gray-700 dark:text-gray-200'>
                    {meal.type || 'Meal'}
                  </h3>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300 mb-2'>
                  {meal.content || 'Not set'}
                </p>
                {meal.notes && (
                  <p className='text-xs text-gray-500 dark:text-gray-400 italic'>
                    Note: {meal.notes}
                  </p>
                )}
                {meal.allergy_warnings && (
                  <p className='text-xs text-amber-600 dark:text-amber-400'>
                    ⚠️ {meal.allergy_warnings}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8'>
            <p className='text-gray-500 dark:text-gray-400'>
              {isManager ? (
                <>
                  No menu set for today.{' '}
                  <button
                    onClick={() => navigate('/admin/setup')}
                    className='text-primary-500 font-medium hover:underline'
                  >
                    Configure meal times
                  </button>{' '}
                  to set up the menu.
                </>
              ) : (
                'Menu not yet set for today. Please check back later.'
              )}
            </p>
          </div>
        )}
      </div>

      {/* Lower Section (Transparency & Tasks) */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8'>
        {/* Transparency Factors */}
        <div className='glass-card-solid p-6 animate-slide-up' style={{ animationDelay: '500ms' }}>
          <div className='flex items-center gap-2 mb-4'>
            <HiOutlineStar className='w-5 h-5 text-primary-500' />
            <h2 className='text-lg font-bold text-gray-900 dark:text-white'>
              Transparency Breakdown
            </h2>
          </div>
          <div className='space-y-4'>
            {[
              {
                label: 'Expense Tracking',
                value: stats?.transparency?.factors?.expenseTracking || 0,
                color: 'bg-emerald-500',
              },
              {
                label: 'Attendance Tracking',
                value: stats?.transparency?.factors?.attendanceTracking || 0,
                color: 'bg-blue-500',
              },
              {
                label: 'Feedback Engagement',
                value: stats?.transparency?.factors?.feedbackEngagement || 0,
                color: 'bg-violet-500',
              },
            ].map((factor) => (
              <div key={factor.label}>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='text-gray-600 dark:text-gray-300'>{factor.label}</span>
                  <span className='font-medium text-gray-900 dark:text-white'>{factor.value}%</span>
                </div>
                <div className='w-full h-2 rounded-full bg-gray-100 dark:bg-dark-700 overflow-hidden'>
                  <div
                    className={`h-full rounded-full ${factor.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${factor.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Widget */}
        <div className='animate-slide-up' style={{ animationDelay: '600ms' }}>
          <TaskListWidget />
        </div>
      </div>
    </div>
  );
}
