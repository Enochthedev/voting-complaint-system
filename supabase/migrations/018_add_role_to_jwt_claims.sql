-- Add role to JWT claims
-- This migration creates a function to add the user's role to their JWT claims
-- so that RLS policies can access it via auth.jwt()->>'role'

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.custom_access_token_hook CASCADE;

-- Create function to add custom claims to JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  user_role user_role;
BEGIN
  -- Get the user's role from the public.users table
  SELECT role INTO user_role
  FROM public.users
  WHERE id = (event->>'user_id')::uuid;

  -- Add the role to the JWT claims
  IF user_role IS NOT NULL THEN
    event := jsonb_set(event, '{claims,role}', to_jsonb(user_role::text));
  END IF;

  RETURN event;
END;
$$;

-- Grant execute permission to supabase_auth_admin
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoke execute from authenticated and public for security
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- Comment for documentation
COMMENT ON FUNCTION public.custom_access_token_hook IS 'Adds user role to JWT claims for RLS policies';
