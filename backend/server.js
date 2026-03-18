const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import enterprise utilities
const { errorHandler, asyncHandler } = require('./src/utils/errors');
const { requestLogger, errorLogger, getLogger } = require('./src/utils/logger');
const { performanceMonitoringMiddleware, getHealthStatus } = require('./src/utils/performance');
const { detectApiVersion, checkVersionCompatibility } = require('./src/utils/versioning');
const { initializeIndexes, performanceMonitor } = require('./src/utils/database');
const { backupManager, schedulePeriodicBackups } = require('./src/utils/backup');

const logger = getLogger('Server');
const app = express();

// CORS must be before helmet so preflight OPTIONS requests get proper headers
const ALLOWED_ORIGINS = [
  'https://mess-walah.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];
// Dynamically add Render URL if set
if (process.env.RENDER_EXTERNAL_URL) {
  ALLOWED_ORIGINS.push(process.env.RENDER_EXTERNAL_URL);
}
if (process.env.FRONTEND_URL) {
  ALLOWED_ORIGINS.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://cdn.jsdelivr.net',
          'https://recharts.org',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        connectSrc: [
          "'self'",
          'https://www.google.com',
          'https://www.gstatic.com',
          process.env.FRONTEND_URL || '',
        ],
        frameSrc: ["'self'", 'https://www.google.com'],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
    frameGuard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
  }),
);

app.use(express.json());

// ─── Enterprise Middleware Stack ───

// Request logging
app.use(requestLogger);

// Performance monitoring
app.use(performanceMonitoringMiddleware);

// API versioning
app.use(detectApiVersion);
app.use(checkVersionCompatibility);

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per window
  message: { success: false, error: 'Too many attempts, please try again after 15 minutes' },
  // Using default in-memory store. For production with multiple instances,
  // consider using a Redis store with redis package instead of rate-limit-mongo
});

app.use('/api/auth/google', authLimiter);
app.use('/api/auth/admin/login', authLimiter);
app.use('/api/auth/admin/forgot-password', authLimiter);
app.use('/api/auth/admin/verify-otp', authLimiter);
app.use('/api/auth/admin/reset-password', authLimiter);

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const mealRoutes = require('./src/routes/mealRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

// Root health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'MessWala API', version: 'v2' });
});

// Detailed health check
app.get('/api/health', (req, res) => {
  res.json(getHealthStatus());
});

// Metrics endpoint (monitoring)
app.get('/api/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    performance: performanceMonitor.getMetrics(),
  });
});

// API documentation endpoint
app.get('/api/version', (req, res) => {
  res.json({
    apiVersion: req.apiVersion,
    config: req.apiVersionConfig,
  });
});

// Backup management endpoints (admin only)
app.post(
  '/api/admin/backup',
  asyncHandler(async (req, res) => {
    const backup = await backupManager.createFullBackup();
    res.json({
      success: true,
      message: 'Backup created successfully',
      data: backup,
    });
  }),
);

app.get(
  '/api/admin/backups',
  asyncHandler(async (req, res) => {
    const backups = backupManager.listBackups();
    res.json({
      success: true,
      data: backups,
    });
  }),
);

app.post(
  '/api/admin/restore/:timestamp',
  asyncHandler(async (req, res) => {
    const result = await backupManager.restoreFromBackup(req.params.timestamp);
    res.json({
      success: true,
      message: 'Restore completed',
      data: result,
    });
  }),
);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling middleware (must come after all other middleware)
app.use(errorLogger);
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    errorCode: 'NOT_FOUND',
    path: req.path,
    method: req.method,
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

logger.info('Server startup initiated', {
  port: PORT,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoConfigured: !!process.env.MONGO_URI,
  jwtConfigured: !!process.env.JWT_SECRET,
});

if (!process.env.MONGO_URI) {
  logger.error('FATAL: MONGO_URI environment variable is missing');
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}

if (!process.env.JWT_SECRET) {
  logger.error('FATAL: JWT_SECRET environment variable is missing');
  if (!process.env.VERCEL) {
    process.exit(1);
  }
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
    .then(async (conn) => {
      logger.info('MongoDB connected successfully');

      // Initialize database indexes
      await initializeIndexes();

      // Schedule periodic backups
      if (process.env.BACKUP_ENABLED !== 'false') {
        schedulePeriodicBackups();
      }

      cachedConnection = conn;
      return conn;
    })
    .catch((err) => {
      logger.error('MongoDB connection failed', { error: err.message });
      throw err;
    });
}

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error', { error: err.message });
  cachedConnection = null;
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
  cachedConnection = null;
});

// In standalone mode, start the HTTP server
if (!process.env.VERCEL) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`MessWala server listening on 0.0.0.0:${PORT}`);
  });

  // Retry logic for standalone server
  let retryCount = 0;
  const MAX_RETRIES = 10;

  const connectWithRetry = () => {
    logger.info(`MongoDB connection attempt ${retryCount + 1}/${MAX_RETRIES}`);
    connectDB().catch((err) => {
      retryCount++;
      logger.error('MongoDB connection error', {
        error: err.message,
        attempt: retryCount,
        maxRetries: MAX_RETRIES,
      });
      if (retryCount < MAX_RETRIES) {
        const delay = Math.min(retryCount * 5000, 30000);
        logger.info(`Retrying in ${delay / 1000}s`);
        setTimeout(connectWithRetry, delay);
      } else {
        logger.error('Max MongoDB connection retries reached');
      }
    });
  };
  connectWithRetry();

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      mongoose.connection.close(false, () => {
        logger.info('Server shutdown complete');
        process.exit(0);
      });
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      mongoose.connection.close(false, () => {
        logger.info('Server shutdown complete');
        process.exit(0);
      });
    });
  });
} else {
  // Serverless: connect once at module load
  logger.info('Serverless mode detected, connecting to MongoDB');
  app.dbReady = connectDB().catch((err) =>
    logger.error('Serverless MongoDB error', { error: err.message }),
  );
}

module.exports = app;
