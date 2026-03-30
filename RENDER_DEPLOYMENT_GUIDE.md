# 🚀 RENDER.COM DEPLOYMENT EXECUTION GUIDE

**MessWala v2.0.0 | Production Ready**  
**Created:** March 30, 2026  
**Deployment Target:** Render.com

---

## ✅ Pre-Deployment Status

All code is committed and pushed to `origin/main`:
- ✅ Production infrastructure implemented
- ✅ Security hardening active
- ✅ Health probes configured
- ✅ Deployment scripts ready
- ✅ Documentation complete

---

## 📋 STEP-BY-STEP DEPLOYMENT (60 minutes)

### PHASE 1: Prepare Your GitHub Repository (2 minutes)

**Skip if already done:**
1. Ensure your MessWala repository is public on GitHub
2. Verify you can access: https://github.com/soumyadeepsarkar-2004/MessWala
3. Keep this window open - you'll need to reference it

### PHASE 2: Create Render.com Account (5 minutes)

1. **Go to:** https://render.com
2. **Click:** "Get Started" or "Sign Up"
3. **Choose:** Sign up with GitHub
4. **Authorize:** Click "Authorize render-oss"
5. **Verify:** Check your email and confirm
6. **Dashboard:** You should see the Render dashboard

### PHASE 3: Create Backend Service on Render (15 minutes)

#### Step 3.1: Create New Service
1. From Render Dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. Click **"Connect a repository"**

#### Step 3.2: Select Repository
1. Find and click **"MessWala"** repository
2. Click **"Connect"**
3. **Wait** for Render to scan your repository

#### Step 3.3: Configure Service
Fill in the following settings:

**General Settings:**
- **Name:** `messwala-api` (or `messwala-backend`)
- **Region:** Select closest to your users
- **Branch:** `main`
- **Runtime:** `Node`

**Build Settings:**
- **Build Command:** 
  ```
  cd backend && npm ci
  ```
- **Start Command:**
  ```
  node server.js
  ```

**Plan:** Free (or Starter if you prefer paid)

### Step 3.4: Add Environment Variables

Click **"Advanced"** and then **"Add Environment Variable"**

Add each variable from your `.env.production`:

| Key | Value | Example |
|-----|-------|---------|
| `NODE_ENV` | `production` | production |
| `PORT` | `5000` | 5000 |
| `MONGO_URI` | Your MongoDB URL | `mongodb+srv://user:pass@cluster.mongodb.net/messwala` |
| `JWT_SECRET` | Your 64-char secret | Get from: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ENCRYPTION_KEY` | Your 32-char key | Get from: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"` |
| `FRONTEND_URL` | Your Vercel frontend URL | `https://your-frontend.vercel.app` |
| `APP_VERSION` | `2.0.0` | 2.0.0 |
| `BACKUP_ENABLED` | `true` | true |
| `BACKUP_SCHEDULE` | `0 2 * * *` | 0 2 * * * |
| `LOG_LEVEL` | `info` | info |
| `GOOGLE_CLIENT_ID` | Your Google OAuth ID | (optional) |
| `GOOGLE_CLIENT_SECRET` | Your Google secret | (optional) |
| `SMTP_EMAIL` | Your Gmail | (optional) |
| `SMTP_PASSWORD` | Gmail App Password | (optional) |

**Important:** 
- Set `JWT_SECRET` to at least 64 characters 
- Use REAL values, not placeholders
- Do NOT commit these to GitHub

### Step 3.5: Configure Health Check

In the same settings page:
- **Health Check Path:** `/api/health`
- **Health Check Protocol:** `HTTP`
- **Health Check Interval:** `30 seconds`

### Step 3.6: Deploy Backend

1. Click **"Create Web Service"**
2. Render will start building (watch the logs)
3. **Wait** for: `✓ Server is listening on 0.0.0.0:5000`
4. Note your backend URL (looks like: `https://messwala-api.onrender.com`)

### Phase 4: Deploy Frontend with Vercel (10 minutes)

#### Step 4.1: Go to Vercel
1. Visit https://vercel.com
2. Sign in or create account
3. Click "Add New..." → "Project"

