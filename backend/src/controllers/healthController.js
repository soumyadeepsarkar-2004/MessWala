/**
 * Health Check Controller
 * Provides comprehensive health status for monitoring and deployment checks
 */

const mongoose = require('mongoose');
const { getLogger } = require('../utils/logger');

const logger = getLogger('HealthCheck');

/**
 * Get overall system health status
 */
exports.getHealthStatus = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {},
    };

    // Check database connectivity
    const dbStatus = mongoose.connection.readyState;
    health.checks.database = {
      status: dbStatus === 1 ? 'connected' : 'disconnected',
      readyState: dbStatus, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    };
    if (dbStatus !== 1) {
      health.status = 'degraded';
    }

    // Check environment configuration
    const envChecks = {
      jwtConfigured: !!process.env.JWT_SECRET,
      mongoConfigured: !!process.env.MONGO_URI,
      frontendUrlConfigured: !!process.env.FRONTEND_URL,
      notificationConfigured:
        !!(
          (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) ||
          (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
        ),
    };

    health.checks.environment = envChecks;

    // Check required services
    health.checks.services = {
      email: {
        configured: !!(
          process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD
        ),
        status: process.env.SMTP_EMAIL ? 'available' : 'not-configured',
      },
      whatsapp: {
        configured: !!(
          process.env.TWILIO_ACCOUNT_SID &&
          process.env.TWILIO_AUTH_TOKEN &&
          process.env.TWILIO_PHONE_NUMBER
        ),
        status:
          process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
            ? 'available'
            : 'not-configured',
      },
    };

    // Check node environment
    health.checks.node = {
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heapTotal:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      },
    };

    // If database or critical service is down, return degraded
    if (!envChecks.mongoConfigured || !envChecks.jwtConfigured) {
      health.status = 'unhealthy';
    }

    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

/**
 * Readiness probe (for Kubernetes/Docker health checks)
 * Returns 200 only if system is fully ready to handle traffic
 */
exports.getReadiness = async (req, res) => {
  try {
    // Check critical components
    const isReady =
      mongoose.connection.readyState === 1 &&
      process.env.JWT_SECRET &&
      process.env.MONGO_URI &&
      process.env.FRONTEND_URL;

    if (isReady) {
      res.status(200).json({
        ready: true,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        ready: false,
        timestamp: new Date().toISOString(),
        checks: {
          database: mongoose.connection.readyState === 1,
          jwtConfigured: !!process.env.JWT_SECRET,
          mongoConfigured: !!process.env.MONGO_URI,
          frontendConfigured: !!process.env.FRONTEND_URL,
        },
      });
    }
  } catch (error) {
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

/**
 * Liveness probe (for Kubernetes)
 * Simple ping endpoint to check if service is running
 */
exports.getLiveness = (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Deployment verification check
 * Comprehensive check for pre-deployment validation
 */
exports.getDeploymentStatus = async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      checks: {
        required: {
          jwtSecret: {
            configured: !!process.env.JWT_SECRET,
            secure: process.env.JWT_SECRET
              ? process.env.JWT_SECRET.length >= 32
              : false,
            recommendation:
              'Minimum 64 characters for production security',
          },
          mongoUri: {
            configured: !!process.env.MONGO_URI,
            isAtlasUri: process.env.MONGO_URI?.includes('mongodb+srv://'),
          },
          frontendUrl: {
            configured: !!process.env.FRONTEND_URL,
            isHttps: process.env.FRONTEND_URL?.startsWith('https://'),
            recommendation:
              'Must use HTTPS in production for security',
          },
        },
        optional: {
          emailNotifications: {
            configured: !!(
              process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD
            ),
            status:
              process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD
                ? 'enabled'
                : 'disabled',
          },
          whatsappNotifications: {
            configured: !!(
              process.env.TWILIO_ACCOUNT_SID &&
              process.env.TWILIO_AUTH_TOKEN &&
              process.env.TWILIO_PHONE_NUMBER
            ),
            status:
              process.env.TWILIO_ACCOUNT_SID &&
              process.env.TWILIO_AUTH_TOKEN &&
              process.env.TWILIO_PHONE_NUMBER
                ? 'enabled'
                : 'disabled',
          },
          backupEnabled: {
            status: process.env.BACKUP_ENABLED !== 'false' ? 'enabled' : 'disabled',
          },
        },
        critical: {
          database: {
            connected: mongoose.connection.readyState === 1,
            readyState: mongoose.connection.readyState,
            description:
              ['disconnected', 'connected', 'connecting', 'disconnecting'][
                mongoose.connection.readyState
              ],
          },
        },
      },
    };

    // Determine overall status
    const allRequiredConfigured = Object.values(
      status.checks.required,
    ).every((check) => check.configured);

    const isProduction = process.env.NODE_ENV === 'production';
    const hasSecureJwt =
      status.checks.required.jwtSecret.secure ||
      !isProduction;

    status.ready =
      allRequiredConfigured &&
      status.checks.critical.database.connected &&
      hasSecureJwt;

    // Generate recommendations
    status.recommendations = [];

    if (isProduction && !status.checks.required.frontendUrl.isHttps) {
      status.recommendations.push('Use HTTPS for FRONTEND_URL in production');
    }

    if (
      isProduction &&
      !status.checks.required.jwtSecret.secure
    ) {
      status.recommendations.push(
        'Increase JWT_SECRET length to at least 64 characters for production',
      );
    }

    if (!status.checks.optional.emailNotifications.configured) {
      status.recommendations.push(
        'Configure email notifications (Gmail) for better user experience',
      );
    }

    if (!status.checks.optional.whatsappNotifications.configured) {
      status.recommendations.push(
        'Configure WhatsApp notifications (Twilio) as backup notification channel',
      );
    }

    res.status(status.ready ? 200 : 400).json(status);
  } catch (error) {
    res.status(500).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};
