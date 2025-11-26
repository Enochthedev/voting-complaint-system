# Complete Notification Triggers Reference

## Overview
All notification triggers have been successfully implemented and tested in the Student Complaint Resolution System.

## Implemented Triggers

### 1. New Complaint Notification ✅
- **Table**: `complaints`
- **Trigger**: `notify_on_new_complaint`
- **Function**: `notify_lecturers_on_new_complaint()`
- **When**: New complaint is submitted (status = 'new', is_draft = false)
- **Who Gets Notified**: All lecturers and admins
- **Notification Type**: `'new_complaint'`
- **Message**: "A new complaint has been submitted: [title]"
- **Migration**: `017_create_complaint_triggers.sql`

### 2. Complaint Opened/Status Change Notification ✅
- **Table**: `complaints`
- **Trigger**: `notify_on_complaint_status_change`
- **Function**: `notify_student_on_status_change()`
- **When**: 
  - Complaint status changes from 'new' to 'opened'
  - Complaint status changes to 'in_progress' or 'resolved'
  - Complaint is assigned to a lecturer
- **Who Gets Notified**: 
  - Student (for status changes)
  - Assigned lecturer (for assignments)
- **Notification Types**: 
  - `'complaint_update'` (status changes)
  - `'assignment'` (assignments)
- **Messages**:
  - "A lecturer has opened your complaint: [title]"
  - "Your complaint '[title]' is now [status]"
  - "You have been assigned complaint: [title]"
- **Migrations**: 
  - `017_create_complaint_triggers.sql`
  - `029_fix_assignment_notification_type.sql`

### 3. Feedback Received Notification ✅
- **Table**: `feedback`
- **Trigger**: `notify_on_feedback_received`
- **Function**: `notify_student_on_feedback()`
- **When**: Lecturer adds feedback to a complaint
- **Who Gets Notified**: Student who submitted the complaint
- **Notification Type**: `'feedback_received'`
- **Message**: "A lecturer has provided feedback on your complaint: [title]"
- **Migration**: `030_create_feedback_notification_trigger.sql`

### 4. Comment Added Notification ✅
- **Table**: `complaint_comments`
- **Trigger**: `notify_on_comment_added`
- **Function**: `notify_users_on_comment()`
- **When**: Comment is added to a complaint (non-internal)
- **Who Gets Notified**: 
  - Student (if not the commenter)
  - Assigned lecturer (if not the commenter)
  - Other lecturers/admins who have commented (if not the commenter)
- **Notification Type**: `'comment_added'`
- **Messages**:
  - "[Name] commented on your complaint: [title]"
  - "[Name] commented on assigned complaint: [title]"
  - "[Name] commented on complaint: [title]"
- **Migration**: `031_create_comment_notification_trigger.sql`

### 5. Escalation Notification ✅
- **Table**: `complaints`
- **Trigger**: `notify_on_complaint_escalation`
- **Function**: `notify_user_on_escalation()`
- **When**: 
  - Complaint is escalated (escalated_at set)
  - Escalation level increases (re-escalation)
- **Who Gets Notified**: User assigned to handle the escalated complaint
- **Notification Type**: `'complaint_escalated'`
- **Message**: "Complaint '[title]' ([category], [priority] priority) has been escalated to you"
- **Migration**: `032_create_escalation_notification_trigger.sql`

### 6. New Vote Notification ✅ **NEW**
- **Table**: `votes`
- **Trigger**: `notify_on_new_vote`
- **Function**: `notify_students_on_new_vote()`
- **When**: New active vote is created (is_active = true)
- **Who Gets Notified**: All students
- **Notification Type**: `'new_vote'`
- **Message**: "A new vote has been created: [title]"
- **Migration**: `033_create_new_vote_notification_trigger.sql`

## Notification Type Enum

```sql
CREATE TYPE notification_type AS ENUM (
  'complaint_opened',      -- Legacy, replaced by complaint_update
  'feedback_received',     -- ✅ Implemented
  'new_complaint',         -- ✅ Implemented
  'new_announcement',      -- Not yet implemented
  'new_vote',              -- ✅ Implemented
  'comment_added',         -- ✅ Implemented
  'complaint_assigned',    -- Legacy, replaced by assignment
  'complaint_escalated',   -- ✅ Implemented
  'complaint_reopened',    -- Not yet implemented
  'status_changed',        -- Legacy, replaced by complaint_update
  'complaint_update',      -- ✅ Implemented (used for status changes)
  'assignment'             -- ✅ Implemented
);
```

## Trigger Status Summary

