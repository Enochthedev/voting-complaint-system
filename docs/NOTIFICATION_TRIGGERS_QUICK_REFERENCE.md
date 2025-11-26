# Notification Triggers Quick Reference

## Overview
This document provides a quick reference for all database triggers that automatically create notifications in the Student Complaint Resolution System.

## Trigger Summary

### 1. Complaint Opened Notification ✅
**Status**: Implemented and Tested  
**Function**: `notify_student_on_status_change()`  
**Trigger**: `notify_on_complaint_status_change`

**When**: Complaint status changes from `'new'` to `'open'`  
**Who Gets Notified**: Student who submitted the complaint  
**Notification Type**: `'complaint_update'`  
**Message**: "Your complaint has been opened"

```sql
-- Trigger condition
IF NEW.status = 'open' AND OLD.status = 'new' AND NEW.student_id IS NOT NULL
```

### 2. Status Update Notification ✅
**Status**: Implemented and Tested  
**Function**: `notify_student_on_status_change()` (same as above)  
**Trigger**: `notify_on_complaint_status_change`

**When**: Complaint status changes to `'in_progress'` or `'resolved'`  
**Who Gets Notified**: Student who submitted the complaint  
**Notification Type**: `'complaint_update'`  
**Message**: "Your complaint '[title]' is now [status]"

```sql
-- Trigger condition
IF NEW.status IN ('in_progress', 'resolved') AND OLD.status != NEW.status AND NEW.student_id IS NOT NULL
```

### 3. Assignment Notification ✅
**Status**: Implemented and Tested  
**Function**: `notify_student_on_status_change()` (same as above)  
**Trigger**: `notify_on_complaint_status_change`

**When**: Complaint is assigned or reassigned to a lecturer  
**Who Gets Notified**: Assigned lecturer  
**Notification Type**: `'assignment'`  
**Message**: "You have been assigned complaint: [title]"

```sql
-- Trigger condition
IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to)
```

### 4. New Complaint Notification ✅
**Status**: Implemented  
**Function**: `notify_lecturers_on_new_complaint()`  
**Trigger**: `notify_on_new_complaint`

**When**: New complaint is submitted (status = 'new', is_draft = false)  
**Who Gets Notified**: All lecturers and admins  
**Notification Type**: `'new_complaint'`  
**Message**: "A new complaint has been submitted: [title]"

```sql
-- Trigger condition
AFTER INSERT ON complaints
WHEN (NEW.status = 'new' AND NEW.is_draft = false)
```

### 5. Feedback Received Notification ⏳
**Status**: To be implemented  
**Planned Trigger**: On INSERT to `feedback` table

**When**: Lecturer adds feedback to a complaint  
**Who Gets Notified**: Student who submitted the complaint  
**Notification Type**: `'feedback_received'`  
**Message**: "You have received feedback on your complaint"

### 6. Comment Added Notification ⏳
**Status**: To be implemented  
**Planned Trigger**: On INSERT to `complaint_comments` table

**When**: New comment is added to a complaint  
**Who Gets Notified**: Complaint owner and participants  
**Notification Type**: `'comment_added'`  
**Message**: "[User] commented on complaint: [title]"

### 7. Escalation Notification ⏳
**Status**: To be implemented  
**Planned Trigger**: On UPDATE when `escalated_at` is set

**When**: Complaint is escalated  
**Who Gets Notified**: Escalation recipient  
**Notification Type**: `'complaint_escalated'`  
**Message**: "Complaint '[title]' has been escalated to you"

## Notification Types

The system uses the following notification types (enum):

```sql
CREATE TYPE notification_type AS ENUM (
  'complaint_update',    -- Status changes, complaint opened
  'assignment',          -- Complaint assigned to lecturer
  'resolution',          -- Complaint resolved
  'comment',             -- New comment added
  'escalation',          -- Complaint escalated
  'system'               -- System notifications
);
```

## Testing Triggers

### Manual Testing
```sql
-- Test complaint opened notification
UPDATE complaints 
SET status = 'open' 
WHERE id = '[complaint_id]' AND status = 'new';

-- Check if notification was created
SELECT * FROM notifications 
WHERE related_id = '[complaint_id]' 
ORDER BY created_at DESC LIMIT 1;
```

