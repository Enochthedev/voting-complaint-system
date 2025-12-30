# History Logging Quick Reference

## Summary

All complaint actions are now automatically logged in the `complaint_history` table. This provides a complete audit trail of everything that happens to a complaint.

## What's Logged

| Action                  | How                 | Status |
| ----------------------- | ------------------- | ------ |
| Complaint creation      | Database trigger    | ✅     |
| Status changes          | Database trigger    | ✅     |
| Assignment/reassignment | Database trigger    | ✅     |
| Feedback addition       | Database trigger    | ✅ NEW |
| Comment addition        | Database trigger    | ✅ NEW |
| Comment edit            | Database trigger    | ✅ NEW |
| Comment deletion        | Database trigger    | ✅ NEW |
| Complaint reopening     | API function        | ✅     |
| Rating submission       | API function        | ✅     |
| Tag addition            | API function        | ✅     |
| Escalation              | Not yet implemented | ⏳     |

## Quick Setup

### 1. Apply the Migration

**Option A: Supabase Dashboard (Easiest)**

1. Go to: https://tnenutksxxdhamlyogto.supabase.co/project/_/sql
2. Open: `supabase/migrations/037_add_missing_history_logging_triggers.sql`
3. Copy all contents (Cmd+A, Cmd+C)
4. Paste into SQL Editor
5. Click "Run"

**Option B: Supabase CLI**

```bash
supabase db push
```

### 2. Verify It Works

```bash
node scripts/verify-history-logging.js
```

Expected output:

```
✅ Passed: 9/9
🎉 All tests passed!
```

## Usage Examples

### View Complaint History

```typescript
const { data: complaint } = await supabase
  .from('complaints')
  .select(
    `
    *,
    history:complaint_history(
      id,
      action,
      old_value,
      new_value,
      created_at,
      performed_by_user:users!complaint_history_performed_by_fkey(
        id, 
        full_name, 
        email
      )
    )
  `
  )
  .eq('id', complaintId)
  .single();

// Display in timeline
complaint.history.forEach((entry) => {
  console.log(`${entry.action} by ${entry.performed_by_user.full_name}`);
});
```

### Query Specific Actions

```typescript
// Get all status changes
const { data: statusChanges } = await supabase
  .from('complaint_history')
  .select('*')
  .eq('complaint_id', complaintId)
  .eq('action', 'status_changed')
  .order('created_at', { ascending: false });

// Get all comments
const { data: comments } = await supabase
  .from('complaint_history')
  .select('*')
  .eq('complaint_id', complaintId)
  .eq('action', 'comment_added')
  .order('created_at', { ascending: false });
```

## What Changed

### New Triggers Added

1. **log_feedback_addition_trigger**
   - Automatically logs when feedback is added
   - Stores first 100 chars of feedback content
   - Includes feedback ID in details

2. **log_comment_addition_trigger**
   - Automatically logs when comments are added
   - Stores first 100 chars of comment
   - Includes comment ID and is_internal flag

3. **log_comment_edit_trigger**
   - Automatically logs when comments are edited
   - Stores old and new text (first 100 chars)
   - Includes action_type: 'edited' in details

4. **log_comment_deletion_trigger**
   - Automatically logs when comments are deleted
   - Stores deleted text (first 100 chars)
   - Includes action_type: 'deleted' in details

### Files Created

- ✨ `supabase/migrations/037_add_missing_history_logging_triggers.sql`
- ✨ `scripts/apply-history-logging-triggers.js`
- ✨ `scripts/verify-history-logging.js`
- ✨ `docs/HISTORY_LOGGING_COMPLETE.md`
- ✨ `docs/HISTORY_LOGGING_QUICK_REFERENCE.md`

## Benefits

✅ **Complete audit trail** - Every action is logged
✅ **Automatic** - No manual logging needed in most cases
✅ **Immutable** - History cannot be changed or deleted
✅ **Transparent** - Users can see full complaint lifecycle
✅ **Debugging** - Easy to troubleshoot issues
✅ **Compliance** - Meets audit requirements

## Troubleshooting

### History not appearing?

1. Check if triggers are installed:

```sql
SELECT tgname FROM pg_trigger
WHERE tgname LIKE 'log_%';
```

2. Check RLS policies:

```sql
SELECT * FROM complaint_history
WHERE complaint_id = 'your-complaint-id';
```

3. Run verification script:

```bash
node scripts/verify-history-logging.js
```

### Need to see all triggers?

```sql
SELECT
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname LIKE 'log_%'
ORDER BY c.relname, t.tgname;
```

## Related Documentation

- [Complete History Logging Documentation](./HISTORY_LOGGING_COMPLETE.md)
- [Timeline Component](./TASK_9.2_TIMELINE_COMPONENT_COMPLETION.md)
- [Complaint History Table Schema](../supabase/migrations/005_create_complaint_history_table.sql)

## Next Steps

1. ✅ Apply the migration
2. ✅ Run verification script
3. ✅ Test in the UI (complaint detail page timeline)
4. ⏳ Implement escalation logging (when escalation feature is built)

---

**Status**: ✅ Complete - All actions except escalation are now logged automatically!
