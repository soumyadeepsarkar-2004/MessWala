/**
 * Structured Logging Infrastructure
 * Enterprise-grade logging with levels, formatting, and monitoring
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

const LOG_LEVEL_NAMES = {
  0: 'DEBUG',
  1: 'INFO',
  2: 'WARN',
  3: 'ERROR',
  4: 'FATAL',
};

class Logger {
  constructor(name, minLevel = LOG_LEVELS.INFO) {
    this.name = name;
    this.minLevel = minLevel;
    this.requestContext = null;
  }

  /**
   * Set request context for correlation
   */
  setContext(requestId, userId = null, path = null) {
    this.requestContext = {
      requestId,
      userId,
      path,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clear context
   */
  clearContext() {
    this.requestContext = null;
  }

  /**
   * Format log message
   */
  formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    const context = this.requestContext ? ` [${this.requestContext.requestId}]` : '';
    
    return {
      timestamp,
      level: levelName,
      logger: this.name,
      context,
      message,
      data: Object.keys(data).length > 0 ? data : undefined,
      ...(this.requestContext && {
        userId: this.requestContext.userId,
        path: this.requestContext.path,
      }),
    };
  }

  /**
   * Write log to console and file
   */
  write(level, message, data = {}) {
    if (level < this.minLevel) return;

    const logEntry = this.formatMessage(level, message, data);
    const logLine = JSON.stringify(logEntry);

    // Console output
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m', // Green
      WARN: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m', // Red
      FATAL: '\x1b[35m', // Magenta
      RESET: '\x1b[0m',
    };

    const color = colors[LOG_LEVEL_NAMES[level]] || '';
    console.log(`${color}${logLine}${colors.RESET}`);

    // File output
    const logFile = path.join(logsDir, `${LOG_LEVEL_NAMES[level].toLowerCase()}.log`);
    fs.appendFileSync(logFile, logLine + '\n');

    // Also write all logs to combined.log
    const combinedLogFile = path.join(logsDir, 'combined.log');
    fs.appendFileSync(combinedLogFile, logLine + '\n');

    // Rotate logs if they get too large (>50MB)
    this.rotateLogsIfNeeded(logFile);
  }

  /**
   * Simple log rotation
   */
  rotateLogsIfNeeded(logFile) {
    try {
      const stats = fs.statSync(logFile);
      if (stats.size > 50 * 1024 * 1024) {
        // 50MB
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = logFile.replace('.log', `-${timestamp}.log`);
        fs.renameSync(logFile, backupFile);
      }
    } catch (err) {
      // Ignore rotation errors
    }
  }

  debug(message, data) {
    this.write(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data) {
    this.write(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data) {
    this.write(LOG_LEVELS.WARN, message, data);
  }

  error(message, data) {
    this.write(LOG_LEVELS.ERROR, message, data);
  }

  fatal(message, data) {
    this.write(LOG_LEVELS.FATAL, message, data);
  }
}

// Global logger instance
const globalLogger = new Logger('MessWala', LOG_LEVELS.INFO);

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  // Set context
  globalLogger.setContext(requestId, req.user?.id, req.path);

  // Log incoming request
  globalLogger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id,
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;

    globalLogger.info('Outgoing response', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });

    return originalJson.call(this, data);
  };

  next();
}

/**
 * Error logging middleware
 */
function errorLogger(err, req, res, next) {
  const duration = Date.now() - (req.startTime || Date.now());

  globalLogger.error('Request error', {
    method: req.method,
    path: req.path,
    status: err.statusCode || 500,
    errorCode: err.errorCode,
    message: err.message,
    duration: `${duration}ms`,
    userId: req.user?.id,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });

  next(err);
}

/**
 * Get logger instance for a module
 */
function getLogger(moduleName) {
  return new Logger(moduleName, LOG_LEVELS[process.env.LOG_LEVEL || 'INFO']);
}

module.exports = {
  Logger,
  globalLogger,
  getLogger,
  requestLogger,
  errorLogger,
  LOG_LEVELS,
};
