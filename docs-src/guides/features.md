# Features Guide

Complete guide to all MessWala features and how to use them.

---

## 💰 Expenses

The expenses module helps track shared costs and calculate fair distribution.

### Recording Expenses

**Access:** Manager and Treasurer only

**Steps:**
```
1. Navigate to Expenses page
2. Click [Add New Expense]
3. Fill the form:
   - Category: Select from predefined list
   - Amount: Enter in rupees (₹)
   - Description: Add details (e.g., "Weekly vegetables from market")
   - Date: Defaults to today, change if needed
4. Click [Save]
5. Confirmation message appears
```

### Expense Categories

Default categories (configurable by admin):
- **Vegetables** — Produce and greens
- **Rice** — Staple grains
- **Gas** — Cooking fuel
- **Salary** — Cook or helper payment
- **Dairy** — Milk and dairy products
- **Spices** — Seasonings
- **Miscellaneous** — Other expenses

**Custom categories:** Admins can add:
- WiFi charges
- Water tank maintenance
- Cleaning supplies
- Electricity (if not included)
- Any other regular expense

### Viewing & Managing Expenses

**Table View:**
- Date (newest first)
- Category (color-coded)
- Amount
- Description
- Recorded by (who added it)

**Filters:**
```
By Category:
├─ Vegetables
├─ Rice
├─ Gas
└─ [All others]

By Date Range:
├─ This week
├─ This month
├─ Last month
└─ Custom range
```

**Actions:**
- View details (click row)
- Edit (if you recorded it)
- Delete (if you recorded it)
- Download CSV report

### Fair Share Calculation

**Formula:**
```
Your Fair Share = (Total Expenses ÷ Active Members) × Your Attendance
```

**Active Members:** Those who attended ≥1 meal in the month

**Example:**
```
Month: March 2026
Total expenses: ₹10,000
Active members: 20 people
You attended: 25 out of 30 meals

Your share = (₹10,000 ÷ 20) × (25÷30)
           = ₹500 × 0.833
           = ₹416.50
```

### Expense Alerts

The system flags unusual spending:

| Alert | Meaning | Action |
|-------|---------|--------|
| 🔴 Red | Unusual high spending for category | Review & discuss |
| 🟡 Yellow | Slightly above average | Monitor next month |
| 🟢 Green | Normal range | No action needed |

---

## ✋ Meal Attendance

Track who eats which meals for fair expense distribution.

### Marking Attendance

**Access:** All user roles

**Steps:**
```
1. Go to Attendance page
2. See meal cards for today:
   ├─ Breakfast (7:30 AM - 9:00 AM)
   ├─ Lunch (12:30 PM - 2:00 PM)
   └─ Dinner (7:30 PM - 9:00 PM)
3. For each meal:
   ├─ Click [Mark Present] if you ate
   ├─ Click [Mark Absent] if you didn't
   └─ Or leave blank if not marked yet
4. Status updates in real-time
```

### Attendance Status

| Status | Meaning | Impact |
|--------|---------|--------|
| ✅ Present | Ate that meal | Counts toward expense share |
| ❌ Absent | Didn't eat | Doesn't count toward expenses |
| 🔲 Not Marked | Unmarked yet | Defaults to absent at day-end |

### Viewing Attendance History

**This Week:**
- See attendance for past 7 days
- View as table or calendar
- See who attended each meal

**This Month:**
- Overall participation percentage
- Meal-wise breakdown
- Attendance trends

**By Member (Managers only):**
- View specific person's attendance
- Identify patterns
- Track consistency

### Attendance Analytics

**Available in Analytics page:**

```
Participation Summary:
├─ Breakfast attendance: 85%
├─ Lunch attendance: 90%
└─ Dinner attendance: 88%

Your Stats:
├─ Days attended: 25/30
├─ Meals marked: 72/90
└─ Participation rate: 80%

Member Ranking:
├─ Most consistent: [Member name]
├─ Least active: [Member name]
└─ Average per member: 87%
```

