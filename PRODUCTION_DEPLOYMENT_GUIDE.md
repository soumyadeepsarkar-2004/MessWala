# MessWala Production Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying MessWala to production using **Render.com**, **Railway.app**, or **Docker**. The system is configured with:

- ✅ **Automatic Health Checks** (`/api/live`, `/api/ready`)
- ✅ **Kubernetes-Compatible Probes** for orchestration
- ✅ **Structured Logging** with JSON format
- ✅ **Automated Backups** on a cron schedule
- ✅ **Security Hardening** (Helmet, XSS, Rate Limits)

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Created `.env.production` with all required variables
- [ ] Set `JWT_SECRET` to at least 64 characters
- [ ] Generated `ENCRYPTION_KEY` for data protection
- [ ] Configured MongoDB Atlas for production
- [ ] Set up Google OAuth credentials (if using social login)
- [ ] Verified GitHub repository is up to date
- [ ] Tested locally: `npm run validate && npm start`

---

## 🔧 Environment Setup

### 1. Create Production Environment File

Copy the template and update with real values:

```bash
cp .env.example .env.production
```

**Critical Variables:**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/messwala
JWT_SECRET=<64-character-minimum>
ENCRYPTION_KEY=<32-character-minimum>
FRONTEND_URL=https://your-frontend-domain.vercel.app
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
```

Generate strong secrets:
```bash
# JWT Secret (64+ chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key (32+ chars)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 2. Add to Git (but don't commit)

```bash
echo ".env.production" >> .gitignore
```

---

## 🌐 Option A: Deploy to Render.com

### Step 1: Prepare for Render

