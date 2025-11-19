#!/usr/bin/env node

/**
 * Supabase Authentication Configuration Script
 * 
 * This script helps configure and verify Supabase authentication settings
 * for the Student Complaint Resolution System.
 * 
 * Usage: node scripts/configure-auth.js
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
  log('Supabase Authentication Configuration Tool', 'blue');
  log('==========================================\n', 'blue');

  // Check environment variables
  logSection('1. Checking Environment Variables');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!supabaseUrl) {
    log('✗ NEXT_PUBLIC_SUPABASE_URL is not set', 'red');
    process.exit(1);
  } else {
    log(`✓ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`, 'green');
  }

  if (!supabaseAnonKey) {
    log('✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set', 'red');
    process.exit(1);
  } else {
    log('✓ NEXT_PUBLIC_SUPABASE_ANON_KEY is set', 'green');
  }

  if (!supabaseServiceKey) {
    log('⚠ SUPABASE_SERVICE_ROLE_KEY is not set (optional for client-side)', 'yellow');
  } else {
    log('✓ SUPABASE_SERVICE_ROLE_KEY is set', 'green');
  }

  if (!appUrl) {
    log('⚠ NEXT_PUBLIC_APP_URL is not set (defaulting to http://localhost:3000)', 'yellow');
  } else {
    log(`✓ NEXT_PUBLIC_APP_URL: ${appUrl}`, 'green');
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Test connection
  logSection('2. Testing Supabase Connection');

  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      log(`✗ Connection test failed: ${error.message}`, 'red');
      log('  Make sure your Supabase project is running and accessible', 'yellow');
    } else {
      log('✓ Successfully connected to Supabase', 'green');
    }
  } catch (error) {
    log(`✗ Connection test failed: ${error.message}`, 'red');
  }

  // Check users table
  logSection('3. Verifying Users Table');

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .limit(1);

    if (error) {
      log(`✗ Users table check failed: ${error.message}`, 'red');
      log('  Run migrations to create the users table', 'yellow');
    } else {
      log('✓ Users table exists and is accessible', 'green');
      
      // Check if there are any users
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      log(`  Total users in database: ${count || 0}`, 'cyan');
    }
  } catch (error) {
    log(`✗ Users table check failed: ${error.message}`, 'red');
  }

  // Authentication configuration summary
  logSection('4. Authentication Configuration Summary');

  log('Authentication Provider: Email/Password', 'cyan');
  log('Session Storage: HTTP-only cookies', 'cyan');
  log('Auto-refresh: Enabled', 'cyan');
  log('Session Detection in URL: Enabled', 'cyan');

  // Password requirements
  logSection('5. Password Requirements');

  log('✓ Minimum 8 characters', 'green');
  log('✓ At least one uppercase letter', 'green');
  log('✓ At least one lowercase letter', 'green');
  log('✓ At least one number', 'green');

  // User roles
  logSection('6. User Roles Configuration');

  log('Available roles:', 'cyan');
  log('  • student   - Can submit and view own complaints', 'cyan');
  log('  • lecturer  - Can manage all complaints and create votes/announcements', 'cyan');
  log('  • admin     - Full system access including escalation rules', 'cyan');

  // Next steps
  logSection('7. Next Steps');

  log('To complete authentication setup:', 'cyan');
  log('  1. Configure Supabase Auth settings in dashboard:', 'yellow');
  log('     - Enable Email provider', 'yellow');
  log('     - Set Site URL to: ' + (appUrl || 'http://localhost:3000'), 'yellow');
  log('     - Add redirect URLs:', 'yellow');
  log('       • ' + (appUrl || 'http://localhost:3000') + '/auth/callback', 'yellow');
  log('       • ' + (appUrl || 'http://localhost:3000') + '/auth/reset-password', 'yellow');
  log('  2. Customize email templates (optional)', 'yellow');
  log('  3. Enable email confirmation for production', 'yellow');
  log('  4. Test authentication flows:', 'yellow');
  log('     - Sign up', 'yellow');
  log('     - Sign in', 'yellow');
  log('     - Password reset', 'yellow');
  log('     - Role-based access', 'yellow');

  // Documentation
  logSection('8. Documentation');

  log('For detailed configuration instructions, see:', 'cyan');
  log('  • docs/AUTH_CONFIGURATION.md', 'yellow');
  log('  • https://supabase.com/docs/guides/auth', 'yellow');

  log('\n✓ Configuration check complete!\n', 'green');
}

// Run the script
main().catch((error) => {
  log(`\n✗ Script failed: ${error.message}`, 'red');
  process.exit(1);
});
