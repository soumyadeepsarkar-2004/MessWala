# 📊 Production Monitoring & Optimization Guide

Complete guide for monitoring, performance tuning, and optimization procedures.

---

## 📡 Monitoring Setup

### Error Tracking (Recommended: Sentry)

**Setup:**
```javascript
// backend/server.js or middleware
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.HapiIntegration(),
    new Sentry.Integrations.OnUncaughtExceptionIntegration(),
    new Sentry.Integrations.OnUnhandledRejectionIntegration(),
  ],
});
```

**Alert Configuration:**
```
Alert when:
- Error rate > 1%
- New error type appears
- Error volume spikes 50%
- Critical error (500s, 503s)
- Database errors > 5/min
```

**Dashboard Metrics:**
- Error frequency by endpoint
- Top error types
- Affected users
- Stack traces
- Session replay (if enabled)

---

### Application Monitoring (Recommended: DataDog/New Relic)

**Key Metrics:**
```
1. Response Times
   - P50 (median): Should be < 100ms
   - P95: Should be < 500ms
   - P99: Should be < 2000ms

2. Throughput
   - Requests/second
   - Users/minute
   - Concurrent sessions

3. Resource Usage
   - CPU: Alert if > 70%
   - Memory: Alert if > 80%
   - Disk: Alert if > 85%
   - Network: Monitor for saturation

4. Database Performance
   - Query count/sec
   - Avg query time: < 10ms
   - Slow queries: < 1/min
```

**Dashboards to Create:**
1. **Overview** - Health status, recent issues
2. **Performance** - Response times, throughput
3. **Infrastructure** - Resource usage
4. **Database** - Query performance, indexing
5. **Users** - Active users, error rates

---

### Uptime Monitoring (Recommended: Uptime Robot)

**Monitors to Configure:**

```
1. Frontend Health Check
   - URL: https://yourdomain.com
   - Type: HTTPS
   - Interval: 5 minutes
   - Expected: 200 OK

2. Backend Health Check
   - URL: https://api.yourdomain.com/api/health
   - Type: HTTPS
   - Interval: 5 minutes
   - Expected: { status: "healthy" }

3. Auth Endpoint Check
   - URL: https://api.yourdomain.com/api/auth/login
   - Type: HTTPS POST
   - Body: { "email": "test@test.com", "password": "test" }
   - Expected: 401 (auth failure = endpoint working)

4. Database Check
   - Verify from /api/health endpoint
```

**Alert Rules:**
```
- Service down: Immediate Slack/Email/SMS
- Slow response (>5sec): Immediate alert
- Certificate expiring < 30 days: Daily reminder
- High error rate: When > 5% for 10 minutes
```

---

### Database Monitoring (MongoDB Atlas)

**Built-in Metrics:**

1. **Query Performance**
   ```
   Alert if:
   - Average query time > 100ms
   - Slow queries > 1/min
   - Index scans > 5%
   ```

2. **Resource Usage**
   ```
   Alert if:
   - CPU > 80%
   - Memory > 90%
   - Disk > 85%
   - Connections > 70% of limit
   ```

3. **Replication Lag** (if replicated)
   ```
   Alert if:
   - Lag > 10 seconds
   - Secondary down
   ```

**Setup Database Profiling:**
```javascript
// Enable slow query logging
db.setProfilingLevel(1, { slowms: 100 })

// View slow queries
db.system.profile.find({ millis: { $gt: 100 } }).limit(10)

// Index recommendation
db.collection.aggregate([{ $indexStats: {} }])
```

---

## 🚀 Performance Optimization

### Frontend Optimization

**1. Bundle Size Analysis**
```bash
# Analyze bundle
npm run build -- --analyze

# Check sizes
ls -lh frontend/dist/assets/

# Target: < 500KB gzipped for main JS
```

**2. Code Splitting**
```javascript
// Use React.lazy for route-based splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// Or component-based
const Charts = React.lazy(() => import('./components/Charts'));
```

**3. Image Optimization**
```javascript
// Use Next Gen formats (WebP)
// Compress with TinyPNG/ImageOptim
// Target: < 100KB per image

// Lazy load images
<img loading="lazy" src="..." />
```

**4. Caching Strategy**
```javascript
// Service Worker caching
// Static assets: 1 year
// API responses: 5 minutes
// HTML: No cache
```

---

### Backend Optimization

**1. Database Query Optimization**

```javascript
// ❌ SLOW: N+1 query
users.forEach(user => {
  const expenses = db.expenses.find({ userId: user._id });
});

// ✅ FAST: Single query with population
const users = db.User
  .find()
  .populate('expenses')
  .lean();
```

