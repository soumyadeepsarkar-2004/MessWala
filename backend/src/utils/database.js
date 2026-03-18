/**
 * Database Optimization & Query Building Utilities
 * Includes indexing strategy, query optimization, and performance monitoring
 */

const mongoose = require('mongoose');
const { getLogger } = require('./logger');

const logger = getLogger('Database');

/**
 * Database Indexes Configuration
 * Define all indexes with their purposes
 */
const INDEXES_CONFIG = {
  User: [
    { fields: { email: 1 }, options: { unique: true, sparse: true } },
    { fields: { collegeId: 1 }, options: { sparse: true } },
    { fields: { role: 1 }, options: {} },
    { fields: { isApproved: 1 }, options: {} },
    { fields: { createdAt: -1 }, options: {} },
  ],
  Expense: [
    { fields: { date: -1 }, options: {} },
    { fields: { category: 1 }, options: {} },
    { fields: { addedBy: 1 }, options: {} },
    { fields: { date: -1, category: 1 }, options: {} }, // Compound index
    { fields: { hostelId: 1, date: -1 }, options: {} }, // Multi-tenant
    { fields: { createdAt: -1 }, options: {} },
  ],
  MealAttendance: [
    { fields: { date: -1 }, options: {} },
    { fields: { userId: 1, date: -1 }, options: {} }, // Compound
    { fields: { mealType: 1 }, options: {} },
    { fields: { hostelId: 1, date: -1 }, options: {} },
  ],
  Feedback: [
    { fields: { date: -1 }, options: {} },
    { fields: { userId: 1, date: -1 }, options: {} },
    { fields: { mealType: 1 }, options: {} },
    { fields: { rating: 1 }, options: {} },
    { fields: { hostelId: 1, date: -1 }, options: {} },
  ],
  Menu: [
    { fields: { date: -1 }, options: {} },
    { fields: { mealType: 1 }, options: {} },
    { fields: { hostelId: 1, date: -1 }, options: {} },
  ],
  Task: [
    { fields: { status: 1 }, options: {} },
    { fields: { dueDate: -1 }, options: {} },
    { fields: { priority: 1 }, options: {} },
    { fields: { createdAt: -1 }, options: {} },
  ],
  ComplianceDocument: [
    { fields: { docType: 1 }, options: {} },
    { fields: { status: 1 }, options: {} },
    { fields: { hostelId: 1 }, options: {} },
    { fields: { createdAt: -1 }, options: {} },
    { fields: { hostelId: 1, docType: 1, status: 1 }, options: {} }, // Compound
  ],
  Hostel: [
    { fields: { code: 1 }, options: { unique: true } },
    { fields: { admin: 1 }, options: {} },
    { fields: { status: 1 }, options: {} },
  ],
};

/**
 * Initialize all database indexes
 */
async function initializeIndexes() {
  try {
    const models = mongoose.modelNames();

    for (const modelName of models) {
      if (INDEXES_CONFIG[modelName]) {
        const Model = mongoose.model(modelName);

        for (const index of INDEXES_CONFIG[modelName]) {
          try {
            await Model.collection.createIndex(index.fields, index.options);
            logger.debug(`Index created for ${modelName}`, { fields: index.fields });
          } catch (err) {
            logger.warn(`Could not create index for ${modelName}`, { error: err.message });
          }
        }
      }
    }

    logger.info('Database indexes initialized');
  } catch (err) {
    logger.error('Failed to initialize indexes', { error: err.message });
  }
}

/**
 * Query Helper Class
 */
class QueryBuilder {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Filter by fields
   */
  filter() {
    const queryObj = { ...this.queryString };

    // Remove special fields
    const removeFields = ['sort', 'fields', 'page', 'limit'];
    removeFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering with operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * Sort results
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  /**
   * Select specific fields
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }

    return this;
  }

  /**
   * Pagination
   */
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;

    return this;
  }

  /**
   * Execute query with timing
   */
  async execute() {
    const startTime = Date.now();
    const result = await this.query;
    const duration = Date.now() - startTime;

    logger.debug('Query executed', { duration: `${duration}ms`, resultCount: result.length });

    return result;
  }

  /**
   * Get count
   */
  async count() {
    return await this.query.countDocuments();
  }
}

/**
 * Transaction Helper
 */
class Transaction {
  constructor(session = null) {
    this.session = session;
  }

  /**
   * Start transaction
   */
  async start() {
    if (!this.session) {
      this.session = await mongoose.startSession();
    }

    this.session.startTransaction();
    logger.debug('Transaction started', { sessionId: this.session.id });

    return this.session;
  }

  /**
   * Commit transaction
   */
  async commit() {
    try {
      await this.session.commitTransaction();
      logger.debug('Transaction committed', { sessionId: this.session.id });
    } catch (err) {
      logger.error('Transaction commit failed', { error: err.message });
      throw err;
    } finally {
      this.session.endSession();
    }
  }

