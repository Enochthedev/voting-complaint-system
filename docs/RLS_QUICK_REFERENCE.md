# RLS Policies Quick Reference Guide

## Complaints Table - Access Control Summary

### Student Access
```
✅ CAN:
- View their own complaints (where student_id = their user ID)
- Create new complaints
- Edit their draft complaints
- Delete their draft complaints

❌ CANNOT:
- View other students' complaints
- View all complaints
- Edit submitted complaints
- Delete submitted complaints
- Update any complaint status
```

### Lecturer/Admin Access
```
✅ CAN:
- View ALL complaints (including anonymous)
- Update any complaint (status, assignment, etc.)
- Assign complaints to other lecturers
- Add feedback and comments

❌ CANNOT:
- Create complaints (students only)
- Delete any complaints (for audit trail)
- See student identity for anonymous complaints (enforced at app level)
```

## Policy Quick Check

### Is RLS Enabled?
```sql
SELECT rowsecurity FROM pg_tables 
WHERE tablename = 'complaints' AND schemaname = 'public';
-- Should return: true
```

### List All Policies
```sql
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'complaints' AND schemaname = 'public'
ORDER BY cmd, policyname;
```

### Test Your Access
```javascript
// As a student - should only see own complaints
const { data } = await supabase
  .from('complaints')
  .select('*');
// Returns: Only complaints where student_id = current user

// As a lecturer - should see all complaints
const { data } = await supabase
  .from('complaints')
  .select('*');
// Returns: All complaints in the system
```

## Common Scenarios

### Scenario 1: Student Creates a Complaint
```javascript
// ✅ ALLOWED - Students can insert
const { data, error } = await supabase
  .from('complaints')
  .insert({
    title: 'My complaint',
    description: 'Details...',
    category: 'academic',
    priority: 'medium',
    is_anonymous: false,
    is_draft: false
  });
```

### Scenario 2: Student Edits a Draft
```javascript
// ✅ ALLOWED - If is_draft = true and student owns it
const { data, error } = await supabase
  .from('complaints')
  .update({ title: 'Updated title' })
  .eq('id', complaintId)
  .eq('is_draft', true);
```

### Scenario 3: Student Tries to Edit Submitted Complaint
```javascript
// ❌ BLOCKED - Students cannot update submitted complaints
const { data, error } = await supabase
  .from('complaints')
  .update({ status: 'resolved' })
  .eq('id', complaintId);
// Error: Policy violation
```

### Scenario 4: Lecturer Updates Complaint Status
```javascript
// ✅ ALLOWED - Lecturers can update any complaint
const { data, error } = await supabase
  .from('complaints')
  .update({ 
    status: 'in_progress',
    assigned_to: lecturerId 
  })
  .eq('id', complaintId);
```

### Scenario 5: Student Deletes a Draft
```javascript
// ✅ ALLOWED - Students can delete their drafts
const { data, error } = await supabase
  .from('complaints')
  .delete()
  .eq('id', complaintId)
  .eq('is_draft', true);
```

### Scenario 6: Student Tries to Delete Submitted Complaint
```javascript
// ❌ BLOCKED - Students cannot delete submitted complaints
const { data, error } = await supabase
  .from('complaints')
  .delete()
  .eq('id', complaintId);
// Error: Policy violation (no matching policy)
```

## Testing Commands

### Run Automated Tests
```bash
node scripts/test-complaints-rls.js
```

### Run SQL Tests
```bash
psql $DATABASE_URL -f supabase/test-complaints-rls.sql
```

### Verify Specific Policy
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'complaints' 
AND policyname = 'Students view own complaints';
```

## Troubleshooting

### Problem: "Permission denied for table complaints"
**Cause**: RLS is enabled but no policy matches your request
**Solution**: Check your user role and ensure you're authenticated

### Problem: "Cannot view other students' complaints"
**Cause**: Working as intended - students can only see their own
**Solution**: Use a lecturer/admin account to view all complaints

### Problem: "Cannot update submitted complaint as student"
**Cause**: Working as intended - only drafts can be edited by students
**Solution**: Lecturers must update submitted complaints

### Problem: "Anonymous complaint shows student_id"
**Cause**: Database constraint violation
**Solution**: Ensure `student_id = NULL` when `is_anonymous = true`

## Policy Files

- **Migration**: `supabase/migrations/002_create_complaints_table.sql`
- **Documentation**: `docs/COMPLAINTS_RLS_POLICIES.md`
- **Test Script**: `scripts/test-complaints-rls.js`
- **SQL Tests**: `supabase/test-complaints-rls.sql`

## Need More Details?

See the full documentation: `docs/COMPLAINTS_RLS_POLICIES.md`
