import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ConfigContext = createContext();

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return ctx;
};

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/auth/admin/config');
      setConfig(res.data.config);
    } catch (err) {
      console.error('Failed to fetch config:', err);
      // Create default config
      setConfig({
        messName: 'My Mess',
        expenseCategories: [
          { value: 'vegetables', label: '🥬 Vegetables', emoji: '🥬' },
          { value: 'rice', label: '🍚 Rice & Flour', emoji: '🍚' },
          { value: 'gas', label: '🔥 Gas', emoji: '🔥' },
          { value: 'salary', label: '👨‍🍳 Salary', emoji: '👨‍🍳' },
          { value: 'dairy', label: '🥛 Dairy', emoji: '🥛' },
          { value: 'spices', label: '🌶️ Spices', emoji: '🌶️' },
          { value: 'misc', label: '📦 Misc', emoji: '📦' },
        ],
        mealTimes: [
          {
            type: 'breakfast',
            emoji: '🌅',
            label: 'Breakfast',
            startTime: '07:30',
            endTime: '09:00',
          },
          { type: 'lunch', emoji: '☀️', label: 'Lunch', startTime: '12:30', endTime: '14:00' },
          { type: 'dinner', emoji: '🌙', label: 'Dinner', startTime: '19:30', endTime: '21:00' },
        ],
        menuDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        isSetup: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigContext.Provider value={{ config, loading, refetch: fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
