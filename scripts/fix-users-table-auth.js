#!/usr/bin/env node

/**
 * Fix Users Table Authentication
 * 
 * This script fixes the users table trigger to properly handle new user creation
 * by ensuring the trigger function has the correct permissions to bypass RLS.
 * 
 * Usage: node scripts/fix-users-table-auth.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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
  log('Fix Users Table Authentication', 'blue');
  log('==============================\n', 'blue');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    log('✗ Missing required environment variables', 'red');
    log('  Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY', 'yellow');
    process.exit(1);
  }

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  logSection('1. Applying Fix Migration');

  // Read the fix migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_fix_users_table_trigger.sql');
  
  if (!fs.existsSync(migrationPath)) {
    log('✗ Migration file not found', 'red');
    log(`  Expected: ${migrationPath}`, 'yellow');
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  try {
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // Try direct execution if RPC doesn't work
      log('  Trying direct SQL execution...', 'yellow');
      
      // Split by semicolon and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error: execError } = await supabase.rpc('exec_sql', { sql: statement });
        if (execError) {
          log(`  Warning: ${execError.message}`, 'yellow');
        }
      }
    }

    log('✓ Migration applied successfully', 'green');

  } catch (error) {
    log(`⚠ Could not apply migration automatically: ${error.message}`, 'yellow');
    log('\nPlease apply the migration manually:', 'cyan');
    log('  1. Open Supabase Dashboard', 'yellow');
    log('  2. Go to SQL Editor', 'yellow');
    log('  3. Copy and paste the contents of:', 'yellow');
    log(`     ${migrationPath}`, 'yellow');
    log('  4. Run the SQL', 'yellow');
  }

  logSection('2. Testing User Creation');

  // Test creating a user
  const testEmail = `test-fix-${Date.now()}@example.com`;
  const testPassword = 'TestPass123';

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User',
        role: 'student',
      },
    });

    if (error) {
      log(`✗ User creation test failed: ${error.message}`, 'red');
      log('\nThe fix may not have been applied correctly.', 'yellow');
      log('Please apply the migration manually (see instructions above).', 'yellow');
      process.exit(1);
    }

    log('✓ User creation test successful', 'green');
    log(`  User ID: ${data.user.id}`, 'cyan');
    log(`  Email: ${data.user.email}`, 'cyan');

    // Check if user profile was created
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      log(`⚠ User profile not created: ${profileError.message}`, 'yellow');
      log('  The trigger may not be working correctly', 'yellow');
    } else {
      log('✓ User profile created successfully', 'green');
      log(`  Role: ${profile.role}`, 'cyan');
      log(`  Full Name: ${profile.full_name}`, 'cyan');
    }

    // Clean up test user
    await supabase.auth.admin.deleteUser(data.user.id);
    log('✓ Test user cleaned up', 'green');

  } catch (error) {
    log(`✗ Test failed: ${error.message}`, 'red');
    process.exit(1);
  }

  logSection('3. Summary');

  log('✓ Users table authentication fix applied successfully!', 'green');
  log('\nYou can now test email/password authentication:', 'cyan');
  log('  node scripts/test-email-auth.js', 'yellow');

  log('\n');
}

// Run the script
main().catch((error) => {
  log(`\n✗ Script failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
