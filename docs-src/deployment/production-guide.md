# MessWala Production Deployment Guide

## Overview

This guide provides comprehensive steps for deploying MessWala to production. Follow each section carefully to ensure a secure, reliable deployment.

**Target Environments:**
- Render.com (Recommended - FREE tier available)
- Vercel/Railway/Heroku (Alternative platforms)
- Self-hosted (VPS/Docker)

---

## Pre-Deployment Checklist

Before deployment, verify all items are complete:

### ✅ Code & Dependencies

- [ ] All code changes pushed to `main` branch
- [ ] `npm install` runs without errors in both frontend and backend
- [ ] `npm run lint` passes with 0 errors
- [ ] All tests pass (`npm test`)
- [ ] `.env.example` updated with all required variables
- [ ] No hardcoded credentials in codebase
- [ ] No `console.log()` statements in production code

### ✅ Environment Variables

- [ ] `NODE_ENV=production` set
- [ ] `JWT_SECRET` is 64+ characters (use: `openssl rand -base64 48`)
- [ ] `MONGO_URI` valid and tested (MongoDB Atlas or self-hosted)
- [ ] `FRONTEND_URL` uses HTTPS
- [ ] Gmail app password configured (for notifications)
- [ ] Twilio credentials configured (for WhatsApp fallback)
- [ ] `BACKUP_ENABLED=true`
- [ ] All environment variables match `.env.example`

### ✅ Security

- [ ] CORS `ALLOWED_ORIGINS` are correct
- [ ] Database access restricted to application IP/VPC
- [ ] MongoDB credentials use strong password (minimum 12 characters)
- [ ] JWT secret not stored in version control
- [ ] HTTPS enforced on frontend (no HTTP)
- [ ] Dependencies have no known vulnerabilities (`npm audit`)

### ✅ Database

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with appropriate permissions
- [ ] Backup enabled (Atlas automatic backups)
- [ ] Whitelist application IP in MongoDB Atlas Network Access
- [ ] Database URI tested with connection string
- [ ] Database migrations applied

### ✅ Notifications

- [ ] Gmail SMTP configured and tested
- [ ] Twilio WhatsApp configured and tested
- [ ] Test notification endpoints return success
- [ ] Fallback notification (email) verified

### ✅ Monitoring & Logging

- [ ] Health check endpoint responds correctly
- [ ] Application logs configured
- [ ] Error tracking set up (if available)
- [ ] Monitoring dashboard configured (optional but recommended)

---

## Deployment Methods

### Method 1: Deploy to Render.com (Recommended)

Render provides free tier with generous limits and simple deployment.

#### Step 1: Prepare Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

#### Step 2: Create Render.com Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. Authorize repository access

#### Step 3: Create MongoDB Atlas Cluster

1. Go to [mongoatlas.com](https://mongoatlas.com)
2. Create free cluster
3. Create database user
4. Get connection string: `mongodb+srv://<USERNAME>:<PASSWORD>@<YOUR_CLUSTER>.mongodb.net/messwala`
5. Enable Network Access for Render IP (or use `0.0.0.0/0` for development)

#### Step 4: Deploy Backend Service

1. In Render dashboard, click "New Web Service"
2. Select your MessWala GitHub repository
3. Configure service:
   - **Name**: `messwala-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free or Paid (as needed)

4. Add environment variables:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<YOUR_CLUSTER>.mongodb.net/messwala
   JWT_SECRET=<YOUR_64_CHAR_SECRET>
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   TWILIO_ACCOUNT_SID=ACxxxxxxx
   TWILIO_AUTH_TOKEN=your-token
   TWILIO_PHONE_NUMBER=+14155238886
   TWILIO_TEST_PHONE=+91xxxxxxxxxx
   BACKUP_ENABLED=true
   ```

5. Click "Create Web Service"
6. Wait for deployment (usually 5-10 minutes)
7. Get backend URL (e.g., `https://messwala-backend.onrender.com`)

#### Step 5: Deploy Frontend Service

1. In Render dashboard, click "New Static Site"
2. Select MessWala repository
3. Configure:
   - **Name**: `messwala-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. Add environment variable:
   ```
   VITE_API_BASE_URL=https://messwala-backend.onrender.com
   ```

5. Click "Create Static Site"
6. Wait for deployment
7. Frontend accessible at provided URL

#### Step 6: Verify Deployment

```bash
# Test backend health
curl https://messwala-backend.onrender.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-03-29T...",
  "checks": {
    "database": { "status": "connected" },
    ...
  }
}
```

---

### Method 2: Deploy with Docker Compose

For self-hosted deployment or local production environment.

#### Step 1: Build Images

```bash
# Build backend image
cd backend
docker build -t messwala-backend:latest .

# Build frontend image
cd ../frontend
docker build -t messwala-frontend:latest .
```

#### Step 2: Create .env File for Production

```bash
# Copy and configure environment file
cp .env.example .env

# Edit .env with production values
nano .env
```

#### Step 3: Start Services with Docker Compose

```bash
# Start all services (MongoDB, Redis, backend, frontend)
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

#### Step 4: Verify Services

```bash
# Check health endpoint
curl http://localhost:5000/api/health

# Check frontend
open http://localhost
```

---

### Method 3: Deploy to Railway.app

Simple alternative to Render with similar simplicity.

