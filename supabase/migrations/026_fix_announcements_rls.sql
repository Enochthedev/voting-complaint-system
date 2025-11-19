-- Fix announcements table RLS policies to avoid infinite recursion
-- This migration updates the RLS policies to use JWT claims instead of querying the users table
-- This prevents infinite recursion when checking user roles

-- Drop existing policies
DROP POLICY IF EXISTS "Lecturers create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Lecturers update own announcements" ON public.announcements;
DROP POLICY IF EXISTS "Lecturers delete own announcements" ON public.announcements;

-- RLS Policy: Lecturers and admins can create announcements
-- Use JWT claims to avoid infinite recursion
CREATE POLICY "Lecturers create announcements"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' IN ('lecturer', 'admin')
  );

-- RLS Policy: Lecturers and admins can update their own announcements
-- Use JWT claims to avoid infinite recursion
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

-- RLS Policy: Lecturers and admins can delete their own announcements
-- Use JWT claims to avoid infinite recursion
CREATE POLICY "Lecturers delete own announcements"
  ON public.announcements
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    auth.jwt()->>'role' IN ('lecturer', 'admin')
  );

-- Comments for documentation
COMMENT ON POLICY "Lecturers create announcements" ON public.announcements IS 
  'Lecturers and admins can create announcements using JWT role claims';
COMMENT ON POLICY "Lecturers update own announcements" ON public.announcements IS 
  'Lecturers and admins can update their own announcements using JWT role claims';
COMMENT ON POLICY "Lecturers delete own announcements" ON public.announcements IS 
  'Lecturers and admins can delete their own announcements using JWT role claims';
