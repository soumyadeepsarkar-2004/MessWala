/**
 * Backup & Recovery Management
 * Database backup, recovery procedures, and disaster recovery
 */

const mongoose = require('mongoose');
const { getLogger } = require('./logger');
const fs = require('fs');
const path = require('path');

const logger = getLogger('Backup');

/**
 * Backup Configuration
 */
const BACKUP_CONFIG = {
  enabled: process.env.BACKUP_ENABLED !== 'false',
  frequency: process.env.BACKUP_FREQUENCY || 'daily', // daily, weekly, monthly
  retention: parseInt(process.env.BACKUP_RETENTION || '30'), // days
  backupDir: process.env.BACKUP_DIR || path.join(__dirname, '../../backups'),
  maxConcurrentBackups: 2,
  compressionEnabled: true,
};

/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_CONFIG.backupDir)) {
    fs.mkdirSync(BACKUP_CONFIG.backupDir, { recursive: true });
    logger.info('Backup directory created', { path: BACKUP_CONFIG.backupDir });
  }
}

/**
 * Collection-level backup
 */
class CollectionBackup {
  constructor(modelName) {
    this.modelName = modelName;
    this.model = mongoose.model(modelName);
    this.timestamp = new Date().toISOString();
  }

  /**
   * Create backup for collection
   */
  async createBackup() {
    try {
      const startTime = Date.now();

      // Query all documents
      const documents = await this.model.find({}).lean();

      const backupData = {
        collection: this.modelName,
        timestamp: this.timestamp,
        count: documents.length,
        documents,
      };

      const filename = `${this.modelName}-${this.timestamp.replace(/[:]/g, '-')}.json`;
      const filepath = path.join(BACKUP_CONFIG.backupDir, filename);

      // Write backup file
      fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

      const duration = Date.now() - startTime;

      logger.info('Collection backup created', {
        collection: this.modelName,
        count: documents.length,
        file: filepath,
        duration: `${duration}ms`,
      });

      return {
        collection: this.modelName,
        filename,
        filepath,
        count: documents.length,
        timestamp: this.timestamp,
      };
    } catch (err) {
      logger.error('Collection backup failed', {
        collection: this.modelName,
        error: err.message,
      });

      throw err;
    }
  }

  /**
   * Restore collection from backup
   */
  async restoreFromBackup(filepath) {
    try {
      const backupData = JSON.parse(fs.readFileSync(filepath, 'utf8'));

      // Validate backup structure
      if (!backupData.documents || !Array.isArray(backupData.documents)) {
        throw new Error('Invalid backup file format');
      }

      // Clear existing data
      const deletedCount = await this.model.deleteMany({});

      logger.info('Existing data cleared', {
        collection: this.modelName,
        deletedCount: deletedCount.deletedCount,
      });

      // Insert backup data
      const result = await this.model.insertMany(backupData.documents);

      logger.info('Collection restored', {
        collection: this.modelName,
        restoredCount: result.length,
        backupFile: filepath,
      });

      return {
        collection: this.modelName,
        restoredCount: result.length,
        timestamp: backupData.timestamp,
      };
    } catch (err) {
      logger.error('Collection restore failed', {
        collection: this.modelName,
        error: err.message,
      });

      throw err;
    }
  }
}

/**
 * Full database backup manager
 */
class DatabaseBackupManager {
  constructor() {
    this.backups = [];
  }

  /**
   * Create full database backup
   */
  async createFullBackup() {
    try {
      ensureBackupDir();

      const models = mongoose.modelNames();
      const backupTimestamp = new Date().toISOString();
      const backupResults = [];

      logger.info('Starting full database backup', { modelCount: models.length });

      for (const modelName of models) {
        try {
          const backup = new CollectionBackup(modelName);
          const result = await backup.createBackup();
          backupResults.push(result);
        } catch (err) {
          logger.warn(`Failed to backup ${modelName}`, { error: err.message });
          // Continue with other collections
        }
      }

      // Create backup manifest
      const manifest = {
        timestamp: backupTimestamp,
        collections: backupResults,
        totalCollections: backupResults.length,
      };

      const manifestPath = path.join(
        BACKUP_CONFIG.backupDir,
        `manifest-${backupTimestamp.replace(/[:]/g, '-')}.json`
      );

      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

      logger.info('Full database backup completed', {
        collections: backupResults.length,
        manifest: manifestPath,
      });

      this.backups.push(manifest);
      this.cleanOldBackups();

      return manifest;
    } catch (err) {
      logger.error('Full database backup failed', { error: err.message });
      throw err;
    }
  }

