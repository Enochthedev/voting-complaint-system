#!/usr/bin/env node

/**
 * Apply votes and vote_responses RLS fix migration
 * This script applies the 025_fix_votes_rls.sql migration directly
 */

const { createClient } = require('@supabase/supabase-js');
const { readFileSync } = require('fs');
const { join } = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔧 Applying votes and vote_responses RLS Policy Fix\n');
  console.log('='.repeat(80));

  try {
    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/025_fix_votes_rls.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('\n📝 Executing migration SQL...\n');

    // Execute the migration
    const { error } = await adminClient.rpc('exec', { query: migrationSQL });

    if (error) {
      // If exec function doesn't exist, provide manual instructions
      if (error.code === 'PGRST202') {
        console.log('⚠️  Direct execution not available. Please apply manually:\n');
        console.log('1. Open your Supabase Dashboard SQL Editor');
        console.log('2. Copy and paste the following SQL:\n');
        console.log('─'.repeat(80));
        console.log(migrationSQL);
        console.log('─'.repeat(80));
        console.log('\n3. Click "Run" to execute\n');
        return false;
      }
      throw error;
    }

    console.log('✅ Migration applied successfully!\n');
    console.log('📋 Changes made:');
    console.log('  - Fixed votes table RLS policies to avoid infinite recursion');
    console.log('  - Fixed vote_responses table RLS policies');
    console.log('  - Lecturers can now create, update, and delete their own votes');
    console.log('  - Students can view and manage their own vote responses');
    console.log('  - Lecturers can view responses to their own votes\n');
    console.log('🧪 Run test script to verify:');
    console.log('   node scripts/test-votes-rls.js\n');
    console.log('='.repeat(80));

    return true;
  } catch (error) {
    console.error('❌ Failed to apply migration:', error.message);
    console.log('\n📋 Please apply manually via Supabase Dashboard');
    console.log('Migration file: supabase/migrations/025_fix_votes_rls.sql\n');
    return false;
  }
}

// Apply migration
applyMigration()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
