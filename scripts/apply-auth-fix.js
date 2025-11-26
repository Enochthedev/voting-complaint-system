#!/usr/bin/env node

/**
 * Apply Authentication Fix
 *
 * This script applies the fix for users table authentication
 * by recreating the trigger with proper permissions.
 *
 * Usage: node scripts/apply-auth-fix.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('Applying Authentication Fix', 'cyan');
  log('===========================\n', 'cyan');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    log('✗ Missing required environment variables', 'red');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  log('Please run the following SQL in your Supabase SQL Editor:\n', 'yellow');

  const sql = `
-- Fix for users table trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add policy to allow user creation via trigger
DROP POLICY IF EXISTS "Allow user creation via trigger" ON public.users;
CREATE POLICY "Allow user creation via trigger"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
`;

  console.log(sql);

  log('\nSteps:', 'cyan');
  log('1. Copy the SQL above', 'yellow');
  log('2. Go to your Supabase Dashboard > SQL Editor', 'yellow');
  log('3. Paste and run the SQL', 'yellow');
  log('4. Run: node scripts/test-email-auth.js', 'yellow');

  log('\n');
}

main().catch((error) => {
  log(`\n✗ Error: ${error.message}`, 'red');
  process.exit(1);
});
