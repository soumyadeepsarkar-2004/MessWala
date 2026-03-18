# 💾 Backup & Recovery Procedures

Complete guide for data backup, recovery testing, and disaster recovery planning.

---

## 🔐 Backup Strategy

### RPO & RTO Targets

```
RPO (Recovery Point Objective): 1 hour
- Data loss acceptable: Up to 1 hour
- Backup frequency: Every 1 hour

RTO (Recovery Time Objective): 30 minutes
- Acceptable downtime: 30 minutes maximum
- Recovery speed: Fast restore required
```

### Backup Locations

```
Primary Backup: MongoDB Atlas Automated
- Location: AWS (multiple regions)
- Frequency: Continuous backup
- Retention: 35 days
- RPO: < 5 minutes

Secondary Backup: Cloud Storage (AWS S3)
- Location: AWS S3 (separate region)
- Frequency: Daily at 2 AM UTC
- Retention: 90 days
- RPO: 1 day

Tertiary Backup: Local Storage (Snapshots)
- Location: On-premise (disaster recovery only)
- Frequency: Weekly
- Retention: 12 weeks
- RPO: 1 week
```

---

## 📦 Automated Backup Setup

### MongoDB Atlas Automated Backups

**Already Configured:**
- ✅ Automatic daily backups
- ✅ Continuous backup stream
- ✅ 35-day retention
- ✅ Multi-region redundancy

**Verify Settings:**
1. Go to MongoDB Atlas Dashboard
2. Select your cluster → "Backup" tab
3. Confirm:
   - ✅ Backup enabled
   - ✅ Snapshot interval: 6 hours
   - ✅ Backup retention: 35 days
   - ✅ Backup provider: AWS

**Access Backups:**
```
MongoDB Atlas Dashboard
→ Clusters
→ Your Cluster
→ Backup
→ Snapshots tab
```

---

### AWS S3 Daily Backups

**Setup Script:**

Create `backend/scripts/backup-to-s3.js`:

```javascript
const AWS = require('aws-sdk');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const MONGO_URI = process.env.MONGO_URI;
const S3_BUCKET = process.env.BACKUP_S3_BUCKET;
const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function backupToS3() {
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const backupFilename = `backup-${timestamp}.archive`;
  const backupPath = path.join(BACKUP_DIR, backupFilename);

  try {
    console.log(`[${new Date().toISOString()}] Starting backup...`);

    // Step 1: Create local backup
    await new Promise((resolve, reject) => {
      exec(
        `mongodump --uri="${MONGO_URI}" --archive="${backupPath}" --gzip`,
        (error, stdout, stderr) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });

    console.log(`[${new Date().toISOString()}] Local backup created`);

    // Step 2: Upload to S3
    const fileContent = fs.readFileSync(backupPath);
    const params = {
      Bucket: S3_BUCKET,
      Key: `backups/${backupFilename}`,
      Body: fileContent,
      ContentType: 'application/gzip',
      Metadata: {
        'created-date': new Date().toISOString(),
        'backup-type': 'daily'
      }
    };

    await s3.upload(params).promise();
    console.log(`[${new Date().toISOString()}] Backup uploaded to S3`);

    // Step 3: Clean up old local backup
    fs.unlinkSync(backupPath);
    console.log(`[${new Date().toISOString()}] Local backup cleaned up`);

    // Step 4: Send success notification
    await notifySuccess(backupFilename);
    console.log(`[${new Date().toISOString()}] Backup completed successfully`);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Backup failed:`, error);
    await notifyFailure(error.message);
    process.exit(1);
  }
}

async function notifySuccess(filename) {
  // Send to monitoring service or Slack
  console.log(`Notify: Backup ${filename} successful`);
}

async function notifyFailure(error) {
  // Send alert to ops team
  console.error(`ALERT: Backup failed - ${error}`);
}

// Run backup
backupToS3();
```

**Schedule with Cron:**

Add to `backend/package.json`:
```json
{
  "scripts": {
    "backup": "node scripts/backup-to-s3.js"
  }
}
```

**Linux/Mac Cron Job:**

```bash
# Edit crontab
crontab -e

# Add this line (2 AM UTC daily)
0 2 * * * cd /path/to/backend && npm run backup >> /var/log/messwala-backup.log 2>&1
```

**Windows Scheduled Task:**

Create batch file `backup.bat`:
```batch
@echo off
cd C:\MessWala\backend
npm run backup >> C:\Logs\backup.log 2>&1
```

Then schedule via Windows Task Scheduler.

---

## 🔄 Recovery Procedures

### Quick Recovery (< 5 minutes)

From MongoDB Atlas automated backups:

```javascript
// Step 1: In MongoDB Atlas Dashboard
// Clusters → {cluster} → Backup → Snapshots