---

## 🍽️ Menu Management

View and plan meal schedules for the mess.

### Viewing Menu

**Access:** Everyone can view

**Steps:**
```
1. Go to Menu page
2. Select view: Week / Month
3. See schedule organized by:
   ├─ Day of week
   ├─ Meal time (Breakfast/Lunch/Dinner)
   └─ Dishes prepared
4. Read notes: Spice level, allergies, etc.
```

### Menu Format

```
┌─ Monday ─────────────────┐
│                           │
│ Breakfast (7:30 - 9:00)  │
│ • Dosa                   │
│ • Sambar                 │
│ • Chutney               │
│ 🌶️ Spicy                 │
│                           │
│ Lunch (12:30 - 2:00)     │
│ • Rice                   │
│ • Chole bhature         │
│ • Yogurt                │
│ 🟡 Mild                  │
│                           │
│ Dinner (7:30 - 9:00)    │
│ • Roti                  │
│ • Dal                   │
│ • Salad                 │
│                           │
└───────────────────────────┘
```

### Planning Menu (Manager Only)

**Steps:**
```
1. Go to Menu page
2. Click [Edit Menu]
3. Select day
4. Select meal time
5. Enter dishes:
   ├─ Separated by commas
   ├─ E.g., "Dosa, Sambar, Chutney"
   └─ Keep it short & clear
6. Add notes (optional):
   ├─ Spice level (Mild/Medium/Spicy)
   ├─ Contains nuts/dairy/allergens
   ├─ Vegan/Vegetarian info
   └─ Any special info
7. Click Save
```

### Menu Accessibility

Good menu planning:
- ✅ Include variety week-to-week
- ✅ Indicate allergens clearly
- ✅ Plan based on feedback & attendance
- ✅ Consider availability of ingredients

---

## 💬 Feedback & Ratings

Members rate meals and provide improvement suggestions.

### Submitting Feedback

**Access:** All user roles

**Steps:**
```
1. Go to Feedback page
2. Select a meal:
   ├─ Date (defaults to today)
   ├─ Meal type (Breakfast/Lunch/Dinner)
   └─ Time period
3. Rate the meal: 1-5 stars
   ├─ 1 star: Poor (bad taste/quality)
   ├─ 2 stars: Below average
   ├─ 3 stars: Average (OK)
   ├─ 4 stars: Good
   └─ 5 stars: Excellent (would eat again)
4. Add optional comment:
   ├─ What you liked
   ├─ What could improve
   ├─ Suggestions for next time
   └─ Any concerns (allergic, etc.)
5. Click [Submit]
```

### Feedback Fields

**Required:**
- Meal date
- Meal type
- Rating (1-5)

**Optional:**
- Comment (max 500 characters)

### Viewing Feedback (Manager)

**Filters:**
```
By Meal Type:
├─ All
├─ Breakfast
├─ Lunch
└─ Dinner

By Rating:
├─ All ratings
├─ 5 stars (excellent)
├─ 4 stars (good)
├─ 3 stars (average)
├─ 2 stars (below avg)
└─ 1 star (poor)

By Time:
├─ Today
├─ This week
├─ This month
└─ Custom range
```

### Analytics from Feedback

**Insights:**
```
Meal Quality Score:
├─ Breakfast avg: 4.2/5
├─ Lunch avg: 3.8/5
└─ Dinner avg: 4.0/5

Trends:
├─ 📈 Improving (good feedback)
├─ 📉 Declining (more 1-2 stars)
└─ ➡️ Stable (consistent ratings)

Suggestions Summary:
├─ More variety requested
├─ Less spicy preferred
├─ Appreciate sweet items
└─ [Other feedback themes]
```

---

## 📊 Analytics & Reports

Comprehensive insights for managers and admins.

### Expense Analytics

