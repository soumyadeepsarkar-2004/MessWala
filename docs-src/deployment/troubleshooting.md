# Troubleshooting Guide

Solutions to common MessWala issues.

---

## 🔑 Login & Authentication

### "Invalid Credentials"

**Problem:** Can't login with email/password

**Solutions:**
1. ✓ Double-check email address (typo?)
2. ✓ Verify password is correct (caps lock on?)
3. ✓ Try "Forgot Password" to reset
4. ✓ Try Google Sign-In instead
5. ✓ Clear browser cookies/cache
6. ✓ Try different browser

**Still not working?**
- Account may not exist
- May not be approved yet
- Check with admin

---

### "User Not Approved"

**Problem:** Registration pending approval

**Solutions:**
1. ✓ Ask admin to check pending registrations
2. ✓ Approval usually within 24 hours
3. ✓ Check email for approval notification
4. ✓ Verify registration was submitted successfully

**Check status:**
- Admin can see pending users in User Management
- They can approve immediately in dashboard

---

### "Google Sign-In Not Working"

**Problem:** Google OAuth login fails

**Solutions:**
1. ✓ Verify Google account works (test on another site)
2. ✓ Check Google cookies are enabled
3. ✓ Try different Google account
4. ✓ Clear browser cache
5. ✓ Try incognito/private mode
6. ✓ Disable browser extensions (AdBlock, etc.)

**Admin check:**
- Ensure Google Client ID is configured
- Check environment variable: `VITE_GOOGLE_CLIENT_ID`

---

### Token Expired / Logged Out

**Problem:** Getting logged out randomly

**Solutions:**
1. ✓ Token valid for 7 days after login
2. ✓ Login again (new token issued)
3. ✓ Check if session timeout is active
4. ✓ Clear cache to remove old token

**Note:** Automatic refresh not yet implemented (future feature)

---

## 📊 Dashboard & Data Issues

### "No Data Showing" / "Loading Forever"

**Problem:** Dashboard empty or loading stuck

**Solutions:**
1. ✓ Check internet connection
2. ✓ Refresh page (F5 or Ctrl+R)
3. ✓ Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
4. ✓ Clear cache: Settings → Cache → Clear
5. ✓ Try incognito/private mode
6. ✓ Try different browser
7. ✓ Check if backend is up (visit `/api/health`)

**Check backend:**
```bash
curl https://messwala-6jvj.onrender.com/api/health
# Should return: {"status":"ok","dbState":1}
```

---

### "Changes Not Saving"

**Problem:** Submit form but changes don't appear

**Solutions:**
1. ✓ Check for error message on page
2. ✓ Verify message says "Saved successfully"
3. ✓ Refresh page to confirm change
4. ✓ Wait 5 seconds and try again
5. ✓ Check internet connection
6. ✓ Verify you have permission for that action

**Debug:**
- Open browser dev tools (F12)
- Go to Network tab
- Submit form
- Check response is 200/201 (not 400/500)

---

### "Outdated Data / Not Syncing"

**Problem:** Data seems outdated

**Solutions:**
1. ✓ Hard refresh (Ctrl+Shift+R)
2. ✓ Close and reopen app
3. ✓ Logout and login
4. ✓ Check another device (is data there?)
5. ✓ Check backend is responsive

**Database check:**
- Contact admin to verify database is working

---

## 💰 Expenses Issues

### "Can't Add Expense"

**Problem:** Add Expense button not working or form won't submit

**Solutions:**
1. ✓ Verify you're a Manager (Student can't add)
2. ✓ Check all required fields filled
3. ✓ Verify amount is valid number (not text)
4. ✓ Check category is selected
5. ✓ Try different browser
6. ✓ Check internet connection

**Debug:**
- Open browser console (F12)
- Look for error messages
- Check if form validation error shows

---

### "Expense Missing/Deleted"

**Problem:** Expense disappeared or not showing

