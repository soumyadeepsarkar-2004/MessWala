/**
 * Intelligent Caching Layer
 * Provides in-memory caching with TTL, invalidation strategies, and analytics
 */

const { getLogger } = require('./logger');

const logger = getLogger('Cache');

class CacheManager {
  constructor(options = {}) {
    this.store = new Map();
    this.ttls = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      sets: 0,
    };
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.defaultTTL || 3600000; // 1 hour
  }

  /**
   * Get a value from cache
   */
  get(key) {
    if (!this.store.has(key)) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    const ttl = this.ttls.get(key);
    if (ttl && Date.now() > ttl) {
      this.store.delete(key);
      this.ttls.delete(key);
      this.stats.misses++;
      logger.debug(`Cache key expired: ${key}`);
      return null;
    }

    this.stats.hits++;
    return this.store.get(key);
  }

  /**
   * Set a value in cache with optional TTL
   */
  set(key, value, ttl = this.defaultTTL) {
    // Evict oldest if cache is full
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
      this.ttls.delete(oldestKey);
      this.stats.evictions++;
      logger.debug(`Cache evicted: ${oldestKey}`);
    }

    this.store.set(key, value);
    if (ttl) {
      this.ttls.set(key, Date.now() + ttl);
    }
    this.stats.sets++;
    logger.debug(`Cache set: ${key}, TTL: ${ttl}ms`);
  }

  /**
   * Delete a cache key
   */
  delete(key) {
    this.store.delete(key);
    this.ttls.delete(key);
  }

  /**
   * Invalidate by pattern (e.g., "expense:*")
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let count = 0;

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        this.ttls.delete(key);
        count++;
      }
    }

    logger.debug(`Cache invalidated ${count} keys matching pattern: ${pattern}`);
    return count;
  }

  /**
   * Clear all cache
   */
  clear() {
    const size = this.store.size;
    this.store.clear();
    this.ttls.clear();
    logger.info(`Cache cleared: ${size} items removed`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.store.size,
      hitRate: total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) + '%' : '0%',
      maxSize: this.maxSize,
    };
  }

  /**
   * Warmup cache with initial data (useful for expensive queries)
   */
  async warmup(key, fetchFn, ttl) {
    try {
      const data = await fetchFn();
      this.set(key, data, ttl);
      logger.info(`Cache warmed up: ${key}`);
      return data;
    } catch (err) {
      logger.error(`Cache warmup failed for ${key}`, { error: err.message });
      throw err;
    }
  }
}

// Singleton instance
const cacheManager = new CacheManager();

/**
 * Middleware to cache GET requests
 */
function cacheMiddleware(options = {}) {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${req.path}:${JSON.stringify(req.query)}`;
    const cached = cacheManager.get(cacheKey);

    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      if (res.statusCode === 200) {
        cacheManager.set(cacheKey, data, options.ttl);
        res.set('X-Cache', 'MISS');
      }
      return originalJson(data);
    };

    next();
  };
}

module.exports = { cacheManager, cacheMiddleware };