**Available Reports:**

1. **Monthly Breakdown**
   - Total spent
   - Per category
   - Trend vs previous month

2. **Category Distribution**
   - Pie chart of spending
   - Identify highest costs
   - Budget allocation

3. **Expense Trends**
   - Line chart over months
   - Identify patterns
   - Forecast next month

4. **Per-Person Fair Share**
   - Calculate who owes what
   - Export for settlement
   - Print for bulletin board

### Attendance Analytics

**Available Reports:**

1. **Meal Attendance Rates**
   - Breakfast: X% average
   - Lunch: Y% average
   - Dinner: Z% average

2. **Member Participation**
   - Most active members
   - Least active members
   - Participation trend

3. **Time-Based Analysis**
   - Peak meal times
   - Quiet meal times
   - Day-of-week patterns

### Health Score

**Overall Mess Score** (1-5):
```
Factors:
├─ 📊 Expense fairness (are costs distributed evenly?)
├─ 👥 Participation (do people attend meals?)
├─ 🍽️ Feedback average (are members satisfied?)
└─ 💰 Sustainability (is budget sustainable?)
```

### Exporting Data

**Available Formats:**
- CSV (Excel compatible)
- PDF (printable)
- JSON (for integration)

**What you can export:**
- Expense report
- Attendance sheet
- Feedback summary
- Fair share calculation
- Monthly statements

---

## ⚙️ Dashboard

Your personal home page with key information.

### Dashboard Widgets

**Mess Overview:**
- Mess name & members
- Current month summary
- Recent activity

**Your Statistics:**
- Your fair share amount
- Your attendance rate
- Your feedback submissions

**Quick Actions:**
- Mark today's attendance
- Add expense (for managers)
- View menu
- Submit feedback

**Alerts:**
- Outstanding payment
- Pending registrations (admin)
- System notifications

---

## FAQs

### Expenses

**Q: How do I record an expense?**
A: Manager/Treasurer navigates to Expenses > Add New Expense > Fill form > Save

**Q: Can students record expenses?**
A: No. Only managers and treasurers.

**Q: How is fair share calculated?**
A: (Total ÷ Active members) × Your attendance meals

**Q: What if someone doesn't mark attendance?**
A: Defaults to absent (they don't pay for that meal)

**Q: Can I edit old expenses?**
A: Yes, if you recorded it. Other expenses can't be edited.

### Attendance

**Q: When should I mark attendance?**
A: Mark immediately after each meal, or by end of day.

**Q: Can I mark past attendance?**
A: Yes, for up to 30 days past.

**Q: What if I forget to mark?**
A: Contact manager to mark manually, or it counts as absent.

**Q: Do I have to mark daily?**
A: No, only mark meals you actually ate.

### Menu & Feedback

**Q: Who plans the menu?**
A: Manager/Treasurer (or whoever is responsible for cooking)

**Q: How often is the menu updated?**
A: Usually weekly (customizable)

**Q: Why should I give feedback?**
A: It helps improve meals & identifies problems

**Q: Is my feedback anonymous?**
A: No, but it's only visible to managers/admins

### Fair Share

**Q: Why is my fair share different each month?**
A: Because it depends on:
- Total expenses that month
- How many times you attended meals
- How many other members attended

**Q: Can I dispute my fair share?**
A: Yes, discuss with manager. If expenses wrong, they can edit or delete.

**Q: What if I attended less than 1 meal?**
A: You still pay a share (you're still part of the mess).

---

## 🎯 Best Practices

**For Managers:**
1. Record expenses same day
2. Categorize correctly
3. Update menu weekly
4. Review analytics monthly
5. Communicate with members

**For Members:**
1. Mark attendance immediately
2. Provide honest feedback
3. Check menu before meals
4. Verify your fair share payment
5. Report discrepancies quickly

---

**Last Updated:** March 17, 2026  
**Version:** 2.0
