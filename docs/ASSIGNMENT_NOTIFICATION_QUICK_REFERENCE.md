# Assignment Notification - Quick Reference

## Status: ✅ IMPLEMENTED & VERIFIED

## What It Does

Automatically creates a notification when a complaint is assigned or reassigned to a lecturer.

## Trigger Details

| Property | Value |
|----------|-------|
| **Trigger Name** | `notify_on_complaint_status_change` |
| **Function** | `notify_student_on_status_change()` |
| **Table** | `complaints` |
| **Event** | `AFTER UPDATE` |
| **Status** | ✅ Enabled |

## When It Fires

- ✅ Initial assignment: `assigned_to` changes from NULL → lecturer_id
- ✅ Reassignment: `assigned_to` changes from lecturer_id_1 → lecturer_id_2

## Notification Created

```json
{
  "user_id": "lecturer-uuid",
  "type": "assignment",
  "title": "A complaint has been assigned to you",
  "message": "You have been assigned complaint: {complaint_title}",
  "related_id": "complaint-uuid",
  "is_read": false
}
```

## Usage

### Assign a Complaint

```typescript
await supabase
  .from('complaints')
  .update({ assigned_to: lecturerId })
  .eq('id', complaintId);
// Notification automatically created ✅
```

### Query Assignment Notifications

```typescript
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('type', 'assignment')
  .eq('is_read', false);
```

## Verification

Run the test script:

```bash
node scripts/verify-assignment-notification-trigger.js
```

Expected output:
- ✅ Assignment notification created
- ✅ Reassignment notification created
- ✅ History entry logged

## Related

- **History Trigger:** `log_complaint_assignment_trigger` also logs assignments
- **Migration:** `029_fix_assignment_notification_type.sql`
- **Full Docs:** `ASSIGNMENT_NOTIFICATION_TRIGGER.md`

## Quick Test

```sql
-- Assign a complaint
UPDATE complaints 
SET assigned_to = 'your-lecturer-uuid'
WHERE id = 'your-complaint-uuid';

-- Check notification
SELECT * FROM notifications 
WHERE type = 'assignment' 
ORDER BY created_at DESC 
LIMIT 1;
```

## Acceptance Criteria

✅ AC17 - Complaint assignment system  
✅ P15 - Assignment notifications