**Solutions:**
1. ✓ Refresh page
2. ✓ Check date filter (might be filtered out)
3. ✓ Scroll to find (might be out of view)
4. ✓ Check category filter
5. ✓ Only original recorder can delete (not you?)
6. ✓ Check different month filter

**Can't undo delete:**
- Currently no undo feature
- Contact admin to restore from backup

---

### "Fair Share Calculation Wrong"

**Problem:** Fair share amount seems incorrect

**Solutions:**
1. ✓ Verify all expenses recorded correctly
2. ✓ Check your attendance marked for that month
3. ✓ Formula: (Total ÷ Active) × Your attendance
4. ✓ "Active" = attended ≥1 meal in month
5. ✓ Refresh page to recalculate
6. ✓ Contact manager to verify expenses

**Example calculation:**
```
Total expenses: ₹3000
Active members: 10
Your meals: 25 eaten, 30 total possible
Your share = (₹3000 ÷ 10) × (25/30) = ₹2500
```

---

## ✋ Attendance Issues

### "Can't Mark Attendance"

**Problem:** Mark Present button not responding

**Solutions:**
1. ✓ Check date (can only mark today and past 30 days)
2. ✓ Verify internet connection
3. ✓ Try clicking again
4. ✓ Refresh page
5. ✓ Logout and login
6. ✓ Try incognito mode

**Expected behavior:**
- Mark instantly with checkmark
- Shows "Marked" confirmation
- Can undo by clicking again

---

### "Attendance Not Saving"

**Problem:** Mark present but doesn't stay marked

**Solutions:**
1. ✓ Check for error notification
2. ✓ Verify action completed with checkmark
3. ✓ Refresh page to persist
4. ✓ Wait 2-3 seconds before refreshing
5. ✓ Check internet connection active

---

## 🍽️ Menu & Feedback Issues

### "Can't See Menu"

**Problem:** Menu page shows empty or loading

**Solutions:**
1. ✓ Refresh page
2. ✓ Menu might not be planned yet (ask manager)
3. ✓ Check correct date/week selected
4. ✓ Hard refresh (Ctrl+Shift+R)

**Admin check:**
- Manager can create menu in Menu page
- Might need to plan upcoming weeks

---

### "Can't Add Feedback"

**Problem:** Feedback form won't submit

**Solutions:**
1. ✓ Verify all required fields (meal, rating)
2. ✓ Check rating is selected (1-5 stars)
3. ✓ Check date is valid
4. ✓ Verified internet connection
5. ✓ Try different browser

---

### "Feedback Not Showing"

**Problem:** Submitted feedback missing

**Solutions:**
1. ✓ Refresh page
2. ✓ Check correct meal type filter
3. ✓ Check correct date range
4. ✓ Check correct meal type selected
5. ✓ Verify not deleted (can you edit?)
6. ✓ Look in another time period

---

## 📈 Analytics Issues

### "Analytics Page Blank"

**Problem:** Analytics section not loading data

**Solutions:**
1. ✓ Only managers can view (are you manager?)
2. ✓ Might be no data yet (check month)
3. ✓ Refresh page
4. ✓ Select different month
5. ✓ Try hard refresh
6. ✓ Check backend `/api/health`

---

### "Charts/Graphs Not Loading"

**Problem:** Analytics shows but charts are empty

**Solutions:**
1. ✓ Data might be loading (wait 5 seconds)
2. ✓ Refresh page
3. ✓ Check if data exists for period
4. ✓ Try different month
5. ✓ Try different browser

**Debug:**
- Check browser console for errors (F12)
- Look for specific error messages

---

## 🔐 Admin-Specific Issues

### "Can't Approve Users"

**Problem:** Approve button not working

**Solutions:**
1. ✓ Verify you're admin (other roles can't)
2. ✓ Verify user status is "Pending"
3. ✓ Refresh User Management page
4. ✓ Try different user
5. ✓ Try logout/login

---

### "Can't Change User Role"

