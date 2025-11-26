# Complaint History Immutability Implementation

## Overview

The `complaint_history` table provides an **immutable audit trail** of all actions performed on complaints. This document describes the implementation of Property P13: History records are immutable.

## Implementation Details

### Database-Level Protections

#### 1. Triggers to Prevent Modifications

Three BEFORE triggers enforce immutability at the database level:

**prevent_history_update**
- Fires: BEFORE UPDATE on each row
- Action: Raises exception preventing any UPDATE operations
- Error: `complaint_history records are immutable and cannot be updated`

**prevent_history_delete**
- Fires: BEFORE DELETE on each row
- Action: Raises exception preventing any DELETE operations
- Error: `complaint_history records are immutable and cannot be deleted`

**prevent_history_truncate**
- Fires: BEFORE TRUNCATE on statement level
- Action: Raises exception preventing TRUNCATE operations
- Error: `complaint_history table cannot be truncated - records are immutable`

#### 2. Row Level Security (RLS) Policies

Four RLS policies control access to history records:

**Users view history on accessible complaints** (SELECT)
- Students: Can view history on their own complaints
- Lecturers/Admins: Can view all history records
- Uses JWT claims to determine role

**System inserts history records** (INSERT)
- All authenticated users can insert history records
- Required for triggers and application code to log actions

**Deny history updates** (UPDATE)
- Explicitly denies all UPDATE operations
- Returns false for all authenticated users

**Deny history deletes** (DELETE)
- Explicitly denies all DELETE operations
- Returns false for all authenticated users

#### 3. Permission Restrictions

Database permissions are restricted to enforce immutability:

```sql
-- Only SELECT and INSERT allowed
GRANT SELECT, INSERT ON public.complaint_history TO authenticated;

-- UPDATE, DELETE, and TRUNCATE explicitly revoked
REVOKE UPDATE, DELETE, TRUNCATE ON public.complaint_history FROM authenticated;
REVOKE UPDATE, DELETE, TRUNCATE ON public.complaint_history FROM anon;
REVOKE TRUNCATE ON public.complaint_history FROM PUBLIC;
```

### Schema Design

The `complaint_history` table schema supports comprehensive audit logging:

```sql
CREATE TABLE public.complaint_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  action complaint_action NOT NULL,
  old_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Action Types** (complaint_action enum):
- `created` - Complaint was created
- `updated` - Complaint details were updated
- `assigned` - Complaint was assigned to a lecturer
- `status_changed` - Complaint status was changed
- `priority_changed` - Complaint priority was changed
- `resolved` - Complaint was marked as resolved
- `closed` - Complaint was closed
- `escalated` - Complaint was escalated
- `commented` - A comment was added

### Automatic History Logging

History records are automatically created by database triggers:

1. **Complaint Creation** - Logs when a new complaint is submitted
2. **Status Changes** - Logs all status transitions
3. **Assignment Changes** - Logs when complaints are assigned/reassigned
4. **Feedback Added** - Logs when lecturers provide feedback
5. **Comments Added** - Logs when comments are posted
6. **Bulk Actions** - Logs bulk operations on multiple complaints

## Verification

### Running the Verification Script

```bash
node scripts/verify-complaint-history-immutability.js
```

The script tests:
1. ✅ INSERT operations work correctly
2. ✅ UPDATE operations are blocked
3. ✅ Records remain unchanged after UPDATE attempts
4. ✅ DELETE operations are blocked
5. ✅ Records still exist after DELETE attempts
6. ✅ Database protections are in place

### Expected Output

```
✅ Immutability verification complete!

Summary:
- INSERT operations: ✅ Working
- UPDATE operations: ✅ Blocked
- DELETE operations: ✅ Blocked
- TRUNCATE operations: ✅ Blocked (via trigger)
- RLS policies: ✅ In place
- Database triggers: ✅ Active

✅ Property P13 (History Immutability) is enforced!
```

## Migrations

The immutability implementation is spread across multiple migrations:

1. **005_create_complaint_history_table.sql**
   - Creates the table and initial RLS policies
   - Sets up indexes for performance

2. **021_fix_complaint_history_rls.sql**
   - Adds explicit DENY policies for UPDATE and DELETE
   - Uses JWT claims to avoid recursion issues

3. **038_enforce_complaint_history_immutability.sql**
   - Adds BEFORE UPDATE trigger
   - Adds BEFORE DELETE trigger
   - Revokes UPDATE/DELETE permissions

4. **039_prevent_complaint_history_truncate_v2.sql**
   - Adds BEFORE TRUNCATE trigger
   - Revokes TRUNCATE permissions

## Benefits

### 1. Audit Trail Integrity
- Complete, tamper-proof record of all complaint actions
- Supports compliance and accountability requirements
- Enables investigation of issues or disputes

### 2. Data Forensics
- Track who did what and when
- Understand the complete lifecycle of each complaint
- Identify patterns in complaint handling

### 3. Security
- Prevents malicious or accidental modification of history
- Protects against data tampering
- Maintains trust in the system

### 4. Compliance
- Meets audit requirements for educational institutions
- Provides evidence for dispute resolution
- Supports data retention policies

## Usage in Application Code

### Reading History

```typescript
// Fetch history for a complaint
const { data: history, error } = await supabase
  .from('complaint_history')
  .select('*')
  .eq('complaint_id', complaintId)
  .order('created_at', { ascending: false });
```

### Creating History Records

History records are typically created automatically by triggers, but can also be created manually:

```typescript
// Manual history logging (if needed)
const { error } = await supabase
  .from('complaint_history')
  .insert({
    complaint_id: complaintId,
    action: 'status_changed',
    old_value: 'new',
    new_value: 'in_progress',
    performed_by: userId,
    details: { reason: 'Assigned to lecturer' }
  });
```

### Attempting Modifications (Will Fail)

```typescript
// This will fail with an error
const { error } = await supabase
  .from('complaint_history')
  .update({ old_value: 'modified' })
  .eq('id', historyId);

// Error: "complaint_history records are immutable and cannot be updated"
```

## Troubleshooting

### Issue: History records not being created

**Cause**: Triggers may not be firing
**Solution**: Check that triggers are enabled:

```sql
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'public.complaint_history'::regclass;
```

### Issue: Cannot insert history records

**Cause**: Missing INSERT permission
**Solution**: Verify permissions:

```sql
SELECT privilege_type 
FROM information_schema.table_privileges
WHERE table_name = 'complaint_history' 
  AND grantee = 'authenticated';
```

### Issue: Superuser can still modify records

**Cause**: Superusers bypass RLS but not triggers
**Solution**: This is expected. The BEFORE triggers will still prevent modifications even for superusers.

## Related Documentation

- [History Logging Architecture](./HISTORY_LOGGING_ARCHITECTURE.md)
- [History Logging Quick Reference](./HISTORY_LOGGING_QUICK_REFERENCE.md)
- [RLS Quick Reference](./RLS_QUICK_REFERENCE.md)

## Property P13 Validation

✅ **Property P13: History records are immutable**

The implementation ensures that:
- History records can be created (INSERT)
- History records can be read (SELECT with RLS)
- History records CANNOT be modified (UPDATE blocked)
- History records CANNOT be deleted (DELETE blocked)
- History table CANNOT be truncated (TRUNCATE blocked)

This is enforced through:
- Database triggers (work for all users including superusers)
- RLS policies (work for authenticated users)
- Permission restrictions (work at the role level)

**Status**: ✅ Fully Implemented and Verified
