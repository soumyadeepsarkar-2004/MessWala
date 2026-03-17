# User Management Guide

How to approve, manage, and configure users as an admin.

---

## 👥 User Management Overview

As an admin, you control:
- **User registration approvals**
- **Role assignments** (Manager, Student, etc.)
- **User deactivation/removal**
- **Account management**

---

## 📝 Registration Flow

### How Students Register

1. User goes to login page
2. Clicks "Register"
3. Fills form:
   - Email
   - Password
   - Full name
   - College ID
   - Room number
   - Phone
4. Submits → Status: **Pending**

### Your Role (Approval)

You (as admin) must:
1. Review pending registrations
2. Verify they're legitimate mess members
3. Approve or reject

---

## ✅ Approving Users

### Find Pending Registrations

**Method 1: Dashboard**
1. Go to Dashboard
2. See "Pending Approvals" widget
3. Click to review

**Method 2: User Management**
1. Go to Settings → User Management
2. Filter: Status = "Pending"
3. See list of pending users

### Review User Details

For each pending user:
- Email
- Full name
- College ID
- Room number
- Phone
- Registration date

### Approve User

1. Click user → "Details"
2. Review information
3. Click "Approve" button
4. Confirm

**Result:**
- Status changes to "Approved"
- Email sent to user
- User can now login

### Reject User

1. Click user → "Details"
2. Click "Reject" button
3. Optionally add rejection reason
4. Confirm

**Result:**
- Status changes to "Rejected"
- User cannot login
- Can re-register later

---

## 🔄 Managing Existing Users

### View All Users

**Go to:** Settings → User Management

See all users with:
- Email
- Full name
- Role (Student, Manager, Admin)
- Status (Approved, Pending, Rejected)
- Join date

### Filter Users

**By Status:**
- Approved
- Pending approval
- Rejected

**By Role:**
- Students
- Managers
- Admins

**By Activity:**
- Active (recent login)
- Inactive (no recent activity)
- New (joined < 30 days)

### Search Users

Search by:
- Email
- Full name
- College ID
- Room number

---

## 🔑 Role Management

### Understand Roles

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| **Student** | Mark attendance, give feedback, view expenses | Add expenses, create menu |
| **Manager** | Record expenses, plan menu, view analytics | User approvals, system config |
| **Admin** | Everything | (Nothing restricted) |

### Assign Role to User

**For pending registration:**
1. When approving, you can assign role
2. Default: "Student"
3. Change if needed (e.g., "Manager")

**For existing user:**
1. Go to User Management
2. Click user
3. Click "Change Role"
4. Select new role
5. Confirm
6. User notified of change

### Common Role Changes

**Student → Manager**
- When: They volunteer to manage expenses
- How: Click Change Role → Manager
- They gain: Expense add/edit, Menu edit, Analytics

**Manager → Student**
- When: They step down from responsibilities
- How: Click Change Role → Student
- They lose: Add/edit permissions

**Any → Admin**
- Careful: Admins have full access
- Only when: Super trusted person
- Recommend: Training first

---

## 🚫 Deactivating Users

### When to Deactivate

- User left hostel/college
- Inactive for long period
- Request to leave
- Expelled from institution

### How to Deactivate

1. Go to User Management
2. Click user
3. Click "Deactivate"
4. Reason (optional)
5. Confirm

**Result:**
- User cannot login
- Their data remains
- Fair share still calculated if records exist

### Reactivate User

1. Go to User Management
2. Filter: Inactive
3. Click user
4. Click "Reactivate"
5. Confirm

---

## 🗑️ Removing Users

### Permanent Deletion

⚠️ **Warning:** Cannot be undone

1. Go to User Management
2. Click user
3. Click "Delete"
4. Confirm (type "DELETE" to confirm)

**What happens:**
- User account deleted
- All their records removed
- Analytics recalculated
- Fair share adjusted

### Better Alternative: Deactivate

Instead of delete:
- Keeps historical records
- Can reactivate later
- Fair share stays accurate
- Recommended for most cases

---

## 📊 User Statistics

**View in Dashboard:**

- Total Members
- New registrations this month
- Pending approvals
- Inactive members
- Active managers

---

## 🔐 Password Management

### Reset User Password

Currently: User must use "Forgot Password"

1. User clicks "Forgot Password" on login
2. Enter email
3. Check email for reset link
4. Click link
5. Create new password

### Admin Password Reset (Future)

Currently not available. If needed:
- Contact super-admin
- Database manual reset (advanced)

---

## 📧 Communication with Users

### Auto-Generated Emails

Users receive emails for:
- Registration confirmation
- Approval notification
- Rejection notification
- Role change notification

### Manual Communication

Send messages:
- (Feature not yet available)
- Alternative: Use external email/messaging

### Bulletin Board

- (Feature not yet available)
- Current: Post in group chat/WhatsApp

---

## 👥 Inviting Members

### Current Invite Process

Users must self-register:
1. Send them login URL
2. They click "Register"
3. Fill form
4. You approve

### Better Approach

1. Create a registration form (Google Forms)
2. Collect email, name, room, phone
3. Share results with students
4. They register on MessWala
5. Approve in batch

### Bulk Invite (Future)

Not yet available:
- Admin-generated invite links
- Bulk user creation from CSV
- Email invitations

---

## 🎯 Best Practices

### For Registration

✅ Review carefully (prevent fake accounts)  
✅ Verify college ID matches institution  
✅ Check email format (college domain preference)  
✅ Approve within 24 hours of registration  
✅ Keep records of rejections  

### For Role Management

✅ Start all as "Student"  
✅ Promote based on participation  
✅ Confirm responsibilities before Manager role  
✅ Monitor manager activity  
✅ Rotate managers periodically  

### For User Removal

✅ Deactivate instead of delete (preserve history)  
✅ Document reason for removal  
✅ Notify user of deactivation  
✅ Archive their final fair share amount  

---

## ⚠️ Common Issues

### User Can't Login After Approval

**Check:**
- Status is "Approved" (not pending)
- They're using correct email
- Password is correct
- Clear browser cache

### Role Change Not Taking Effect

**Solution:**
- User must logout and login
- Browser may cache permissions
- Try incognito/private mode

### Rejected User Can Re-Register

**Yes, they can:**
- They can submit registration again
- You can re-approve or reject again
- Consider email rules if they're repeat spammers

### Can't Find a User

**Try:**
- Search by email instead of name
- Check if user was deleted
- Check different status filters
- Scroll through full list

---

## 🔒 Admin Responsibilities

**Remember:**
- Admins have full system access
- Be careful when managing others
- Document important actions
- Follow fair policies for approval
- Treat all users equally

---

## 📞 Support

**Issues with user management?**
- See [Troubleshooting](../deployment/troubleshooting.md)
- Contact higher-level admin
- Check system logs

---

**Last Updated:** March 17, 2026  
**Version:** 2.0