  /**
   * Rollback transaction
   */
  async rollback() {
    try {
      await this.session.abortTransaction();
      logger.debug('Transaction rolled back', { sessionId: this.session.id });
    } catch (err) {
      logger.error('Transaction rollback failed', { error: err.message });
    } finally {
      this.session.endSession();
    }
  }

  /**
   * Execute operation with automatic commit/rollback
   */
  async execute(operation) {
    try {
      await this.start();
      const result = await operation(this.session);
      await this.commit();

      return result;
    } catch (err) {
      await this.rollback();
      throw err;
    }
  }
}

/**
 * Database connection pooling
 */
const connectionPool = {
  connections: [],
  maxConnections: 10,
  activeConnections: 0,

  async getConnection() {
    if (this.activeConnections < this.maxConnections) {
      const conn = mongoose.connection;
      this.activeConnections++;
      return conn;
    }

    // Wait for connection
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.activeConnections < this.maxConnections) {
          clearInterval(checkInterval);
          this.activeConnections++;
          resolve(mongoose.connection);
        }
      }, 100);
    });
  },

  releaseConnection() {
    if (this.activeConnections > 0) {
      this.activeConnections--;
    }
  },
};

/**
 * Query performance monitoring
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }

  recordQuery(modelName, duration, resultCount) {
    if (!this.metrics[modelName]) {
      this.metrics[modelName] = {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: Infinity,
      };
    }

    const metric = this.metrics[modelName];
    metric.count++;
    metric.totalDuration += duration;
    metric.avgDuration = metric.totalDuration / metric.count;
    metric.maxDuration = Math.max(metric.maxDuration, duration);
    metric.minDuration = Math.min(metric.minDuration, duration);

    // Alert on slow queries
    if (duration > 1000) {
      logger.warn(`Slow query detected on ${modelName}`, {
        duration: `${duration}ms`,
        resultCount,
      });
    }
  }

  getMetrics() {
    return this.metrics;
  }

  resetMetrics() {
    this.metrics = {};
  }
}

const performanceMonitor = new PerformanceMonitor();

/**
 * Aggregation pipeline builder
 */
class AggregationBuilder {
  constructor(Model) {
    this.Model = Model;
    this.pipeline = [];
  }

  /**
   * Add match stage
   */
  match(conditions) {
    this.pipeline.push({ $match: conditions });
    return this;
  }

  /**
   * Add group stage
   */
  group(groupBy, fields = {}) {
    this.pipeline.push({
      $group: {
        _id: groupBy,
        ...fields,
      },
    });

    return this;
  }

  /**
   * Add sort stage
   */
  sort(sortBy) {
    this.pipeline.push({ $sort: sortBy });
    return this;
  }

  /**
   * Add skip stage
   */
  skip(count) {
    this.pipeline.push({ $skip: count });
    return this;
  }

  /**
   * Add limit stage
   */
  limit(count) {
    this.pipeline.push({ $limit: count });
    return this;
  }

  /**
   * Execute aggregation
   */
  async execute() {
    const startTime = Date.now();
    const result = await this.Model.aggregate(this.pipeline);
    const duration = Date.now() - startTime;

    performanceMonitor.recordQuery(this.Model.collection.name, duration, result.length);

    return result;
  }

  /**
   * Get pipeline
   */
  getPipeline() {
    return this.pipeline;
  }
}

/**
 * Bulk operation helper
 */
class BulkOperations {
  constructor(Model) {
    this.Model = Model;
    this.operations = [];
  }

  /**
   * Add insert operation
   */
  insertOne(document) {
    this.operations.push({ insertOne: { document } });
    return this;
  }

  /**
   * Add update operation
   */
  updateOne(filter, update) {
    this.operations.push({ updateOne: { filter, update: { $set: update } } });
    return this;
  }

  /**
   * Add delete operation
   */
  deleteOne(filter) {
    this.operations.push({ deleteOne: { filter } });
    return this;
  }

  /**
   * Execute all operations
   */
  async execute() {
    if (this.operations.length === 0) {
      return { acknowledged: true, modifiedCount: 0 };
    }

    try {
      const result = await this.Model.collection.bulkWrite(this.operations, {
        ordered: false,
      });

      logger.info(`Bulk operations completed for ${this.Model.collection.name}`, {
        insertedCount: result.insertedCount,
        modifiedCount: result.modifiedCount,
        deletedCount: result.deletedCount,
      });

      return result;
    } catch (err) {
      logger.error('Bulk operations failed', { error: err.message });
      throw err;
    }
  }
}

module.exports = {
  INDEXES_CONFIG,
  initializeIndexes,
  QueryBuilder,
  Transaction,
  connectionPool,
  PerformanceMonitor,
  performanceMonitor,
  AggregationBuilder,
  BulkOperations,
};
