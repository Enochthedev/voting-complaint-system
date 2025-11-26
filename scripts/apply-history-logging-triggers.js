#!/usr/bin/env node

/**
 * Script to apply missing history logging triggers migration
 *
 * This script applies migration 037_add_missing_history_logging_triggers.sql
 * which adds triggers to automatically log feedback and comment actions
 * in the complaint_history table.
 *
 * Usage:
 *   node scripts/apply-history-logging-triggers.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error(
    'Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Applying History Logging Triggers Migration\n');
  console.log('This migration adds triggers to automatically log:');
  console.log('  - Feedback additions');
  console.log('  - Comment additions');
  console.log('  - Comment edits');
  console.log('  - Comment deletions\n');

  try {
    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '037_add_missing_history_logging_triggers.sql'
    );
    console.log('📄 Reading migration file:', migrationPath);

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded\n');

    // Execute the migration
    console.log('⚙️  Executing migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      if (error.message.includes('function public.exec_sql') || error.code === '42883') {
        console.log('⚠️  exec_sql function not available, attempting direct execution...\n');

        // Split the SQL into individual statements and execute them
        const statements = migrationSQL
          .split(/;\s*$/gm)
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.startsWith('--'));

        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          if (statement) {
            console.log(`Executing statement ${i + 1}/${statements.length}...`);
            const { error: stmtError } = await supabase.rpc('exec', { sql: statement + ';' });

            if (stmtError) {
              console.error(`❌ Error executing statement ${i + 1}:`, stmtError.message);
              throw stmtError;
            }
          }
        }

        console.log('\n✅ Migration applied successfully!\n');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Migration applied successfully!\n');
    }

    // Verify the triggers were created
    console.log('🔍 Verifying triggers...\n');

    const triggers = [
      'log_feedback_addition_trigger',
      'log_comment_addition_trigger',
      'log_comment_edit_trigger',
      'log_comment_deletion_trigger',
    ];

    for (const triggerName of triggers) {
      const { data: triggerData, error: triggerError } = await supabase
        .from('pg_trigger')
        .select('tgname')
        .eq('tgname', triggerName)
        .maybeSingle();

      if (triggerError) {
        console.log(`⚠️  Could not verify trigger ${triggerName}: ${triggerError.message}`);
      } else if (triggerData) {
        console.log(`✅ Trigger verified: ${triggerName}`);
      } else {
        console.log(`⚠️  Trigger not found: ${triggerName}`);
      }
    }

    console.log('\n✨ Migration complete!\n');
    console.log('📋 Summary:');
    console.log('  - Feedback additions will now be automatically logged');
    console.log('  - Comment additions will now be automatically logged');
    console.log('  - Comment edits will now be automatically logged');
    console.log('  - Comment deletions will now be automatically logged\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nPlease apply this migration manually:');
    console.error('\n1. Go to: ' + supabaseUrl + '/project/_/sql');
    console.error(
      '2. Copy the contents of: supabase/migrations/037_add_missing_history_logging_triggers.sql'
    );
    console.error('3. Paste into the SQL Editor');
    console.error('4. Click "Run" to execute\n');
    process.exit(1);
  }
}

// Run the migration
applyMigration();
