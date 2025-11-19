# Quick Apply: Announcements RLS Fix

## 🚀 Quick Start (2 minutes)

### Step 1: Apply the Migration

Open Supabase Dashboard and run this SQL:

```sql
-- Drop old policies that cause infinite recursion
DROP POLICY IF EXISTS "Lecturers create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Lecturers update own announcements" ON public.announcements;
DROP POLICY IF EXISTS "Lecturers delete own announcements" ON public.announcements;

-- Create new policies using JWT claims (no recursion)
CREATE POLICY "Lecturers create announcements"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' IN ('lecturer', 'admin')
  );

CREATE POLICY "Lecturers update own announcements"
  ON public.announcements
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    auth.jwt()->>'role' IN ('lecturer', 'admin')
  )
  WITH CHECK (
    created_by = auth.uid() AND
    auth.jwt()->>'role' IN ('lecturer', 'admin')
  );

CREATE POLICY "Lecturers delete own announcements"
  ON public.announcements
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    auth.jwt()->>'role' IN ('lecturer', 'admin')
  );
```

### Step 2: Verify

Run the test script:

```bash
node scripts/test-announcements-rls.js
```

You should see all tests pass! ✅

---

## What This Does

- ✅ Fixes infinite recursion error
- ✅ All users can view announcements
- ✅ Only lecturers/admins can create announcements
- ✅ Lecturers/admins can only edit their own announcements

## Need Help?

See `APPLY_ANNOUNCEMENTS_RLS_FIX.md` for detailed instructions.
