/**
 * Performance Monitoring & Metrics Collection
 * Track API performance, database efficiency, and system health
 */

const { getLogger } = require('./logger');

const logger = getLogger('Performance');

class PerformanceMetrics {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        byEndpoint: {},
        byStatus: {},
        byMethod: {},
      },
      latency: {
        p50: 0,
        p95: 0,
        p99: 0,
        mean: 0,
        max: 0,
        samples: [],
      },
      database: {
        queries: 0,
        avgDuration: 0,
        slowQueries: 0,
      },
      errors: {
        total: 0,
        by5xxStatus: 0,
        by4xxStatus: 0,
      },
      uptime: new Date(),
    };
  }

  /**
   * Record request
   */
  recordRequest(method, path, statusCode, duration) {
    this.metrics.requests.total++;

    // By endpoint
    const endpoint = `${method} ${path}`;
    this.metrics.requests.byEndpoint[endpoint] =
      (this.metrics.requests.byEndpoint[endpoint] || 0) + 1;

    // By status
    this.metrics.requests.byStatus[statusCode] =
      (this.metrics.requests.byStatus[statusCode] || 0) + 1;

    // By method
    this.metrics.requests.byMethod[method] = (this.metrics.requests.byMethod[method] || 0) + 1;

    // Latency tracking
    this.recordLatency(duration);

    // Error tracking
    if (statusCode >= 500) {
      this.metrics.errors.by5xxStatus++;
      this.metrics.errors.total++;
    } else if (statusCode >= 400) {
      this.metrics.errors.by4xxStatus++;
      this.metrics.errors.total++;
    }
  }

  /**
   * Record latency
   */
  recordLatency(duration) {
    this.metrics.latency.samples.push(duration);

    // Keep only last 1000 samples to avoid memory bloat
    if (this.metrics.latency.samples.length > 1000) {
      this.metrics.latency.samples.shift();
    }

    this.metrics.latency.max = Math.max(this.metrics.latency.max, duration);

    // Calculate percentiles
    this.calculatePercentiles();
  }

  /**
   * Calculate percentiles
   */
  calculatePercentiles() {
    const sorted = this.metrics.latency.samples.sort((a, b) => a - b);
    const len = sorted.length;

    if (len === 0) {
      return;
    }

    this.metrics.latency.mean = sorted.reduce((a, b) => a + b, 0) / len;
    this.metrics.latency.p50 = sorted[Math.floor(len * 0.5)];
    this.metrics.latency.p95 = sorted[Math.floor(len * 0.95)];
    this.metrics.latency.p99 = sorted[Math.floor(len * 0.99)];
  }

  /**
   * Record database query
   */
  recordDatabaseQuery(duration, queryType = 'unknown') {
    this.metrics.database.queries++;

    if (duration > 1000) {
      this.metrics.database.slowQueries++;

      if (this.metrics.database.slowQueries % 10 === 0) {
        logger.warn('Slow database query detected', {
          duration: `${duration}ms`,
          queryType,
          totalSlowQueries: this.metrics.database.slowQueries,
        });
      }
    }
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    const uptime = Math.floor((new Date() - this.metrics.uptime) / 1000);

    return {
      ...this.metrics,
      uptime: `${uptime}s`,
      health: this.calculateHealth(),
    };
  }

  /**
   * Calculate system health score
   */
  calculateHealth() {
    let score = 100;

    // Deduct for 5xx errors
    if (this.metrics.errors.by5xxStatus > 0) {
      score -= Math.min(50, this.metrics.errors.by5xxStatus);
    }

    // Deduct for slow queries
    if (this.metrics.database.slowQueries > 100) {
      score -= Math.min(30, Math.floor(this.metrics.database.slowQueries / 10));
    }

    // Deduct for high latency (p95 > 500ms)
    if (this.metrics.latency.p95 > 500) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics.requests = {
      total: 0,
      byEndpoint: {},
      byStatus: {},
      byMethod: {},
    };
    this.metrics.latency.samples = [];
    this.metrics.uptime = new Date();
  }
}

const performanceMetrics = new PerformanceMetrics();

/**
 * Performance monitoring middleware
 */
function performanceMonitoringMiddleware(req, res, next) {
  const startTime = Date.now();

  // Override res.json and res.send
  const originalJson = res.json;
  const originalSend = res.send;

  res.json = function (data) {
    const duration = Date.now() - startTime;
    performanceMetrics.recordRequest(req.method, req.path, res.statusCode, duration);

    if (duration > 1000) {
      logger.warn('Slow request', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }

    return originalJson.call(this, data);
  };

  res.send = function (data) {
    const duration = Date.now() - startTime;
    performanceMetrics.recordRequest(req.method, req.path, res.statusCode, duration);

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Health check endpoint data
 */
function getHealthStatus() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    metrics: performanceMetrics.getMetrics(),
    checks: {
      database: 'operational',
      cache: 'operational',
      api: performanceMetrics.calculateHealth() > 50 ? 'operational' : 'degraded',
    },
  };
}

/**
 * Alert on health degradation
 */
function checkHealthAlerts() {
  const metrics = performanceMetrics.getMetrics();

  // Alert if p95 latency > 1000ms
  if (metrics.latency.p95 > 1000) {
    logger.warn('High latency alert', {
      p95: `${metrics.latency.p95}ms`,
      p99: `${metrics.latency.p99}ms`,
    });
  }

  // Alert if 5xx error rate > 1%
  const errorRate = metrics.errors.by5xxStatus / metrics.requests.total;
  if (errorRate > 0.01) {
    logger.error('High error rate alert', {
      errorRate: `${(errorRate * 100).toFixed(2)}%`,
      count: metrics.errors.by5xxStatus,
    });
  }

  // Alert if slow queries > 10%
  const slowQueryRate = metrics.database.slowQueries / metrics.database.queries;
  if (slowQueryRate > 0.1) {
    logger.warn('High slow query rate alert', {
      slowQueryRate: `${(slowQueryRate * 100).toFixed(2)}%`,
      count: metrics.database.slowQueries,
    });
  }
}

module.exports = {
  PerformanceMetrics,
  performanceMetrics,
  performanceMonitoringMiddleware,
  getHealthStatus,
  checkHealthAlerts,
};
