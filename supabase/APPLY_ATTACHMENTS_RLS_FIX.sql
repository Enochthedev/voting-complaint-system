-- ============================================================
-- COMPLAINT ATTACHMENTS RLS POLICY FIX
-- ============================================================
-- This script fixes the infinite recursion issue in RLS policies
-- by using JWT claims instead of querying the users table.
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run"
-- 5. Verify with: node scripts/test-complaint-attachments-rls.js
-- ============================================================

-- ============================================================
-- PART 1: Fix Users Table RLS Policies
-- ============================================================

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Lecturers and admins can view all users" ON public.users;

-- RLS Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policy: Lecturers and admins can view all users
-- Use JWT claims to avoid infinite recursion
CREATE POLICY "Lecturers and admins can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'role' IN ('lecturer', 'admin')
  );

-- Add comments for documentation
COMMENT ON POLICY "Users can view own profile" ON public.users IS 
  'Users can view their own profile information';
COMMENT ON POLICY "Users can update own profile" ON public.users IS 
  'Users can update their own profile information';
COMMENT ON POLICY "Lecturers and admins can view all users" ON public.users IS 
  'Lecturers and admins can view all user profiles using JWT claims';

-- ============================================================
-- PART 2: Fix Complaint Attachments RLS Policies
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users view attachments on accessible complaints" ON public.complaint_attachments;
DROP POLICY IF EXISTS "Students upload attachments to own complaints" ON public.complaint_attachments;
DROP POLICY IF EXISTS "Lecturers upload attachments to complaints" ON public.complaint_attachments;
DROP POLICY IF EXISTS "Students delete attachments from own complaints" ON public.complaint_attachments;
DROP POLICY IF EXISTS "Lecturers delete attachments from complaints" ON public.complaint_attachments;

-- RLS Policy: Users can view attachments on accessible complaints
-- Students can view attachments on their own complaints
-- Lecturers and admins can view attachments on all complaints
CREATE POLICY "Users view attachments on accessible complaints"
  ON public.complaint_attachments
  FOR SELECT
  TO authenticated
  USING (
    -- Lecturers and admins can view all attachments
    (auth.jwt()->>'role' IN ('lecturer', 'admin'))
    OR
    -- Students can view attachments on their own complaints
    (
      auth.jwt()->>'role' = 'student'
      AND complaint_id IN (
        SELECT id FROM public.complaints
        WHERE student_id = auth.uid()
      )
    )
  );

-- RLS Policy: Students can upload attachments to their own complaints
CREATE POLICY "Students upload attachments to own complaints"
  ON public.complaint_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' = 'student'
    AND complaint_id IN (
      SELECT id FROM public.complaints
      WHERE student_id = auth.uid()
    )
    AND uploaded_by = auth.uid()
  );

-- RLS Policy: Lecturers and admins can upload attachments to any complaint
CREATE POLICY "Lecturers upload attachments to complaints"
  ON public.complaint_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' IN ('lecturer', 'admin')
    AND uploaded_by = auth.uid()
  );

-- RLS Policy: Students can delete attachments from their own complaints
CREATE POLICY "Students delete attachments from own complaints"
  ON public.complaint_attachments
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'student'
    AND complaint_id IN (
      SELECT id FROM public.complaints
      WHERE student_id = auth.uid()
    )
  );

-- RLS Policy: Lecturers and admins can delete attachments from any complaint
CREATE POLICY "Lecturers delete attachments from complaints"
  ON public.complaint_attachments
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt()->>'role' IN ('lecturer', 'admin')
  );

-- Add comments for documentation
COMMENT ON POLICY "Users view attachments on accessible complaints" ON public.complaint_attachments IS 
  'Students can view attachments on their own complaints; Lecturers and admins can view all attachments';
COMMENT ON POLICY "Students upload attachments to own complaints" ON public.complaint_attachments IS 
  'Students can only upload attachments to their own complaints';
COMMENT ON POLICY "Lecturers upload attachments to complaints" ON public.complaint_attachments IS 
  'Lecturers and admins can upload attachments to any complaint';
COMMENT ON POLICY "Students delete attachments from own complaints" ON public.complaint_attachments IS 
  'Students can only delete attachments from their own complaints';
COMMENT ON POLICY "Lecturers delete attachments from complaints" ON public.complaint_attachments IS 
  'Lecturers and admins can delete attachments from any complaint';

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Check that RLS is enabled
SELECT 
  'RLS Status Check' as check_name,
  CASE 
    WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'complaint_attachments' AND relnamespace = 'public'::regnamespace) 
    THEN '✓ RLS is enabled on complaint_attachments'
    ELSE '✗ RLS is NOT enabled on complaint_attachments'
  END as status;

-- Count policies
SELECT 
  'Policy Count' as check_name,
  COUNT(*)::text || ' policies created' as status
FROM pg_policies 
WHERE tablename = 'complaint_attachments';

-- List all policies
SELECT 
  'Policy: ' || policyname as policy_name,
  cmd::text as command
FROM pg_policies 
WHERE tablename = 'complaint_attachments'
ORDER BY policyname;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

SELECT '✅ RLS policies have been successfully applied!' as status;
SELECT '📋 Next step: Run test script to verify' as next_step;
SELECT '   Command: node scripts/test-complaint-attachments-rls.js' as command;
