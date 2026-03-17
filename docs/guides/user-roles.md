# User Roles & Permissions

MessWala has three user roles, each with specific permissions and responsibilities. Understanding your role is key to using MessWala effectively.

---

## 👨‍💼 Admin Role

### What is an Admin?

Admins are system administrators responsible for:
- Initial mess setup and configuration
- User approval and management
- System maintenance
- Full access to all features

### Permissions

| Feature | Permission | Details |
|---------|-----------|---------|
| **Dashboard** | Full | View all analytics & user activity |
| **Expenses** | View & Edit | Can view all, add new, edit/delete own |
| **Expenses Analytics** | Full | Monthly trends, category breakdown, per-person costs |
| **Attendance** | View | See all member attendance |
| **Attendance Analytics** | Full | Patterns, rates, member details |
| **Menu** | View & Edit | Can create, update, delete menus |
| **Feedback** | View | See all feedback & ratings |
| **User Management** | Full | Approve, reject, edit, assign roles |
| **Mess Configuration** | Full | Set categories, meal times, mess info |
| **System Settings** | Full | Database, security, integrations |
| **Reports** | Full | Export any data as CSV/PDF |

### First-Time Setup (Admin Only)

When an admin logs in for the first time, they must:

1. **Complete Setup Wizard:**
   - Mess name and description
   - Contact information
   - Expense categories
   - Meal time schedule

2. **Verify Database Connection**
   - Check MongoDB connectivity
   - Verify configuration stored

3. **Approve Initial Users**
   - Review pending registrations
   - Accept or reject members
   - Assign roles as needed

### Admin Responsibilities

#### Daily Tasks
- ✅ Approve pending registrations
- ✅ Review expense submissions (optional)
- ✅ Monitor system health
- ✅ Respond to user issues

#### Weekly Tasks
- ✅ Review analytics reports
- ✅ Check attendance trends
- ✅ Approve expense reports
- ✅ Plan upcoming menus

#### Monthly Tasks
- ✅ Generate financial reports
- ✅ Audit fair share calculations
- ✅ Review feedback trends
- ✅ Planning next month

---

## 👔 Manager (Treasurer)

### What is a Manager?

Managers handle financial and operational aspects:
- Record and categorize expenses
- Create and manage menus
- View analytics and reports
- Support admin in day-to-day operations

### Permissions

| Feature | Permission | Details |
|---------|-----------|---------|
| **Dashboard** | Limited | View summaries & trends |
| **Expenses** | Full | Add, edit, view all, delete own |
| **Expenses Analytics** | Full | All trends, reports, per-person costs |
| **Attendance** | View | See attendance records |
| **Attendance Analytics** | Full | View patterns & detailed reports |
| **Menu** | View & Edit | Create, update, delete menus |
| **Feedback** | View | See all feedback |
| **User Management** | View | List all users, see status |
| **Mess Configuration** | Edit | Cannot change (admin only) |
| **System Settings** | None | No access |
| **Reports** | Full | Export expense & attendance data |

### Manager Responsibilities

#### Daily Tasks
- ✅ Record expenses (grocery, utilities, etc.)
- ✅ Categorize expenses properly
- ✅ Update menu if needed
- ✅ Monitor feedback

#### Weekly Tasks
- ✅ Review expense trends
- ✅ Plan next week's menu
- ✅ Check attendance rates
- ✅ Communicate with members

#### Monthly Tasks
- ✅ Generate expense report
- ✅ Calculate fair share per member
- ✅ Review attendance summary
- ✅ Plan next month's budget

### Manager Key Features

**Expense Tracking:**
```
Go to Expenses page
├─ Add new expense
├─ Choose category
├─ Enter amount & description
├─ View all expenses
├─ Filter by date/category
└─ Export reports
```

**Menu Planning:**
```
Go to Menu page
├─ View current month
├─ Click Edit Menu
├─ Select day & meal time
├─ Enter dishes
├─ Add notes (spicy level, allergies, etc.)
└─ Save schedule
```

**Analytics:**
```
Go to Analytics page
├─ Expense breakdown (pie chart)
├─ Monthly trends (line chart)
├─ Fair share calculation
├─ Attendance rates
└─ Member participation
```

---

## 👨‍🎓 Student Role

### What is a Student?

Students (residents/members) are:
- Individual mess members
- Mark their meal attendance
- Provide feedback on meals
- View shared information

### Permissions

| Feature | Permission | Details |
|---------|-----------|---------|
| **Dashboard** | Limited | Personal overview only |
| **Expenses** | View | View all expenses, your fair share |
| **Expenses Analytics** | View | Monthly breakdown, trends |
| **Attendance** | Full | Mark own, view past |
| **Attendance Analytics** | View | View own attendance %, trends |
| **Menu** | View | View upcoming meals |
| **Feedback** | Full | Submit ratings & comments |
| **User Management** | None | No access |
| **Mess Configuration** | None | No access |
| **System Settings** | None | No access |
| **Reports** | None | No access |

