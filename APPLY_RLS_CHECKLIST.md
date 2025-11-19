# Complaint Attachments RLS - Application Checklist

Use this checklist to apply and verify the RLS policies for complaint_attachments.

## Pre-Application Checklist

- [ ] Supabase project is accessible
- [ ] You have admin access to the Supabase Dashboard
- [ ] Migration 018 (JWT claims) has been applied
- [ ] You have the SQL file ready: `supabase/APPLY_ATTACHMENTS_RLS_FIX.sql`

## Application Steps

### Step 1: Apply the Migration

- [ ] Open Supabase Dashboard (https://supabase.com/dashboard)
- [ ] Navigate to your project
- [ ] Click on **SQL Editor** in the left sidebar
- [ ] Click **New Query**
- [ ] Open file: `supabase/APPLY_ATTACHMENTS_RLS_FIX.sql`
- [ ] Copy the entire contents
- [ ] Paste into the SQL Editor
- [ ] Click **Run** (or press Cmd/Ctrl + Enter)
- [ ] Verify success message appears

### Step 2: Verify the Migration

- [ ] Check that no errors were displayed
- [ ] Verify the success messages at the end of the output
- [ ] Confirm policy count shows 5 policies created

### Step 3: Run Tests

- [ ] Open terminal
- [ ] Navigate to project: `cd student-complaint-system`
- [ ] Run test script: `node scripts/test-complaint-attachments-rls.js`
- [ ] Verify all 10 tests pass
- [ ] Check success rate is 100%

### Step 4: User Session Update

- [ ] Inform all users to sign out
- [ ] Have users sign back in
- [ ] This updates their JWT tokens with role information

## Verification Checklist

### Database Verification

- [ ] RLS is enabled on `complaint_attachments` table
- [ ] 5 policies exist on `complaint_attachments` table
- [ ] Users table RLS policies updated
- [ ] No infinite recursion errors

### Functional Verification

- [ ] Students can upload attachments to own complaints
- [ ] Students cannot upload to other students' complaints
- [ ] Lecturers can upload attachments to any complaint
- [ ] Students can view attachments on own complaints
- [ ] Students cannot view other students' attachments
- [ ] Lecturers can view all attachments
- [ ] Students can delete attachments from own complaints
- [ ] Students cannot delete other students' attachments
- [ ] Lecturers can delete attachments from any complaint
- [ ] File size limit (10MB) is enforced

## Post-Application Tasks

- [ ] Document the migration in your project log
- [ ] Update team on the changes
- [ ] Monitor for any RLS-related errors
- [ ] Move to next task: complaint_history RLS policies

## Rollback Plan (If Needed)

If something goes wrong, you can rollback by:

1. Go to Supabase Dashboard → SQL Editor
2. Run the original policies from: `supabase/migrations/004_create_complaint_attachments_table.sql`
3. Note: This will restore the infinite recursion issue

## Support Resources

- **Quick Start**: `supabase/APPLY_ATTACHMENTS_RLS_README.md`
- **Detailed Guide**: `docs/TASK_2.2_COMPLAINT_ATTACHMENTS_RLS_COMPLETION.md`
- **Summary**: `TASK_2.2_ATTACHMENTS_RLS_SUMMARY.md`
- **Test Script**: `scripts/test-complaint-attachments-rls.js`

## Common Issues

### Issue: Infinite Recursion Error
- **Status**: ✅ Fixed by this migration
- **Cause**: Old policies queried users table within users policies
- **Solution**: This migration uses JWT claims instead

### Issue: Tests Fail After Migration
- **Likely Cause**: Users haven't signed out/in
- **Solution**: Have users sign out and back in

### Issue: "role" Not Found in JWT
- **Likely Cause**: Migration 018 not applied
- **Solution**: Apply `018_add_role_to_jwt_claims.sql` first

## Success Criteria

✅ All checklist items completed
✅ All 10 tests pass
✅ No errors in Supabase logs
✅ Users can perform expected operations
✅ Privacy is maintained (students can't access others' data)

---

**Date Applied**: _______________
**Applied By**: _______________
**Test Results**: _______________
**Notes**: _______________
