-- Fix users table RLS policies to avoid infinite recursion
-- This migration updates the RLS policies to use JWT claims instead of querying the users table

-- Drop existing policies
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

-- Comment for documentation
COMMENT ON POLICY "Users can view own profile" ON public.users IS 
  'Users can view their own profile information';
COMMENT ON POLICY "Users can update own profile" ON public.users IS 
  'Users can update their own profile information';
COMMENT ON POLICY "Lecturers and admins can view all users" ON public.users IS 
  'Lecturers and admins can view all user profiles using JWT claims';
