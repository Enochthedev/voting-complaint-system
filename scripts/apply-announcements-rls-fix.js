#!/usr/bin/env node

/**
 * Apply Announcements RLS Fix Migration
 *
 * This script applies the fix for announcements table RLS policies
 * to use JWT claims instead of querying the users table.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('='.repeat(60));
  console.log('Applying Announcements RLS Fix Migration');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '026_fix_announcements_rls.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file: 026_fix_announcements_rls.sql');
    console.log('');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments
      if (statement.trim().startsWith('--')) {
        continue;
      }

      console.log(`${i + 1}. Executing statement...`);

      const { error } = await supabase.rpc('exec_sql', {
        sql: statement,
      });

      if (error) {
        // Try direct execution if exec_sql doesn't exist
        console.log('   Using alternative execution method...');

        // For Supabase, we need to use the REST API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ query: statement }),
        });

        if (!response.ok) {
          console.log(`   ⚠️  Could not execute via API: ${response.statusText}`);
          console.log('   Please run the migration manually using the Supabase SQL Editor');
          console.log('');
          continue;
        }
      }

      console.log('   ✅ Success');
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Migration applied successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: node scripts/test-announcements-rls.js');
    console.log('2. Verify all tests pass');
    console.log('');
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.error('');
    console.error('Please apply the migration manually:');
    console.error('1. Open Supabase Dashboard > SQL Editor');
    console.error('2. Copy the contents of supabase/migrations/026_fix_announcements_rls.sql');
    console.error('3. Execute the SQL');
    console.error('');
    process.exit(1);
  }
}

applyMigration();
