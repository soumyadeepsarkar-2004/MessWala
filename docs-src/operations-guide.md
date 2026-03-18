# MessWala Enterprise Operations Guide

**Version:** 2.5.0  
**Last Updated:** March 18, 2026  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Infrastructure & Deployment](#infrastructure--deployment)
3. [Database Operations](#database-operations)
4. [Security & Compliance](#security--compliance)
5. [Monitoring & Performance](#monitoring--performance)
6. [Backup & Recovery](#backup--recovery)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [SLA & Performance Targets](#sla--performance-targets)

---

## System Architecture

### Enterprise Stack

**Backend:**
- Node.js 18+
- Express.js 4.21+
- MongoDB 7 (Atlas or Self-Hosted)
- Clustering: Node.js built-in cluster module ready

**Frontend:**
- React 18+
- Vite 5.0+
- Tailwind CSS 3+
- React Testing Library + Vitest

**Infrastructure:**
- Docker & Docker Compose (containerized)
- Render (backend deployment)
- Vercel (frontend deployment)
- GitHub Pages (documentation)

### Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│ Client Layer (React SPA @ Vercel)                   │
├─────────────────────────────────────────────────────┤
│ CDN & Edge Caching (Vercel Edge Network)            │
├─────────────────────────────────────────────────────┤
│ API Layer (Express @ Render)                        │
│ - Request Logging & Monitoring                      │
│ - Rate Limiting & Security                          │
│ - Input Validation & Sanitization                   │
├─────────────────────────────────────────────────────┤
│ Business Logic Layer                                │
│ - Controllers & Services                            │
│ - Transaction Management                            │
│ - Error Handling                                    │
├─────────────────────────────────────────────────────┤
│ Data Access Layer (Mongoose ODM)                    │
│ - Query Optimization                                │
│ - Indexing Strategy                                 │
│ - Connection Pooling                                │
├─────────────────────────────────────────────────────┤
│ Persistence Layer (MongoDB)                         │
│ - Multi-tenant Isolation                            │
│ - ACID Transactions                                 │
│ - Replication (Master-Slave)                        │
└─────────────────────────────────────────────────────┘
```

---

## Infrastructure & Deployment

### Environment Configuration

```bash
# Backend Environment Variables (DO NOT commit actual values)
# Store sensitive values in .env.local or GitHub Secrets
NODE_ENV=production
PORT=5000
MONGO_URI=<your-mongodb-atlas-uri-here>
JWT_SECRET=<your-secure-256-bit-secret-here>
JWT_EXPIRE=30d
GOOGLE_CLIENT_ID=<your-google-client-id-here>
GOOGLE_CLIENT_SECRET=<your-google-client-secret-here>
FRONTEND_URL=https://mess-walah.vercel.app
LOG_LEVEL=INFO
BACKUP_ENABLED=true
BACKUP_FREQUENCY=daily
BACKUP_RETENTION=30
```

### MongoDB Connection

For MongoDB Atlas:
1. Create a cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user with strong password
3. Whitelist your IP addresses
4. Get your connection string (MONGO_URI)
5. Never commit credentials to version control

### Docker Deployment

```bash
# Build and run full stack
docker-compose up --build

# Production build
docker-compose -f docker-compose.prod.yml up

# Check service health
docker ps
docker logs backend
docker logs frontend
```

### Kubernetes Deployment (Optional)

```yaml
# Deploy to K8s
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/mongodb-statefulset.yaml
```

### Auto-Scaling Configuration

```yaml
# Horizontal Pod Autoscaling (K8s)
minReplicas: 2
maxReplicas: 10
targetCPUUtilizationPercentage: 70
```

---

## Database Operations

### Index Strategy

**Indexes Created:**
- User: `email` (unique), `role`, `isApproved`, `createdAt`
- Expense: `date` (compound with category), `addedBy`, `hostelId`
- MealAttendance: `userId` + `date`, `mealType`, `hostelId`
- Feedback: `date`, `rating`, `hostelId`

**Verify Indexes:**
```javascript
db.users.getIndexes();
db.expenses.getIndexes();
// Check query performance
db.expenses.find({date: {$gte: "2026-03-01"}}).explain("executionStats");
```

### Query Optimization

```javascript
// Good: Uses index
db.expenses.find({date: {$gte: ISODate("2026-01-01")}})
  .sort({date: -1})
  .limit(10);

// Bad: Full scan
db.expenses.find({description: /test/})
  .sort({date: -1});

// Solution: Add text index
db.expenses.createIndex({description: "text", date: -1});
```

### Transaction Support

```javascript
const session = db.getMongo().startSession();
session.startTransaction();

try {
  // Multiple operations with ACID guarantees
  db.expenses.insertOne({...}, {session});
  db.meals.updateOne({...}, {...}, {session});
  session.commitTransaction();
} catch (err) {
  session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

### Backup Procedures

**Automated Daily Backups:**
```bash
# Backup runs automatically at 2 AM UTC
# Location: backend/backups/
# Retention: 30 days

# Manual backup
curl -X POST http://localhost:5000/api/admin/backup \
  -H "Authorization: Bearer $TOKEN"

# View backups
curl http://localhost:5000/api/admin/backups

# Restore from backup
curl -X POST http://localhost:5000/api/admin/restore/2026-03-18T02:00:00Z \
  -H "Authorization: Bearer $TOKEN"
```

### MongoDB Atlas Operations

**Enable Backup:**
- Continuous backup enabled (30-day retention)
- Point-in-time recovery available

**Restore from Snapshot:**
1. Go to MongoDB Atlas → Backups
2. Select snapshot
3. Click "Restore"
4. Choose "New Cluster" or "Existing Cluster"

---

## Security & Compliance

### Authentication & Authorization

```
User Roles:
├── student (least privilege)
├── manager (hostel level)
├── treasurer (financial operations)
└── admin (system level)

Permission Matrix:
student:
  - Mark attendance
  - View own expenses
  - Submit feedback
  
manager:
  - View all expenses
  - Approve students
  - Set menus
  
treasurer:
  - Add/edit expenses
  - View financial reports
  
admin:
  - Everything
  - System configuration
```

### Data Validation & Sanitization

```javascript
// All inputs validated:
- Email: RFC 5322 format, unique check
- Phone: Indian format (+91 or 0)
- Amounts: > 0, <= 100,000 INR
- Dates: Valid, not future
- Strings: XSS-escaped, length limits

// Example validation
const email = validateEmail(req.body.email);
if (!email) throw new ValidationError('Invalid email');
```

### Rate Limiting

```javascript
// Authentication endpoints: 20 requests per 15 min per IP
// General API: 100 requests per minute per user
// Bulk operations: 10 requests per minute

// Rate limit response
HTTP/429
{
  "success": false,
  "error": "Too many requests",
  "retryAfter": 900,
  "errorCode": "RATE_LIMIT_EXCEEDED"
}
```

### SSL/TLS Configuration

```nginx
# nginx.conf
ssl_certificate /etc/ssl/certs/acme/cert.pem;
ssl_certificate_key /etc/ssl/private/acme/key.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_session_timeout 1h;
ssl_session_cache shared:MozSSL:10m;
```

### CORS Configuration

```javascript
// Only allow production origins
ALLOWED_ORIGINS: [
  'https://mess-walah.vercel.app',
  'https://messwala.com',
]
```

### Compliance Features

**Audit Trail:**
- All user actions logged with timestamp
- User IP tracked
- Changes recorded with before/after values

**Data Privacy:**
- Passwords never logged
- PII in logs masked
- Compliance reports available

**Document Management:**
- Document upload & verification
- Compliance reporting (monthly/quarterly)
- GST invoice generation

---

## Monitoring & Performance

### Application Metrics

**Available at:** `GET /api/metrics`

```json
{
  "requests": {
    "total": 15234,
    "byEndpoint": {...},
    "byStatus": {...}
  },
  "latency": {
    "p50": 45,
    "p95": 150,
    "p99": 350,
    "mean": 82
  },
  "database": {
    "queries": 14523,
    "slowQueries": 12,
    "avgDuration": 45
  },
  "errors": {
    "total": 23,
    "5xx": 3,
    "4xx": 20
  }
}
```

### Health Checks

```bash
# Basic health
curl http://localhost:5000/api/health

# Detailed status
curl http://localhost:5000/api/health?detailed=true

# Response
{
  "status": "ok",
  "checks": {
    "database": "operational",
    "cache": "operational",
    "api": "operational"
  },
  "uptime": "72h 15m",
  "health": 98
}
```

### Logging

**Logs Location:** `backend/logs/`

```
logs/
├── debug.log         # Debug level
├── info.log          # Info level
├── warning.log       # Warnings
├── error.log         # Errors
├── combined.log      # All levels
└── access.log        # HTTP access
```

**Log Rotation:** Automatic at 50MB per file

**Log Retention:** 30 days

**Log Format:**
```json
{
  "timestamp": "2026-03-18T10:30:45Z",
  "level": "ERROR",
  "logger": "ExpenseController",
  "message": "Failed to save expense",
  "userId": "user_123",
  "path": "/api/expenses",
  "data": {
    "error": "Validation failed",
    "field": "amount"
  }
}
```

### Performance Targets (SLA)

| Metric | Target | Alert |
|--------|--------|-------|
| P95 Latency | < 200ms | > 500ms |
| P99 Latency | < 500ms | > 1000ms |
| 5xx Error Rate | < 0.1% | > 1% |
| Database Query | < 100ms | > 1000ms |
| Uptime | 99.9% | < 99.5% |
| Page Load | < 3s | > 5s |

---

## Backup & Recovery

### Backup Strategy

**Frequency:** Daily (2 AM UTC)  
**Retention:** 30 days  
**Type:** Full database snapshot

**Backup Process:**
1. Create collection snapshots
2. Compress if enabled
3. Store in `backend/backups/`
4. Create manifest.json

**Restore Process:**
1. Verify backup integrity
2. Clear existing data (option)
3. Restore collections
4. Verify record count
5. Re-create indexes

### Disaster Recovery Plan

**RTO:** Recovery Time Objective = 1 hour  
**RPO:** Recovery Point Objective = 24 hours

**Failure Scenarios:**

**Scenario 1: Database Connection Loss**
- Auto-retry with exponential backoff (max 30s)
- Return 503 Service Unavailable
- Log error for investigation
- Auto-recovers on reconnection

**Scenario 2: Data Corruption**
- Detect on verification check
- Alert admin immediately
- Restore from latest backup
- Verify integrity

**Scenario 3: Ransomware/Malicious Action**
- Restore from immutable snapshot
- Change all credentials
- Audit access logs
- Notify users

### Restore Procedure

```bash
# 1. Identify backup to restore
curl http://localhost:5000/api/admin/backups

# 2. Stop application
docker-compose down

# 3. Restore backup
curl -X POST http://localhost:5000/api/admin/restore/TIMESTAMP

# 4. Verify data
npm run seed:verify

# 5. Restart application
docker-compose up
```

---

## Troubleshooting Guide

### Common Issues & Solutions

**Issue: MongoDB connection timeout**
```
Error: ECONNREFUSED mongodb://localhost:27017
```

**Solution:**
1. Check MongoDB service: `systemctl status mongod`
2. Verify connection string in .env
3. Check firewall: `sudo ufw status`
4. Increase timeout: `serverSelectionTimeoutMS`
5. Check MongoDB logs: `tail /var/log/mongodb/mongod.log`

**Issue: High latency (P95 > 500ms)**
```
Solution:
1. Check database slow query log
2. Review query explain plans
3. Add missing indexes
4. Increase connection pool size
5. Cache frequently accessed data
```

**Issue: Memory leak**
```
Solution:
1. Check Node process memory: top -p $(pgrep node)
2. Take heap snapshot: node --inspect
3. Profile with clinic.js
4. Look for circular references
5. Check for uncleared intervals/timers
```

**Issue: 429 Rate Limit Errors**
```
Solution:
1. Check rate limit configuration
2. Verify client IP address
3. Use authentication token (higher limit)
4. Queue requests on client
5. Implement exponential backoff
```

---

## SLA & Performance Targets

### Service Level Agreement

**Uptime Guarantee:** 99.9%  
**Monthly Downtime Allowance:** ~43 minutes

**Support Tiers:**
- Critical (P1): Response < 1h, Resolution < 4h
- High (P2): Response < 4h, Resolution < 24h
- Medium (P3): Response < 24h, Resolution < 72h
- Low (P4): Response < 48h, Resolution < 2 weeks

### Performance Benchmarks

**Endpoint Latency:**
- GET /api/expenses: 50-150ms
- POST /api/expenses: 100-300ms
- GET /api/advanced-analytics: 200-500ms

**Database Operations:**
- Insert: 10-50ms
- Query (indexed): 30-100ms
- Aggregation: 200-500ms

**Frontend Metrics:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1

---

## Development & Testing

### Running Tests

```bash
# Backend tests
npm run test                 # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# Frontend tests
npm run test               # Vitest
npm run test:ui           # UI mode
npm run test:coverage     # Coverage

# E2E tests
npm run e2e               # Cypress
npm run e2e:open          # Interactive
```

### Code Quality

```bash
# Linting
npm run lint              # Check
npm run lint:fix          # Auto-fix

# Formatting
npm run format            # Apply Prettier
npm run format:check      # Check only
```

---

## Contact & Support

**Maintainers:** [@soumyadeepsarkar-2004](https://github.com/soumyadeepsarkar-2004)  
**Email:** soumyadeep.sarkar@example.com  
**GitHub Discussions:** [MessWala Discussions](https://github.com/soumyadeepsarkar-2004/MessWala/discussions)

---

**Last Updated:** March 18, 2026  
**Version:** 2.5.0  
**Status:** Enterprise Production Ready
