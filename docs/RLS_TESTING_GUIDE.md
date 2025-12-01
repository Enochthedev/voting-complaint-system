# RLS Policy Testing Guide

## Quick Start

This guide helps you test and verify Row Level Security (RLS) policies in the Student Complaint Resolution System.

## Verification Scripts

### 1. Quick Verification

Check if all tables have RLS policies:

```bash
node scripts/verify-all-rls-policies.js
```

This script will:

- ✅ Check RLS is enabled on all tables
- ✅ Count policies per table
- ✅ Verify minimum policy requirements
- ✅ Show policy breakdown by operation

### 2. Comprehensive Testing

Run the full test suite:

```bash
node scripts/test-all-rls-policies.js
```

This script will:

- ✅ Test each table individually
- ✅ Check for missing policies
- ✅ Detect duplicate policies
- ✅ Verify policy consistency

## Manual SQL Verification

### Check RLS Status

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### List All Policies

```sql
SELECT
  tablename,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;
```

### Policy Count by Table

```sql
SELECT
  tablename,
  COUNT(*) as policy_count,
  COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
  COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
  COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
  COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

### Find Tables Without Policies

```sql
SELECT
  t.tablename,
  t.rowsecurity as rls_enabled,
  COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
AND t.rowsecurity = true
GROUP BY t.tablename, t.rowsecurity
HAVING COUNT(p.policyname) = 0;
```

## Testing with Real Users

### Setup Test Users

Create test users with different roles:

```javascript
// Student user
const student = await supabase.auth.signUp({
  email: 'student@test.com',
  password: 'test123',
  options: {
    data: {
      role: 'student',
      full_name: 'Test Student',
    },
  },
});

// Lecturer user
const lecturer = await supabase.auth.signUp({
  email: 'lecturer@test.com',
  password: 'test123',
  options: {
    data: {
      role: 'lecturer',
      full_name: 'Test Lecturer',
    },
  },
});

// Admin user
const admin = await supabase.auth.signUp({
  email: 'admin@test.com',
  password: 'test123',
  options: {
    data: {
      role: 'admin',
      full_name: 'Test Admin',
    },
  },
});
```

### Test Student Access

```javascript
// Login as student
const {
  data: { session },
} = await supabase.auth.signInWithPassword({
  email: 'student@test.com',
  password: 'test123',
});

// Try to view all complaints (should only see own)
const { data: complaints, error } = await supabase.from('complaints').select('*');

console.log('Student sees', complaints.length, 'complaints');
// Should only see complaints where student_id = student's user ID

// Try to create a complaint (should succeed)
const { data: newComplaint, error: createError } = await supabase.from('complaints').insert({
  title: 'Test Complaint',
  description: 'Testing RLS',
  category: 'academic',
  priority: 'medium',
  is_draft: false,
});

console.log('Create complaint:', createError ? 'FAILED' : 'SUCCESS');

// Try to update another student's complaint (should fail)
const { error: updateError } = await supabase
  .from('complaints')
  .update({ status: 'resolved' })
  .eq('id', 'some-other-complaint-id');

console.log('Update other complaint:', updateError ? 'BLOCKED ✅' : 'ALLOWED ❌');
```

### Test Lecturer Access

```javascript
// Login as lecturer
const {
  data: { session },
} = await supabase.auth.signInWithPassword({
  email: 'lecturer@test.com',
  password: 'test123',
});

// Try to view all complaints (should see all)
const { data: complaints, error } = await supabase.from('complaints').select('*');

console.log('Lecturer sees', complaints.length, 'complaints');
// Should see ALL complaints

// Try to update any complaint (should succeed)
const { error: updateError } = await supabase
  .from('complaints')
  .update({ status: 'in_progress' })
  .eq('id', 'any-complaint-id');

console.log('Update complaint:', updateError ? 'FAILED' : 'SUCCESS ✅');

// Try to create a complaint (should fail - students only)
const { error: createError } = await supabase.from('complaints').insert({
  title: 'Test',
  description: 'Test',
  category: 'academic',
});

console.log('Create complaint:', createError ? 'BLOCKED ✅' : 'ALLOWED ❌');
```

### Test Admin Access

```javascript
// Login as admin
const {
  data: { session },
} = await supabase.auth.signInWithPassword({
  email: 'admin@test.com',
  password: 'test123',
});

// Try to manage escalation rules (should succeed)
const { data: rules, error } = await supabase.from('escalation_rules').select('*');

console.log('Admin sees', rules.length, 'escalation rules');

// Try to create escalation rule (should succeed)
const { error: createError } = await supabase.from('escalation_rules').insert({
  category: 'academic',
  priority: 'high',
  hours_threshold: 48,
  escalate_to: 'some-user-id',
  is_active: true,
});

