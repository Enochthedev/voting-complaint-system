# Anonymous Complaint Privacy - Quick Reference

## Overview

This guide provides quick reference information for working with anonymous complaints in the Student Complaint Resolution System.

## Key Privacy Rules

### Database Constraint

```sql
CONSTRAINT anonymous_complaint_check CHECK (
  (is_anonymous = true AND student_id IS NULL) OR
  (is_anonymous = false)
)
```

**Rule**: If `is_anonymous = true`, then `student_id` MUST be `null`.

## Creating Anonymous Complaints

### ✅ Correct Way

```javascript
// Anonymous complaint
const { data, error } = await supabase.from('complaints').insert({
  student_id: null, // Must be null
  is_anonymous: true, // Flag as anonymous
  title: 'Complaint title',
  description: 'Complaint description',
  category: 'academic',
  priority: 'medium',
  status: 'new',
});
```

### ❌ Incorrect Way

```javascript
// This will be REJECTED by the database constraint
const { data, error } = await supabase.from('complaints').insert({
  student_id: userId, // ❌ Cannot have student_id
  is_anonymous: true, // ❌ Conflict!
  title: 'Complaint title',
  // ...
});
```

## Querying Anonymous Complaints

### As a Lecturer

```javascript
// Lecturers can view all complaints, including anonymous ones
const { data: complaints } = await supabase.from('complaints').select('*').eq('is_anonymous', true);

// Anonymous complaints will have:
// - student_id: null
// - is_anonymous: true
// - All other fields populated normally
```

### As a Student

```javascript
// Students can only view their own non-anonymous complaints
const { data: myComplaints } = await supabase
  .from('complaints')
  .select('*')
  .eq('student_id', userId);

// This will NOT return anonymous complaints
// (because anonymous complaints have student_id = null)
```

## Updating Anonymous Complaints

### ✅ Safe Updates

```javascript
// These updates maintain anonymity
await supabase
  .from('complaints')
  .update({
    status: 'in_progress', // ✅ OK
    assigned_to: lecturerId, // ✅ OK
    priority: 'high', // ✅ OK
  })
  .eq('id', complaintId);
```

### ❌ Dangerous Updates

```javascript
// ❌ DO NOT set student_id on anonymous complaints
await supabase
  .from('complaints')
  .update({
    student_id: userId, // ❌ Violates constraint!
    is_anonymous: true,
  })
  .eq('id', complaintId);

// ❌ DO NOT change is_anonymous without handling student_id
await supabase
  .from('complaints')
  .update({
    is_anonymous: false, // ❌ Leaves student_id as null!
  })
  .eq('id', complaintId);
```

## UI Considerations

### Displaying Anonymous Complaints

```typescript
// In complaint list/detail views
function ComplaintCard({ complaint }) {
  const submitterName = complaint.is_anonymous
    ? 'Anonymous Student'           // ✅ Show generic label
    : complaint.student?.full_name; // Show actual name

  return (
    <div>
      <h3>{complaint.title}</h3>
      <p>Submitted by: {submitterName}</p>
      {complaint.is_anonymous && (
        <Badge>Anonymous</Badge>    // ✅ Visual indicator
      )}
    </div>
  );
}
```

### Creating Anonymous Complaints

```typescript
// In complaint submission form
function ComplaintForm() {
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = async (formData) => {
    const complaint = {
      student_id: isAnonymous ? null : currentUser.id,  // ✅ Conditional
      is_anonymous: isAnonymous,
      title: formData.title,
      description: formData.description,
      // ...
    };

    await supabase.from('complaints').insert(complaint);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        Submit anonymously
      </label>
      {/* ... other fields ... */}
    </form>
  );
}
```

## Testing Anonymous Complaints

### Run the Test Suite

```bash
node scripts/test-anonymous-complaint-privacy.js
```

### Manual Testing Checklist

- [ ] Create an anonymous complaint (student_id should be null)
- [ ] Verify lecturer can view the anonymous complaint
- [ ] Verify lecturer sees "Anonymous" instead of student name
- [ ] Verify student cannot see other students' anonymous complaints
- [ ] Update anonymous complaint status (should maintain anonymity)
- [ ] Assign anonymous complaint to lecturer (should maintain anonymity)
- [ ] Add feedback to anonymous complaint (should maintain anonymity)
- [ ] Check complaint history (should not reveal student identity)

## Common Pitfalls

### 1. Forgetting to Set student_id to null

```javascript
// ❌ Wrong
const complaint = {
  is_anonymous: true,
  // student_id not set - might default to current user!
};

// ✅ Correct
const complaint = {
  student_id: null, // Explicitly set to null
  is_anonymous: true,
};
```

### 2. Exposing Identity in Related Tables

```javascript
// ❌ Wrong - logging student info in history
await supabase.from('complaint_history').insert({
  complaint_id: complaintId,
  action: 'created',
  details: {
    student_id: userId, // ❌ Leaks identity!
    student_name: userName,
  },
});

// ✅ Correct - no student info in history
await supabase.from('complaint_history').insert({
  complaint_id: complaintId,
  action: 'created',
  details: {
    submission_type: 'anonymous', // ✅ Generic info only
  },
});
```

### 3. Incorrect RLS Policies

```sql
-- ❌ Wrong - allows students to see anonymous complaints
CREATE POLICY "Students view complaints"
ON complaints FOR SELECT
USING (true);  -- Too permissive!

-- ✅ Correct - students only see their own
CREATE POLICY "Students view own complaints"
ON complaints FOR SELECT
USING (student_id = auth.uid() OR role = 'lecturer');
```

## Debugging Anonymous Complaint Issues

### Check for Constraint Violations

```sql
-- Find anonymous complaints with non-null student_id
SELECT id, title, student_id, is_anonymous
FROM complaints
WHERE is_anonymous = true
  AND student_id IS NOT NULL;
```

### Verify Constraint Exists

```sql
-- Check if constraint is defined
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.complaints'::regclass
  AND conname = 'anonymous_complaint_check';
```

### Fix Violated Data

```sql
-- Fix anonymous complaints with student_id
UPDATE complaints
SET student_id = NULL
WHERE is_anonymous = true
  AND student_id IS NOT NULL;
```

## Security Checklist

- [ ] Database constraint enforces anonymous = true → student_id = null
- [ ] RLS policies prevent students from viewing other students' anonymous complaints
- [ ] UI never displays student identity for anonymous complaints
- [ ] API responses don't include student_id for anonymous complaints
- [ ] Complaint history doesn't log student identity for anonymous complaints
- [ ] Comments on anonymous complaints don't reveal original submitter
- [ ] Notifications about anonymous complaints don't include student identity
- [ ] Export/PDF generation respects anonymous complaint privacy

## Related Documentation

- Full Test Report: `docs/ANONYMOUS_COMPLAINT_PRIVACY_TEST.md`
- Test Script: `scripts/test-anonymous-complaint-privacy.js`
- Database Schema: `supabase/migrations/002_create_complaints_table.sql`
- Design Document: `.kiro/specs/design.md` (Property P2)
- Requirements: `.kiro/specs/requirements.md` (AC2, AC3)

## Support

If you encounter issues with anonymous complaint privacy:

1. Run the test suite to identify specific failures
2. Check the database for constraint violations
3. Review RLS policies for proper access control
4. Verify UI code doesn't expose student identity
5. Check application logs for privacy-related errors

---

**Last Updated**: December 1, 2024
**Status**: All tests passing ✅