### Automated Testing
```bash
# Run verification script
node scripts/verify-complaint-opened-trigger.js
```

## Common Queries

### Get All Notifications for a User
```sql
SELECT * FROM notifications
WHERE user_id = '[user_id]'
ORDER BY created_at DESC;
```

### Get Unread Notifications
```sql
SELECT * FROM notifications
WHERE user_id = '[user_id]' AND is_read = false
ORDER BY created_at DESC;
```

### Mark Notification as Read
```sql
UPDATE notifications
SET is_read = true
WHERE id = '[notification_id]';
```

### Mark All Notifications as Read
```sql
UPDATE notifications
SET is_read = true
WHERE user_id = '[user_id]' AND is_read = false;
```

### Get Notification Count by Type
```sql
SELECT type, COUNT(*) as count
FROM notifications
WHERE user_id = '[user_id]'
GROUP BY type;
```

## Frontend Integration

### Subscribe to Real-time Notifications
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// Subscribe to new notifications
const subscription = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('New notification:', payload.new)
    // Update UI, show toast, etc.
  })
  .subscribe()

// Cleanup
subscription.unsubscribe()
```

### Fetch Notifications
```javascript
// Get all notifications
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// Get unread count
const { count } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('is_read', false)
```

### Mark as Read
```javascript
// Mark single notification as read
await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId)

// Mark all as read
await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('user_id', userId)
  .eq('is_read', false)
```

## Troubleshooting

### Notifications Not Being Created

1. **Check if trigger exists**
```sql
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'public.complaints'::regclass;
```

2. **Check if function exists**
```sql
SELECT proname 
FROM pg_proc 
WHERE proname LIKE '%notify%';
```

3. **Check trigger is enabled**
```sql
-- Enable trigger if disabled
ALTER TABLE complaints ENABLE TRIGGER notify_on_complaint_status_change;
```

4. **Check for errors in logs**
```sql
-- View recent errors
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%notify%' 
ORDER BY last_exec DESC;
```

### Duplicate Notifications

1. **Check for multiple triggers**
```sql
SELECT tgname, tgtype, tgenabled
FROM pg_trigger
WHERE tgrelid = 'public.complaints'::regclass;
```

2. **Check application code** - Ensure you're not manually creating notifications in addition to triggers

### Performance Issues

1. **Check notification table size**
```sql
SELECT COUNT(*) FROM notifications;
```

2. **Archive old notifications**
```sql
-- Delete read notifications older than 30 days
DELETE FROM notifications
WHERE is_read = true 
  AND created_at < NOW() - INTERVAL '30 days';
```

3. **Check indexes**
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'notifications';
```

## Best Practices

### 1. Keep Notification Messages Concise
- Use clear, actionable language
- Include relevant context (complaint title, user name)
- Avoid technical jargon

### 2. Prevent Notification Spam
- Don't create duplicate notifications
- Batch similar notifications when possible
- Allow users to configure notification preferences

### 3. Clean Up Old Notifications
- Archive or delete old read notifications
- Keep unread notifications indefinitely
- Consider a retention policy (e.g., 90 days)

### 4. Monitor Notification Performance
- Track notification creation rate
- Monitor trigger execution time
- Alert on failed notification creation

### 5. Test Thoroughly
- Test all trigger conditions
- Verify notification content
- Test with anonymous complaints
- Test edge cases (null values, etc.)

## Related Documentation

- [Complaint Opened Notification Trigger](./COMPLAINT_OPENED_NOTIFICATION_TRIGGER.md)
- [Notification System Quick Reference](./NOTIFICATION_SYSTEM_QUICK_REFERENCE.md)
- [Database Triggers Migration](../supabase/migrations/017_create_complaint_triggers.sql)
- [Notifications Table Schema](../supabase/migrations/011_create_notifications_table.sql)

## Migration Files

All notification triggers are defined in:
- `supabase/migrations/017_create_complaint_triggers.sql`

Notification table schema:
- `supabase/migrations/011_create_notifications_table.sql`

---

**Last Updated**: November 25, 2025  
**Status**: 4 of 7 triggers implemented ✅  
**Next**: Implement feedback, comment, and escalation triggers
