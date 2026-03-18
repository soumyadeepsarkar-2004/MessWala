# 🚨 Incident Response & Runbooks

Complete procedures for handling production incidents at MessWala.

---

## Quick Reference - Response Times

| Severity | Definition | Response Time | Resolution Time |
|----------|-----------|---|---|
| **Critical** | System down, data loss, security breach | 15 minutes | 1 hour |
| **High** | Major feature broken, affecting 50%+ users | 30 minutes | 4 hours |
| **Medium** | Feature partially broken, affecting <50% | 1 hour | 8 hours |
| **Low** | Minor issue, workaround available | 4 hours | 24 hours |

---

## Incident Response Process

### Phase 1: Detection (Immediate)

**Alert received from:**
- Error tracking (Sentry, Rollbar)
- Uptime monitoring (Uptime Robot)
- User reports
- Performance monitoring

**On-call responsibilities:**
1. [ ] Acknowledge alert within 5 minutes
2. [ ] Assess severity level
3. [ ] Page escalation if critical
4. [ ] Create incident ticket

### Phase 2: Assessment (5-15 minutes)

**Gather information:**
```bash
# Backend logs
# - Check Render dashboard: https://dashboard.render.com
# - Look for error patterns
# - Check timestamps

# Frontend monitoring
# - Check Vercel dashboard: https://vercel.com/dashboard
# - Look for build failures or runtime errors

# Database status
# - Check MongoDB Atlas: https://cloud.mongodb.com
# - Look for connection issues, high CPU, disk usage
```

**Key questions:**
1. When did issue start?
2. How many users affected?
3. What's the error pattern?
4. Any recent deployments?
5. Any infrastructure changes?

**Severity determination:**
```
Critical = System unavailable OR Data loss OR Security breach
High = Major feature broken OR 50%+ users affected
Medium = Partial feature broken OR <50% users affected
Low = Minor issue OR Workaround exists
```

### Phase 3: Investigation (15-45 minutes)

**Check recent changes:**
```bash
# View recent deployments
git log --oneline -10

# Check deployment times vs incident time
# Cross-reference with error spikes
```

**Common causes & quick fixes:**

**Issue: API returning 500 errors**
```
Likely causes:
1. Database connection timeout
2. Environment variable missing
3. Out of memory
4. Recent code deployment

Quick diagnose:
- Check MongoDB connection string
- Check logs for stack traces
- Check memory usage in Render dashboard
- Check if specific endpoint is affected
```

**Issue: Frontend not loading**
```
Likely causes:
1. Build failure
2. CDN issue
3. CORS error
4. Missing environment variable

Quick diagnose:
- Check Vercel build logs
- Check browser console CORS errors
- Verify API_URL is set correctly
- Check network tab for failed requests
```

**Issue: Database slow/unresponsive**
```
Likely causes:
1. High CPU usage
2. Slow queries
3. Connection pool exhausted
4. Disk space full

Quick diagnose:
- Check MongoDB Atlas monitoring
- Look for slow query logs
- Check connection count
- Check database size vs tier limits
```

**Issue: Authentication failures**
```
Likely causes:
1. JWT_SECRET mismatch
2. Google OAuth config wrong
3. Database connection issue
4. Redis cache issue (if used)

Quick diagnose:
- Check JWT_SECRET on Render
- Verify Google OAuth credentials
- Test database connectivity
- Check logs for auth errors
```

### Phase 4: Mitigation (30+ minutes)

**Immediate actions (if needed):**

```bash
# Rollback to previous version
git revert <commit-hash>
git push origin main
# Wait for Render/Vercel auto-deploy

# Or Emergency Rollback
# On Render Dashboard:
# 1. Go to Deployments
# 2. Click on previous stable version
# 3. Click "Redeploy"

# Scale up resources (temporary)
# On Render/Vercel: Increase plan tier temporarily
```

**Workarounds:**

If full resolution will take time:
1. Return maintenance page to users
2. Implement feature flag to disable broken feature
3. Route traffic to backup system
4. Enable read-only mode temporarily

### Phase 5: Resolution (Varies by severity)

**Critical (Target: 1 hour)**
```
1. Immediate mitigation deployed
2. Root cause identified
3. Fix implemented and tested
4. Deployed to production
5. Monitoring for side effects
```

**High (Target: 4 hours)**
```
1. Workaround implemented for users
2. Root cause analysis complete
3. Fix designed and tested
4. Deployed during maintenance window
5. Verified working
```

**Medium (Target: 8 hours)**
```
1. Documented and tracked
2. Root cause analysis
3. Fix implemented
4. Testing complete
5. Scheduled deployment
```

**Low (Target: 24 hours)**
```
1. Added to backlog
2. Planned for next sprint
3. Fixed in next deployment
```

### Phase 6: Recovery & Verification

**Verify system healthy:**
```
✅ All API endpoints responding
✅ Database queries performing well
✅ Frontend loads without errors
✅ User workflows functional
✅ No error spike in monitoring
✅ Performance metrics normal
```

**Customer communication:**
1. Acknowledge issue
2. Provide status updates every 15 min (if critical)
3. Explain issue and fix
4. Apologize for inconvenience
5. Outline prevention measures

### Phase 7: Post-Incident

**Immediately after resolution (within 1 hour):**
1. [ ] Update incident ticket with resolution
2. [ ] Document root cause
3. [ ] List any data lost (if applicable)
4. [ ] Notify stakeholders

