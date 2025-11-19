# Apply Complaint Attachments RLS Policies

## Quick Start

### Step 1: Apply the SQL Migration

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `APPLY_ATTACHMENTS_RLS_FIX.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 2: Verify the Migration

Run the test script to verify everything is working:

```bash
cd student-complaint-system
node scripts/test-complaint-attachments-rls.js
```

Expected result: All 10 tests should pass (100% success rate)

### Step 3: Important - User Sessions

After applying the migration, users need to **sign out and sign back in** for the JWT claims to update with their role information.

## What This Migration Does

This migration fixes the infinite recursion issue in RLS policies by:

1. **Fixing Users Table RLS**: Updates policies to use JWT claims instead of querying the users table
2. **Fixing Complaint Attachments RLS**: Updates policies to use JWT claims for role checking

### Policies Created

#### For `complaint_attachments` table:

1. **SELECT**: Students can view attachments on their own complaints; Lecturers/admins can view all
2. **INSERT (Students)**: Students can upload attachments to their own complaints only
3. **INSERT (Lecturers)**: Lecturers/admins can upload attachments to any complaint
4. **DELETE (Students)**: Students can delete attachments from their own complaints only
5. **DELETE (Lecturers)**: Lecturers/admins can delete attachments from any complaint

## Troubleshooting

### Issue: "infinite recursion detected in policy for relation 'users'"

**Cause**: The old RLS policies query the users table within the users table policies, causing infinite recursion.

**Solution**: Apply the `APPLY_ATTACHMENTS_RLS_FIX.sql` migration which uses JWT claims instead.

### Issue: Tests still failing after migration

**Possible causes**:
1. Users haven't signed out and back in (JWT claims not updated)
2. JWT hook not configured (migration 018 not applied)
3. Migration not applied correctly

**Solutions**:
1. Have all test users sign out and sign back in
2. Verify migration 018 is applied: `018_add_role_to_jwt_claims.sql`
3. Re-run the migration SQL

### Issue: "role" not found in JWT claims

**Cause**: The JWT custom claims hook is not configured.

**Solution**: 
1. Apply migration 018: `018_add_role_to_jwt_claims.sql`
2. Configure the hook in Supabase Dashboard:
   - Go to Authentication > Hooks
   - Add a custom access token hook
   - Point to the `custom_access_token_hook` function

## Files Reference

- **Migration SQL**: `supabase/APPLY_ATTACHMENTS_RLS_FIX.sql`
- **Test Script**: `scripts/test-complaint-attachments-rls.js`
- **Verification Script**: `supabase/verify-complaint-attachments-table.sql`
- **Documentation**: `docs/TASK_2.2_COMPLAINT_ATTACHMENTS_RLS_COMPLETION.md`

## Related Migrations

- `004_create_complaint_attachments_table.sql` - Original table creation
- `018_add_role_to_jwt_claims.sql` - JWT claims configuration
- `019_fix_complaint_attachments_rls.sql` - Attachments RLS fix (included in combined file)
- `020_fix_users_table_rls.sql` - Users RLS fix (included in combined file)

## Support

For detailed documentation, see:
- `docs/TASK_2.2_COMPLAINT_ATTACHMENTS_RLS_COMPLETION.md`
- Design document: `.kiro/specs/student-complaint-system/design.md`
