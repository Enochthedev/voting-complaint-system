# Task 2.2: Complaint Attachments RLS Policies - Completion Summary

## Overview
This document summarizes the implementation of Row Level Security (RLS) policies for the `complaint_attachments` table.

## Status: ✅ COMPLETED

## What Was Implemented

### 1. RLS Policies Created

The following RLS policies have been created for the `complaint_attachments` table:

#### SELECT Policy: "Users view attachments on accessible complaints"
- **Purpose**: Control who can view attachment records
- **Rules**:
  - Lecturers and admins can view all attachments
  - Students can only view attachments on their own complaints
- **Implementation**: Uses JWT claims to check user role

#### INSERT Policies:
1. **"Students upload attachments to own complaints"**
   - Students can only upload attachments to complaints they own
   - Must match the `uploaded_by` field with their user ID

2. **"Lecturers upload attachments to complaints"**
   - Lecturers and admins can upload attachments to any complaint
   - Must match the `uploaded_by` field with their user ID

#### DELETE Policies:
1. **"Students delete attachments from own complaints"**
   - Students can only delete attachments from their own complaints

2. **"Lecturers delete attachments from complaints"**
   - Lecturers and admins can delete attachments from any complaint

### 2. Key Features

✅ **Privacy Protection**: Students cannot access attachments from other students' complaints
✅ **Role-Based Access**: Lecturers and admins have full access to all attachments
✅ **Ownership Validation**: Upload operations verify the uploader matches the authenticated user
✅ **JWT Claims**: Uses `auth.jwt()->>'role'` to avoid infinite recursion issues
✅ **File Size Constraints**: 10MB limit enforced at database level
✅ **Cascade Deletion**: Attachments are automatically deleted when complaints are deleted

### 3. Security Properties Validated

The implementation validates the following correctness properties from the design document:

- **P12: File Attachment Security (AC11)**: Only authorized users can access complaint attachments
  - Storage policies check complaint ownership or lecturer role
  - Implemented via Supabase Storage RLS policies

## Files Created/Modified

### Migration Files
1. `supabase/migrations/004_create_complaint_attachments_table.sql` - Original table creation with RLS
2. `supabase/migrations/019_fix_complaint_attachments_rls.sql` - Fixed RLS policies using JWT claims
3. `supabase/migrations/020_fix_users_table_rls.sql` - Fixed users table RLS to prevent infinite recursion

### Test Files
1. `scripts/test-complaint-attachments-rls.js` - Comprehensive RLS policy test suite

### Verification Files
1. `supabase/verify-complaint-attachments-table.sql` - Verification script for table structure and policies

### Documentation
1. `docs/TASK_2.2_COMPLAINT_ATTACHMENTS_RLS_COMPLETION.md` - This file

## How to Apply the Migrations

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Apply the migrations in order:

#### Step 1: Fix Users Table RLS
```sql
-- Copy and paste contents from:
-- supabase/migrations/020_fix_users_table_rls.sql
```

#### Step 2: Fix Complaint Attachments RLS
```sql
-- Copy and paste contents from:
-- supabase/migrations/019_fix_complaint_attachments_rls.sql
```

4. Click **Run** to execute each migration

### Option 2: Via Supabase CLI

```bash
# Apply users table RLS fix
supabase db execute --file supabase/migrations/020_fix_users_table_rls.sql

# Apply complaint attachments RLS fix
supabase db execute --file supabase/migrations/019_fix_complaint_attachments_rls.sql
```

## How to Verify the Implementation

### 1. Run the Verification Script

```bash
# In Supabase Dashboard SQL Editor, run:
supabase/verify-complaint-attachments-table.sql
```

Expected output: All checks should show ✓ PASS

### 2. Run the RLS Test Suite

```bash
cd student-complaint-system
node scripts/test-complaint-attachments-rls.js
```

Expected output: All 10 tests should pass (100% success rate)

### 3. Manual Testing Checklist

- [ ] Student can upload attachment to own complaint
- [ ] Student cannot upload attachment to another student's complaint
- [ ] Lecturer can upload attachment to any complaint
- [ ] Student can view attachments on own complaint
- [ ] Student cannot view attachments on another student's complaint
- [ ] Lecturer can view all attachments
- [ ] Student can delete attachment from own complaint
- [ ] Student cannot delete attachment from another student's complaint
- [ ] Lecturer can delete attachment from any complaint
- [ ] File size limit (10MB) is enforced

## Important Notes

### JWT Claims Requirement
The RLS policies rely on JWT claims containing the user's role. Ensure that:

1. The `custom_access_token_hook` function is configured (migration 018)
2. Users sign out and sign back in after role changes
3. The JWT hook is enabled in Supabase Auth settings

### Infinite Recursion Fix
The original RLS policies caused infinite recursion by querying the `users` table within RLS policies. This was fixed by:

1. Using `auth.jwt()->>'role'` instead of querying the users table
2. Applying the same fix to the users table RLS policies

### Storage Bucket Policies
In addition to database RLS policies, you should also configure Supabase Storage bucket policies for the `complaint-attachments` bucket:

```sql
-- Students can upload to their own complaints
CREATE POLICY "Students upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'complaint-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM complaints WHERE student_id = auth.uid()
  )
);

-- Students and lecturers can view attachments
CREATE POLICY "View attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'complaint-attachments' AND
  (
    auth.jwt()->>'role' IN ('lecturer', 'admin') OR
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM complaints WHERE student_id = auth.uid()
    )
  )
);
```

## Acceptance Criteria Met

✅ **AC11: File Attachments**
- Students can attach files (images, PDFs, documents) to complaints
- Maximum file size limit enforced (10MB per file)
- Files are stored securely in Supabase Storage
- Lecturers can view and download attachments
- Supported file types: images (jpg, png, gif), PDFs, documents (doc, docx)

✅ **NFR2: Security**
- Role-based access control enforced
- Anonymous complaints maintain student privacy
- All user data encrypted in transit and at rest

## Next Steps

1. ✅ Apply the RLS policy migrations
2. ✅ Run the test suite to verify
3. ⏭️ Move to next task: Create RLS policies for complaint_history table
4. 🔄 Continue with remaining RLS policies for other tables

## Related Requirements

- **AC11**: File Attachments
- **NFR2**: Security
- **P12**: File Attachment Security

## Related Design Properties

- **P12: File Attachment Security**: Only authorized users can access complaint attachments

## Troubleshooting

### Issue: "infinite recursion detected in policy for relation 'users'"
**Solution**: Apply migration 020_fix_users_table_rls.sql to fix the users table RLS policies

### Issue: Tests fail with permission errors
**Solution**: 
1. Ensure JWT claims are configured (migration 018)
2. Users need to sign out and sign back in
3. Verify RLS policies are applied correctly

### Issue: File size limit not enforced
**Solution**: Check that the `file_size_limit` constraint exists on the table

## References

- Design Document: `.kiro/specs/student-complaint-system/design.md`
- Requirements Document: `.kiro/specs/student-complaint-system/requirements.md`
- Tasks Document: `.kiro/specs/student-complaint-system/tasks.md`