#### Step 4.2: Import Project
1. Click **"Import Git Repository"**
2. Paste your repository URL OR authorize GitHub
3. Find and select **"MessWala"**
4. Click **"Import"**

#### Step 4.3: Configure Vercel
- **Project Name:** `messwala-frontend`
- **Framework Preset:** `Vite`
- **Root Directory:** `./frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

#### Step 4.4: Add Environment Variable
1. Go to **"Settings"** → **"Environment Variables"**
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://messwala-api.onrender.com/api`
   - (Use your actual Render backend URL)

3. Click **"Add"**

#### Step 4.5: Deploy
1. Click **"Deploy"**
2. **Wait** for deployment to complete
3. Note your frontend URL (looks like: `https://messwala.vercel.app`)

### Phase 5: Update Backend FRONTEND_URL (2 minutes)

Now that you have both URLs, update Render:

1. Go to **Render Dashboard**
2. Click on **"messwala-api"** service
3. Go to **"Settings"** → **"Environment"**
4. Find **`FRONTEND_URL`**
5. Update value to your Vercel URL: `https://messwala.vercel.app`
6. Click **"Save"**
7. Service will redeploy automatically

### Phase 6: Verify Deployment (10 minutes)

#### Check Backend
```bash
# Copy your backend URL and test these:

# Health check
curl https://messwala-api.onrender.com/api/health

# Readiness probe
curl https://messwala-api.onrender.com/api/ready

# Deployment status
curl https://messwala-api.onrender.com/api/deployment-status

# API docs
https://messwala-api.onrender.com/api/docs
```

**Expected Responses:**
- `/api/health` → `{ "status": "healthy", ... }`
- `/api/ready` → `{ "ready": true, ... }`
- `/api/deployment-status` → Shows version & uptime
- `/api/docs` → Interactive API documentation

#### Check Frontend
1. Visit: `https://your-vercel-url`
2. Should show MessWala login page
3. Test login with a test account
4. Verify analytics/dashboard loads data

### Phase 7: Test Authentication Flow (10 minutes)

**Test Login:**
1. Open frontend URL
2. Use test credentials (or Google OAuth if configured)
3. Should successfully authenticate
4. Check if API calls work (Dashboard should load)

**Test Analytics:**
1. Go to Analytics page (if accessible)
2. Should display data from backend
3. Check Expenses, Menu, Attendance pages

**Test Admin Features:**
1. Login as admin account
2. Access admin dashboard
3. Check health summary: `/api/admin/health-summary`

### Phase 8: Monitor Initial Deployment (10 minutes)

**Watch Render Logs:**
1. Go to Render Dashboard
2. Click on **"messwala-api"**
3. Go to **"Logs"**
4. Watch for errors or issues
5. Should see: "Server listening on 0.0.0.0:5000"

**Monitor Frontend:**
1. Go to Vercel Dashboard
2. Click on **"messwala"**
3. Watch deployment progress
4. Should complete with green checkmark

---

## 🔍 VERIFICATION CHECKLIST

After deployment, verify:

```
Health & Status:
☐ /api/live returns 200 OK
☐ /api/ready returns 200 OK  
☐ /api/health returns healthy status
☐ /api/deployment-status shows correct version
☐ Render logs show no errors
☐ Vercel logs show successful build

Frontend:
☐ Frontend loads without errors
☐ Login page displays correctly
☐ Navigation works
☐ API calls connect to backend (check network tab)

Authentication:
☐ Can login with credentials
☐ Can logout
☐ Session persists on page reload
☐ Unauthorized routes show permission denied

Database:
☐ Data displays on dashboard
☐ Can view analytics
☐ Can submit forms (if applicable)
☐ MongoDB connection shown as healthy

Security:
☐ HTTPS is used (green lock icon)
☐ CORS errors do not appear in console
☐ API keys not exposed in frontend

Performance:
☐ Frontend loads in <2 seconds
☐ API responses <200ms
☐ No 500 errors in logs
```

---

## 🚨 TROUBLESHOOTING

### Backend Not Starting

**Error: "Build failed"**
```bash
# Check build command is correct:
cd backend && npm ci

# Verify Node version requirement (18+)
```

