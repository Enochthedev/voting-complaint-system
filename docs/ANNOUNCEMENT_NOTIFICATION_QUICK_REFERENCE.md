# Announcement Notification - Quick Reference

## Overview

Automatic notifications for all students when a new announcement is created.

## Key Files

| File | Purpose |
|------|---------|
| `supabase/migrations/034_create_announcement_notification_trigger.sql` | Database trigger migration |
| `scripts/test-announcement-notification-trigger.js` | Test script |
| `docs/ANNOUNCEMENT_NOTIFICATION_IMPLEMENTATION.md` | Full documentation |

## How It Works

```
Lecturer creates announcement
         ↓
Database INSERT trigger fires
         ↓
Notification created for each student
         ↓
Real-time delivery to connected clients
         ↓
Notification bell updates
```

## Notification Details

- **Type**: `new_announcement`
- **Title**: "A new announcement has been posted"
- **Message**: "A new announcement has been posted: {announcement_title}"
- **Related ID**: Links to announcement
- **Default State**: Unread

## Testing

```bash
# Run the test script
node scripts/test-announcement-notification-trigger.js
```

**Expected Result**: ✅ All students receive notification

## Verification

### Check Trigger Exists

```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'notify_on_new_announcement';
```

### Check Recent Notifications

```sql
SELECT n.*, u.full_name, u.email
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.type = 'new_announcement'
ORDER BY n.created_at DESC
LIMIT 10;
```

### Count Notifications per Announcement

```sql
SELECT 
  a.title,
  COUNT(n.id) as notification_count
FROM announcements a
LEFT JOIN notifications n ON n.related_id = a.id AND n.type = 'new_announcement'
GROUP BY a.id, a.title
ORDER BY a.created_at DESC;
```

## Frontend Integration

The notification system is already integrated:

1. **Notification Bell** - Shows count badge
2. **Notification Dropdown** - Lists all notifications
3. **Real-time Updates** - Automatic UI updates

No additional frontend changes needed!

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No notifications created | Check trigger exists and is enabled |
| Students not receiving | Verify student role in users table |
| Real-time not working | Check Realtime subscription in frontend |
| Wrong notification count | Verify RLS policies allow students to read notifications |

## Related Triggers

- `notify_on_feedback_received` - Feedback notifications
- `notify_on_comment_added` - Comment notifications
- `notify_on_new_vote` - Vote notifications
- `notify_on_new_announcement` - Announcement notifications ← This one

## Status

✅ **Complete and Tested**

All students automatically receive notifications when announcements are created.
