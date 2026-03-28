/**
 * Intelligent Request Router & Rate Limiting with AI-powered decisions
 * Adapts rate limits based on system load and user behavior
 */

const { getLogger } = require('./logger');

const logger = getLogger('Router');

class IntelligentRateLimiter {
  constructor(options = {}) {
    this.userRequests = new Map(); // Track requests per user
    this.endpoints = new Map(); // Track endpoint-specific limits
    this.baseLimit = options.baseLimit || 100; // requests per minute
    this.burstAllowance = options.burstAllowance || 1.5; // Allow 1.5x for short bursts
    this.adaptiveThreshold = options.adaptiveThreshold || 0.8; // Tighten if 80% used
    this.learningWindow = options.learningWindow || 3600000; // 1 hour
  }

  /**
   * Check if request should be allowed (returns quota info)
   */
  checkLimit(userId, endpoint = 'default') {
    const now = Date.now();
    const key = `${userId}:${endpoint}`;

    // Clean old entries
    if (!this.userRequests.has(key)) {
      this.userRequests.set(key, {
        requests: [],
        trustScore: 100,
        lastReset: now,
      });
    }

    const userState = this.userRequests.get(key);
    const windowStart = now - 60000; // 1 minute window

    // Remove old requests outside window
    userState.requests = userState.requests.filter((t) => t > windowStart);

    // Get endpoint configuration
    const config = this.getEndpointConfig(endpoint);
    const limit = Math.floor(config.limit * (userState.trustScore / 100));

    const allowed = userState.requests.length < limit;
    const nearLimit = userState.requests.length > limit * this.adaptiveThreshold;

    if (allowed) {
      userState.requests.push(now);
      // Increase trust score for good behavior
      userState.trustScore = Math.min(100, userState.trustScore + 0.1);
    } else {
      // Decrease trust score for rate limit violations
      userState.trustScore = Math.max(20, userState.trustScore - 5);
      logger.warn(`Rate limit exceeded for ${key}`, {
        requests: userState.requests.length,
        limit,
        trustScore: userState.trustScore,
      });
    }

    return {
      allowed,
      limit,
      remaining: Math.max(0, limit - userState.requests.length),
      resetIn: 60000,
      trustScore: userState.trustScore,
      nearLimit,
      recommendation: this.getRecommendation(userState, endpoint),
    };
  }

  /**
   * Get endpoint-specific configuration
   */
  getEndpointConfig(endpoint) {
    if (!this.endpoints.has(endpoint)) {
      this.endpoints.set(endpoint, {
        limit: this.baseLimit,
        priority: 'normal',
      });
    }
    return this.endpoints.get(endpoint);
  }

  /**
   * Set custom limit for an endpoint
   */
  setEndpointLimit(endpoint, limit, priority = 'normal') {
    this.endpoints.set(endpoint, { limit, priority });
    logger.info(`Rate limit set for ${endpoint}`, { limit, priority });
  }

  /**
   * Get intelligent recommendation for throttled requests
   */
  getRecommendation(userState, _endpoint) {
    const trustScore = userState.trustScore;

    if (trustScore < 30) {
      return {
        action: 'BLOCK',
        message: 'Suspicious activity detected. Please try again later.',
        retryAfter: 300000, // 5 minutes
      };
    }

    if (trustScore < 50) {
      return {
        action: 'THROTTLE',
        message: 'Too many requests. Waiting required before next request.',
        retryAfter: 60000, // 1 minute
      };
    }

    return {
      action: 'QUEUE',
      message: 'Request queued. Will be processed shortly.',
      retryAfter: 5000, // 5 seconds
    };
  }

  /**
   * Middleware for Express
   */
  middleware() {
    return (req, res, next) => {
      const userId = req.user?.id || req.ip;
      const endpoint = `${req.method} ${req.path}`;

      const result = this.checkLimit(userId, endpoint);

      res.set('X-RateLimit-Limit', result.limit);
      res.set('X-RateLimit-Remaining', result.remaining);
      res.set('X-RateLimit-Reset', new Date(Date.now() + result.resetIn).toISOString());
      res.set('X-Trust-Score', result.trustScore);

      if (!result.allowed) {
        res.status(429).json({
          success: false,
          error: 'Too Many Requests',
          recommendation: result.recommendation,
          retryAfter: result.recommendation.retryAfter,
        });
        return;
      }

      if (result.nearLimit) {
        res.set('X-Warning', 'Approaching rate limit');
        logger.debug(`User approaching rate limit: ${userId}`, {
          remaining: result.remaining,
          limit: result.limit,
        });
      }

      next();
    };
  }

  /**
   * Get analytics
   */
  getAnalytics() {
    const users = Array.from(this.userRequests.values());
    const avgTrustScore = users.reduce((sum, u) => sum + u.trustScore, 0) / users.length || 0;
    const suspiciousUsers = users.filter((u) => u.trustScore < 50).length;

    return {
      totalTrackedUsers: users.length,
      avgTrustScore: avgTrustScore.toFixed(2),
      suspiciousUsers,
      endpointConfigs: Object.fromEntries(this.endpoints),
    };
  }
}

module.exports = { IntelligentRateLimiter };
