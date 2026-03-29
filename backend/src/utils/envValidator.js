/**
 * Environment Variable Validator
 * Validates all required environment variables for production deployment
 */

const { getLogger } = require('./logger');

const logger = getLogger('EnvValidator');

/**
 * Required environment variables with their types and descriptions
 */
const ENV_SCHEMA = {
  // Core Application
  NODE_ENV: {
    required: true,
    type: 'string',
    enum: ['development', 'staging', 'production'],
    description: 'Application environment',
    default: 'development',
  },
  PORT: {
    required: false,
    type: 'number',
    description: 'Server port',
    default: 5000,
  },

  // Database
  MONGO_URI: {
    required: true,
    type: 'string',
    description: 'MongoDB connection URI',
    sensitive: true,
  },

  // JWT & Security
  JWT_SECRET: {
    required: true,
    type: 'string',
    minLength: 32,
    description: 'JWT signing secret (minimum 32 characters)',
    sensitive: true,
  },
  JWT_EXPIRE: {
    required: false,
    type: 'string',
    description: 'JWT expiration time',
    default: '30d',
  },

  // Frontend
  FRONTEND_URL: {
    required: true,
    type: 'string',
    description: 'Frontend application URL',
  },

  // Gmail Notifications
  SMTP_EMAIL: {
    required: false,
    type: 'string',
    description: 'Gmail address for sending emails',
  },
  SMTP_PASSWORD: {
    required: false,
    type: 'string',
    description: 'Gmail app password',
    sensitive: true,
  },

  // Twilio WhatsApp
  TWILIO_ACCOUNT_SID: {
    required: false,
    type: 'string',
    description: 'Twilio account SID',
    sensitive: true,
  },
  TWILIO_AUTH_TOKEN: {
    required: false,
    type: 'string',
    description: 'Twilio auth token',
    sensitive: true,
  },
  TWILIO_PHONE_NUMBER: {
    required: false,
    type: 'string',
    description: 'Twilio WhatsApp phone number',
  },
  TWILIO_TEST_PHONE: {
    required: false,
    type: 'string',
    description: 'Test phone number for WhatsApp sandbox',
  },

  // Deployment Platforms
  RENDER_EXTERNAL_URL: {
    required: false,
    type: 'string',
    description: 'Render external URL (if deploying on Render)',
  },
  VERCEL: {
    required: false,
    type: 'boolean',
    description: 'Set by Vercel automatically',
  },

  // Backup & Storage
  BACKUP_ENABLED: {
    required: false,
    type: 'boolean',
    description: 'Enable automated database backups',
    default: 'true',
  },

  // Redis (Optional, for caching)
  REDIS_URL: {
    required: false,
    type: 'string',
    description: 'Redis connection URL',
    sensitive: true,
  },

  // Monitoring & Logging
  LOG_LEVEL: {
    required: false,
    type: 'string',
    enum: ['error', 'warn', 'info', 'debug'],
    description: 'Logging level',
    default: 'info',
  },
};

/**
 * Validate environment variables
 * @throws {Error} If required variables are missing or invalid
 * @returns {Object} Validated environment configuration
 */
function validateEnvironment() {
  const errors = [];
  const warnings = [];
  const config = {};

  logger.info('Validating environment variables...');

  for (const [key, schema] of Object.entries(ENV_SCHEMA)) {
    const value = process.env[key];

    // Check if required variable is missing
    if (schema.required && !value) {
      errors.push(`Missing required environment variable: ${key}`);
      continue;
    }

    // Use default if available
    if (!value && schema.default !== undefined) {
      config[key] = schema.default;
      logger.debug(`Using default for ${key}: ${schema.default}`);
      continue;
    }

    // Skip optional variables that are not set
    if (!value && !schema.required) {
      logger.debug(`Optional variable not set: ${key}`);
      continue;
    }

    // Type validation
    if (value) {
      let typedValue = value;

      if (schema.type === 'number') {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
          errors.push(`Invalid type for ${key}: expected number, got ${value}`);
          continue;
        }
        typedValue = num;
      } else if (schema.type === 'boolean') {
        typedValue = value === 'true' || value === '1' || value === true;
      }

      // Enum validation
      if (schema.enum && !schema.enum.includes(typedValue)) {
        errors.push(
          `Invalid value for ${key}: must be one of [${schema.enum.join(', ')}], got ${value}`,
        );
        continue;
      }

      // Min length validation
      if (schema.minLength && value.length < schema.minLength) {
        errors.push(
          `${key} is too short: minimum ${schema.minLength} characters required`,
        );
        continue;
      }

      config[key] = typedValue;
    }
  }

  // Production-specific validations
  if (process.env.NODE_ENV === 'production') {
    // Enforce HTTPS in production
    if (config.FRONTEND_URL && !config.FRONTEND_URL.startsWith('https://')) {
      warnings.push('FRONTEND_URL should use HTTPS in production');
    }

    // Check for secure JWT secret
    if (config.JWT_SECRET && config.JWT_SECRET.length < 64) {
      warnings.push(
        'JWT_SECRET should be longer than 64 characters for production security',
      );
    }

    // Warn if notification services not configured
    if (!config.SMTP_EMAIL && !config.TWILIO_ACCOUNT_SID) {
      warnings.push('No notification service configured (Gmail or Twilio)');
    }
  }

  // Log results
  if (errors.length > 0) {
    logger.error('Environment validation FAILED:');
    errors.forEach((err) => logger.error(`  ✗ ${err}`));
    throw new Error(`Environment validation failed with ${errors.length} errors`);
  }

  if (warnings.length > 0) {
    logger.warn('Environment validation warnings:');
    warnings.forEach((warn) => logger.warn(`  ⚠ ${warn}`));
  }

  // Log success with masked sensitive data
  logger.info('✅ Environment validation PASSED');
  const summary = {};
  for (const [key, value] of Object.entries(config)) {
    const schema = ENV_SCHEMA[key];
    summary[key] = schema && schema.sensitive ? '***MASKED***' : value;
  }
  logger.debug('Environment configuration:', summary);

  return config;
}

/**
 * Get environment configuration
 * @returns {Object} Configuration object
 */
function getConfig() {
  return validateEnvironment();
}

/**
 * Check if specific service is configured
 * @param {string} service - Service name (gmail, twilio, redis)
 * @returns {boolean} True if service is configured
 */
function isServiceConfigured(service) {
  switch (service.toLowerCase()) {
    case 'gmail':
      return !!process.env.SMTP_EMAIL && !!process.env.SMTP_PASSWORD;
    case 'twilio':
      return (
        !!process.env.TWILIO_ACCOUNT_SID &&
        !!process.env.TWILIO_AUTH_TOKEN &&
        !!process.env.TWILIO_PHONE_NUMBER
      );
    case 'redis':
      return !!process.env.REDIS_URL;
    default:
      return false;
  }
}

module.exports = {
  validateEnvironment,
  getConfig,
  isServiceConfigured,
  ENV_SCHEMA,
};