**Problem:** Role change button missing or not working

**Solutions:**
1. ✓ Only admins can change roles
2. ✓ Try refreshing page
3. ✓ Try logout/login
4. ✓ Try different user
5. ✓ Try different browser

---

### "Setup Wizard Not Loading"

**Problem:** Admin setup page blank on first login

**Solutions:**
1. ✓ Clear browser cache
2. ✓ Try private/incognito mode
3. ✓ Refresh page (F5)
4. ✓ Try different browser
5. ✓ Try different device
6. ✓ Hard refresh (Ctrl+Shift+R)

**Alternative:**
- Contact super-admin
- Manually access setup at `/admin/setup`

---

## 🔗 Connectivity Issues

### "CORS Error in Console"

**Problem:** Browser shows CORS error

**Solutions:**
1. ✓ Backend API URL might be wrong
2. ✓ Check environment variable: `VITE_API_URL`
3. ✓ Verify backend domain matches
4. ✓ Try redeploying frontend
5. ✓ Wait 5 minutes for changes to propagate
6. ✓ Clear cache

**Example correct URLs:**
```
Frontend: https://mess-walah.vercel.app
Backend: https://messwala-6jvj.onrender.com/api
```

---

### "Network Error / 502 Bad Gateway"

**Problem:** Network error from backend

**Solutions:**
1. ✓ Backend might be down (check status)
2. ✓ Backend restarting (wait 30 seconds)
3. ✓ Try refresh page
4. ✓ Check internet connection
5. ✓ Try different network (WiFi vs Mobile)

**Check backend:**
```
Visit: https://messwala-6jvj.onrender.com/api/health
Should return: {"status":"ok","dbState":1}
```

**If backend down:**
- Try refreshing page (auto-restart after few min)
- Or contact admin

---

## 🆘 Getting Help

### Gather Debug Information

When reporting an issue:

1. **Screenshot** of the error
2. **Browser name & version** (Chrome 120, Firefox 121, etc.)
3. **Operating system** (Windows, Mac, Linux, iOS, Android)
4. **Steps to reproduce** the issue
5. **Console errors** (F12 → Console tab)
6. **Network errors** (F12 → Network tab)

### Where to Report

**Bug Reports:**
- GitHub Issues: https://github.com/soumyadeepsarkar-2004/MessWala/issues

**Quick Help:**
- Contact your mess admin
- Check this troubleshooting guide

**Still stuck?**
- Try different device/browser first
- Clear all cache and cookies
- Logout and login fresh

---

## 📱 Mobile-Specific Issues

### "App Not Working on Phone"

**Solutions:**
1. ✓ Check internet connection
2. ✓ Try mobile browser (Chrome, Safari)
3. ✓ Refresh page
4. ✓ Close and reopen browser
5. ✓ Try desktop version (compare)
6. ✓ Clear browser data (settings)

### "Slow on Mobile"

**Solutions:**
1. ✓ Check 4G/WiFi signal strength
2. ✓ Close other apps
3. ✓ Try WiFi instead of mobile data
4. ✓ Refresh and wait for load

---

## 🔄 Performance Issues

### "Page Loading Slow"

**Solutions:**
1. ✓ Check internet speed
2. ✓ Close other browser tabs
3. ✓ Disable browser extensions
4. ✓ Clear browser cache
5. ✓ Try different browser
6. ✓ Try different network

---

## 📋 Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request (invalid data) | Check form inputs |
| 401 | Unauthorized (no token) | Login again |
| 403 | Forbidden (no permission) | Check your role |
| 404 | Not Found | Page/endpoint doesn't exist |
| 500 | Server Error | Contact admin, try again |
| CORS Error | Cross-origin error | Check API URL config |
| TIMEOUT | Request took too long | Retry, check backend |

---

**Last Updated:** March 17, 2026  
**Version:** 2.0  
**Still need help?** Check [Getting Started](../guides/getting-started.md) or contact your admin.
