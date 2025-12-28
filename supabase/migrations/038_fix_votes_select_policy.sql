-- Fix votes SELECT policy that was accidentally removed in migration 025
-- Migration 025 fixed RLS recursion issues but forgot to recreate the SELECT policy
-- This allows all authenticated users (including students) to view votes

-- Drop any existing SELECT policies on votes to avoid conflicts
DROP POLICY IF EXISTS "All users view votes" ON public.votes;
DROP POLICY IF EXISTS "Users view votes" ON public.votes;
DROP POLICY IF EXISTS "Students view votes" ON public.votes;

-- Recreate SELECT policy for all authenticated users
CREATE POLICY "All users view votes"
  ON public.votes
  FOR SELECT
  TO authenticated
  USING (true);

-- Comments for documentation
COMMENT ON POLICY "All users view votes" ON public.votes IS 'All authenticated users can view votes regardless of role';
