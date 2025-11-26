-- Migration 035: Final Fix for Secure User Creation
-- This migration ensures the handle_new_user trigger ALWAYS defaults to 'student' role
-- and cannot be overridden by client-provided metadata.
-- Also ensures role is synced to public.users table, not just user_metadata

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert into public.users table with HARDCODED 'student' role
  -- This is the source of truth for user roles
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    'student', -- ALWAYS default to student - NEVER trust client metadata
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Important: Do NOT set role in user_metadata
  -- The public.users table is the single source of truth
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the auth.users insert
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS policies allow the trigger to insert
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
CREATE POLICY "Service role can insert users"
  ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow user creation via trigger" ON public.users;
CREATE POLICY "Allow user creation via trigger"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Comment on the function
COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates a user profile in public.users with HARDCODED student role. ' ||
  'This is a security measure to prevent privilege escalation attacks. ' ||
  'Admins must manually upgrade user roles after account creation.';

-- Create a function to safely update user roles (admin only)
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id UUID,
  new_role user_role
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  caller_role user_role;
BEGIN
  -- Get the caller's role
  SELECT role INTO caller_role
  FROM public.users
  WHERE id = auth.uid();
  
  -- Only admins can update roles
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can update user roles';
  END IF;
  
  -- Update the user's role
  UPDATE public.users
  SET role = new_role,
      updated_at = NOW()
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', target_user_id;
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_user_role(UUID, user_role) TO authenticated;

COMMENT ON FUNCTION public.update_user_role(UUID, user_role) IS 
  'Safely updates a user role. Only callable by administrators.';
