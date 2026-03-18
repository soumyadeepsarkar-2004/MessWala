import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineDownload,
  HiOutlineCurrencyRupee,
} from 'react-icons/hi';

export default function ExpensesPage() {
  const { isRole } = useAuth();
  const { config } = useConfig();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [costPerPlate, setCostPerPlate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);
  const canManage = isRole('treasurer', 'admin');

  // Initialize form category when config loads
  useEffect(() => {
    if (config?.expenseCategories?.length > 0) {
      setForm((f) => ({ ...f, category: config.expenseCategories[0].value }));
    }
  }, [config]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, sumRes, costRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/expenses/summary'),
        api.get('/expenses/cost-per-plate'),
      ]);
      setExpenses(expRes.data.expenses);
      setSummary(sumRes.data);
      setCostPerPlate(costRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', form);
      toast.success('Expense added! 💰');
      setForm({
        category: 'vegetables',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get(`/expenses/export?month=${summary?.month || ''}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses-${summary?.month || 'all'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const getCategoryInfo = (cat) => {
    const found = config?.expenseCategories?.find((c) => c.value === cat);
    if (found) {
      // Add default colors based on category value if not in config
      const colors = {
        vegetables: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        rice: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
        gas: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
        salary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        dairy: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
        spices: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        misc: 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300',
      };
      return { ...found, color: found.color || colors[found.value] || 'bg-gray-100' };
    }
    return (
      config?.expenseCategories?.[config.expenseCategories.length - 1] || {
        label: 'Other',
        value: 'misc',
      }
    );
  };

  if (loading) {
    return (
      <div className='page-container'>
        <div className='glass-card-solid p-8 animate-pulse'>
          <div className='h-8 bg-gray-200 dark:bg-dark-700 rounded w-1/3 mb-4' />
          <div className='h-4 bg-gray-200 dark:bg-dark-700 rounded w-2/3' />
        </div>
      </div>
    );
  }

  return (
    <div className='page-container'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-8 animate-fade-in'>
        <div>
          <h1 className='section-title mb-0'>Expense Tracking</h1>
          <p className='text-gray-500 dark:text-gray-400 mt-1'>Real-time cost transparency</p>
        </div>
        <div className='flex gap-3 mt-4 sm:mt-0'>
          {canManage && (
            <button
              onClick={() => setShowForm(!showForm)}
              className='btn-primary flex items-center gap-2'
              id='add-expense-btn'
            >
              <HiOutlinePlus className='w-4 h-4' />
              Add Expense
            </button>
          )}
          <button
            onClick={handleExport}
            className='btn-secondary flex items-center gap-2'
            id='export-csv-btn'
          >
            <HiOutlineDownload className='w-4 h-4' />
            CSV
          </button>
        </div>
      </div>

      {/* Cost per plate hero */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <div className='stat-card bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0 animate-slide-up'>
          <HiOutlineCurrencyRupee className='w-8 h-8 opacity-80 mb-2' />
          <p className='text-primary-100 text-sm font-medium'>Cost Per Plate</p>
          <p className='text-3xl font-bold mt-1'>₹{costPerPlate?.costPerPlate || 0}</p>
          <p className='text-primary-200 text-xs mt-1'>
            {costPerPlate?.mealsServed || 0} meals served this month
          </p>
        </div>
        <div className='stat-card animate-slide-up' style={{ animationDelay: '100ms' }}>
          <p className='text-sm text-gray-500 dark:text-gray-400 font-medium'>
            Total Monthly Expense
          </p>
          <p className='text-2xl font-bold text-gray-900 dark:text-white mt-1'>
            ₹{(summary?.totalExpense || 0).toLocaleString()}
          </p>
          <p className='text-xs text-gray-400 mt-1'>{summary?.month || ''}</p>
        </div>
        <div className='stat-card animate-slide-up' style={{ animationDelay: '200ms' }}>
          <p className='text-sm text-gray-500 dark:text-gray-400 font-medium'>Categories Tracked</p>
          <p className='text-2xl font-bold text-gray-900 dark:text-white mt-1'>
            {summary?.breakdown?.length || 0}
          </p>
          <p className='text-xs text-gray-400 mt-1'>Active expense categories</p>
        </div>
      </div>

      {/* Add expense form */}
      {showForm && (
        <div className='glass-card-solid p-6 mb-8 animate-scale-in'>
          <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>New Expense</h3>
          <form
            onSubmit={handleSubmit}
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'
          >
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className='input-field'
              id='expense-category'
            >
              {config?.expenseCategories?.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              type='number'
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder='Amount (₹)'
              className='input-field'
              required
              min='0'
              id='expense-amount'
            />
            <input
              type='text'
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder='Description'
              className='input-field'
              id='expense-description'
            />
            <div className='flex gap-2'>
              <input
                type='date'
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className='input-field flex-1'
                id='expense-date'
              />
              <button type='submit' className='btn-primary whitespace-nowrap' id='expense-submit'>
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category breakdown */}
      <div
        className='glass-card-solid p-6 mb-8 animate-slide-up'
        style={{ animationDelay: '300ms' }}
      >
        <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>Category Breakdown</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          {summary?.breakdown?.map((b) => {
            const info = getCategoryInfo(b._id);
            const percent =
              summary.totalExpense > 0 ? ((b.total / summary.totalExpense) * 100).toFixed(1) : 0;
            return (
              <div key={b._id} className={`p-4 rounded-xl ${info.color}`}>
                <p className='text-xs font-medium opacity-70'>{info.label}</p>
                <p className='text-lg font-bold mt-1'>₹{b.total.toLocaleString()}</p>
                <p className='text-xs opacity-60'>{percent}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense list */}
      <div className='glass-card-solid p-6 animate-slide-up' style={{ animationDelay: '400ms' }}>
        <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>Recent Expenses</h3>
        <div className='space-y-3'>
          {expenses.slice(0, 20).map((exp) => {
            const info = getCategoryInfo(exp.category);
            return (
              <div
                key={exp._id}
                className='flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors group'
              >
                <div className='flex items-center gap-3'>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${info.color}`}>
                    {info.label}
                  </span>
                  <div>
                    <p className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                      {exp.description || 'No description'}
                    </p>
                    <p className='text-xs text-gray-400'>
                      {new Date(exp.date + 'T00:00').toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='text-sm font-bold text-gray-900 dark:text-white'>
                    ₹{exp.amount.toLocaleString()}
                  </span>
                  {canManage && (
                    <button
                      onClick={() => handleDelete(exp._id)}
                      className='opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all'
                    >
                      <HiOutlineTrash className='w-4 h-4' />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