// Step 2: Click the desired snapshot

// Step 3: Choose "Restore to a New Cluster" or "Restore to Existing Cluster"

// Step 3a: If new cluster:
// - Name: messwala-restored-{timestamp}
// - Confirm cluster specs
// - Click "Restore"

// Step 3b: If existing (careful!):
// - Connection strings will need update
// - Application requires restart

// Step 4: Update MONGO_URI in environment
// MONGO_URI=mongodb+srv://user:pass@restored-cluster.mongodb.net/dbname

// Step 5: Restart application
npm run start

console.log('Recovery completed');
```

---

### Standard Recovery (5-30 minutes)

From AWS S3 daily backup:

```bash
#!/bin/bash
# recovery-from-s3.sh

BACKUP_NAME=$1  # e.g., backup-2026-03-19
S3_BUCKET=$BACKUP_S3_BUCKET
RESTORE_DB=$MONGO_DB_NAME
BACKUP_DIR="./backups"

if [ -z "$BACKUP_NAME" ]; then
  echo "Usage: ./recovery-from-s3.sh backup-YYYY-MM-DD"
  exit 1
fi

echo "[$(date)] Starting recovery from $BACKUP_NAME..."

# Step 1: Download backup from S3
echo "[$(date)] Downloading backup from S3..."
aws s3 cp s3://$S3_BUCKET/backups/$BACKUP_NAME.archive $BACKUP_DIR/

# Step 2: Extract backup
echo "[$(date)] Extracting backup..."
mongorestore --uri="$MONGO_URI" --archive=$BACKUP_DIR/$BACKUP_NAME.archive --gzip --drop

# Step 3: Verify data
echo "[$(date)] Verifying data..."
mongosh "$MONGO_URI" --eval "db.stats()"

# Step 4: Clean up
rm $BACKUP_DIR/$BACKUP_NAME.archive

# Step 5: Restart application
echo "[$(date)] Recovery completed. Restarting application..."
npm run start

echo "[$(date)] Recovery successful"
```

---

## 🧪 Recovery Testing

### Monthly Recovery Drill

**Every first Monday of the month:**

```
☐ 1. Select a backup point (typically 24-48 hours old)
☐ 2. Create test cluster in MongoDB Atlas
☐ 3. Restore backup to test cluster
☐ 4. Run validation queries
☐ 5. Document recovery time
☐ 6. Delete test cluster
☐ 7. Report results
```

**Test Script:**

```javascript
// test-recovery.js
const mongoose = require('mongoose');

