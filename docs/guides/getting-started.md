# Getting Started with MessWala

Welcome to MessWala! This guide will help you get up and running in minutes.

---

## 🎯 What is MessWala?

MessWala is a comprehensive **mess management system** designed for hostels and shared living spaces. It helps manage:

- **Expenses** — Track shared costs and calculate fair distribution
- **Meal Attendance** — Mark daily meal participation
- **Menu Planning** — Organize and communicate meal schedules
- **Feedback** — Rate meals and provide suggestions
- **Analytics** — View spending trends and participation metrics

---

## 👤 Choose Your Path

### I'm an Admin (Setting up a new mess)
1. **[Deployment Guide](../deployment/setup.md)** — Deploy the application
2. **[Admin Setup Wizard](../admin/setup-wizard.md)** — Configure your mess
3. **[User Management](../admin/user-management.md)** — Approve initial users

### I'm a Manager/Treasurer
1. **[Getting Started](#login)** — Login to your account
2. **[Features Guide](features.md)** — Learn about expense tracking & analytics
3. **[API Reference](../api/endpoints.md)** (if integrating) — Connect to MessWala

### I'm a Student/Resident
1. **[Getting Started](#login)** — Login to your account
2. **[Features Guide](features.md)** — Mark attendance, view menu, give feedback
3. **[User Roles](user-roles.md)** — Understand your permissions

---

## 📱 Login & Authentication

### Step 1: Access MessWala

**Live URL:** https://mess-walah.vercel.app

### Step 2: Choose Authentication Method

#### Option A: Google Sign-In (Recommended)
```
1. Click "Login with Google"
2. Select your Google account
3. Authorize MessWala
4. System auto-creates your account
5. Complete your profile if first login
```

**Advantages:**
- ✅ No password to remember
- ✅ Secure (Google-backed)
- ✅ Fast login
- ✅ Works on mobile

#### Option B: Email & Password
```
1. Click "Don't have an account? Register"
2. Enter your email address
3. Create a strong password
4. Fill in your details:
   - Full Name
   - College ID
   - Room Number
   - Phone Number
5. Submit for approval
```

**After registration:**
- Admins receive approval notification
- Your account is pending until approved
- You can login once approved

### Step 3: Complete Your Profile

On first login, update:
- **Profile Picture** (optional)
- **Contact Information** (phone, email)
- **Additional Details** (room, preferences)

---

## 🎨 Dashboard Overview

After login, you'll see your personalized dashboard with:

### Dashboard Cards
- **Mess Information** — Quick stats about your mess
- **Expense Summary** — Monthly spending overview
- **Attendance Rate** — Your meal participation percentage
- **Quick Actions** — Shortcuts to common tasks

### Navigation Menu
```
📊 Dashboard        (Home & overview)
💰 Expenses         (Track & view expenses)
✋ Attendance       (Mark meal attendance)
🍽️  Menu           (View meal schedule)
💬 Feedback        (Rate meals)
📈 Analytics       (View reports & trends)
⚙️  Settings       (Manage account)
```

### Empty States
When you first login to a new mess, some sections show "No data yet":
- **Expenses** — Managers haven't recorded any yet
- **Attendance** — No meals marked
- **Menu** — No meals planned

This is **normal**. Data populates as managers and members interact with MessWala.

---

## 💰 Expenses (Manager & Student View)

### As a Manager/Treasurer

**Recording an Expense:**
```
1. Go to Expenses page
2. Click [Add Expense]
3. Select Category (Vegetables, Rice, Gas, etc.)
4. Enter Amount
5. Add Description (optional)
6. Set Date (defaults to today)
7. Click [Save]
```

**Viewing Expenses:**
- See all expenses in a table
- Filter by category or date range
- View monthly trends in chart
- Download CSV reports

### As a Student

**Viewing Expenses:**
- See all mess expenses
- Understand fair cost distribution
- Cannot add expenses (unless manager role)
- Your "fair share" calculated automatically

---

## ✋ Attendance System

### How Attendance Works

**Marking Attendance for Today's Meals:**
```
1. Go to Attendance page
2. See meal cards (Breakfast, Lunch, Dinner)
3. Click [Mark Present] if you ate that meal
4. Click [Mark Absent] if you skipped
```

**Attendance History:**
- View past week's attendance
- See who attended each meal
- Track your own monthly participation

### Why Attendance Matters

- **Fair Expense Sharing** — Only active members share costs
- **Meal Planning** — Managers forecast portions based on attendance
- **Analytics** — Identify popular and unpopular meals

---

## 🍽️ Menu

### Viewing Menu

```
1. Go to Menu page
2. See this week's schedule
3. View meals by day and type (Breakfast/Lunch/Dinner)
4. Read dish names and notes
```

### As a Manager: Planning Meals

```
1. Go to Menu page
2. Click [Edit Menu] (if manager)
3. Select day and meal type
4. Enter dishes (comma-separated)
5. Add notes (optional)
6. Save
```

---

## 💬 Feedback & Ratings

### Giving Feedback

```
1. Go to Feedback page
2. Select a meal and date
3. Rate from 1-5 stars (1=Poor, 5=Excellent)
4. Add optional comments
5. Submit
```

### Why Feedback Matters

- Managers see which meals need improvement
- Identify dietary preferences
- Track satisfaction trends
- Plan better menus

---

## 📊 Analytics Dashboard

**Access:** Admin and Manager only

### Available Reports

#### Expense Analytics
- Monthly breakdown with charts
- Category distribution (pie chart)
- Spending trends over time
- Per-person fair share calculation

#### Attendance Analytics
- Meal attendance rates
- Member participation trends
- Peak/quiet meal times
- Monthly attendance reports

#### Health Score
- Overall mess health (1-5 scale)
- Meal quality score
- Attendance rate score
- Fair expense distribution score

---

## ⚙️ Account Settings

### Available Options

**Profile Settings:**
- Update full name
- Change profile picture
- Update contact information
- Change password

**Preferences:**
- Email notifications
- Language selection
- Dashboard layout

**Security:**
- Change password
- Linked accounts (Google)
- Session management
- Login history

---

## 🔐 Security Tips

Do:
- ✅ Use a strong, unique password
- ✅ Enable 2FA on Google account
- ✅ Log out on shared computers
- ✅ Report suspicious activity

Don't:
- ❌ Share your password
- ❌ Use the same password as other accounts
- ❌ Click links in suspicious emails
- ❌ Login on unsecured WiFi without VPN

---

## ❓ Common Questions

**Q: How do I reset my password?**
A: Click "Forgot Password" on login page. Check your email for reset link.

**Q: Can I change my role?**
A: Only admins can change roles. Contact your mess admin.

**Q: Where's my expense report?**
A: Go to Analytics > Expenses. Export as CSV.

**Q: Why can't I see Expenses page?**
A: Your role might not have permission. Ask admin.

**Q: How is fair share calculated?**
A: `Fair Share = Total Expenses ÷ Active Members`  
Active = attended at least 1 meal this month.

**Q: Can I access offline?**
A: No, MessWala requires internet. Data syncs automatically.

---

## 🆘 Troubleshooting

### Login Issues

**"Invalid credentials"**
- Double-check email and password
- Reset password if forgotten
- Try Google Sign-In instead

**"User not approved"**
- Registration pending admin approval
- Ask admin to check pending registrations
- Typically approved within 24 hours

### Data Issues

**"No data showing"**
- Refresh page (Ctrl+Shift+R)
- Clear browser cache
- Try incognito/private mode
- Reload from fresh URL

**"Changes not saving"**
- Check internet connection
- Verify message says "Saved successfully"
- Try again after 5 seconds
- Contact admin if persists

### Performance Issues

**"Page loading slowly"**
- Check internet speed
- Close other browser tabs
- Try different browser
- Clear cache and cookies

---

## 📚 Next Steps

- **For Managers:** [Features Guide](features.md) → Learn expense tracking
- **For Students:** [Features Guide](features.md) → Learn your options
- **For Admins:** [Admin Guide](../admin/setup-wizard.md) → Configure mess
- **For Developers:** [API Guide](../api/endpoints.md) → Integrate MessWala

---

## 📞 Need Help?

- **General Questions:** Check [Features Guide](features.md)
- **Setup Issues:** See [Deployment Guide](../deployment/setup.md)
- **Admin Issues:** See [Admin Guide](../admin/setup-wizard.md)
- **Technical Problems:** See [Troubleshooting](../deployment/troubleshooting.md)
- **Report Bugs:** [GitHub Issues](https://github.com/soumyadeepsarkar-2004/MessWala/issues)

---

**Last Updated:** March 17, 2026  
**Version:** 2.0  
**Ready to start?** Login at https://mess-walah.vercel.app
