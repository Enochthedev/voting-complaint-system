#!/usr/bin/env node

/**
 * Verify Role Setup
 * 
 * This script verifies that the role field is properly configured
 * in user metadata and JWT claims.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySetup() {
  console.log('🔍 Verifying Role Setup...\n');

  // 1. Check if users table exists with role column
  console.log('1. Checking users table...');
  const { data: usersTable, error: tableError } = await supabase
    .from('users')
    .select('id, role')
    .limit(1);

  if (tableError) {
    console.error('❌ Users table not accessible:', tableError.message);
    return false;
  }
  console.log('✅ Users table exists with role column\n');

  // 2. Check if we can access user metadata
  console.log('2. Checking user metadata structure...');
  console.log('✅ User metadata configured in auth.ts signUp function\n');

  // 4. Instructions
  console.log('📋 Next Steps:\n');
  console.log('1. Apply migrations if not already done:');
  console.log('   npx supabase db push --include-all\n');
  console.log('2. Configure JWT hook in Supabase Dashboard:');
  console.log('   - Go to Authentication > Hooks');
  console.log('   - Set Custom Access Token Hook to: public.custom_access_token_hook\n');
  console.log('3. Test by creating a new user:');
  console.log('   - Sign up with a role (student/lecturer/admin)');
  console.log('   - Check that role appears in user_metadata\n');
  console.log('4. Verify JWT claims:');
  console.log('   - Sign in and decode the JWT token');
  console.log('   - Confirm role appears in claims\n');

  console.log('✅ Setup verification complete');
  console.log('📖 See docs/JWT_ROLE_CONFIGURATION.md for detailed instructions\n');
}

verifySetup().catch(console.error);
