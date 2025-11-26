#!/usr/bin/env node

/**
 * Configure JWT Claims Hook
 *
 * This script configures Supabase to use the custom_access_token_hook
 * to add the user's role to their JWT claims.
 *
 * Prerequisites:
 * - Supabase CLI installed
 * - Migration 018_add_role_to_jwt_claims.sql applied
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables set
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error(
    '   Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function configureJWTClaims() {
  console.log('🔧 Configuring JWT Claims Hook...\n');

  try {
    // Test the function exists
    console.log('1. Testing custom_access_token_hook function...');
    const { data: functionExists, error: functionError } = await supabase.rpc(
      'custom_access_token_hook',
      { event: { user_id: '00000000-0000-0000-0000-000000000000', claims: {} } }
    );

    if (functionError) {
      console.error('❌ Error: custom_access_token_hook function not found or not working');
      console.error('   Please ensure migration 018_add_role_to_jwt_claims.sql has been applied');
      console.error('   Error details:', functionError.message);
      process.exit(1);
    }

    console.log('✅ Function exists and is callable\n');

    // Instructions for manual configuration
    console.log('📋 Manual Configuration Required:\n');
    console.log('The JWT claims hook function has been created, but you need to configure');
    console.log('Supabase to use it. Follow these steps:\n');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to Authentication > Hooks');
    console.log('3. Under "Custom Access Token Hook", select:');
    console.log('   - Hook: custom_access_token_hook');
    console.log('   - Schema: public');
    console.log('4. Click "Save"\n');
    console.log('Alternatively, if using Supabase CLI locally:');
    console.log('1. Edit supabase/config.toml');
    console.log('2. Add under [auth.hook.custom_access_token]:');
    console.log('   enabled = true');
    console.log('   uri = "pg-functions://postgres/public/custom_access_token_hook"\n');
    console.log('3. Restart your local Supabase instance\n');

    console.log('✅ Configuration instructions provided');
    console.log(
      '⚠️  Note: After configuring the hook, users will need to sign out and sign in again'
    );
    console.log('   for the role to be included in their JWT tokens.\n');
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

configureJWTClaims();
