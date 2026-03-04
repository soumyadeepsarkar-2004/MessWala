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

// Start the HTTP server immediately so Railway sees a healthy port binding
// (prevents Railway from marking the service as crashed during DB connection retries)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MessWala server listening on port ${PORT}`);
});

// Health check returns DB status
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'ok' : 'db_unavailable',
    dbState,
    timestamp: new Date().toISOString(),
  });
});

// Connect to MongoDB with automatic retry
const MAX_RETRIES = 10;
let retryCount = 0;

function connectWithRetry() {
  console.log(`🔄 Attempting MongoDB connection (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
  mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,   // fail fast per attempt
      socketTimeoutMS: 45000,
    })
    .then(() => {
      console.log('✅ MongoDB connected successfully');
      retryCount = 0; // reset for any future reconnects
    })
    .catch((err) => {
      retryCount++;
      console.error(`❌ MongoDB connection error (attempt ${retryCount}/${MAX_RETRIES}):`, err.message);
      if (err.message.includes('whitelist') || err.message.includes('IP')) {
        console.error('💡 FIX: Go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)');
      }
      if (retryCount < MAX_RETRIES) {
        const delay = Math.min(retryCount * 5000, 30000); // 5s, 10s, 15s... max 30s
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        setTimeout(connectWithRetry, delay);
      } else {
        console.error('❌ Max retries reached. Server stays up but DB is unavailable.');
        console.error('💡 Fix the issue and redeploy, or the server will accept requests but return 503 on DB-dependent routes.');
      }
    });
}

// Handle disconnection events for auto-reconnect
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Will attempt reconnect...');
  if (retryCount === 0) {
    retryCount = 0;
    setTimeout(connectWithRetry, 5000);
  }
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ MongoDB connection error event:', err.message);
});

connectWithRetry();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

module.exports = app;