**2. Indexing Strategy**

```javascript
// Add indexes for frequently queried fields
db.users.createIndex({ email: 1 }, { unique: true });
db.expenses.createIndex({ userId: 1, date: -1 });
db.meals.createIndex({ date: 1 });
db.feedback.createIndex({ userId: 1, date: -1 });

// Compound indexes for common filters
db.expenses.createIndex({ 
  userId: 1, 
  category: 1, 
  date: -1 
});
```

**3. Query Optimization**

```javascript
// Use projection to limit fields
const users = db.User.find({}, { name: 1, email: 1 });

// Use limit and pagination
const page = 1;
const limit = 20;
const skip = (page - 1) * limit;
const users = db.User.find().skip(skip).limit(limit);

// Use aggregation pipeline for complex queries
const report = db.Expense.aggregate([
  { $match: { date: { $gte: startDate } } },
  { $group: { _id: '$category', total: { $sum: '$amount' } } },
  { $sort: { total: -1 } }
]);
```

**4. Caching Strategy**

```javascript
// In-memory caching for frequently accessed data
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

// Cache user preferences
app.get('/api/user/preferences', (req, res) => {
  const cached = cache.get(`user-${req.user.id}`);
  if (cached) return res.json(cached);
  
  const prefs = getUserPreferences(req.user.id);
  cache.set(`user-${req.user.id}`, prefs);
  res.json(prefs);
});
```

**5. API Response Compression**

```javascript
// Already configured in server.js
// Gzip compression for responses > 1KB
app.use(compression({ 
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6 // 0-9, default 6
}));
```

---

### Infrastructure Optimization

**1. Auto-scaling**

```
Render Backend:
- Small: 512MB RAM, 0.5 CPU
- Medium: 2GB RAM, 1 CPU
- Large: 4GB RAM, 2 CPU

Scale up when:
- CPU > 70% for 10 minutes
- Memory > 80%
- Response time > 1 second

Scale down when:
- CPU < 30% for 30 minutes
- Memory < 50%
```

**2. CDN for Static Assets**

Configure on Vercel (built-in):
```
- Automatic for static assets
- Caches in 280+ edge locations
- Purge cache on deploy
```

**3. Database Connection Pooling**

```javascript
// MongoDB connection pooling
mongoose.connect(MONGO_URI, {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000
});
```

---

## 📈 Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Frontend Load Time | < 2s | TBD | ⏳ |
| API Response Time (p95) | < 500ms | TBD | ⏳ |
| Database Query Time (avg) | < 50ms | TBD | ⏳ |
| Uptime | 99.5% | TBD | ⏳ |
| Error Rate | < 1% | TBD | ⏳ |
| Bundle Size (gzipped) | < 500KB | TBD | ⏳ |

---

## 🔍 Weekly Performance Review

**Every Monday, review:**

```
□ Performance metrics for past week
  - Response times (avg, p95, p99)
  - Error rate trends
  - User growth
  - Traffic patterns

□ Database performance
  - Slow queries
  - Index usage
  - Disk space usage
  - Connection pool health

□ Infrastructure
  - CPU/memory usage patterns
  - Traffic spikes
  - Cost analysis
  - Capacity planning

□ User feedback
  - Any performance complaints
  - Slow feature reports
  - Browser/device compatibility

□ Alert review
  - False positives
  - Missed issues
  - Threshold adjustments
```

---

## 🛠️ Common Performance Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| High memory usage | Memory leak, large objects | Profile code, find accumulating data |
| Slow API response | N+1 queries, missing index | Optimize query, add index |
| High CPU | Inefficient algorithm | Profile CPU, optimize loop |
| Large bundle | Unused dependencies | Tree-shake, code split |
| High latency | Slow network, far CDN | Use CDN, compression |
| Database timeout | Connection pool exhausted | Increase pool size |
| High error rate | New bugs, upstream issues | Check logs, review deployment |

---

## ✅ Daily Operations Checklist

**Morning (Start of business day):**
- [ ] Check Sentry for new errors
- [ ] Review Uptime Robot status
- [ ] Check performance trends
- [ ] Review database metrics
- [ ] Scan logs for warnings

**Throughout day:**
- [ ] Monitor alerts
- [ ] Respond to issues
- [ ] Track metrics

**Evening (End of business day):**
- [ ] Review day's errors
- [ ] Note any patterns
- [ ] Plan tomorrow's optimizations
- [ ] Document any issues

---

**Last Updated:** March 19, 2026  
**Version:** 1.0
