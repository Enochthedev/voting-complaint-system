# Reopen Complaint - Visual Guide

## Overview
This guide demonstrates the complaint reopening functionality that allows students to reopen resolved complaints with a justification.

## User Flow

### Step 1: View Resolved Complaint
```
┌─────────────────────────────────────────────────────────────┐
│ Complaint Detail View                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Title: Broken AC in Lecture Hall                          │
│  Status: [Resolved] ✓                                      │
│  Priority: High                                             │
│                                                             │
│  Description: The air conditioning in Lecture Hall B...    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Actions                                             │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ [💬 Add Comment]  [⚠️ Reopen Complaint]  [✓ Rate]  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: Click "Reopen Complaint" Button
When a student clicks the "Reopen Complaint" button, a modal appears.

### Step 3: Reopen Modal
```
┌─────────────────────────────────────────────────────────────┐
│                    Reopen Complaint                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Please provide a justification for reopening this          │
│  complaint. This will help the assigned lecturer            │
│  understand why the issue persists.                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ⚠️ Important                                        │  │
│  │ Reopening will change the status from "Resolved"   │  │
│  │ to "Reopened" and notify the assigned lecturer.    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Justification *                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ The AC is still not working properly. It turns     │  │
│  │ off after 10 minutes and the room gets very hot.   │  │
│  │ Students are having difficulty concentrating.      │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│  142 characters                                             │
│                                                             │
│                              [Cancel] [Reopen Complaint]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Validation
- If justification is empty, an alert appears: "Please provide a justification for reopening this complaint"
- Whitespace-only justification is also rejected

### Step 5: Submission
```
┌─────────────────────────────────────────────────────────────┐
│                    Reopen Complaint                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Loading spinner] Reopening...                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 6: Success
```
┌─────────────────────────────────────────────────────────────┐
│ ✓ Success                                                   │
├─────────────────────────────────────────────────────────────┤
│ Complaint reopened successfully.                            │
│                                                             │
│ Justification: The AC is still not working properly...     │
│                                                             │
│                                                      [OK]   │
└─────────────────────────────────────────────────────────────┘
```

### Step 7: Updated Complaint View
After reopening, the page reloads and shows:

```
┌─────────────────────────────────────────────────────────────┐
│ Complaint Detail View                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Title: Broken AC in Lecture Hall                          │
│  Status: [Reopened] 🔄                                     │
│  Priority: High                                             │
│                                                             │
│  Description: The air conditioning in Lecture Hall B...    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Timeline                                            │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ 🔄 Reopened by John Doe                            │  │
│  │    2024-11-25 10:30 AM                             │  │
│  │    Justification: The AC is still not working...   │  │
│  │                                                     │  │
│  │ ✓ Resolved by Dr. Smith                           │  │
│  │    2024-11-20 3:45 PM                              │  │
│  │                                                     │  │
│  │ 📝 Status changed to In Progress                   │  │
│  │    2024-11-18 9:00 AM                              │  │
│  │                                                     │  │
│  │ 📝 Created by John Doe                             │  │
│  │    2024-11-15 2:30 PM                              │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Backend Actions

When a complaint is reopened, the following happens automatically:

### 1. Database Update
```sql
-- Update complaint status
UPDATE complaints 
SET status = 'reopened', 
    updated_at = NOW()
WHERE id = 'complaint-123' 
  AND status = 'resolved';
```

### 2. History Logging
```sql
-- Log the reopen action
INSERT INTO complaint_history (
  complaint_id,
  action,
  old_value,
  new_value,
  performed_by,
  details
) VALUES (
  'complaint-123',
  'reopened',
  'resolved',
  'reopened',
  'user-789',
  '{"justification": "The AC is still not working properly..."}'
);
```

