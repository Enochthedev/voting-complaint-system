# Assignment Notification - Quick Start Guide

## Overview

When a complaint is assigned to a lecturer, the system automatically creates a notification and logs the assignment in history.

## How to Use

### Assigning a Complaint

```javascript
// Update the assigned_to field
const { error } = await supabase
  .from('complaints')
  .update({ assigned_to: lecturerId })
  .eq('id', complaintId);

// That's it! The notification and history are created automatically
```

### Checking Notifications

```javascript
// Get all assignment notifications for a user
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .eq('type', 'assignment')
  .order('created_at', { ascending: false });
```

### Checking Assignment History

```javascript
// Get assignment history for a complaint
const { data: history } = await supabase
  .from('complaint_history')
  .select('*')
  .eq('complaint_id', complaintId)
  .eq('action', 'assigned')
  .order('created_at', { ascending: false });
```

## Real-time Notifications

Subscribe to receive notifications in real-time:

```javascript
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    if (payload.new.type === 'assignment') {
      // Handle new assignment notification
      console.log('New complaint assigned:', payload.new.message);
      showToast(payload.new.title);
    }
  })
  .subscribe();

// Don't forget to unsubscribe when done
channel.unsubscribe();
```

## Notification Structure

```typescript
interface AssignmentNotification {
  id: string;
  user_id: string;           // Assigned lecturer ID
  type: 'assignment';
  title: string;             // "A complaint has been assigned to you"
  message: string;           // "You have been assigned complaint: [title]"
  related_id: string;        // Complaint ID
  is_read: boolean;          // false by default
  created_at: string;        // ISO timestamp
}
```

## History Structure

```typescript
interface AssignmentHistory {
  id: string;
  complaint_id: string;
  action: 'assigned';
  old_value: string | null;  // Previous assignee ID (null for first assignment)
  new_value: string;         // New assignee ID
  performed_by: string;      // User who made the assignment
  details: {
    previous_assignee: string | null;
    new_assignee: string;
    is_reassignment: boolean;
    timestamp: string;
  };
  created_at: string;
}
```

## Testing

Run the verification script to test the functionality:

```bash
node scripts/verify-assignment-notification.js
```

Expected output:
```
✅ Assignment notification verification PASSED
```

## Troubleshooting

### Notification not created?

1. Check if the trigger exists:
```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'notify_on_complaint_status_change';
```

2. Check if the function exists:
```sql
SELECT proname FROM pg_proc WHERE proname = 'notify_student_on_status_change';
```

3. Verify the notification type enum:
```sql
SELECT unnest(enum_range(NULL::notification_type))::text;
```

### History not logged?

1. Check if the trigger exists:
```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'log_complaint_assignment_trigger';
```

2. Check if the function exists:
```sql
SELECT proname FROM pg_proc WHERE proname = 'log_complaint_assignment';
```

## Related Files

- **Verification Script**: `scripts/verify-assignment-notification.js`
- **Migration**: `supabase/migrations/029_fix_assignment_notification_type.sql`
- **Full Documentation**: `docs/ASSIGNMENT_NOTIFICATION_IMPLEMENTATION.md`
- **UI Component**: `src/components/complaints/complaint-detail/ActionButtons.tsx`

## Key Points

✅ **Automatic**: Notifications are created automatically by database triggers  
✅ **Real-time**: Delivered instantly via Supabase Realtime  
✅ **Logged**: All assignments are logged in complaint history  
✅ **Tested**: Comprehensive verification script included  
✅ **Secure**: Protected by RLS policies  

## Next Steps

1. Implement notification UI in Phase 6
2. Add notification bell with count badge
3. Create notification center/dropdown
4. Add mark as read functionality