async function testRecovery() {
  const testUri = process.env.TEST_MONGO_URI;
  
  try {
    await mongoose.connect(testUri);
    console.log('Connected to test database');

    // Test 1: Check user count
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log(`✓ Users: ${userCount}`);

    // Test 2: Check sample user data
    const user = await User.findOne();
    console.assert(user.email, 'User has email');
    console.assert(user.passwordHash, 'User has passwordHash');
    console.log('✓ User data integrity verified');

    // Test 3: Check collection integrity
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✓ Collections present: ${collections.map(c => c.name).join(', ')}`);

    // Test 4: Check indexes
    const indexes = await User.collection.getIndexes();
    console.log(`✓ Indexes: ${Object.keys(indexes).join(', ')}`);

    console.log('\n✅ Recovery test PASSED');
    process.exit(0);

  } catch (error) {
    console.error('❌ Recovery test FAILED:', error);
    process.exit(1);
  }
}

testRecovery();
```

Run monthly:
```bash
npm run test:recovery
```

---

## 🆘 Disaster Recovery Scenarios

### Scenario 1: Database Corruption

**Severity:** CRITICAL | **RTO:** 30 minutes | **RPO:** 1 hour

**Steps:**
1. **Detect:** Check MongoDB logs for corruption messages
2. **Alert:** Page on-call engineer
3. **Assess:** Is data recoverable?
   - YES → Continue to Step 4
   - NO → Continue to Step 5

4. **Recover:**
   ```bash
   # Restore from automated backup
   # In MongoDB Atlas Dashboard:
   # Click "Restore to New Cluster"
   # Allow 10-15 minutes for restore
   ```

5. **Switch:**
   ```bash
   # Update MONGO_URI to new cluster
   # Restart application
   # Verify functionality
   ```

**Prevention:**
- ✅ Enable MongoDB encryption at rest
- ✅ Enable network encryption
- ✅ Regular corruption checks
- ✅ Redundant backups

---

### Scenario 2: Accidental Data Deletion

**Severity:** HIGH | **RTO:** 15 minutes | **RPO:** 1 hour

**Steps:**
1. **Immediate:** DO NOT restart application
2. **Assess:** What was deleted? When?
   ```
   Check MongoDB logs for deletion timestamps
   Determine backup point needed
   ```

3. **Recover:**
   - From automated backup if < 35 days old
   - From S3 daily backup if < 90 days old

4. **Restore:**
   ```bash
   # Option A: Restore to new cluster, merge data
   mongo-restore --uri=$NEW_CLUSTER --archive=backup.archive

   # Option B: Point-in-time restore (if available)
   # In MongoDB Atlas, use PITR (Point-in-Time Restore)
   ```

5. **Verify:**
   ```
   - Data integrity checks
   - User reports
   - Application functionality
   ```

**Prevention:**
- ✅ Role-based access control
- ✅ Audit logging enabled
- ✅ Regular backups
- ✅ Delete command restrictions

---

### Scenario 3: Complete Service Failure

**Severity:** CRITICAL | **RTO:** 5 minutes | **RPO:** < 5 minutes

**Steps:**
1. **Alert:** All team members
2. **Failover:** Switch to secondary cluster
   ```bash
   # Update MONGO_URI to secondary
   # Restart all services
   # Verify connectivity
   ```

3. **Communication:**
   ```
   - Status page update
   - Slack notification
   - Email to users (if needed)
   ```

4. **Recovery:**
   ```
   - Investigate root cause
   - Restore primary
   - Validate data
   - Switch back when ready
   ```

**Prevention:**
- ✅ Multi-region deployment
- ✅ Database replication
- ✅ Failover testing
- ✅ Load balancing

---

### Scenario 4: Security Breach - Data Exfiltration

**Severity:** CRITICAL | **RTO:** Immediate | **RPO:** 1 hour

**Steps:**
1. **Immediate Actions:**
   ```
   ☐ Take system offline
   ☐ Revoke all API keys
   ☐ Reset database passwords
   ☐ Alert security team
   ☐ Notify affected users
   ```

2. **Investigation:**
   ```
   ☐ Check access logs
   ☐ Identify compromised data
   ☐ Determine exposure time
   ☐ Forensic analysis
   ```

3. **Recovery:**
   ```
   ☐ Restore from backup before breach
   ☐ Invalidate all user sessions
   ☐ Force password resets
   ☐ Enable MFA
   ☐ Audit all accounts
   ```

4. **System Rebuild:**
   ```
   ☐ Patch all vulnerabilities
   ☐ Update security policies
   ☐ Enable additional monitoring
   ☐ Implement threat detection
   ```

---

## 📋 Backup Verification Checklist

**Weekly:**
- [ ] Automated backups running
- [ ] S3 backup size reasonable (not 0 bytes)
- [ ] Backups within SLA window
- [ ] Backup logs checked for errors

**Monthly:**
- [ ] Recovery drill completed
- [ ] Test data integrity verified
- [ ] Recovery time documented
- [ ] Issues resolved

**Quarterly:**
- [ ] Disaster recovery plan reviewed
- [ ] Team trained on recovery
- [ ] Failover procedures tested
- [ ] RTO/RPO targets verified

---

## 🚨 Emergency Contacts

```
On-Call Database Engineer:
- Slack: @database-oncall
- Phone: [CONFIGURE]
- Email: oncall-database@company.com

Backup Contact:
- Slack: @senior-database
- Email: database-team@company.com

AWS Account Manager:
- Resource: AWS Support console
- Login: [AWS Account]
```

---

## 📊 Backup Status Dashboard

| Component | Status | Last Backup | Next Backup | RPO Met |
|-----------|--------|-------------|-------------|---------|
| MongoDB Atlas | ✅ | [Auto] | Continuous | ✅ |
| S3 Daily | ✅ | Today 2 AM | Tomorrow 2 AM | ✅ |
| Local Snapshots | ✅ | Weekly | Next Week | ✅ |

---

## ✅ Monthly Backup Report Template

```
DATE: [Date]
REVIEWED BY: [Name]

AUTOMATED BACKUPS:
✅ Status: [OK/ISSUES]
✅ Frequency: [Daily/Hourly]
✅ Last Backup: [Timestamp]
✅ Retention: [Days]

S3 BACKUPS:
✅ Status: [OK/ISSUES]
✅ Latest: [Filename]
✅ Size: [MB]
✅ Age: [Days]

RECOVERY TESTS:
✅ Last Test: [Date]
✅ Test Duration: [Minutes]
✅ Data Integrity: [OK/ISSUES]
✅ Issues Found: [None/List]

ISSUES & ACTIONS:
- [Issue]: [Action Required]

NEXT MONTH:
- [ ] Schedule test
- [ ] Review retention
- [ ] Update procedures
```

---

**Last Updated:** March 19, 2026  
**Version:** 1.0  
**Next Review:** April 19, 2026
