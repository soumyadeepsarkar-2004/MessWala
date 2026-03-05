const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// CORS must be before helmet so preflight OPTIONS requests get proper headers
app.use(cors({
  origin: true, // reflect request origin (supports credentials)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security middleware (after CORS) - disabled crossOriginResourcePolicy for Railway proxy
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

app.use(express.json());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per window
  message: { success: false, error: 'Too many attempts, please try again after 15 minutes' },
});

app.use('/api/auth/google', authLimiter);

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const mealRoutes = require('./src/routes/mealRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

// Root health check (Railway may probe /)
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'MessWala API' });
});

// Health check (before other routes so it always works)
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'ok' : 'db_unavailable',
    dbState,
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tasks', taskRoutes);

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
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set (defaults to development)'}`);
console.log(`MONGO_URI Configured: ${process.env.MONGO_URI ? 'YES (Env Var)' : 'NO - FATAL ERROR'}`);
console.log(`JWT_SECRET Configured: ${process.env.JWT_SECRET ? 'YES' : 'NO - FATAL ERROR (login will fail)'}`);

if (!process.env.MONGO_URI) {
  console.error('FATAL: MONGO_URI environment variable is missing.');
  if (!process.env.VERCEL) process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET not set. Using built-in fallback.');
  process.env.JWT_SECRET = 'mW$2026!xK9pLqR#vTzYn@8sFdGhJb4c';
}

const mongoUri = process.env.MONGO_URI;

// MongoDB connection with caching for serverless
let cachedConnection = null;

function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return Promise.resolve(cachedConnection);
  }
  return mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    .then((conn) => {
      console.log('✅ MongoDB connected successfully');
      cachedConnection = conn;
      return conn;
    });
}

mongoose.connection.on('error', (err) => {
  console.error('⚠️ MongoDB connection error:', err.message);
  cachedConnection = null;
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected.');
  cachedConnection = null;
});

// In serverless (Vercel), don't start a listener — just connect to DB
// In standalone mode, start the HTTP server
if (!process.env.VERCEL) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MessWala server listening on 0.0.0.0:${PORT}`);
  });

  // Retry logic for standalone server
  const MAX_RETRIES = 10;
  let retryCount = 0;

  function connectWithRetry() {
    console.log(`🔄 MongoDB connection attempt ${retryCount + 1}/${MAX_RETRIES}...`);
    connectDB().catch((err) => {
      retryCount++;
      console.error(`❌ MongoDB error (attempt ${retryCount}/${MAX_RETRIES}):`, err.message);
      if (retryCount < MAX_RETRIES) {
        const delay = Math.min(retryCount * 5000, 30000);
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        setTimeout(connectWithRetry, delay);
      }
    });
  }
  connectWithRetry();

  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down...');
    server.close(() => {
      mongoose.connection.close(false, () => process.exit(0));
    });
  });
} else {
  // Serverless: connect once at module load, store promise for handler to await
  app.dbReady = connectDB().catch((err) => console.error('❌ Serverless MongoDB error:', err.message));
}

module.exports = app;