| Trigger | Table | Status | Tested | Migration |
|---------|-------|--------|--------|-----------|
| New Complaint | complaints | ✅ Enabled | ✅ Yes | 017 |
| Status Change | complaints | ✅ Enabled | ✅ Yes | 017, 029 |
| Assignment | complaints | ✅ Enabled | ✅ Yes | 017, 029 |
| Feedback | feedback | ✅ Enabled | ✅ Yes | 030 |
| Comment | complaint_comments | ✅ Enabled | ✅ Yes | 031 |
| Escalation | complaints | ✅ Enabled | ✅ Yes | 032 |
| New Vote | votes | ✅ Enabled | ✅ Yes | 033 |

## Test Scripts

All triggers have corresponding test scripts:

1. `scripts/test-complaint-triggers.js` - Tests new complaint and status change
2. `scripts/verify-assignment-notification-trigger.js` - Tests assignment notifications
3. `scripts/test-feedback-notification-trigger.js` - Tests feedback notifications
4. `scripts/test-comment-notification-trigger.js` - Tests comment notifications
5. `scripts/test-escalation-notification-trigger.js` - Tests escalation notifications
6. `scripts/test-new-vote-notification-trigger.js` - Tests new vote notifications ✅ NEW

## Notification Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Actions                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Database Table Updates                          │
│  • complaints (INSERT/UPDATE)                                │
│  • feedback (INSERT)                                         │
│  • complaint_comments (INSERT)                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Triggers Fire Automatically                     │
│  • notify_on_new_complaint                                   │
│  • notify_on_complaint_status_change                         │
│  • notify_on_feedback_received                               │
│  • notify_on_comment_added                                   │
│  • notify_on_complaint_escalation                            │
│  • notify_on_new_vote ✅ NEW                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         Notification Records Created                         │
│  • INSERT into notifications table                           │
│  • is_read = false                                           │
│  • related_id = complaint/feedback/comment ID                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         Real-time Delivery (Optional)                        │
│  • Supabase Realtime broadcasts change                       │
│  • Frontend receives notification                            │
│  • UI updates immediately                                    │
└─────────────────────────────────────────────────────────────┘
```

## Security

All trigger functions use `SECURITY DEFINER` to ensure:
- Notifications can be created even if user doesn't have direct INSERT permission
- Proper authorization checks are performed within the function
- RLS policies on notifications table ensure users only see their own notifications

## Performance Considerations

1. **Indexing**: All notification queries use indexed columns (user_id, type, created_at)
2. **Selective Triggers**: Triggers only fire when specific conditions are met (WHEN clause)
3. **Minimal Logic**: Trigger functions perform minimal processing
4. **No Cascading**: Triggers don't trigger other triggers (no infinite loops)

## Maintenance

### Adding New Notification Types

1. Add new value to `notification_type` enum:
   ```sql
   ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_type';
   ```

2. Create trigger function:
   ```sql
   CREATE OR REPLACE FUNCTION notify_on_event()
   RETURNS TRIGGER AS $$
   BEGIN
     -- Notification logic
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

3. Create trigger:
   ```sql
   CREATE TRIGGER trigger_name
     AFTER INSERT/UPDATE ON table_name
     FOR EACH ROW
     WHEN (condition)
     EXECUTE FUNCTION notify_on_event();
   ```

4. Test thoroughly with test script

### Monitoring

Check trigger health:
```sql
-- List all notification triggers
SELECT 
  c.relname AS table_name,
  t.tgname AS trigger_name,
  p.proname AS function_name,
  CASE 
    WHEN t.tgenabled = 'O' THEN 'Enabled'
    WHEN t.tgenabled = 'D' THEN 'Disabled'
  END AS status
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE (t.tgname LIKE '%notify%')
  AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY c.relname, t.tgname;
```

## Related Documentation

- [Notification System Quick Reference](./NOTIFICATION_SYSTEM_QUICK_REFERENCE.md)
- [Escalation Notification Trigger](./ESCALATION_NOTIFICATION_TRIGGER.md)
- [Assignment Notification Implementation](./ASSIGNMENT_NOTIFICATION_IMPLEMENTATION.md)
- [Comment Notification Implementation](./COMMENT_NOTIFICATION_IMPLEMENTATION.md)
- [Feedback Notification Implementation](./FEEDBACK_NOTIFICATION_IMPLEMENTATION.md)
- [New Vote Notification Trigger](./NEW_VOTE_NOTIFICATION_TRIGGER.md) ✅ NEW

## Status

✅ **ALL NOTIFICATION TRIGGERS IMPLEMENTED AND TESTED**

All required notification triggers for Phase 6 (Task 6.1) and Phase 7 (Task 7.1) are now complete:
- ✅ New complaint notification
- ✅ Complaint opened notification
- ✅ Assignment notification
- ✅ Feedback received notification
- ✅ Comment added notification
- ✅ Escalation notification
- ✅ New vote notification (NEW)

Next steps: Implement notification UI (Task 6.2) and real-time subscriptions (Task 6.3)
