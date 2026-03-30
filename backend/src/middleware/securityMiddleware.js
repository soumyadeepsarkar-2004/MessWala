/**
 * Production Security Middleware
 * Implements security headers, input validation, and attack prevention
 */

const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const { getLogger } = require('../utils/logger');

const logger = getLogger('SecurityMiddleware');

/**
 * Input sanitization middleware
 * Prevents XSS attacks and NoSQL injection
 */
function sanitizationMiddleware(req, res, next) {
  // MongoDB Sanitization - prevents NoSQL injection
  mongoSanitize()(req, res, () => {
    // XSS Sanitization - prevents XSS attacks
    xss()(req, res, next);
  });
}

/**
 * Security headers middleware
 * Additional security headers beyond Helmet
 */
function securityHeadersMiddleware(req, res, next) {
  // Prevent clickjacking (X-Frame-Options already set by Helmet)
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Transport Security
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (formerly Feature Policy)
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');

  next();
}

/**
 * Request size limiting middleware
 * Prevents large payload attacks
 */
function requestSizeLimitMiddleware(req, res, next) {
  // Express body parser limits should be set in server.js
  // This is an additional check
  const maxSize = 10 * 1024 * 1024; // 10MB

  let size = 0;
  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > maxSize) {
      logger.warn('Request payload too large', {
        size,
        maxSize,
        ip: req.ip,
      });
      res.status(413).json({
        success: false,
        error: 'Payload too large (max 10MB)',
      });
      req.pause();
    }
  });

  next();
}

/**
 * Input validation middleware
 * Validates common input patterns
 */
function inputValidationMiddleware(req, res, next) {
  // Check for suspicious patterns in user input
  const suspiciousPatterns = [/eval\(/i, /script/i, /onclick/i, /onerror/i, /javascript:/i];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some((pattern) => pattern.test(value));
    }
    return false;
  };

  // Check query params
  for (const [key, value] of Object.entries(req.query || {})) {
    if (checkValue(value)) {
      logger.warn('Suspicious input detected in query', {
        key,
        value: value.substring(0, 50),
        ip: req.ip,
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid input detected',
      });
    }
  }

  // Check body params
  const checkBody = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj || {})) {
      if (checkValue(value)) {
        logger.warn('Suspicious input detected in body', {
          path: `${path}.${key}`,
          ip: req.ip,
        });
        return false;
      }
      if (typeof value === 'object' && value !== null) {
        if (!checkBody(value, `${path}.${key}`)) {
          return false;
        }
      }
    }
    return true;
  };

  if (!checkBody(req.body)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected',
    });
  }

  next();
}

/**
 * Database query injection prevention
 * Prevents common NoSQL injection patterns
 */
function mongoInjectionPrevention(req, res, next) {
  const preventionPatterns = {
    // Prevent { $ne: null } and similar operators
    query: /\$ne|\$where|\$regex|\$js|\$function/i,
  };

  const checkForInjection = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    for (const [key, value] of Object.entries(obj)) {
      // Check keys for operators
      if (preventionPatterns.query.test(key)) {
        return true;
      }

      // Recursively check nested objects
      if (typeof value === 'object' && value !== null) {
        if (checkForInjection(value)) {
          return true;
        }
      }
    }

    return false;
  };

  // Check query and body for injection attempts
  if (checkForInjection(req.query) || checkForInjection(req.body)) {
    logger.warn('Potential NoSQL injection attempt detected', {
      ip: req.ip,
      path: req.path,
    });
    return res.status(400).json({
      success: false,
      error: 'Invalid query parameters',
    });
  }

  next();
}

/**
 * Environment-specific security middleware
 */
function environmentSecurityMiddleware(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    // Additional production-only checks

    // Block access to sensitive paths
    const sensitivePatterns = [/\.env/, /admin\/debug/, /internal\//, /\.git\//, /backup\//];

    if (sensitivePatterns.some((pattern) => pattern.test(req.path))) {
      logger.warn('Attempt to access sensitive path', {
        path: req.path,
        ip: req.ip,
      });
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }
  }

  next();
}

/**
 * Security middleware initialization
 * Applies all security middleware in correct order
 */
function initializeSecurityMiddleware(app) {
  // Order matters - apply middlewares in sequence

  // 1. Request size limiting (prevent DoS attacks)
  app.use(requestSizeLimitMiddleware);

  // 2. Sanitization (prevent injection attacks)
  app.use(sanitizationMiddleware);

  // 3. Security headers
  app.use(securityHeadersMiddleware);

  // 4. Input validation
  app.use(inputValidationMiddleware);

  // 5. Database injection prevention
  app.use(mongoInjectionPrevention);

  // 6. Environment-specific security
  app.use(environmentSecurityMiddleware);

  logger.info('✅ Security middleware initialized');
}

module.exports = {
  initializeSecurityMiddleware,
  sanitizationMiddleware,
  securityHeadersMiddleware,
  requestSizeLimitMiddleware,
  inputValidationMiddleware,
  mongoInjectionPrevention,
  environmentSecurityMiddleware,
};
