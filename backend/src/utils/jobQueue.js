/**
 * Async Job Queue & Background Processing
 * Handles long-running tasks without blocking the main thread
 */

const EventEmitter = require('events');
const { getLogger } = require('./logger');

const logger = getLogger('JobQueue');

class JobQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    this.jobs = new Map();
    this.queue = [];
    this.processing = false;
    this.concurrency = options.concurrency || 3;
    this.activeJobs = 0;
    this.stats = {
      completed: 0,
      failed: 0,
      totalProcessed: 0,
      avgDuration: 0,
      durations: [],
    };
  }

  /**
   * Add a job to the queue
   */
  enqueue(jobId, fn, options = {}) {
    const job = {
      id: jobId,
      fn,
      priority: options.priority || 'normal',
      retries: options.retries || 3,
      timeout: options.timeout || 30000,
      createdAt: new Date(),
      status: 'queued',
      attempts: 0,
    };

    this.jobs.set(jobId, job);
    this.queue.push(job);

    // Sort by priority
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    logger.info(`Job enqueued: ${jobId}`, { priority: job.priority, queueSize: this.queue.length });
    this.emit('jobEnqueued', job);
    this.processQueue();
  }

  /**
   * Process the job queue
   */
  async processQueue() {
    if (this.processing || this.activeJobs >= this.concurrency) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.activeJobs < this.concurrency && this.queue.length > 0) {
      const job = this.queue.shift();
      this.activeJobs++;
      this.processJob(job);
    }

    this.processing = false;
  }

  /**
   * Process a single job with timeout and retry logic
   */
  async processJob(job) {
    job.status = 'running';
    job.startedAt = new Date();
    job.attempts++;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Job timeout')), job.timeout),
    );

    try {
      logger.debug(`Job started: ${job.id}`, { attempt: job.attempts });
      this.emit('jobStarted', job);

      await Promise.race([job.fn(), timeoutPromise]);

      job.status = 'completed';
      job.completedAt = new Date();
      const duration = job.completedAt - job.startedAt;

      this.stats.completed++;
      this.stats.durations.push(duration);
      if (this.stats.durations.length > 100) {
        this.stats.durations.shift();
      }
      this.stats.avgDuration =
        this.stats.durations.reduce((a, b) => a + b, 0) / this.stats.durations.length;
      this.stats.totalProcessed++;

      logger.info(`Job completed: ${job.id}`, { duration: `${duration}ms` });
      this.emit('jobCompleted', job);
    } catch (err) {
      logger.error(`Job failed: ${job.id}`, { attempt: job.attempts, error: err.message });

      if (job.attempts < job.retries) {
        job.status = 'retryable';
        // Add back to queue with exponential backoff
        const delay = Math.min(10000, 1000 * Math.pow(2, job.attempts - 1));
        setTimeout(() => {
          job.status = 'queued';
          this.queue.unshift(job);
          this.processQueue();
        }, delay);
        this.emit('jobRetry', job);
      } else {
        job.status = 'failed';
        job.error = err.message;
        this.stats.failed++;
        logger.error(`Job exhausted retries: ${job.id}`, { attempts: job.attempts });
        this.emit('jobFailed', job);
      }
    } finally {
      this.activeJobs--;
      this.processQueue();
    }
  }

  /**
   * Wait for a job to complete
   */
  waitFor(jobId, timeout = 60000) {
    return new Promise((resolve, reject) => {
      const job = this.jobs.get(jobId);

      if (!job) {
        return reject(new Error(`Job not found: ${jobId}`));
      }

      if (job.status === 'completed') {
        return resolve(job);
      }

      if (job.status === 'failed') {
        return reject(new Error(`Job failed: ${job.error}`));
      }

      const onCompleted = (completedJob) => {
        if (completedJob.id === jobId) {
          cleanup();
          resolve(job);
        }
      };

      const onFailed = (failedJob) => {
        if (failedJob.id === jobId) {
          cleanup();
          reject(new Error(`Job failed: ${failedJob.error}`));
        }
      };

      const timeoutHandle = setTimeout(() => {
        cleanup();
        reject(new Error(`Job timeout: ${jobId}`));
      }, timeout);

      const cleanup = () => {
        this.off('jobCompleted', onCompleted);
        this.off('jobFailed', onFailed);
        clearTimeout(timeoutHandle);
      };

      this.on('jobCompleted', onCompleted);
      this.on('jobFailed', onFailed);
    });
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueSize: this.queue.length,
      activeJobs: this.activeJobs,
      concurrency: this.concurrency,
      stats: this.stats,
      jobs: Array.from(this.jobs.values()).map((job) => ({
        id: job.id,
        status: job.status,
        createdAt: job.createdAt,
        attempts: job.attempts,
      })),
    };
  }

  /**
   * Clear failed jobs
   */
  clearFailed() {
    const failed = Array.from(this.jobs.values()).filter((j) => j.status === 'failed');
    failed.forEach((job) => this.jobs.delete(job.id));
    logger.info(`Cleared ${failed.length} failed jobs`);
  }
}

// Singleton instance
const jobQueue = new JobQueue();

module.exports = { jobQueue, JobQueue };
