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

// Import scalability & automation utilities
const { cacheManager, cacheMiddleware } = require('./src/utils/cache');
const { monitoringSystem } = require('./src/utils/monitoring');
const { IntelligentRateLimiter } = require('./src/utils/intelligentRateLimiter');
const { jobQueue } = require('./src/utils/jobQueue');
const { APIDocGenerator } = require('./src/utils/apiDocGenerator');
const { validateEnvironment } = require('./src/utils/envValidator');

const {
  sanitizationMiddleware,
  securityHeadersMiddleware,
  requestSizeLimitMiddleware,
  inputValidationMiddleware,
} = require('./src/middleware/securityMiddleware');

const logger = getLogger('Server');

// Validate environment before starting server
try {
  validateEnvironment();
} catch (err) {
  logger.error('CRITICAL: Environment validation failed', { error: err.message });
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const app = express();

// CORS must be before helmet so preflight OPTIONS requests get proper headers
const ALLOWED_ORIGINS = ['https://mess-walah.vercel.app'];

// Add frontend URL from environment (required in production)
if (process.env.FRONTEND_URL) {
  ALLOWED_ORIGINS.push(process.env.FRONTEND_URL);
}

// Add Render URL if set (for Render deployments)
if (process.env.RENDER_EXTERNAL_URL) {
  ALLOWED_ORIGINS.push(process.env.RENDER_EXTERNAL_URL);
}

// Only add localhost in development mode
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:5173');
  ALLOWED_ORIGINS.push('http://localhost:3000');
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
          'https://cdn.jsdelivr.net',
          'https://recharts.org',
          'https://www.google.com/recaptcha/',
          'https://www.gstatic.com/recaptcha/',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', 'http:', 'blob:'],
        connectSrc: [
          "'self'",
          'https://www.google.com',
          'https://www.gstatic.com',
          process.env.FRONTEND_URL || '*',
          'https://api.render.com',
        ],
        frameSrc: ["'self'", 'https://www.google.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
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
    referrerPolicy: { policy: 'same-origin' },
  }),
);

app.use(express.json());

// ─── Enterprise Middleware Stack ───

// Security hardening
app.use(securityHeadersMiddleware);
app.use(sanitizationMiddleware);
app.use(requestSizeLimitMiddleware);
app.use(inputValidationMiddleware);

// Request logging
app.use(requestLogger);

// Performance monitoring
app.use(performanceMonitoringMiddleware);

// API versioning
app.use(detectApiVersion);
app.use(checkVersionCompatibility);

// Intelligent rate limiting
const intelligentRateLimiter = new IntelligentRateLimiter({
  baseLimit: 100,
  adaptiveThreshold: 0.8,
});

// Cache middleware for GET requests
app.use(cacheMiddleware({ ttl: 300000 })); // 5 minutes

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
const healthRoutes = require('./src/routes/healthRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const advancedAnalyticsRoutes = require('./src/routes/advancedAnalyticsRoutes');
const mealRoutes = require('./src/routes/mealRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const configRoutes = require('./src/routes/configRoutes');

// Root health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'MessWala API', version: 'v2' });
});

// Detailed health check
app.get('/api/health', (req, res) => {
  res.json(getHealthStatus());
});

// Readiness probe (for Kubernetes/Docker/orchestrators)
// Returns 200 if service is ready to accept traffic
app.get('/api/ready', (req, res) => {
  const health = getHealthStatus();

  // Service is ready if database is connected and healthy
  if (health.database.status === 'connected' && health.overall === 'healthy') {
    res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString(),
      checks: {
        database: health.database.status,
        service: health.overall,
      },
    });
  } else {
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      message: 'Service not ready',
      checks: {
        database: health.database.status,
        service: health.overall,
      },
    });
  }
});

// Liveness probe (for Kubernetes/Docker/orchestrators)
// Returns 200 if service process is alive
app.get('/api/live', (req, res) => {
  res.status(200).json({
    alive: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Deployment status endpoint
// Shows deployment information and readiness
app.get('/api/deployment-status', (req, res) => {
  const health = getHealthStatus();
  res.json({
    deployed: true,
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION || '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: {
      health: health.overall,
      database: health.database.status,
      ready: health.database.status === 'connected' && health.overall === 'healthy',
    },
    buildInfo: {
      node: process.version,
      platform: process.platform,
    },
  });
});

// Metrics endpoint (monitoring)
app.get('/api/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    performance: performanceMonitor.getMetrics(),
  });
});

// System health summary
app.get('/api/admin/health-summary', (req, res) => {
  res.json({
    status: monitoringSystem.getHealthSummary(),
    cache: cacheManager.getStats(),
    jobQueue: jobQueue.getStatus(),
    rateLimiter: intelligentRateLimiter.getAnalytics(),
  });
});

// Cache management endpoints
app.get('/api/admin/cache/stats', (req, res) => {
  res.json({
    stats: cacheManager.getStats(),
  });
});

app.post('/api/admin/cache/clear', (req, res) => {
  cacheManager.clear();
  res.json({
    success: true,
    message: 'Cache cleared',
  });
});

// Job queue monitoring
app.get('/api/admin/jobs/status', (req, res) => {
  res.json(jobQueue.getStatus());
});

app.post('/api/admin/jobs/clear-failed', (req, res) => {
  jobQueue.clearFailed();
  res.json({
    success: true,
    message: 'Failed jobs cleared',
  });
});

// API documentation setup
const apiDocGenerator = new APIDocGenerator({
  title: 'MessWala API',
  version: '2.0.0',
  baseUrl: process.env.FRONTEND_URL || 'https://api.messwala.com',
});

// Register API endpoints for documentation
apiDocGenerator.registerEndpoint({
  method: 'GET',
  path: '/api/health',
  summary: 'Health Check',
  description: 'Check API and database health status',
  tags: ['System'],
  responses: {
    200: { description: 'Service is healthy' },
    500: { description: 'Service is degraded' },
  },
});

// API documentation endpoints
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(apiDocGenerator.generateOpenAPI());
});

app.get('/api/docs', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(apiDocGenerator.generateHTML());
});

app.get('/api/docs/stats', (req, res) => {
  res.json(apiDocGenerator.getStats());
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
app.use('/api/health', healthRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/advanced-analytics', advancedAnalyticsRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/config', configRoutes);

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

      // Initialize notification scheduler
      try {
        // eslint-disable-next-line global-require
        require('./src/utils/notificationScheduler');
        logger.info('Notification scheduler initialized');
      } catch (err) {
        logger.warn('Failed to initialize notification scheduler', { error: err.message });
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
