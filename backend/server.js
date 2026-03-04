const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const mealRoutes = require('./src/routes/mealRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

// fallback URI provided by user -- INSECURE for production but fixes deployment immediately
const FALLBACK_MONGO_URI = 'mongodb+srv://shannking969_db_user:nlWk4dBdeSkIxyRj@cluster0.u4tdugj.mongodb.net/messwala?retryWrites=true&w=majority&appName=Cluster0';
const mongoUri = process.env.MONGO_URI || FALLBACK_MONGO_URI;

console.log('--- Server Startup ---');
console.log(`Time: ${new Date().toISOString()}`);
console.log(`Port Configured: ${PORT}`);
console.log(`MONGO_URI Configured: ${process.env.MONGO_URI ? 'YES (Env Var)' : 'YES (Fallback Hardcoded)'}`);

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 MessWala server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    // Do not exit immediately, log robustly
    console.error('Check your MongoDB Atlas Network Access (IP Whitelist).');
    setTimeout(() => process.exit(1), 2000);
  });

module.exports = app;
