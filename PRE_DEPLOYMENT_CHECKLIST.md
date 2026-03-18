# 🔒 Pre-Deployment Security Checklist

Use this checklist before deploying MessWala to production. Each item should be verified and checked off.

## Phase 1: Code Review & Cleanup ✅

- [x] All dummy data removed
- [x] No hardcoded credentials in code
- [x] No localhost URLs in production builds
- [x] Seed script disabled for production
- [x] Demo accounts removed from documentation
- [x] All test files properly isolated
- [x] No console.log of sensitive data
- [x] All dependencies reviewed for vulnerabilities

## Phase 2: Environment Configuration ✅

Before deploying, complete these steps:

### Backend Environment (Render)
- [ ] `NODE_ENV` = `production`
- [ ] `MONGO_URI` = Production MongoDB connection string
- [ ] `JWT_SECRET` = 32+ character cryptographically random string
  - Generate: `openssl rand -base64 32`
- [ ] `FRONTEND_URL` = Your production frontend URL (e.g., https://yourdomain.vercel.app)
- [ ] `GOOGLE_CLIENT_ID` = Production Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` = Production Google OAuth client secret
- [ ] No localhost URLs set
- [ ] All passwords are strong (16+ characters)

### Frontend Environment (Vercel)
- [ ] `VITE_API_URL` = Production backend URL (e.g., https://api.yourdomain.onrender.com/api)
- [ ] `VITE_GOOGLE_CLIENT_ID` = Production Google OAuth client ID
- [ ] `VITE_RECAPTCHA_SITE_KEY` = Production reCAPTCHA site key
- [ ] No localhost URLs
- [ ] All values point to production services

### Validate Environment
```bash
cd backend
node validate-production-env.js
```

## Phase 3: Database Security ✅

### MongoDB Atlas
- [ ] Cluster running on Premium tier (M10+) recommended
- [ ] Encryption at rest enabled
- [ ] Encryption in transit (TLS) enabled
- [ ] Database user created (not root/admin)
  - User has only necessary permissions
  - Password is 16+ characters, cryptographically random
- [ ] IP Whitelist enabled
  - Only allow Render's static IP
  - No 0.0.0.0 access
- [ ] Automated backups enabled
  - Daily backups scheduled
  - Retention: 7+ days
- [ ] Backups encrypted
- [ ] Tested restore procedure works

## Phase 4: SSL/TLS & HTTPS ✅

### Render (Backend)
- [ ] HTTPS enabled on custom domain
- [ ] SSL certificate valid and not expiring soon
- [ ] Minimum TLS 1.2 enforced
- [ ] HSTS headers configured
  - Verify: `curl -I https://your-backend.com | grep Strict-Transport`

### Vercel (Frontend)
- [ ] HTTPS auto-enabled
- [ ] SSL certificate valid
- [ ] Automatic HTTPS redirect enabled
- [ ] Security headers present:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block

## Phase 5: API Security ✅

- [ ] Rate limiting enabled
  - Test: Rapid requests should return 429 after threshold
- [ ] CORS properly restricted
  - Only allows production frontend URL
  - No wildcard (*) in production
- [ ] Authentication required on all protected routes
- [ ] Authorization checks working (role-based)
- [ ] Input validation on all endpoints
- [ ] Output encoding to prevent XSS
- [ ] SQL/NoSQL injection protection verified

## Phase 6: Frontend Security ✅

- [ ] Content Security Policy (CSP) headers set
- [ ] No inline JavaScript in production build
- [ ] No sensitive data in localStorage
- [ ] External scripts have integrity attributes
- [ ] No API keys in frontend code
- [ ] Build process strips/minifies code
- [ ] Service Worker secure (if PWA enabled)

## Phase 7: Monitoring & Logging ✅

### Error Tracking Setup
- [ ] Error tracking service configured (Sentry, Rollbar, etc.)
- [ ] Backend errors logged to tracking service
- [ ] Frontend errors logged to tracking service
- [ ] Alerts configured for critical errors
- [ ] Email notifications enabled for team

### Application Monitoring
- [ ] Uptime monitoring enabled (Uptime Robot, etc.)
- [ ] Performance monitoring enabled
- [ ] Database query monitoring enabled
- [ ] Memory/CPU usage alerts set
- [ ] Disk space alerts set

### Logging
- [ ] Application logs being collected
- [ ] Log rotation configured
- [ ] Sensitive data excluded from logs
- [ ] Log retention policy set (typically 30 days)
- [ ] Available for manual review

## Phase 8: Data Privacy & Compliance ✅

- [ ] Privacy Policy documented
- [ ] Data retention policy documented
- [ ] User data protected (encrypted where needed)
- [ ] No personally identifiable information in logs
- [ ] Data export option available for users (if required)
- [ ] Terms of Service documented

## Phase 9: Backup & Disaster Recovery ✅

- [ ] Database backups automated
- [ ] Backups tested for restore capability
- [ ] Disaster recovery procedure documented
- [ ] Team trained on backup/restore process
- [ ] Recovery time objective (RTO) defined
- [ ] Recovery point objective (RPO) defined

## Phase 10: Performance ✅

- [ ] Frontend build optimized
  - Tree-shaking enabled
  - Code splitting configured
  - CSS minified
- [ ] API response times < 500ms (p95)
- [ ] Database queries optimized
  - Indexes created on frequently queried fields
  - No N+1 queries
- [ ] Caching strategy implemented
  - Static assets cached long-term
  - API responses cached where appropriate
- [ ] CDN enabled (for static assets)

## Phase 11: Documentation ✅

- [ ] RunBook created: How to deploy
- [ ] RunBook created: How to rollback
- [ ] RunBook created: How to restore from backup
- [ ] RunBook created: How to handle incidents
- [ ] Team trained on runbooks
- [ ] Incident contact list updated
- [ ] On-call rotation established

## Phase 12: Final Verification Before Deploy ✅

### Code
- [ ] All tests passing
- [ ] Linting passes without warnings
- [ ] No security warnings from npm audit
- [ ] Code review completed
- [ ] Change log updated
- [ ] Version number bumped

### Configuration
- [ ] All environment variables verified with validation script
- [ ] Secrets secured (not in git, only in platforms)
- [ ] Production MongoDB connection verified
- [ ] Production OAuth credentials verified
- [ ] No development URLs in production config

### Team
- [ ] Deployment plan reviewed with team
- [ ] Rollback procedure understood by team
- [ ] Support/monitoring team notified
- [ ] On-call person ready
- [ ] Communication channel ready for updates

## Deployment Steps

Once all items are checked:

1. **Create backup** of current production (if exists)
   ```bash
   # Manually trigger MongoDB backup on Atlas
   ```

2. **Deploy backend**
   - Push to GitHub main branch
   - Render auto-deploys
   - Monitor logs for errors

3. **Deploy frontend**
   - Push to GitHub main branch (if on different repo)
   - Vercel auto-deploys
   - Monitor logs for build errors

4. **Post-deployment verification**
   ```bash
   # Test critical flows
   - User signup
   - User login
   - View dashboard
   - API endpoints responding
   ```

5. **Monitor for 24 hours**
   - Watch error tracking
   - Check uptime monitoring
   - Review performance metrics
   - Monitor user feedback

## Post-Deployment Checklist ✅

- [ ] All systems operational
- [ ] No unusual error rates
- [ ] Performance metrics normal
- [ ] Users able to access application
- [ ] Database accessible and performing well
- [ ] Backups running on schedule
- [ ] Monitoring alerts functioning
- [ ] Team notification sent to stakeholders

## Rollback Procedure (If Needed)

If critical issues occur after deployment:

1. Identify issue scope and severity
2. Create incident report
3. Either:
   - **Option A:** Deploy previous stable version immediately
   - **Option B:** Apply hotfix and deploy
4. Verify fix in production
5. Document root cause
6. Schedule post-mortem meeting

## Sign-Off

- [ ] Developer: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______
- [ ] DevOps/Ops: _________________ Date: _______
- [ ] Project Lead: _________________ Date: _______

---

**Date Created:** March 19, 2026  
**Last Updated:** March 19, 2026  
**Version:** 1.0  
**Status:** ✅ Ready for Production
