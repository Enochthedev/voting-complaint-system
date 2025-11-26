# New Complaint Notification - Quick Reference

## Summary

Database trigger that automatically notifies all lecturers and admins when a student submits a new complaint.

## Key Details

| Property | Value |
|----------|-------|
| **Trigger Name** | `notify_on_new_complaint` |
| **Function** | `notify_lecturers_on_new_complaint()` |
| **Event** | AFTER INSERT on `complaints` |
| **Condition** | `status = 'new' AND is_draft = false` |
| **Recipients** | All users with role `lecturer` or `admin` |
| **Notification Type** | `new_complaint` |

## When It Fires

✅ **DOES trigger** when:
- A new complaint is inserted with `status = 'new'`
- The complaint has `is_draft = false`
- Example: Student submits a complaint form

❌ **DOES NOT trigger** when:
- A draft complaint is saved (`is_draft = true`)
- A complaint is created with status other than 'new'
- A complaint is updated (only INSERT events)

## Notification Content

```
Title: "New complaint submitted"
Message: "A new complaint has been submitted: [complaint title]"
Type: new_complaint
Related ID: [complaint_id]
Is Read: false
```

## Testing

```bash
# Run the test script
node scripts/test-new-complaint-notification.js
```

## Verification

```sql
-- Check if trigger exists
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'notify_on_new_complaint';

-- Check recent notifications
SELECT n.*, u.full_name, u.role
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.type = 'new_complaint'
ORDER BY n.created_at DESC
LIMIT 10;
```

## Related Documentation

- Full documentation: `docs/NEW_COMPLAINT_NOTIFICATION_TRIGGER.md`
- Test script: `scripts/test-new-complaint-notification.js`
- Migration: `supabase/migrations/add_missing_complaint_insert_triggers.sql`
