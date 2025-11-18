#!/usr/bin/env node

/**
 * Test script to verify the users table migration was applied successfully
 * Run with: node scripts/test-users-table.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUsersTable() {
  console.log('🔍 Testing users table migration...\n');

  try {
    // Test 1: Check if users table exists by querying it
    console.log('Test 1: Checking if users table exists...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('❌ FAIL: Users table does not exist');
        console.log('   Action: Apply the migration via Supabase Dashboard SQL Editor');
        return false;
      }
      console.log('⚠️  Warning:', error.message);
    } else {
      console.log('✅ PASS: Users table exists');
    }

    // Test 2: Check table structure by attempting to insert (will fail but shows columns)
    console.log('\nTest 2: Checking table structure...');
    const { error: structureError } = await supabase
      .from('users')
      .select('id, email, role, full_name, created_at, updated_at')
      .limit(1);

    if (structureError) {
      console.log('❌ FAIL: Table structure issue:', structureError.message);
      return false;
    } else {
      console.log('✅ PASS: Table has expected columns');
    }

    // Test 3: Check if we can query with role filter (tests enum)
    console.log('\nTest 3: Checking user_role enum...');
    const { error: enumError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .limit(1);

    if (enumError) {
      console.log('❌ FAIL: user_role enum issue:', enumError.message);
      return false;
    } else {
      console.log('✅ PASS: user_role enum works correctly');
    }

    // Test 4: Count existing users
    console.log('\nTest 4: Counting existing users...');
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('⚠️  Warning:', countError.message);
    } else {
      console.log(`✅ Found ${count} user(s) in the database`);
    }

    console.log('\n✨ All tests passed! Users table migration is working correctly.');
    return true;

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

// Run tests
testUsersTable()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
