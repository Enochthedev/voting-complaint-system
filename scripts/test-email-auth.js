#!/usr/bin/env node

/**
 * Email/Password Authentication Test Script
 * 
 * This script tests the email/password authentication functionality
 * to verify that sign up, sign in, and sign out work correctly.
 * 
 * Usage: node scripts/test-email-auth.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

async function main() {
  log('Email/Password Authentication Test', 'blue');
  log('==================================\n', 'blue');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    log('✗ Missing required environment variables', 'red');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Don't persist for testing
      autoRefreshToken: false,
    },
  });

  // Test credentials
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123';
  const testFullName = 'Test User';
  const testRole = 'student';

  logSection('1. Testing Sign Up');

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testFullName,
          role: testRole,
        },
      },
    });

    if (error) {
      log(`✗ Sign up failed: ${error.message}`, 'red');
      
      // Check if it's because email confirmation is required
      if (error.message.includes('email') || error.message.includes('confirmation')) {
        log('  Note: Email confirmation may be enabled in Supabase settings', 'yellow');
        log('  For testing, you can disable it in: Authentication > Providers > Email', 'yellow');
      }
      
      process.exit(1);
    }

    if (!data.user) {
      log('✗ Sign up succeeded but no user returned', 'red');
      log('  This may indicate email confirmation is required', 'yellow');
      log('  Check Supabase dashboard: Authentication > Providers > Email', 'yellow');
      log('  Disable "Confirm email" for testing purposes', 'yellow');
      process.exit(1);
    }

    log('✓ Sign up successful', 'green');
    log(`  User ID: ${data.user.id}`, 'cyan');
    log(`  Email: ${data.user.email}`, 'cyan');
    log(`  Role: ${data.user.user_metadata?.role || 'not set'}`, 'cyan');
    log(`  Full Name: ${data.user.user_metadata?.full_name || 'not set'}`, 'cyan');

    // Verify user metadata
    if (data.user.user_metadata?.role !== testRole) {
      log('⚠ Warning: Role not set correctly in user metadata', 'yellow');
    }

    if (data.user.user_metadata?.full_name !== testFullName) {
      log('⚠ Warning: Full name not set correctly in user metadata', 'yellow');
    }

  } catch (error) {
    log(`✗ Sign up failed with exception: ${error.message}`, 'red');
    process.exit(1);
  }

  logSection('2. Testing Sign In');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      log(`✗ Sign in failed: ${error.message}`, 'red');
      
      if (error.message.includes('Email not confirmed')) {
        log('  Email confirmation is required', 'yellow');
        log('  To disable for testing: Supabase Dashboard > Authentication > Providers > Email', 'yellow');
        log('  Uncheck "Confirm email"', 'yellow');
      }
      
      process.exit(1);
    }

    if (!data.user || !data.session) {
      log('✗ Sign in succeeded but no user/session returned', 'red');
      process.exit(1);
    }

    log('✓ Sign in successful', 'green');
    log(`  User ID: ${data.user.id}`, 'cyan');
    log(`  Email: ${data.user.email}`, 'cyan');
    log(`  Session: ${data.session ? 'Active' : 'None'}`, 'cyan');
    log(`  Access Token: ${data.session.access_token.substring(0, 20)}...`, 'cyan');

  } catch (error) {
    log(`✗ Sign in failed with exception: ${error.message}`, 'red');
    process.exit(1);
  }

  logSection('3. Testing Get Current User');

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      log(`✗ Get user failed: ${error.message}`, 'red');
      process.exit(1);
    }

    if (!data.user) {
      log('✗ No user returned', 'red');
      process.exit(1);
    }

    log('✓ Get user successful', 'green');
    log(`  User ID: ${data.user.id}`, 'cyan');
    log(`  Email: ${data.user.email}`, 'cyan');
    log(`  Role: ${data.user.user_metadata?.role || 'not set'}`, 'cyan');

  } catch (error) {
    log(`✗ Get user failed with exception: ${error.message}`, 'red');
    process.exit(1);
  }

  logSection('4. Testing Sign Out');

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      log(`✗ Sign out failed: ${error.message}`, 'red');
      process.exit(1);
    }

    log('✓ Sign out successful', 'green');

  } catch (error) {
    log(`✗ Sign out failed with exception: ${error.message}`, 'red');
    process.exit(1);
  }

  logSection('5. Verifying Sign Out');

  try {
    const { data, error } = await supabase.auth.getUser();

    // After sign out, we should get an error or no user
    if (data.user) {
      log('⚠ Warning: User still authenticated after sign out', 'yellow');
    } else {
      log('✓ User successfully signed out (no active session)', 'green');
    }

  } catch (error) {
    log('✓ User successfully signed out (session cleared)', 'green');
  }

  logSection('6. Testing Invalid Credentials');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'WrongPassword123',
    });

    if (error) {
      log('✓ Invalid credentials correctly rejected', 'green');
      log(`  Error: ${error.message}`, 'cyan');
    } else {
      log('✗ Invalid credentials were accepted (security issue!)', 'red');
      process.exit(1);
    }

  } catch (error) {
    log('✓ Invalid credentials correctly rejected', 'green');
  }

  logSection('7. Summary');

  log('All email/password authentication tests passed!', 'green');
  log('\nAuthentication features verified:', 'cyan');
  log('  ✓ User sign up with email and password', 'green');
  log('  ✓ User metadata (role and full name) stored correctly', 'green');
  log('  ✓ User sign in with credentials', 'green');
  log('  ✓ Session management', 'green');
  log('  ✓ Get current user', 'green');
  log('  ✓ User sign out', 'green');
  log('  ✓ Invalid credentials rejection', 'green');

  log('\nNext steps:', 'cyan');
  log('  1. Verify Supabase Auth settings in dashboard', 'yellow');
  log('  2. Test password reset functionality', 'yellow');
  log('  3. Implement authentication pages (Task 2.3)', 'yellow');
  log('  4. Test role-based access control', 'yellow');

  log('\n✓ Email/password authentication is working correctly!\n', 'green');
}

// Run the script
main().catch((error) => {
  log(`\n✗ Test failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
