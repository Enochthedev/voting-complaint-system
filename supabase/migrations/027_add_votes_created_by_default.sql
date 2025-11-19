-- Add default value for created_by in votes table
-- This allows the RLS policy to work correctly

-- Add default value for created_by
ALTER TABLE public.votes 
  ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Comment
COMMENT ON COLUMN public.votes.created_by IS 'User who created the vote - defaults to current authenticated user';
