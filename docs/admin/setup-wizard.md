# Admin Setup Wizard Guide

Complete guide for admins to configure MessWala for the first time.

---

## 🎯 Overview

The **Admin Setup Wizard** configures your mess on first login. It's a 3-step process that takes ~5 minutes.

**What you'll configure:**
1. Mess information (name, contact)
2. Expense categories
3. Meal times

After setup, the system is ready for students to join.

---

## ⏱️ When to Do Setup

**When:** First time any admin logs in  
**Where:** Automatic redirect to `/admin/setup`  
**Time:** ~5 minutes  
**Required:** Yes (can't skip)  

---

## Step 1️⃣: Mess Information

### What You're Configuring

Basic information about your mess/hostel.

### Fields

**Mess Name** (Required)
- Example: "Krishna Bhawan", "Hostel Block A"
- Used in dashboard, reports, etc.
- Can change later in settings

**Description** (Optional)
- Brief info about your mess
- Example: "Main hostel for engineering students"
- Visible in some reports

**Email** (Optional)
- Contact email for the mess
- Example: "mess@college.edu"
- Shown to members for inquiries

**Phone** (Optional)
- Contact phone/mobile
- Example: "9876543210"
- Shown to members for contact

### Best Practices

✅ Use clear, formal names  
✅ Include email/phone for member inquiries  
✅ Keep description brief (<100 chars)  
✅ Use consistent naming across all systems  

### Save & Continue

Click "Next" to proceed to Step 2.

---

## Step 2️⃣: Expense Categories

### What You're Configuring

The types of expenses you'll track (e.g., Vegetables, Salary).

These appear as dropdown options when recording expenses.

### Preset Categories

MessWala provides these common categories:

```
☑ Vegetables      (Produce, greens, onions, tomatoes)
☑ Rice            (Rice, other grains, staples)
☑ Gas             (Cooking fuel, LPG cylinders)
☑ Salary          (Cook, helper, staff payment)
☑ Dairy           (Milk, yogurt, paneer, cheese)
☑ Spices          (Seasonings, spice powders)
☑ Miscellaneous   (Misc expenses that don't fit)
```

### Select Preset Categories

1. Check the boxes for categories your mess will use
2. Most messes use all 7 presets
3. You can always add more later

### Add Custom Categories

For expenses not in presets:

**Click "Add Category"**

Enter category names:
- WiFi charges
- Electricity (if separate)
- Water tank maintenance
- Cleaning supplies
- Kitchen equipment
- Advance payment
- [Any others specific to your mess]

### Recommendations

**Minimum:** 3-4 categories (Vegetables, Rice, Gas, Misc)

**Ideal:** 6-8 categories (provides good breakdown)

**Maximum:** 15+ (too many for easy selection)

### Examples by Mess Type

**Hostel with cook:**
- Vegetables
- Rice
- Gas / Electricity
- Salary (for cook)
- Dairy
- Spices
- Miscellaneous

**Student co-op mess:**
- Vegetables
- Rice & Staples
- Gas / Cooking
- Dairy
- Spices
- Costs (containers, cleaning)

**Professional mess:**
- Food (Vegetables, Fruits, Proteins)
- Grains (Rice, Wheat, Dal)
- Utilities (Gas, Water, Electricity)
- Salaries
- Supplies (Containers, Equipment)
- Maintenance

### Save & Continue

Click "Next" to proceed to Step 3.

---

## Step 3️⃣: Meal Times

### What You're Configuring

When meals are served (breakfast, lunch, dinner, etc.).

These appear as options when:
- Marking attendance
- Planning menus
- Recording feedback

### Default Meal Times

MessWala provides these standard times:

**Breakfast** (Morning meal)
- Start: 7:30 AM
- End: 9:00 AM
- Duration: 1.5 hours

**Lunch** (Midday meal)
- Start: 12:30 PM
- End: 2:00 PM (14:00)
- Duration: 1.5 hours

**Dinner** (Evening meal)
- Start: 7:30 PM
- End: 9:00 PM
- Duration: 1.5 hours

### Customize Times

If your mess has different meal times:

**For each meal:**
1. Click "Edit" to change times
2. Set **Start Time** (e.g., 8:00 AM)
3. Set **End Time** (e.g., 9:30 AM)
4. Save

### Common Customizations

**Early breakfast mess:**
- Breakfast: 6:00 - 7:30 AM
- Lunch: 12:00 - 1:30 PM
- Dinner: 7:00 - 8:30 PM

**Late breakfast mess:**
- Breakfast: 8:30 - 10:00 AM
- Lunch: 1:00 - 2:30 PM
- Dinner: 8:00 - 9:30 PM

**Two-meal mess:**
- Lunch: 12:30 - 2:00 PM
- Dinner: 7:30 - 9:00 PM
- (Remove breakfast)

### Add More Meals

Click "Add Meal Type" for:
- Snacks
- Tea time
- Second breakfast
- Late dinner
- Any meals your mess serves

### Important Notes

🔔 **Meal times are for reference only**, not enforced  
🔔 **Students can mark attendance anytime** during windows  
🔔 **Times shown on Attendance & Menu pages**

### Save & Complete

Click "Complete Setup" to finish.

---

## ✅ After Setup

### What Happens

1. Configuration saved to database
2. System becomes operational
3. Dashboard shows empty state
4. Ready to invite members

### Next Steps

1. **Approve Users**
   - Students register
   - You approve them
   - They can now use system

2. **Record First Expenses**
   - Manager records expenses
   - Establish categories
   - Build history

3. **Plan Meals**
   - Manager creates menu
   - Set weekly schedule
   - Members see upcoming meals

4. **Members Mark Attendance**
   - Students mark meals eaten
   - Data starts building up
   - Analytics populate

---

## 🔄 Editing Configuration Later

### Change Mess Information

**Go to:** Settings → Mess Configuration

Can edit:
- Mess name
- Description
- Email
- Phone

### Change Expense Categories

**Go to:** Settings → Manage Categories

Can:
- Add new categories
- Delete unused categories
- Note: Old records keep original category

### Change Meal Times

**Go to:** Settings → Manage Meals

Can:
- Edit times
- Add new meal types
- Delete meals (if unused)
- Note: Old records keep original meal type

---

## ❓ Setup Troubleshooting

### Setup Page Won't Load

**Solution:**
- Clear browser cache
- Try incognito/private mode
- Try different browser
- Refresh page (Ctrl+F5)

### Can't Save Changes

**Check:**
- All required fields filled
- No special characters in names
- Internet connection active
- Try clicking Save again

### Already Configured (can't redo setup)

**Current limitation:** Setup can only be done once

**To change:**
1. Ask super-admin to reset
2. Or manually update in database
3. Or delete MessConfig and re-login

---

## 📋 Setup Checklist

Before clicking "Complete Setup":

- [ ] Mess name entered
- [ ] Relevant expense categories selected
- [ ] Custom categories added if needed
- [ ] Meal times match your schedule
- [ ] All times in 24-hour format
- [ ] No typos in names

---

## 🎯 Pro Tips

1. **Start simple** — Add more categories as needed

2. **Use consistent naming** — Match expense receipts

3. **Align meal times** — Match kitchen schedule

4. **Plan flexibility** — Buffer time (e.g., 7:30-9:00 AM not 7:45-8:45 AM)

5. **Test immediately** — Record first expense after setup

6. **Communicate** — Share meal times with members

---

## 📞 Help & Support

**Setup not working?**
- See [Troubleshooting Guide](../deployment/troubleshooting.md)
- Check [Deployment Guide](../deployment/setup.md)
- Contact system admin

**Want different configuration?**
- You can edit most settings later
- See "Editing Configuration Later" section above

---

**Last Updated:** March 17, 2026  
**Version:** 2.0