### 3. Notification Creation
```sql
-- Create notification for assigned lecturer
INSERT INTO notifications (
  user_id,
  type,
  title,
  message,
  related_id,
  is_read
) VALUES (
  'lecturer-456',
  'complaint_reopened',
  'Complaint Reopened',
  'A complaint has been reopened: "Broken AC in Lecture Hall"',
  'complaint-123',
  false
);
```

## Lecturer View

When a lecturer receives the notification:

```
┌─────────────────────────────────────────────────────────────┐
│ Notifications                                        [🔔 1] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔄 Complaint Reopened                                     │
│     A complaint has been reopened: "Broken AC in           │
│     Lecture Hall"                                           │
│     2 minutes ago                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Clicking the notification takes them to the complaint detail view where they can see:
- Updated status: "Reopened"
- Timeline entry with justification
- Student's reason for reopening

## Status Transitions

```
┌─────────┐
│   New   │
└────┬────┘
     │
     ▼
┌─────────┐
│ Opened  │
└────┬────┘
     │
     ▼
┌─────────────┐
│ In Progress │
└──────┬──────┘
       │
       ▼
   ┌──────────┐
   │ Resolved │◄──────────┐
   └────┬─────┘           │
        │                 │
        │ Reopen          │
        ▼                 │
   ┌──────────┐           │
   │ Reopened │───────────┘
   └────┬─────┘
        │
        ▼
   ┌────────┐
   │ Closed │
   └────────┘
```

## Key Features

### 1. Validation
- ✅ Justification is required
- ✅ Whitespace-only text is rejected
- ✅ Only resolved complaints can be reopened
- ✅ Only complaint owner can reopen (enforced by RLS)

### 2. Audit Trail
- ✅ All reopen actions are logged
- ✅ Justification is stored in history details
- ✅ Timestamp and user are recorded
- ✅ History is immutable (insert-only)

### 3. Notifications
- ✅ Assigned lecturer is notified
- ✅ Notification includes complaint title
- ✅ Real-time notification delivery
- ✅ Notification links to complaint

### 4. User Experience
- ✅ Clear warning message
- ✅ Character counter for justification
- ✅ Loading state during submission
- ✅ Success/error feedback
- ✅ Page reload to show updated status

## Error Handling

### Case 1: Not Authenticated
```
Error: User not authenticated
Action: Redirect to login page
```

### Case 2: Complaint Not Resolved
```
Error: Only resolved complaints can be reopened
Action: Show error alert, close modal
```

### Case 3: Database Error
```
Error: Failed to reopen complaint: [error message]
Action: Show error alert, keep modal open
```

### Case 4: Network Error
```
Error: Failed to reopen complaint: Network error
Action: Show error alert, allow retry
```

## Security

### Row Level Security (RLS)
- Students can only reopen their own complaints
- Anonymous complaints cannot be reopened (no student_id)
- Lecturers cannot reopen complaints (student action only)

### Input Validation
- Client-side: Required field validation
- Server-side: Status validation (must be "resolved")
- Database: Foreign key constraints

### Audit Trail
- All actions are logged with user ID
- Justification is stored for accountability
- History records are immutable

## Testing Checklist

- [ ] Student can see "Reopen" button on resolved complaints
- [ ] Student cannot see "Reopen" button on non-resolved complaints
- [ ] Modal appears when clicking "Reopen Complaint"
- [ ] Validation prevents empty justification
- [ ] Loading state shows during submission
- [ ] Success message appears after reopening
- [ ] Page reloads and shows updated status
- [ ] History entry is created with justification
- [ ] Notification is sent to assigned lecturer
- [ ] Only resolved complaints can be reopened
- [ ] Error handling works for various failure cases

## Related Documentation
- [Task 5.3 Completion Summary](./TASK_5.3_REOPEN_COMPLAINT_COMPLETION.md)
- [Complaint Detail View Refactoring](./COMPLAINT_DETAIL_VIEW_REFACTORING_COMPLETE.md)
- [Notification System Quick Reference](./NOTIFICATION_SYSTEM_QUICK_REFERENCE.md)
