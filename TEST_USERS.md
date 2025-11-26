# Test User Accounts

This document contains the test user accounts for the Student Complaint Management System.

## Test Credentials

All test accounts use the same password: **`password123`**

---

## 👨‍🎓 Student Accounts

### Primary Student Account
- **Email:** `student@test.com`
- **Password:** `password123`
- **Name:** Test Student
- **Role:** Student
- **Use for:** Primary student testing, creating complaints, viewing own complaints

### Additional Student Accounts
- **Email:** `test-student-1763546088225@example.com`
- **Password:** `password123`
- **Name:** test-student-1763546088225@example.com
- **Role:** Student

- **Email:** `test-student-ratings-1-1763501033169@example.com`
- **Password:** `password123`
- **Name:** Test Student 1
- **Role:** Student

- **Email:** `test-student-ratings-2-1763501033920@example.com`
- **Password:** `password123`
- **Name:** Test Student 2
- **Role:** Student

---

## 👨‍🏫 Lecturer Accounts

### Primary Lecturer Account
- **Email:** `lecturer@test.com`
- **Password:** `password123`
- **Name:** Test Lecturer
- **Role:** Lecturer
- **Use for:** Reviewing complaints, assigning, providing feedback, managing templates

### Additional Lecturer Account
- **Email:** `test-lecturer-ratings-1763501034188@example.com`
- **Password:** `password123`
- **Name:** Test Lecturer
- **Role:** Lecturer

---

## 👨‍💼 Admin Account

### Primary Admin Account
- **Email:** `admin@test.com`
- **Password:** `password123`
- **Name:** Test Admin
- **Role:** Admin
- **Use for:** Full system access, user management, analytics, system settings

---

## Quick Login Guide

### For Students:
1. Go to `/auth/login`
2. Enter: `student@test.com` / `password123`
3. You'll see your own complaints and can create new ones

### For Lecturers:
1. Go to `/auth/login`
2. Enter: `lecturer@test.com` / `password123`
3. You'll see all complaints and can manage them

### For Admins:
1. Go to `/auth/login`
2. Enter: `admin@test.com` / `password123`
3. You'll have full system access

---

## Test Data Overview

The database has been seeded with:
- **6 Complaints** (various statuses: new, in_progress, resolved, closed, draft)
- **12 Tags** on complaints
- **5 Comments** (conversations between students and lecturers)
- **3 Templates** (for common complaint types)
- **4 Escalation Rules** (auto-escalation logic)
- **6 Notifications** (for students and lecturers)
- **3 Announcements** (system-wide messages)
- **2 Feedback** entries (lecturer feedback on resolved complaints)
- **2 Ratings** (student satisfaction ratings)

---

## Sample Complaints to Test

1. **"Broken AC in Lecture Hall B"** - New complaint (student@test.com)
2. **"Missing course materials for CS301"** - In Progress with comments (assigned to lecturer@test.com)
3. **"Parking lot lighting issue"** - Resolved with feedback and 5-star rating
4. **"Inappropriate behavior in class"** - Anonymous harassment complaint
5. **"Cafeteria food quality concerns"** - Draft complaint
6. **"WiFi connectivity issues in library"** - Closed complaint with 4-star rating

---

## Notes

- All passwords are the same for easy testing: `password123`
- The mock authentication system is currently in use (Phase 2)
- Real Supabase authentication will be integrated in Phase 12
- RLS policies are enabled and working on all tables
- Each role has appropriate permissions based on RLS policies

---

## Security Note

⚠️ **These are test accounts only!** 
- Do not use these credentials in production
- Change all passwords before deploying to production
- Enable proper authentication flows in Phase 12
