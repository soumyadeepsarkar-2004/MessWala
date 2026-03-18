import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HiOutlineTrendingUp, HiOutlineLightBulb, HiOutlineShieldCheck } from 'react-icons/hi';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4', '#6b7280'];

export default function AnalyticsPage() {
  const [expenseTrend, setExpenseTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [costTrend, setCostTrend] = useState([]);
  const [wastage, setWastage] = useState(null);
  const [transparency, setTransparency] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [trendRes, catRes, costRes, wastRes, transRes, predRes] = await Promise.all([
          api.get('/analytics/expense-trend'),
          api.get('/analytics/category-breakdown'),
          api.get('/analytics/cost-per-plate-trend'),
          api.get('/analytics/wastage'),
          api.get('/analytics/transparency-index'),
          api.get('/analytics/predicted-cost'),
        ]);
        setExpenseTrend(trendRes.data.trend);
        setCategoryBreakdown(catRes.data.breakdown.map((b) => ({ name: b._id, value: b.total })));
        setCostTrend(costRes.data.trend);
        setWastage(wastRes.data);
        setTransparency(transRes.data);
        setPrediction(predRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className='page-container'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='glass-card-solid p-6 h-64 animate-pulse'>
              <div className='h-4 bg-gray-200 dark:bg-dark-700 rounded w-1/3 mb-4' />
              <div className='h-full bg-gray-100 dark:bg-dark-700 rounded-xl' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const transparencyColor =
    transparency?.transparencyIndex >= 70
      ? 'text-emerald-500'
      : transparency?.transparencyIndex >= 40
        ? 'text-amber-500'
        : 'text-red-500';
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - ((transparency?.transparencyIndex || 0) / 100) * circumference;

  return (
    <div className='page-container'>
      <div className='mb-8 animate-fade-in'>
        <h1 className='section-title'>Cost Analytics</h1>
        <p className='text-gray-500 dark:text-gray-400 -mt-4'>Data-driven insights for your mess</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
        {/* Transparency Index */}
        <div className='glass-card-solid p-6 flex flex-col items-center justify-center animate-slide-up'>
          <HiOutlineShieldCheck className='w-6 h-6 text-primary-500 mb-2' />
          <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-4'>
            Mess Transparency Index
          </h3>
          <div className='relative w-28 h-28'>
            <svg className='w-28 h-28 -rotate-90' viewBox='0 0 100 100'>
              <circle
                cx='50'
                cy='50'
                r='45'
                fill='none'
                stroke='currentColor'
                strokeWidth='8'
                className='text-gray-100 dark:text-dark-700'
              />
              <circle
                cx='50'
                cy='50'
                r='45'
                fill='none'
                stroke='currentColor'
                strokeWidth='8'
                strokeLinecap='round'
                className={transparencyColor}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
              />
            </svg>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className={`text-2xl font-bold ${transparencyColor}`}>
                {transparency?.transparencyIndex || 0}%
              </span>
            </div>
          </div>
          <p className='text-xs text-gray-400 mt-3'>Based on last 30 days activity</p>
        </div>

        {/* Predicted Cost */}
        <div className='glass-card-solid p-6 animate-slide-up' style={{ animationDelay: '100ms' }}>
          <div className='flex items-center gap-2 mb-4'>
            <HiOutlineLightBulb className='w-5 h-5 text-violet-500' />
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              Predicted Next Month
            </h3>
          </div>
          <p className='text-3xl font-bold text-gray-900 dark:text-white'>
            ₹{(prediction?.predictedNextMonth || 0).toLocaleString()}
          </p>
          <div className='mt-3 flex items-center gap-2'>
            <span
              className={`badge ${prediction?.confidence === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
            >
              {prediction?.confidence || 'low'} confidence
            </span>
          </div>
          <p className='text-xs text-gray-400 mt-2'>Based on linear regression of 6 months data</p>
        </div>

        {/* Wastage */}
        <div className='glass-card-solid p-6 animate-slide-up' style={{ animationDelay: '200ms' }}>
          <div className='flex items-center gap-2 mb-4'>
            <HiOutlineTrendingUp className='w-5 h-5 text-red-500' />
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              Wastage Estimate
            </h3>
          </div>
          <p className='text-3xl font-bold text-gray-900 dark:text-white'>
            {wastage?.wastagePercent || 0}%
          </p>
          <div className='mt-3 w-full h-3 rounded-full bg-gray-100 dark:bg-dark-700 overflow-hidden'>
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                (wastage?.wastagePercent || 0) > 20
                  ? 'bg-gradient-to-r from-red-400 to-red-500'
                  : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              }`}
              style={{ width: `${Math.min(wastage?.wastagePercent || 0, 100)}%` }}
            />
          </div>
          <div className='flex justify-between text-xs text-gray-400 mt-2'>
            <span>Present: {wastage?.presentCount || 0}</span>
            <span>Absent: {wastage?.absentCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Expense Trend */}
        <div className='glass-card-solid p-6 animate-slide-up' style={{ animationDelay: '300ms' }}>
          <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>
            Monthly Expense Trend
          </h3>
          <ResponsiveContainer width='100%' height={280}>
            <LineChart data={expenseTrend}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='month' stroke='#9ca3af' tick={{ fontSize: 12 }} />
              <YAxis stroke='#9ca3af' tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Expense']}
              />
              <Line
                type='monotone'
                dataKey='total'
                stroke='#f59e0b'
                strokeWidth={3}
                dot={{ r: 5, fill: '#f59e0b' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown Pie */}
        <div className='glass-card-solid p-6 animate-slide-up' style={{ animationDelay: '400ms' }}>
          <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>
            Category Breakdown
          </h3>
          <ResponsiveContainer width='100%' height={280}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey='value'
              >
                {categoryBreakdown.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Per Plate Trend */}
        <div
          className='glass-card-solid p-6 lg:col-span-2 animate-slide-up'
          style={{ animationDelay: '500ms' }}
        >
          <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>
            Cost Per Plate Trend
          </h3>
          <ResponsiveContainer width='100%' height={280}>
            <BarChart data={costTrend}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='month' stroke='#9ca3af' tick={{ fontSize: 12 }} />
              <YAxis stroke='#9ca3af' tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
                formatter={(value, name) => [
                  name === 'costPerPlate' ? `₹${value}` : value.toLocaleString(),
                  name === 'costPerPlate' ? 'Cost/Plate' : 'Meals',
                ]}
              />
              <Legend />
              <Bar
                dataKey='costPerPlate'
                fill='#8b5cf6'
                radius={[8, 8, 0, 0]}
                name='Cost Per Plate (₹)'
              />
              <Bar dataKey='mealsServed' fill='#06b6d4' radius={[8, 8, 0, 0]} name='Meals Served' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
