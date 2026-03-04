const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per window
  message: { success: false, error: 'Too many attempts, please try again after 15 minutes' },
});

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // In production, check against allowed origins; in dev, allow all
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    // Allow all vercel.app and railway.app domains
    if (origin.endsWith('.vercel.app') || origin.endsWith('.railway.app')) {
      return callback(null, true);
    }
    callback(null, true); // permissive for now
  },
  credentials: true,
}));
app.use(express.json());

// Apply rate limiter to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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

console.log('--- Server Startup ---');
console.log(`Time: ${new Date().toISOString()}`);
console.log(`Port Configured: ${PORT}`);
console.log(`MONGO_URI Configured: ${process.env.MONGO_URI ? 'YES (Env Var)' : 'NO - FATAL ERROR'}`);

if (!process.env.MONGO_URI) {
  console.error('❌ FATAL ERROR: MONGO_URI environment variable is missing.');
  console.error('💡 TIP: Go to Railway Dashboard -> Variables and add MONGO_URI');
  process.exit(1);
}

const mongoUri = process.env.MONGO_URI;

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
