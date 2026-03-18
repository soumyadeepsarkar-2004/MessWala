/**
 * Enterprise-Grade Error Handling System
 * Structured error codes, messages, and tracking
 */

class AppError extends Error {
  constructor(message, statusCode, errorCode = 'INTERNAL_ERROR', context = {}) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, context = {}) {
    super(message, 400, 'VALIDATION_ERROR', context);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', context = {}) {
    super(message, 401, 'AUTHENTICATION_ERROR', context);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions', context = {}) {
    super(message, 403, 'AUTHORIZATION_ERROR', context);
  }
}

class NotFoundError extends AppError {
  constructor(resource, id, context = {}) {
    const message = `${resource} with id ${id} not found`;
    super(message, 404, 'NOT_FOUND', { resource, id, ...context });
  }
}

class ConflictError extends AppError {
  constructor(message, context = {}) {
    super(message, 409, 'CONFLICT', context);
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests', retryAfter = 60, context = {}) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfter, ...context });
    this.retryAfter = retryAfter;
  }
}

class DatabaseError extends AppError {
  constructor(message, context = {}) {
    super(message, 500, 'DATABASE_ERROR', context);
  }
}

class InvalidOperationError extends AppError {
  constructor(message, context = {}) {
    super(message, 400, 'INVALID_OPERATION', context);
  }
}

/**
 * Error Code to Message Mapping
 */
const ERROR_MESSAGES = {
  // Authentication & Authorization
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PASSWORD: 'Password does not meet security requirements',
  WEAK_PASSWORD:
    'Password is too weak. Must contain uppercase, lowercase, number, and be at least 8 characters',
  EMAIL_EXISTS: 'Email already registered',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Authentication token has expired',
  TOKEN_INVALID: 'Invalid authentication token',
  TOKEN_MISSING: 'No authentication token provided',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
  ACCOUNT_PENDING_APPROVAL: 'Your account is pending approval',
  ACCOUNT_SUSPENDED: 'Your account has been suspended',

  // Validation Errors
  INVALID_DATE_FORMAT: 'Invalid date format (use YYYY-MM-DD)',
  INVALID_MONTH_FORMAT: 'Invalid month format (use YYYY-MM)',
  INVALID_DATE_RANGE: 'Start date must be before end date',
  INVALID_AMOUNT: 'Invalid amount (must be positive number)',
  INVALID_RATING: 'Rating must be between 1 and 5',
  INVALID_ENUM: 'Invalid value for enumerated field',
  INVALID_ID: 'Invalid resource ID format',
  REQUIRED_FIELD: 'Required field is missing',
  STRING_TOO_LONG: 'String exceeds maximum length',
  STRING_TOO_SHORT: 'String below minimum length',

  // Resource Errors
  RESOURCE_NOT_FOUND: 'Resource not found',
  USER_NOT_FOUND: 'User not found',
  EXPENSE_NOT_FOUND: 'Expense record not found',
  MENU_NOT_FOUND: 'Menu item not found',
  FEEDBACK_NOT_FOUND: 'Feedback record not found',
  TASK_NOT_FOUND: 'Task not found',
  HOSTEL_NOT_FOUND: 'Hostel not found',
  DOCUMENT_NOT_FOUND: 'Document not found',

  // Conflict Errors
  EMAIL_ALREADY_EXISTS: 'Email is already registered',
  DUPLICATE_ENTRY: 'Record already exists',
  DUPLICATE_ATTENDANCE: 'Attendance already marked for this meal',
  DUPLICATE_FEEDBACK: 'Feedback already submitted for this meal',

  // Operation Errors
  INVALID_OPERATION: 'Operation cannot be performed in current state',
  CANNOT_DELETE_ADMIN: 'Cannot delete admin user',
  CANNOT_MODIFY_PAST_EXPENSE: 'Cannot modify expenses older than 7 days',
  INVALID_TRANSITION: 'Invalid state transition',
  INSUFFICIENT_DATA: 'Insufficient data to complete operation',

  // Database Errors
  DATABASE_ERROR: 'Database operation failed',
  WRITE_CONFLICT: 'Write conflict occurred, please retry',
  TRANSACTION_FAILED: 'Transaction failed, all changes rolled back',

  // Rate Limiting
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  TOO_MANY_LOGIN_ATTEMPTS: 'Too many login attempts, please try again after 15 minutes',

  // Server Errors
  INTERNAL_ERROR: 'An internal server error occurred',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  DATABASE_UNAVAILABLE: 'Database connection unavailable',
};

/**
 * Global error handler middleware
 */
function errorHandler(err, _req, res, _next) {
  // Log error
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: _req.method,
    path: _req.path,
    ip: _req.ip,
    userId: _req.user?.id,
    errorCode: err.errorCode || 'UNKNOWN',
    message: err.message,
    statusCode: err.statusCode || 500,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  };

  console.error('[ERROR]', JSON.stringify(errorLog, null, 2));

  // Handle different error types
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errorCode: err.errorCode,
      ...(process.env.NODE_ENV !== 'production' && { context: err.context }),
    });
  }

  // MongoDB validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((error) => error.message);

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errorCode: 'VALIDATION_ERROR',
      details: messages,
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    return res.status(409).json({
      success: false,
      error: `${field} already exists`,
      errorCode: 'DUPLICATE_ENTRY',
      field,
    });
  }

  // MongoDB ID error
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid resource ID',
      errorCode: 'INVALID_ID',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token',
      errorCode: 'TOKEN_INVALID',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication token has expired',
      errorCode: 'TOKEN_EXPIRED',
    });
  }

  // Rate limit errors (from express-rate-limit)
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      errorCode: 'RATE_LIMIT_EXCEEDED',
      retryAfter: err.retryAfter || 60,
    });
  }

  // Generic server error
  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    errorCode: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { message: err.message }),
  });
}

/**
 * Async error wrapper - catches async errors in route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  InvalidOperationError,
  ERROR_MESSAGES,
  errorHandler,
  asyncHandler,
};