1. Create account at [render.com](https://render.com)
2. Connect GitHub repository
3. Go to Dashboard → New → Web Service

### Step 2: Configure Backend Service

**Basic Settings:**
- **Name:** `messwala-api`
- **Repository:** Your GitHub repo
- **Branch:** `main`
- **Runtime:** `Node`
- **Build Command:** `cd backend && npm ci`
- **Start Command:** `cd backend && npm start`

**Environment Variables:**
Add all variables from `.env.production`:
- `NODE_ENV=production`
- `PORT=5000`
- `MONGO_URI=<your-mongodb-url>`
- `JWT_SECRET=<your-strong-secret>`
- `ENCRYPTION_KEY=<your-encryption-key>`
- `FRONTEND_URL=<your-vercel-frontend-url>`
- And all other required variables...

### Step 3: Configure Health Check

Render will auto-detect health checks. Configure manually if needed:

```
Health Check Path: /api/live
Health Check Protocol: HTTP
Health Check Interval: 60 seconds
```

### Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Configure:
   - **Framework:** Vite
   - **Build Command:** `cd frontend && npm run build`
   - **Output Directory:** `frontend/dist`
   - **Environment Variables:**
     - `VITE_API_URL=https://messwala-api.onrender.com/api`

### Step 5: Verify Deployment

```bash
# Check health
curl https://messwala-api.onrender.com/api/health

# Check readiness
curl https://messwala-api.onrender.com/api/ready

# View docs
curl https://messwala-api.onrender.com/api/docs
```

---

## 🚂 Option B: Deploy to Railway.app

### Step 1: Prepare for Railway

1. Create account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm install -g @railway/cli`
3. Login: `railway login`

### Step 2: Configure and Deploy

```bash
# Initialize project
railway init

# Add environment variables
railway variables set NODE_ENV=production
railway variables set MONGO_URI=<your-mongodb-url>
railway variables set JWT_SECRET=<your-secret>
railway variables set ENCRYPTION_KEY=<your-key>
railway variables set FRONTEND_URL=<your-frontend-url>
# ... set all other variables

# Deploy backend
cd backend
railway up

# Note the Railway URL, use it in frontend VITE_API_URL
```

### Step 3: Deploy Frontend

```bash
# In frontend directory
railway up
```

### Step 4: Link Services

In Railway Dashboard:
1. Create plugin for MongoDB (if not using external)
2. Link services together
3. Set appropriate environment variables

---

## 🐳 Option C: Deploy with Docker Compose

### Step 1: Prepare Docker Images

Ensure `Dockerfile` exists in `backend/` and `frontend/`

```bash
# Build images
docker build -f backend/Dockerfile -t messwala-backend:latest .
docker build -f frontend/Dockerfile -t messwala-frontend:latest .
```

### Step 2: Deploy with Docker Compose

Update `docker-compose.yml` with production settings:

```yaml
version: '3.8'
services:
  backend:
    image: messwala-backend:latest
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      MONGO_URI: ${MONGO_URI}
      JWT_SECRET: ${JWT_SECRET}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      FRONTEND_URL: ${FRONTEND_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/live"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: messwala-frontend:latest
    ports:
      - "80:80"
    environment:
      VITE_API_URL: http://backend:5000/api
    depends_on:
      - backend
    restart: unless-stopped
```

### Step 3: Start Services

```bash
# Create .env file with variables
cp .env.production .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Step 4: Verify Services

```bash
# Check backend health
curl http://localhost:5000/api/health

# Check frontend
curl http://localhost
```

---

## 🔄 Post-Deployment Verification

### 1. Health Check Endpoints

All infrastructure probes should return `200`:

```bash
# Liveness probe (is the service running?)
$ curl https://your-api-url/api/live
{"alive": true, "uptime": 12345, ...}

# Readiness probe (is it ready to accept traffic?)
$ curl https://your-api-url/api/ready
{"ready": true, "checks": {...}}

# Deployment status
$ curl https://your-api-url/api/deployment-status
{"deployed": true, "environment": "production", ...}
```

### 2. Monitor Logs

- **Render:** Dashboard → Logs
- **Railway:** Dashboard → Logs
- **Docker:** `docker-compose logs -f`

Watch for:
- No unhandled errors
- Successful database connections
- Health probe responses

### 3. Test API Endpoints

```bash
# Authentication
curl -X POST https://your-api-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# Analytics
curl https://your-api-url/api/analytics/transparency-index \
  -H "Authorization: Bearer YOUR_TOKEN"

# Health Summary
curl https://your-api-url/api/admin/health-summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Frontend

- Visit frontend URL
- Test login flow
- Check analytics/dashboard
- Verify API calls are working

---

## 📊 Monitoring & Maintenance

### Enable Production Monitoring

1. **Prometheus Metrics** (if enabled):
   - Endpoint: `/api/metrics`
   - Configure Prometheus to scrape this endpoint

2. **Health Summary** (Admin only):
   - Endpoint: `/api/admin/health-summary`
   - Shows: Database status, cache stats, job queue

3. **Logs** (Structured JSON):
   - All logs are in JSON format
   - Can be parsed by ELK Stack or Datadog

### Backup Management

Automated backups run on schedule (default: 2 AM daily):

```bash
# Create manual backup (admin only)
curl -X POST https://your-api-url/api/admin/backup \
  -H "Authorization: Bearer YOUR_TOKEN"

# List backups
curl https://your-api-url/api/admin/backups \
  -H "Authorization: Bearer YOUR_TOKEN"

# Restore from backup
curl -X POST https://your-api-url/api/admin/restore/TIMESTAMP \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Clear Cache (if needed)

```bash
# Get cache stats
curl https://your-api-url/api/admin/cache/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Clear cache
curl -X POST https://your-api-url/api/admin/cache/clear \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔒 Security Checklist

After deployment, verify:

- [ ] HTTPS is enforced (check HSTS headers)
- [ ] CORS is restricted to frontend domain
- [ ] Rate limiting is active
- [ ] XSS protection headers present
- [ ] MongoDB is authentication protected
- [ ] JWT secrets are strong (64+ chars)
- [ ] Environment variables are NOT in code
- [ ] Automated backups are running
- [ ] Logs are being collected

---

## 🚨 Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker-compose logs backend

# Validate environment
npm run validate

# Check Node version
node --version  # Should be 18+
```

### Database Connection Failed

- Verify `MONGO_URI` is correct
- Check MongoDB connection limit reached
- Ensure IP whitelist includes deployment server

### Frontend API Calls Failing

- Check `VITE_API_URL` points to correct backend
- Verify CORS is configured correctly
- Check authentication token expiry

### Health Checks Returning Errors

```bash
# Test health check locally
curl http://localhost:5000/api/health

# Check MongoDB connection
npm run health:check

# View detailed health summary
npm run health:summary
```

---

## 📞 Support & Escalation

If issues persist:

1. **Check Logs:** Review structured JSON logs in deployment platform
2. **Review Docs:** `/api/docs` endpoint shows all available endpoints
3. **Contact:** Create issue in repository with logs

---

## ✅ Deployment Complete

Your MessWala system is now running in production with:

- 🌍 Global availability via CDN
- 🔒 Enterprise-grade security
- 📊 Real-time monitoring
- 💾 Automated backups
- 🚀 Auto-scaling (where applicable)
- 📈 Comprehensive logging

Thank you for using MessWala!
