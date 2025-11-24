# Feedback Notification - Quick Reference

## Overview

Automatic notifications are sent to students when lecturers provide feedback on their complaints.

## How It Works

**Automatic**: Database triggers handle everything - no manual code needed!

```
Lecturer adds feedback → Database trigger → Notification created → Student notified
```

## What Gets Created

### 1. Notification
- **Type**: `feedback_received`
- **Title**: "New Feedback Received"
- **Message**: "A lecturer has provided feedback on your complaint: [complaint title]"
- **Recipient**: The student who submitted the complaint
- **Exception**: No notification for anonymous complaints

### 2. History Entry
- **Action**: `feedback_added`
- **Logged in**: `complaint_history` table
- **Includes**: Feedback ID, lecturer ID, timestamp

## Files

### Migration
```
supabase/migrations/029_create_feedback_notification_trigger.sql
```

### Documentation
```
docs/FEEDBACK_NOTIFICATION_IMPLEMENTATION.md
docs/TASK_5.1_FEEDBACK_NOTIFICATION_COMPLETION.md
```

### Test Scripts
```
scripts/test-feedback-notification.js
scripts/verify-feedback-notification-trigger.js
```

## Apply Migration

```bash
# Using Supabase CLI
supabase db push

# Or via Supabase Dashboard
# SQL Editor > New Query > Paste migration content
```

## Test

```bash
# Verify triggers are installed
node scripts/verify-feedback-notification-trigger.js

# Test notification creation (Phase 12)
node scripts/test-feedback-notification.js
```

## Database Triggers

### `notify_on_feedback_added`
- **Table**: `feedback`
- **Event**: AFTER INSERT
- **Function**: `notify_student_on_feedback()`
- **Purpose**: Create notification for student

### `log_feedback_addition_trigger`
- **Table**: `feedback`
- **Event**: AFTER INSERT
- **Function**: `log_feedback_addition()`
- **Purpose**: Log feedback in complaint history

## Requirements Satisfied

- ✅ **AC5**: Students receive notifications when feedback is provided
- ✅ **AC4**: Real-time notifications
- ✅ **AC12**: Feedback logged in complaint history

## Design Properties

- ✅ **P4**: Notification Delivery - Students receive notifications when feedback is added
- ✅ **P5**: Feedback Association - Every feedback is associated with complaint and lecturer

## Anonymous Complaints

Anonymous complaints (where `student_id` is NULL) do **not** trigger notifications. This maintains privacy.

## Real-time Updates (Phase 12)

When integrated with Supabase Realtime:

```javascript
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, handleNewNotification)
  .subscribe()
```

## Example Notification

```json
{
  "id": "uuid",
  "user_id": "student-uuid",
  "type": "feedback_received",
  "title": "New Feedback Received",
  "message": "A lecturer has provided feedback on your complaint: Broken AC in Lecture Hall",
  "related_id": "complaint-uuid",
  "is_read": false,
  "created_at": "2024-11-20T10:30:00Z"
}
```

## Example History Entry

```json
{
  "id": "uuid",
  "complaint_id": "complaint-uuid",
  "action": "feedback_added",
  "old_value": null,
  "new_value": "Feedback provided",
  "performed_by": "lecturer-uuid",
  "details": {
    "feedback_id": "feedback-uuid",
    "timestamp": "2024-11-20T10:30:00Z"
  },
  "created_at": "2024-11-20T10:30:00Z"
}
```

## Troubleshooting

### Notifications not being created?

1. Check if migration is applied:
   ```bash
   node scripts/verify-feedback-notification-trigger.js
   ```

2. Check if triggers are enabled:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%feedback%';
   ```

3. Check if complaint has student_id (not anonymous):
   ```sql
   SELECT id, student_id, is_anonymous FROM complaints WHERE id = 'complaint-uuid';
   ```

### History entries not being created?

1. Verify trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'log_feedback_addition_trigger';
   ```

2. Check complaint_history table:
   ```sql
   SELECT * FROM complaint_history WHERE complaint_id = 'complaint-uuid' AND action = 'feedback_added';
   ```

## Related Components

- `FeedbackForm` - Component for adding feedback
- `FeedbackDisplay` - Component for displaying feedback
- `NotificationCenter` - Displays notifications (Phase 12)

## Status

✅ **Complete** - Ready for Phase 12 API integration