**Within 24 hours:**
1. [ ] Create comprehensive incident report
2. [ ] Timeline of events
3. [ ] Root cause analysis
4. [ ] Actions to prevent recurrence

**Within 1 week:**
1. [ ] Schedule post-mortem meeting
2. [ ] Review incident response performance
3. [ ] Update runbooks if needed
4. [ ] Implement prevention measures

---

## Specific Runbooks

### Runbook 1: Database Emergency

**Symptom:** Database connection errors, timeouts

**Diagnosis:**
```bash
# Check connection count
# MongoDB Atlas → Metrics → Active Connections

# Check query performance
# MongoDB Atlas → Metrics → Operation Duration
```

**Actions:**
```
1. [ ] Check connection pool size
2. [ ] Kill long-running queries if necessary
3. [ ] Reduce application connection pool
4. [ ] Scale up database tier if needed
5. [ ] Monitor recovery
```

**Prevention:**
- Add connection pooling limits
- Add query timeouts
- Monitor slow queries regularly
- Plan capacity based on growth

---

### Runbook 2: Server Crash

**Symptom:** Render server won't start, constant restarts

**Diagnosis:**
```bash
# Check recent changes
git log --oneline -5

# Check error logs
# Render Dashboard → Logs
```

**Actions:**
```
1. [ ] Check error messages in logs
2. [ ] Verify environment variables set
3. [ ] Check for code syntax errors
4. [ ] Rollback to previous version if needed
5. [ ] Test locally before redeploying
```

**Prevention:**
- Run tests before deploying
- Use staging environment
- Gradual deployment strategy

---

### Runbook 3: Memory Leak

**Symptom:** Increasing memory usage, eventually crashes

**Diagnosis:**
```bash
# Check memory trend in Render dashboard
# Look for steady increase without plateau

# Check for:
- Global variables accumulating
- Event listeners not removed
- Database connections not closed
- Promises not resolved
```

**Actions:**
```
1. [ ] Enable profiling for next deployment
2. [ ] Review recent code changes
3. [ ] Identify accumulating data structures
4. [ ] Add cleanup/garbage collection
5. [ ] Test and redeploy
6. [ ] Monitor memory after fix
```

---

### Runbook 4: Security Breach

**Symptom:** Unauthorized access, data exfiltration, hacked accounts

**Actions (IMMEDIATE):**
```
1. [ ] Isolate affected systems
2. [ ] Alert security team
3. [ ] Preserve logs for forensics
4. [ ] Notify affected users
5. [ ] Reset all secrets:
   - JWT_SECRET
   - Google OAuth credentials
   - Database passwords
6. [ ] Rotate all access credentials
7. [ ] Enable 2FA everywhere
8. [ ] Run security audit
9. [ ] Update security policies
```

---

### Runbook 5: High Latency

**Symptom:** API responses slow, timeouts

**Diagnosis:**
```bash
# Check response times in monitoring
# Render/Vercel metrics → Request duration

# Identify slow endpoints
# Check database query times
# Check error logs for timeout errors
```

**Actions:**
```
1. [ ] Identify slow endpoints
2. [ ] Add database indexes
3. [ ] Implement caching
4. [ ] Reduce response payload size
5. [ ] Scale up server resources
6. [ ] Monitor after changes
```

---

## On-Call Checklist

**Start of shift:**
- [ ] Read previous incident reports
- [ ] Review recent error trends
- [ ] Check system metrics baseline
- [ ] Verify all monitoring tools accessible
- [ ] Have runbooks printed/accessible

**During shift:**
- [ ] Monitor alerts closely
- [ ] Respond within SLA
- [ ] Document responses
- [ ] Keep track of time spent
- [ ] Communicate status to team

**End of shift:**
- [ ] Handoff notes to next on-call
- [ ] Summarize any incidents
- [ ] Update wiki with lessons learned
- [ ] Ensure backlog tickets created for follow-ups

---

## Escalation Matrix

```
Level 1 On-Call:
- Can: Respond to alerts, diagnose issues, implement standard runbooks
- Cannot: Make architectural changes, database schema changes

↓ Escalate if:
- Issue not resolved in 1 hour
- Requires code changes
- Requires emergency deployment

Level 2 Tech Lead:
- Can: Code changes, rollbacks, scaling decisions
- Cannot: Security decisions, executive decisions

↓ Escalate if:
- Security breach
- Data loss
- Major outage

Level 3 CTO/Management:
- Can: Security decisions, cost approval, executive decisions
- Handles: Major incidents, customer communication
```

---

## Emergency Contacts

**Update these with actual contacts:**

```
Primary On-Call: _________________ (Phone: ____________)
Secondary On-Call: _________________ (Phone: ____________)
Tech Lead: _________________ (Phone: ____________)
CTO: _________________ (Phone: ____________)
Database Admin: _________________ (Phone: ____________)
Security Lead: _________________ (Phone: ____________)

Vendor Support:
- Render Support: https://support.render.com
- Vercel Support: https://support.vercel.com
- MongoDB Support: https://docs.mongodb.com/support/

Public Status Page: https://status.yourdomain.com
War Room Channel: #production-incidents (Slack/Teams)
```

---

## Metrics to Track (Post-Incident)

- Mean Time to Detect (MTTD)
- Mean Time to Respond (MTTR)
- Mean Time to Resolution (MTTR)
- Time to Prevention (TTP)
- Impact (users affected, data lost, revenue impact)

---

**Last Updated:** March 19, 2026  
**Version:** 1.0