1. Connect GitHub to [railway.app](https://railway.app)
2. Create new project
3. Add services:
   - MongoDB Atlas URI
   - Backend service (from repository)
   - Frontend service (from repository)
4. Configure environment variables
5. Deploy

---

## Post-Deployment Verification

After successful deployment:

### 1. Health Checks

```bash
# Check overall health
curl https://your-backend-domain.com/api/health

# Check readiness (for Kubernetes/Docker)
curl https://your-backend-domain.com/api/ready

# Check deployment status
curl https://your-backend-domain.com/api/deployment-status
```

### 2. Test Core Features

```bash
# Test authentication
curl -X POST https://your-backend-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test notifications config
curl https://your-backend-domain.com/api/notifications/config/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test dashboard role-based views
# Login and navigate to dashboard via frontend
```

### 3. Database Verification

```bash
# Connect to MongoDB Atlas
# Navigate to Collections tab
# Verify collections created:
# - users
# - hostels
# - menus
# - notifications
# - etc.
```

### 4. Notification Testing

```bash
# Test email channel
curl -X POST https://your-backend-domain.com/api/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel":"email"}'

# Test WhatsApp channel
curl -X POST https://your-backend-domain.com/api/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel":"whatsapp"}'
```

### 5. CORS & Security Verification

- Open frontend in browser
- Check browser console (F12) for CORS errors
- Verify mixed content warnings don't appear
- Confirm HTTPS is enforced

---

## Monitoring & Maintenance

### Daily Checks

```bash
# Monitor health endpoint
curl https://your-backend-domain.com/api/health

# Review logs for errors
# Check notification queue status
# Verify no failed database connections
```

### Weekly Checks

- Review application logs
- Check database backup status (MongoDB Atlas)
- Monitor resource usage (CPU, memory, storage)
- Test all notification channels
- Verify user authentication flow

### Monthly Rotation

- Rotate JWT_SECRET (requires re-authentication of all users)
- Review and update security policies
- Audit database access logs
- Update dependencies (`npm audit fix`)
- Performance optimization review

---

## Troubleshooting Deployment Issues

### Issue: Database Connection Fails

**Solution:**
```bash
# Test MongoDB URI locally
mongosh "mongodb+srv://<USERNAME>:<PASSWORD>@<YOUR_CLUSTER>.mongodb.net/messwala"

# Check IP whitelist in MongoDB Atlas
# Ensure application IP is whitelisted
# For Render: whitelist 0.0.0.0/0 or specific Render IP
```

### Issue: Frontend Shows Blank Page

**Solution:**
```bash
# Check browser console (F12)
# Verify VITE_API_BASE_URL environment variable
# Check CORS configuration in backend
# Ensure frontend build completed successfully
```

### Issue: Notifications Not Sending

**Solution:**
```bash
# Test health endpoint
curl https://your-domain.com/api/notifications/config/check

# Verify Gmail credentials configured
# Check Twilio account status
# Review application logs for errors
```

### Issue: Performance Issues

**Solution:**
```bash
# Check database indexes
# Review slow query logs
# Increase application resources in Render/Docker
# Enable caching (Redis)
# Optimize database queries
```

---

## Emergency Procedures

### Rollback to Previous Version

```bash
# In Render: Select previous deployment
# In Docker: Pull previous image
docker pull messwala-backend:previous-version
docker-compose down
docker-compose up -d

# In Vercel: Automatic rollback available
```

### Database Backup & Restore

```bash
# MongoDB Atlas automatic backups (free tier)
# Manual backup
mongoexport --uri="mongodb+srv://..." --db messwala --out backup.json

# Restore from backup
mongorestore --uri="mongodb+srv://..." --db messwala backup/
```

### Emergency Database Cleanup

```bash
# Connect to MongoDB
mongosh "mongodb+srv://..."

# Find database
use messwala

# List collections
show collections

# Remove corrupt collection if needed
db.collection_name.drop()
```

---

## Security Hardening Checklist

- [ ] All passwords 12+ characters, no dictionary words
- [ ] JWT_SECRET is 64+ characters, random
- [ ] HTTPS enforced everywhere
- [ ] Database credentials never in version control
- [ ] CORS configured for specific domains, not `*`
- [ ] Rate limiting enabled (default: 100 requests/15 min)
- [ ] HSTS header enabled (1 year max-age)
- [ ] Content Security Policy configured
- [ ] Helmet.js security headers active
- [ ] XSS sanitization enabled
- [ ] MongoDB injection prevention active
- [ ] Input validation enabled
- [ ] Backup automated and tested
- [ ] Monitoring and alerting configured

---

## Production Environment Variables Reference

```bash
# Critical (must be set)
NODE_ENV=production
JWT_SECRET=<64+ character random string>
MONGO_URI=mongodb+srv://...
FRONTEND_URL=https://yourdomain.com

# Highly Recommended
SMTP_EMAIL=<your-email>
SMTP_PASSWORD=<app-password>
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
TWILIO_PHONE_NUMBER=<phone>

# Optional but Recommended
BACKUP_ENABLED=true
LOG_LEVEL=warn
REDIS_URL=<redis-url>

# Platform-Specific
RENDER_EXTERNAL_URL=<render-url>
GOOGLE_CLIENT_ID=<google-oauth-id>
GOOGLE_CLIENT_SECRET=<google-oauth-secret>
```

---

## Support & Resources

- **Documentation**: See `README.md` and `SYSTEM_ARCHITECTURE.md`
- **API Documentation**: `/api/docs` endpoint (auto-generated)
- **Health Check**: `/api/health` endpoint
- **Issues**: Check GitHub issues or raise new ones

---

## Rollback Procedures

### If Deployment Fails

1. **Render**: Click "Previous Deployment" in Render dashboard
2. **Docker**: Stop current container and restart previous version
3. **Verify**: Run health checks to confirm rollback

---

## Success Criteria

✅ All health checks pass
✅ Frontend loads without errors
✅ Authentication works
✅ Dashboard role-based views function correctly
✅ Notifications send successfully
✅ Database backed up and verified
✅ Logs show no critical errors
✅ Performance metrics within acceptable range

---

**Document Version**: 1.0  
**Last Updated**: March 29, 2026  
**Status**: ✅ Production Ready

