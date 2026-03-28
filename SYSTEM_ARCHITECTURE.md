# MessWala - System Architecture & Scalability Guide

## Complete System Overview

### Backend Architecture
```
┌─────────────────────────────────────────────────────┐
│                    API Gateway Layer                 │
│              (Load Balancer, Rate Limiting)          │
└─────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────┐
│           Middleware Stack (Request Processing)      │
│  ├─ Authentication & Authorization                   │
│  ├─ Error Handling & Logging                         │
│  ├─ Performance Monitoring                           │
│  ├─ Rate Limiting (Intelligent)                      │
│  └─ Caching Layer                                    │
└─────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────┐
│              Route Handlers & Controllers            │
│  ├─ Auth Controller                                  │
│  ├─ Expense Controller                               │
│  ├─ Meal Controller                                  │
│  ├─ Analytics Controller                             │
│  └─ Admin Controller                                 │
└─────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────┐
│         Data Access & Optimization Layer             │
│  ├─ Query Builder                                    │
│  ├─ Database Indexing                                │
│  ├─ Connection Pooling                               │
│  └─ Caching Strategy                                 │
└─────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────┐
│              MongoDB Atlas (Production)              │
│              Local MongoDB (Development)             │
└─────────────────────────────────────────────────────┘
```

### Utility Modules

#### 1. **Caching Layer** (`src/utils/cache.js`)
- In-memory cache with TTL
- LRU eviction strategy
- Pattern-based invalidation
- Middleware for automatic GET response caching
- Cache statistics and hit rate tracking

#### 2. **Intelligent Rate Limiter** (`src/utils/intelligentRateLimiter.js`)
- Adaptive rate limiting based on system load
- Per-user trust scoring
- Endpoint-specific configurations
- Burst allowance for legitimate spikes
- Suspicious activity detection

#### 3. **Job Queue** (`src/utils/jobQueue.js`)
- Async background processing
- Configurable concurrency
- Retry logic with exponential backoff
- Job priority levels
- Event-based processing status

#### 4. **Monitoring System** (`src/utils/monitoring.js`)
- Real-time system health tracking
- Threshold-based alerting
- Performance anomaly detection
- Memory and CPU monitoring
- Alert fatigue prevention

#### 5. **API Documentation** (`src/utils/apiDocGenerator.js`)
- Auto-generates OpenAPI 3.0 specs
- HTML documentation UI
- Schema registration and validation
- Endpoint discovery and stats

### Frontend Accessibility (`frontend/src/utils/accessibility.jsx`)
- WCAG 2.1 Level AA compliance
- Screen reader support
- Keyboard navigation
- Form validation with accessible error messages
- Modal focus management
- Color contrast checking

## Scaling Strategies

### Horizontal Scaling
```
┌──────────────────────────────────────────┐
│         Load Balancer (Nginx/HAProxy)    │
└──────────────────────────────────────────┘
        │        │        │        │
    ┌───┴────┬───┴────┬───┴────┬───┴────┐
    │Node 1  │Node 2  │Node 3  │Node N  │
    │:5000   │:5001   │:5002   │:500N   │
    └────┬───┴───┬────┴────┬───┴────┬───┘
         │       │         │        │
    ┌────┴───┬───┴─────┬──┴─────┬──┴────┐
    │  Shared Cache (Redis)           │
    │  Session Store                   │
    └─────────────────────────────────┘
         │
    ┌────┴─────────────────────────┐
    │    MongoDB Atlas Cluster      │
    │  (Replica Set w/ Sharding)    │
    └───────────────────────────────┘
```

### Deployment Configuration
- **Frontend**: Vercel (CDN + Serverless)
- **Backend**: Render/Heroku (Multiple dynos)
- **Database**: MongoDB Atlas (Auto-scaling)
- **Cache**: Redis Cloud or Memcached
- **Job Queue**: Bull/BullMQ with Redis backing
- **Monitoring**: DataDog, New Relic, or Prometheus

### Performance Optimization
1. **Database**: Indexing strategy implemented
2. **Caching**: Multi-level caching (in-memory + Redis)
3. **Compression**: Gzip middleware for responses
4. **CDN**: Static assets served from CDN
5. **API**: Pagination, field selection, eager loading

## Environment Setup

### Development
```bash
npm run dev        # Starts with hot reload
npm run test       # Run test suite
npm run seed       # Populate test data
```

### Production
```bash
NODE_ENV=production npm start
MONGO_URI=<atlas-uri>
JWT_SECRET=<secure-random-32-char>
FRONTEND_URL=<your-domain>
```

## API Endpoints (Auto-documented)

Access API documentation at:
- **JSON**: `/api/docs.json` (OpenAPI spec)
- **HTML**: `/api/docs` (Interactive docs)

## Monitoring & Health Checks

### Health Check Endpoints
- **General Health**: `GET /api/health`
- **Detailed Status**: `GET /api/metrics`
- **Database Health**: `/api/health/db`
- **Cache Status**: `/api/health/cache`
- **Job Queue Status**: `/api/health/jobs`

### Alerts Configured
- High error rate (> 5%)
- Slow API responses (> 1 second)
- High memory usage (> 90%)
- Database slow queries (> 500ms)
- Job queue backlog

## Security Measures

1. **CSP Headers**: Strict Content Security Policy
2. **Rate Limiting**: Intelligent, adaptive throttling
3. **Authentication**: JWT + Google OAuth
4. **CORS**: Configured for production domains
5. **Helmet**: Security headers middleware
6. **Input Validation**: Extended validation utilities
7. **Encryption**: Passwords hashed with bcrypt

## Maintenance & Operations

### Regular Tasks
- Monitor cache hit ratios
- Review rate limiter trust scores
- Check job queue health
- Analyze performance metrics
- Review security alerts

### Scaling Triggers
- **CPU**: Scale up when consistently > 70%
- **Memory**: Scale up when > 85%
- **Response Time**: Scale if p95 > 2000ms
- **Error Rate**: Alert if > 1%
- **Queue Size**: Scale if pending jobs > 1000

## Future Enhancements

1. **GraphQL API**: For complex data queries
2. **WebSocket Support**: Real-time notifications
3. **Machine Learning**: Expense prediction, anomaly detection
4. **Advanced Analytics**: Forecasting, trend analysis
5. **Multi-tenant**: Support for multiple hostels
6. **Mobile App**: Native iOS/Android apps
7. **Payment Integration**: Automated payment processing
8. **AI Chatbot**: Intelligent support assistant