console.log('Create rule:', createError ? 'FAILED' : 'SUCCESS ✅');
```

## Common Test Scenarios

### 1. Anonymous Complaint Privacy

```javascript
// Create anonymous complaint
const { data: complaint } = await supabase
  .from('complaints')
  .insert({
    title: 'Anonymous Test',
    description: 'Testing anonymity',
    category: 'harassment',
    is_anonymous: true,
    student_id: null, // Must be null for anonymous
  })
  .select()
  .single();

// Verify student_id is null
console.log('Anonymous complaint student_id:', complaint.student_id);
// Should be null

// Login as lecturer and verify they can see it but not student identity
const { data: lecturerView } = await supabase
  .from('complaints')
  .select('*')
  .eq('id', complaint.id)
  .single();

console.log('Lecturer sees anonymous complaint:', lecturerView ? 'YES ✅' : 'NO ❌');
console.log('Student ID visible:', lecturerView.student_id ? 'YES ❌' : 'NO ✅');
```

### 2. Draft Isolation

```javascript
// Student creates draft
const { data: draft } = await supabase
  .from('complaints')
  .insert({
    title: 'Draft Test',
    description: 'Testing draft',
    category: 'academic',
    is_draft: true,
  })
  .select()
  .single();

// Student can update draft
const { error: updateError } = await supabase
  .from('complaints')
  .update({ title: 'Updated Draft' })
  .eq('id', draft.id)
  .eq('is_draft', true);

console.log('Update draft:', updateError ? 'FAILED' : 'SUCCESS ✅');

// Submit draft (set is_draft = false)
await supabase.from('complaints').update({ is_draft: false, status: 'new' }).eq('id', draft.id);

// Try to update submitted complaint (should fail)
const { error: updateSubmittedError } = await supabase
  .from('complaints')
  .update({ title: 'Try to update' })
  .eq('id', draft.id);

console.log('Update submitted:', updateSubmittedError ? 'BLOCKED ✅' : 'ALLOWED ❌');
```

### 3. History Immutability

```javascript
// Try to update history record (should fail)
const { error: updateError } = await supabase
  .from('complaint_history')
  .update({ action: 'modified' })
  .eq('id', 'some-history-id');

console.log('Update history:', updateError ? 'BLOCKED ✅' : 'ALLOWED ❌');

// Try to delete history record (should fail)
const { error: deleteError } = await supabase
  .from('complaint_history')
  .delete()
  .eq('id', 'some-history-id');

console.log('Delete history:', deleteError ? 'BLOCKED ✅' : 'ALLOWED ❌');
```

## Expected Results

### Student Role

- ✅ Can view own complaints
- ✅ Can create complaints
- ✅ Can update own drafts
- ✅ Can delete own drafts
- ❌ Cannot view other students' complaints
- ❌ Cannot update submitted complaints
- ❌ Cannot delete submitted complaints
- ❌ Cannot access admin features

### Lecturer Role

- ✅ Can view all complaints
- ✅ Can update any complaint
- ✅ Can assign complaints
- ✅ Can add feedback
- ✅ Can create templates
- ✅ Can view escalation rules
- ❌ Cannot create complaints
- ❌ Cannot delete complaints
- ❌ Cannot manage escalation rules

### Admin Role

- ✅ Can view all data
- ✅ Can update all data
- ✅ Can manage escalation rules
- ✅ Can override lecturer restrictions
- ✅ Full system access
- ❌ Cannot delete complaints (audit trail)
- ❌ Cannot modify history (immutable)

## Troubleshooting

### Policy Violation Errors

If you see "new row violates row-level security policy":

1. Check user is authenticated
2. Verify user role is correct
3. Ensure operation is allowed for that role
4. Check policy conditions are met

### Empty Result Sets

If queries return no data unexpectedly:

1. Verify RLS is enabled on the table
2. Check policies exist for SELECT operation
3. Ensure user has permission to view data
4. Verify data exists in the table

### Cannot Insert/Update

If insert/update operations fail:

1. Check WITH CHECK clause in policies
2. Verify required fields are provided
3. Ensure user owns the record (if applicable)
4. Check foreign key constraints

## Documentation References

- **Full Verification Report**: `docs/RLS_POLICY_VERIFICATION_COMPLETE.md`
- **Complaints Policies**: `docs/COMPLAINTS_RLS_POLICIES.md`
- **Templates Policies**: `docs/COMPLAINT_TEMPLATES_RLS_POLICIES.md`
- **Escalation Policies**: `docs/ESCALATION_RULES_RLS_POLICIES.md`
- **Quick Reference**: `docs/RLS_QUICK_REFERENCE.md`

## Need Help?

1. Check the comprehensive documentation in `docs/`
2. Review the migration files in `supabase/migrations/`
3. Run the verification scripts
4. Test with real user sessions
5. Check Supabase logs for policy violations

---

**Last Updated**: December 1, 2024  
**Status**: ✅ All policies verified and tested