### Student Responsibilities

#### Daily Tasks
- ✅ Mark attendance for meals eaten
- ✅ View today's menu
- ✅ Check your fair share amount

#### Weekly Tasks
- ✅ Review attendance for the week
- ✅ Provide feedback on meals
- ✅ Check upcoming menu

#### Monthly Tasks
- ✅ Review your fair share calculation
- ✅ Pay your portion to appropriate person
- ✅ Review attendance rate

### Student Key Features

**Marking Attendance:**
```
Go to Attendance page
├─ See today's meals:
│  ├─ Breakfast (7:30 - 9:00 AM)
│  ├─ Lunch (12:30 - 2:00 PM)
│  └─ Dinner (7:30 - 9:00 PM)
├─ Click Mark Present (if you ate)
├─ Click Mark Absent (if you didn't)
└─ View past attendance
```

**Giving Feedback:**
```
Go to Feedback page
├─ Select meal & date
├─ Rate 1-5 stars
├─ Add comments (optional):
│  ├─ Taste
│  ├─ Quantity
│  ├─ Suggestions
│  └─ Allergen warnings
└─ Submit
```

**Viewing Menu:**
```
Go to Menu page
├─ See this week's schedule
├─ Check meal times
├─ Read dishes & descriptions
└─ Plan your participation
```

**Understanding Fair Share:**
```
Your cost = (Total expenses ÷ members who attended) × your attendance
```

Example:
- Total expenses: ₹3000
- Members attended at least 1 meal: 10
- Your attendance: 7 out of 10 meals

Your share: (3000 ÷ 10) × 7 = **₹2100**

---

## 🔄 Role Upgrade/Downgrade

### How to Get a Different Role

**Student → Manager:**
- Ask admins for role upgrade
- Admins review your participation
- Admins confirm responsibility
- Your role changes immediately

**Current Manager → Student:**
- Admins can downgrade if needed
- You lose manager permissions
- Your data remains accessible
- Clear handoff recommended

**Any Role → Admin:**
- Requires explicit admin action
- Not usually granted to students
- New admins need training
- Discuss before granting

### Requesting Role Change

1. Contact your mess admin
2. Explain why you need the upgrade
3. Discuss responsibilities
4. Admin approves and updates

---

## Permission Matrix Summary

```
Feature                  Admin    Manager   Student
─────────────────────────────────────────────────────
Dashboard                Full     Limited   Limited
Expenses (View)          ✓        ✓         ✓
Expenses (Add/Edit)      ✓        ✓         ✗
Attendance (Mark)        ✓        ✓         ✓
Attendance (View All)    ✓        ✓         ✗
Menu (View)              ✓        ✓         ✓
Menu (Edit)              ✓        ✓         ✗
Feedback (Submit)        ✓        ✓         ✓
Feedback (View All)      ✓        ✓         ✗
Analytics                Full     Full      View
User Management          ✓        ✗         ✗
Mess Configuration       ✓        View      ✗
System Settings          ✓        ✗         ✗
Reports Export           ✓        ✓         ✗
```

---

## 🔐 Security per Role

### Admin-Level Security
- Full audit log access
- Cannot be removed by other users
- All actions logged
- Special authentication required

### Manager-Level Security
- Expense verification enabled
- Actions logged for audit
- Cannot change own role
- Permissions reviewed monthly

### Student-Level Security
- Personal data encrypted
- Can only edit own records
- View-only access to shared data
- No system settings access

---

## 📋 Role Assignment Checklist

### For Admins

When assigning roles, ask:
- ✓ Does this person understand responsibilities?
- ✓ Do they have the time commitment?
- ✓ Are they trustworthy with financial data?
- ✓ Have they been formally chosen by the mess?
- ✓ Do others agree with the choice?

### For Managers

Before accepting, confirm:
- ✓ You understand expense tracking system
- ✓ You can commit 1-2 hours weekly
- ✓ You're comfortable with key-keeping/finances
- ✓ You have backup support

---

## ❓ Common Questions

**Q: Can a student view other students' attendance?**
A: No. Students see only overall stats, not individual records.

**Q: Can a manager approve users?**
A: No. Only admins can approve registrations.

**Q: What if admin isn't available?**
A: Appoint a backup admin. Multiple admins can exist.

**Q: Can I have multiple roles?**
A: No. Each user has one primary role.

**Q: Do roles expire?**
A: No, unless admins change them.

---

**Last Updated:** March 17, 2026  
**Version:** 2.0