  /**
   * List available backups
   */
  listBackups() {
    try {
      ensureBackupDir();

      const files = fs.readdirSync(BACKUP_CONFIG.backupDir);
      const manifests = files
        .filter((f) => f.startsWith('manifest-') && f.endsWith('.json'))
        .map((f) => {
          const filepath = path.join(BACKUP_CONFIG.backupDir, f);
          const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
          return {
            filename: f,
            ...data,
          };
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return manifests;
    } catch (err) {
      logger.error('Failed to list backups', { error: err.message });
      return [];
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupTimestamp) {
    try {
      const backups = this.listBackups();
      const backup = backups.find((b) => b.timestamp === backupTimestamp);

      if (!backup) {
        throw new Error(`Backup not found: ${backupTimestamp}`);
      }

      logger.info('Starting restore from backup', {
        timestamp: backupTimestamp,
        collections: backup.collections.length,
      });

      const restoreResults = [];

      for (const collectionBackup of backup.collections) {
        try {
          const backup = new CollectionBackup(collectionBackup.collection);
          const filepath = collectionBackup.filepath;
          const result = await backup.restoreFromBackup(filepath);
          restoreResults.push(result);
        } catch (err) {
          logger.error(`Failed to restore ${collectionBackup.collection}`, {
            error: err.message,
          });
          // Continue with other collections
        }
      }

      logger.info('Restore completed', {
        timestamp: backupTimestamp,
        restoredCollections: restoreResults.length,
      });

      return {
        timestamp: backupTimestamp,
        restoredCollections: restoreResults,
      };
    } catch (err) {
      logger.error('Restore from backup failed', { error: err.message });
      throw err;
    }
  }

  /**
   * Clean old backups
   */
  cleanOldBackups() {
    try {
      ensureBackupDir();

      const files = fs.readdirSync(BACKUP_CONFIG.backupDir);
      const now = Date.now();
      const maxAge = BACKUP_CONFIG.retention * 24 * 60 * 60 * 1000; // Convert days to ms

      let deletedCount = 0;

      for (const file of files) {
        const filepath = path.join(BACKUP_CONFIG.backupDir, file);
        const stats = fs.statSync(filepath);
        const age = now - stats.mtime.getTime();

        if (age > maxAge) {
          fs.unlinkSync(filepath);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        logger.info('Old backups cleaned', {
          deletedCount,
          retentionDays: BACKUP_CONFIG.retention,
        });
      }
    } catch (err) {
      logger.warn('Backup cleanup failed', { error: err.message });
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(backupTimestamp) {
    try {
      const backups = this.listBackups();
      const backup = backups.find((b) => b.timestamp === backupTimestamp);

      if (!backup) {
        return { valid: false, error: 'Backup not found' };
      }

      let validCount = 0;
      let invalidCount = 0;

      for (const collectionBackup of backup.collections) {
        try {
          const filepath = collectionBackup.filepath;
          const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

          if (data.documents && Array.isArray(data.documents)) {
            validCount++;
          } else {
            invalidCount++;
          }
        } catch (err) {
          invalidCount++;
        }
      }

      const isValid = invalidCount === 0;

      logger.info('Backup verification completed', {
        timestamp: backupTimestamp,
        valid: isValid,
        validCollections: validCount,
        invalidCollections: invalidCount,
      });

      return {
        valid: isValid,
        timestamp: backupTimestamp,
        validCollections: validCount,
        invalidCollections: invalidCount,
      };
    } catch (err) {
      logger.error('Backup verification failed', { error: err.message });

      return {
        valid: false,
        error: err.message,
      };
    }
  }
}

const backupManager = new DatabaseBackupManager();

/**
 * Schedule periodic backups
 */
function schedulePeriodicBackups() {
  const frequency = BACKUP_CONFIG.frequency;

  let interval;

  switch (frequency) {
    case 'daily':
      interval = 24 * 60 * 60 * 1000; // 24 hours
      break;
    case 'weekly':
      interval = 7 * 24 * 60 * 60 * 1000; // 7 days
      break;
    case 'monthly':
      interval = 30 * 24 * 60 * 60 * 1000; // 30 days
      break;
    default:
      interval = 24 * 60 * 60 * 1000; // Default to daily
  }

  setInterval(() => {
    backupManager
      .createFullBackup()
      .catch((err) => logger.error('Scheduled backup failed', { error: err.message }));
  }, interval);

  logger.info('Periodic backups scheduled', {
    frequency,
    intervalMs: interval,
  });
}

module.exports = {
  BACKUP_CONFIG,
  CollectionBackup,
  DatabaseBackupManager,
  backupManager,
  schedulePeriodicBackups,
};
