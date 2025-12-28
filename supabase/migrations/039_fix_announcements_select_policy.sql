-- Fix announcements SELECT policy that was accidentally removed in migration 026
-- Migration 026 fixed RLS recursion issues but forgot to recreate the SELECT policy
-- This allows all authenticated users to view announcements

-- Drop any existing SELECT policies on announcements to avoid conflicts
DROP POLICY IF EXISTS "All users view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Users view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Students view announcements" ON public.announcements;

-- Recreate SELECT policy for all authenticated users
CREATE POLICY "All users view announcements"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- Comments for documentation
COMMENT ON POLICY "All users view announcements" ON public.announcements IS 'All authenticated users can view announcements regardless of role';
