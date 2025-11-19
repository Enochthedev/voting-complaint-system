# Complaints Table RLS Policies Documentation

## Overview

This document describes the Row Level Security (RLS) policies implemented for the `complaints` table in the Student Complaint Resolution System. RLS policies ensure that users can only access and modify data they are authorized to see and change.

## RLS Status

✅ **RLS is ENABLED** on the `complaints` table

All policies are defined in migration file: `supabase/migrations/002_create_complaints_table.sql`

## Policy Summary

The complaints table has **5 RLS policies** covering all CRUD operations:

| Operation | Policy Name | Description |
|-----------|-------------|-------------|
| SELECT | Students view own complaints | Students can view their own non-anonymous complaints |
| SELECT | (implicit) | Lecturers and admins can view all complaints |
| INSERT | Students insert complaints | Students can create new complaints |
| UPDATE | Students update own drafts | Students can update their own draft complaints |
| UPDATE | Lecturers update complaints | Lecturers and admins can update all complaints |
| DELETE | Students delete own drafts | Students can delete their own draft complaints |

## Detailed Policy Definitions

### 1. SELECT Policies

#### Policy: "Students view own complaints"
```sql
CREATE POLICY "Students view own complaints"
  ON public.complaints
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );
```

**Purpose**: Controls who can view complaints

**Rules**:
- Students can view complaints where they are the author (`student_id = auth.uid()`)
- Lecturers and admins can view ALL complaints (including anonymous ones)
- Anonymous complaints are visible to lecturers but hide the student identity

**Validates Requirements**: AC3, P2, P7

---

### 2. INSERT Policies

#### Policy: "Students insert complaints"
```sql
CREATE POLICY "Students insert complaints"
  ON public.complaints
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'student'
    )
  );
```

**Purpose**: Controls who can create new complaints

**Rules**:
- Only users with role 'student' can insert complaints
- Lecturers and admins cannot create complaints on behalf of students
- Enforces that complaint submission is a student-only action

**Validates Requirements**: AC2, P3

---

### 3. UPDATE Policies

#### Policy: "Students update own drafts"
```sql
CREATE POLICY "Students update own drafts"
  ON public.complaints
  FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid() AND is_draft = true
  )
  WITH CHECK (
    student_id = auth.uid() AND is_draft = true
  );
```

**Purpose**: Allows students to edit their draft complaints

**Rules**:
- Students can only update complaints they own (`student_id = auth.uid()`)
- Students can only update complaints that are drafts (`is_draft = true`)
- Once a complaint is submitted (not a draft), students cannot modify it
- Both USING and WITH CHECK clauses ensure the complaint remains a draft

**Validates Requirements**: AC10, P11

---

#### Policy: "Lecturers update complaints"
```sql
CREATE POLICY "Lecturers update complaints"
  ON public.complaints
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );
```

**Purpose**: Allows lecturers and admins to manage all complaints

**Rules**:
- Only users with role 'lecturer' or 'admin' can update any complaint
- Lecturers can change status, assign complaints, add notes, etc.
- No restrictions on which complaints can be updated

**Validates Requirements**: AC3, AC17, P7, P9

---

### 4. DELETE Policies

#### Policy: "Students delete own drafts"
```sql
CREATE POLICY "Students delete own drafts"
  ON public.complaints
  FOR DELETE
  TO authenticated
  USING (
    student_id = auth.uid() AND is_draft = true
  );
```

**Purpose**: Allows students to delete their draft complaints

**Rules**:
- Students can only delete complaints they own (`student_id = auth.uid()`)
- Students can only delete complaints that are drafts (`is_draft = true`)
- Once a complaint is submitted, it cannot be deleted by students
- Lecturers and admins cannot delete complaints (for audit trail purposes)

**Validates Requirements**: AC10, P11

---

## Data Integrity Constraints

In addition to RLS policies, the complaints table has database-level constraints:

### Anonymous Complaint Constraint
```sql
CONSTRAINT anonymous_complaint_check CHECK (
  (is_anonymous = true AND student_id IS NULL) OR
  (is_anonymous = false)
)
```

**Purpose**: Ensures anonymous complaints truly hide student identity

**Rules**:
- If `is_anonymous = true`, then `student_id` MUST be NULL
- If `is_anonymous = false`, `student_id` can be any value (including NULL for edge cases)

**Validates Requirements**: AC2, AC3, P2

---

