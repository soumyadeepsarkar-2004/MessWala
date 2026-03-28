/**
 * Advanced Monitoring & Alerting System
 * Tracks system health, performance degradation, and anomalies
 */

const { getLogger } = require('./logger');

const logger = getLogger('Monitor');

class MonitoringSystem {
  constructor(options = {}) {
    this.alerts = [];
    this.thresholds = {
      errorRate: options.errorRateThreshold || 0.05, // 5%
      responseTime: options.responseTimeThreshold || 1000, // 1 second
      memoryUsage: options.memoryUsageThreshold || 0.9, // 90%
      cpuUsage: options.cpuUsageThreshold || 0.85, // 85%
      errorCount: options.errorCountThreshold || 10, // per minute
      dbSlowQuery: options.dbSlowQueryThreshold || 500, // 500ms
    };
    this.metrics = {
      health: 'healthy',
      lastCheck: new Date(),
      errorRatePercent: 0,
      avgResponseTime: 0,
      uptime: process.uptime(),
    };
    this.history = [];
    this.maxHistorySize = 1000;
  }

  /**
   * Record metrics and check thresholds
   */
  recordMetrics(data) {
    const metric = {
      timestamp: new Date(),
      ...data,
    };

    this.history.push(metric);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    // Check thresholds
    this.checkThresholds(data);
  }

  /**
   * Check if any thresholds are exceeded
   */
  checkThresholds(data) {
    const newAlerts = [];

    if (data.errorRate > this.thresholds.errorRate) {
      newAlerts.push({
        type: 'HIGH_ERROR_RATE',
        severity: 'warning',
        message: `Error rate ${(data.errorRate * 100).toFixed(2)}% exceeds threshold`,
        value: data.errorRate,
        threshold: this.thresholds.errorRate,
      });
    }

    if (data.avgResponseTime > this.thresholds.responseTime) {
      newAlerts.push({
        type: 'SLOW_RESPONSE',
        severity: 'warning',
        message: `Average response time ${data.avgResponseTime.toFixed(0)}ms exceeds threshold`,
        value: data.avgResponseTime,
        threshold: this.thresholds.responseTime,
      });
    }

    if (data.memoryUsagePercent > this.thresholds.memoryUsage) {
      newAlerts.push({
        type: 'HIGH_MEMORY',
        severity: 'critical',
        message: `Memory usage ${(data.memoryUsagePercent * 100).toFixed(1)}% is critical`,
        value: data.memoryUsagePercent,
        threshold: this.thresholds.memoryUsage,
      });
    }

    if (data.slowQueries > this.thresholds.errorCount) {
      newAlerts.push({
        type: 'SLOW_QUERIES',
        severity: 'warning',
        message: `Detected ${data.slowQueries} slow database queries`,
        value: data.slowQueries,
        threshold: this.thresholds.errorCount,
      });
    }

    // Add new alerts
    newAlerts.forEach((alert) => {
      this.alerts.push({
        ...alert,
        timestamp: new Date(),
      });
      logger.warn(`Alert triggered: ${alert.type}`, { alert });
    });

    // Update health status
    this.updateHealthStatus();
  }

  /**
   * Update overall health status
   */
  updateHealthStatus() {
    const recentAlerts = this.alerts.filter((a) => {
      const age = Date.now() - a.timestamp;
      return age < 300000; // 5 minutes
    });

    const criticalAlerts = recentAlerts.filter((a) => a.severity === 'critical');
    const warningAlerts = recentAlerts.filter((a) => a.severity === 'warning');

    if (criticalAlerts.length > 0) {
      this.metrics.health = 'critical';
    } else if (warningAlerts.length > 2) {
      this.metrics.health = 'degraded';
    } else {
      this.metrics.health = 'healthy';
    }

    this.metrics.lastCheck = new Date();
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(minutes = 5) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.alerts.filter((a) => a.timestamp > cutoff);
  }

  /**
   * Get health summary
   */
  getHealthSummary() {
    return {
      status: this.metrics.health,
      lastCheck: this.metrics.lastCheck,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      recentAlerts: this.getRecentAlerts(),
      metricsHistory: this.history.slice(-10), // Last 10 metrics
    };
  }

  /**
   * Alert fatigue prevention - batch similar alerts
   */
  getSummaryAlerts() {
    const alertsByType = {};

    this.getRecentAlerts().forEach((alert) => {
      if (!alertsByType[alert.type]) {
        alertsByType[alert.type] = { count: 0, first: alert, latest: alert };
      }
      alertsByType[alert.type].count++;
      alertsByType[alert.type].latest = alert;
    });

    return Object.values(alertsByType);
  }
}

// Singleton instance
const monitoringSystem = new MonitoringSystem();

module.exports = { monitoringSystem, MonitoringSystem };
