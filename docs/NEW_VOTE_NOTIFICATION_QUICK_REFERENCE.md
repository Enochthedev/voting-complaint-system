# New Vote Notification - Quick Reference

## What It Does

Automatically notifies all students when a lecturer creates a new active vote.

## Key Files

| File                                                               | Purpose                    |
| ------------------------------------------------------------------ | -------------------------- |
| `supabase/migrations/033_create_new_vote_notification_trigger.sql` | Database trigger migration |
| `scripts/test-new-vote-notification-trigger.js`                    | Test script                |
| `docs/NEW_VOTE_NOTIFICATION_TRIGGER.md`                            | Full documentation         |

## Trigger Logic

```
New Vote Created (is_active = true)
    ↓
Trigger: notify_on_new_vote
    ↓
Function: notify_students_on_new_vote()
    ↓
Create notification for each student
    ↓
Students see notification in UI
```

## Notification Format

```javascript
{
  type: 'new_vote',
  title: 'New vote available',
  message: 'A new vote has been created: [Vote Title]',
  related_id: '[Vote UUID]',
  is_read: false
}
```

## Testing

```bash
# Run the test
node scripts/test-new-vote-notification-trigger.js

# Expected: All tests pass ✅
```

## UI Integration

- **Icon:** 📄 FileText
- **Color:** Cyan
- **Group:** "Votes"
- **Click Action:** Navigate to `/votes` page

## Common Scenarios

### Scenario 1: Create Active Vote

```
Lecturer creates vote with is_active = true
→ All students receive notification ✅
```

### Scenario 2: Create Inactive Vote (Draft)

```
Lecturer creates vote with is_active = false
→ No notifications sent ✅
```

### Scenario 3: Activate Draft Vote

```
Lecturer updates vote from is_active = false to true
→ No notifications (trigger only fires on INSERT) ❌
→ Future enhancement needed
```

## Quick Checks

### Verify Trigger Exists

```sql
SELECT * FROM pg_trigger
WHERE tgname = 'notify_on_new_vote';
```

### Check Recent Notifications

```sql
SELECT * FROM notifications
WHERE type = 'new_vote'
ORDER BY created_at DESC
LIMIT 10;
```

### Count Students

```sql
SELECT COUNT(*) FROM users WHERE role = 'student';
```

## Troubleshooting

| Issue                    | Solution                                        |
| ------------------------ | ----------------------------------------------- |
| No notifications created | Check if vote is active and students exist      |
| Wrong notification count | Verify student count matches notification count |
| Trigger not firing       | Check if trigger is enabled on votes table      |

## Related Tasks

- ✅ Task 7.1: Build Voting System
- ✅ Task 6.1: Set Up Database Triggers for Notifications
- ✅ Task 6.2: Build Notification System UI

## Status

✅ **Implemented and Tested**

All functionality is working as expected.