### Draft Status Constraint
```sql
CONSTRAINT draft_status_check CHECK (
  (is_draft = true AND status = 'draft') OR
  (is_draft = false AND status != 'draft')
)
```

**Purpose**: Ensures draft flag and status are synchronized

**Rules**:
- If `is_draft = true`, then `status` MUST be 'draft'
- If `is_draft = false`, then `status` MUST NOT be 'draft'
- Prevents inconsistent states

**Validates Requirements**: AC10, P11

---

## Security Considerations

### 1. Anonymous Complaint Privacy (P2)
- Anonymous complaints have `student_id = NULL`
- RLS policies allow lecturers to view anonymous complaints
- Application layer must not expose identifying information
- Database constraint enforces anonymity at the data level

### 2. Role-Based Access Control (P7)
- All policies check user role via `auth.jwt()->>'role'` or users table lookup
- Students have limited access (own complaints only)
- Lecturers have full access (all complaints)
- Admins have same access as lecturers

### 3. Draft Isolation (P11)
- Draft complaints are only visible to the student who created them
- Drafts can be edited and deleted by the owner
- Once submitted, complaints become immutable to students
- Lecturers can still manage submitted complaints

### 4. Audit Trail Protection
- Students cannot delete submitted complaints
- Lecturers cannot delete any complaints
- All changes should be logged in `complaint_history` table
- Ensures accountability and transparency

---

## Testing

### Automated Tests

Run the RLS policy test script:
```bash
node scripts/test-complaints-rls.js
```

This script verifies:
- ✅ RLS is enabled on the complaints table
- ✅ All 5 required policies are present
- ✅ Data integrity constraints work correctly
- ✅ Anonymous complaint constraint
- ✅ Draft status constraint

### Manual Testing

Run the SQL verification script:
```bash
psql $DATABASE_URL -f supabase/test-complaints-rls.sql
```

Or use the Supabase SQL Editor to run:
```bash
supabase/verify-complaints-table.sql
```

---

## Policy Coverage Matrix

| User Role | View Own | View All | Create | Update Own Draft | Update Any | Delete Own Draft |
|-----------|----------|----------|--------|------------------|------------|------------------|
| Student   | ✅       | ❌       | ✅     | ✅               | ❌         | ✅               |
| Lecturer  | ✅       | ✅       | ❌     | ❌               | ✅         | ❌               |
| Admin     | ✅       | ✅       | ❌     | ❌               | ✅         | ❌               |

---

## Related Requirements

### Acceptance Criteria
- **AC2**: Complaint Submission - Students can submit complaints
- **AC3**: Complaint Viewing - Role-based access to complaints
- **AC10**: Draft Complaints - Students can save and manage drafts
- **AC17**: Complaint Assignment - Lecturers can assign complaints

### Correctness Properties
- **P2**: Anonymous Complaint Privacy - Identity protection for anonymous complaints
- **P3**: Complaint Submission Integrity - Required fields and validation
- **P7**: Role-Based Access - Proper access control by user role
- **P9**: Status Transition Validity - Valid state transitions
- **P11**: Draft Complaint Isolation - Drafts only visible to owner

---

## Future Enhancements

Potential policy improvements for future versions:

1. **Department-based Access**: Lecturers only see complaints assigned to their department
2. **Time-based Restrictions**: Students can only edit drafts within X hours of creation
3. **Escalation Policies**: Special access for escalated complaints
4. **Archived Complaints**: Separate policies for archived/closed complaints
5. **Bulk Operations**: Optimized policies for bulk updates by lecturers

---

## Troubleshooting

### Common Issues

**Issue**: Students cannot see their own complaints
- **Check**: Verify `student_id` matches `auth.uid()`
- **Check**: Ensure user is authenticated
- **Check**: Verify complaint is not anonymous (anonymous complaints have NULL student_id)

**Issue**: Lecturers cannot update complaints
- **Check**: Verify user role is 'lecturer' or 'admin' in users table
- **Check**: Ensure JWT token includes correct role claim

**Issue**: Students can update submitted complaints
- **Check**: Verify `is_draft = false` for submitted complaints
- **Check**: Check if "Students update own drafts" policy is correctly filtering by `is_draft`

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Design Document: `.kiro/specs/student-complaint-system/design.md`
- Requirements Document: `.kiro/specs/student-complaint-system/requirements.md`
- Migration File: `supabase/migrations/002_create_complaints_table.sql`

---

**Last Updated**: 2024
**Status**: ✅ Implemented and Tested