**Solution:**
1. Check Render logs for error details
2. Verify all environment variables are set
3. Restart the service: Dashboard → Service → "Restart"

### Database Connection Failed

**Error: "MONGO_URI invalid" or "Cannot connect to database"**

1. Verify `MONGO_URI` format:
   ```
   mongodb+srv://username:password@host/dbname?retryWrites=true
   ```

2. Check MongoDB Atlas:
   - Is cluster running?
   - IP whitelist includes Render's IPs
   - Username/password correct?

3. Update in Render:
   - Dashboard → messwala-api → Settings → Environment
   - Fix `MONGO_URI`
   - Restart service

### Frontend Cannot Reach Backend

**Error: "CORS error" or "Network error"**

1. Check `VITE_API_URL` is correct on Vercel
2. Verify backend CORS settings allow frontend domain
3. Backend `FRONTEND_URL` matches Vercel URL

Solution:
```bash
# Check backend CORS
curl -H "Origin: https://your-vercel-url" \
  https://messwala-api.onrender.com/api/health
```

### Health Check Failing

**Error: Health check returning 503 or failing**

1. Check database connection:
   ```bash
   # Test from backend logs if MongoDB is accessible
   ```

2. Verify environment variables are complete

3. Check Render logs for specific error

---

## 📊 POST-DEPLOYMENT MONITORING

### Daily Checks
```bash
# Check backend health
curl https://messwala-api.onrender.com/api/health

# Check frontend is up
curl https://messwala.vercel.app
```

### Admin Monitoring
```bash
# Health summary (requires auth token)
curl https://messwala-api.onrender.com/api/admin/health-summary \
  -H "Authorization: Bearer YOUR_TOKEN"

# Cache stats
curl https://messwala-api.onrender.com/api/admin/cache/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Scheduled Tasks
- ✅ Backups: Run daily at 2 AM (configured)
- ✅ Logs: Review daily for errors
- ✅ Updates: Check for dependency updates monthly

---

## 🔐 SECURITY REMINDERS

Before going public:

- ☐ JWT_SECRET is 64+ characters
- ☐ ENCRYPTION_KEY is 32+ characters  
- ☐ All environment variables use REAL values
- ☐ MongoDB has authentication enabled
- ☐ IP whitelist configured on MongoDB
- ☐ HTTPS is enforced
- ☐ CORS only allows your frontend domain
- ☐ Sensitive values NOT in git history

**Verify with:**
```bash
git log --all --full-history -- '.env*'  # Should show nothing
```

---

## 📞 SUPPORT RESOURCES

| Issue | Resource |
|-------|----------|
| Render Deployment | https://render.com/docs |
| Vercel Deployment | https://vercel.com/docs |
| MongoDB Connect | https://docs.mongodb.com/drivers/node/ |
| Express.js | https://expressjs.com |
| React/Vite | https://vitejs.dev |

### Your Documentation
- Full guide: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- Checklist: `GO_LIVE_CHECKLIST.md`
- Summary: `DEPLOYMENT_COMPLETE.md`
- API docs: `/api/docs` (on your deployed backend)

---

## ✅ SUCCESS INDICATORS

Your deployment is successful when:

1. ✅ Both `git push origin main` show no errors
2. ✅ Backend URL is responsive and healthy
3. ✅ Frontend loads without console errors
4. ✅ Can login and view dashboard
5. ✅ API calls complete quickly (<200ms)
6. ✅ Logs show no critical errors
7. ✅ Health endpoints return "healthy"/"ready"

---

## 🎉 DEPLOYMENT COMPLETE!

Your MessWala system is now running in production on:

- **Frontend:** https://your-frontend-domain
- **Backend API:** https://your-backend-domain/api
- **API Docs:** https://your-backend-domain/api/docs
- **Health:** https://your-backend-domain/api/health

**System is:**
- ✅ Secure with enterprise-grade encryption
- ✅ Monitored with health probes
- ✅ Backed up automatically
- ✅ Scaled with Render & Vercel
- ✅ Ready for student users

Thank you for using MessWala! 🚀
