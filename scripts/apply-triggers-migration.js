/**
 * Script to apply the complaint triggers migration
 * This script reads the migration file and executes it via Supabase
 *
 * Run with: node scripts/apply-triggers-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log('🚀 Applying Complaint Triggers Migration\n');
  console.log('='.repeat(60));

  try {
    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '017_create_complaint_triggers.sql'
    );
    console.log('\n📄 Reading migration file:', migrationPath);

    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded (' + migrationSQL.length + ' characters)');

    // Split the SQL into individual statements
    // We need to execute them one by one because Supabase doesn't support multi-statement execution
    console.log('\n📋 Parsing SQL statements...');

    // Split by semicolons but be careful with function definitions
    const statements = [];
    let currentStatement = '';
    let inFunction = false;

    const lines = migrationSQL.split('\n');
    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('--') || line.trim() === '') {
        continue;
      }

      // Track if we're inside a function definition
      if (line.includes('CREATE OR REPLACE FUNCTION') || line.includes('CREATE FUNCTION')) {
        inFunction = true;
      }

      currentStatement += line + '\n';

      // End of function
      if (inFunction && line.includes('$$ LANGUAGE')) {
        inFunction = false;
      }

      // End of statement (semicolon outside of function)
      if (line.trim().endsWith(';') && !inFunction) {
        const stmt = currentStatement.trim();
        if (stmt && !stmt.startsWith('--')) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }

    console.log('✅ Found ' + statements.length + ' SQL statements to execute');

    // Execute each statement
    console.log('\n📋 Executing migration...\n');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];

      // Extract a description from the statement
      let description = 'Statement ' + (i + 1);
      if (stmt.includes('CREATE OR REPLACE FUNCTION')) {
        const match = stmt.match(/CREATE OR REPLACE FUNCTION\s+[\w.]+\.([\w_]+)/);
        if (match) description = 'Function: ' + match[1];
      } else if (stmt.includes('CREATE TRIGGER')) {
        const match = stmt.match(/CREATE TRIGGER\s+([\w_]+)/);
        if (match) description = 'Trigger: ' + match[1];
      } else if (stmt.includes('GRANT')) {
        description = 'Grant permissions';
      } else if (stmt.includes('COMMENT')) {
        description = 'Add comment';
      }

      process.stdout.write('  ' + (i + 1) + '. ' + description + '... ');

      try {
        // Execute via Supabase RPC or direct query
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });

        if (error) {
          // Try alternative method
          const { error: error2 } = await supabase.from('_sql').select('*').limit(0);

          if (error2 || error.message.includes('does not exist')) {
            // Supabase doesn't have exec_sql RPC, we need to use the REST API directly
            console.log('⚠️  Cannot execute via RPC');
            console.log('\n\n⚠️  MANUAL MIGRATION REQUIRED');
            console.log('='.repeat(60));
            console.log('\nPlease apply this migration manually:');
            console.log('\n1. Go to: ' + supabaseUrl + '/project/_/sql');
            console.log(
              '2. Copy the contents of: supabase/migrations/017_create_complaint_triggers.sql'
            );
            console.log('3. Paste into the SQL Editor');
            console.log('4. Click "Run" to execute');
            console.log('\nOr use the Supabase CLI:');
            console.log('  supabase db push --linked --include-all');
            console.log('\n' + '='.repeat(60));
            process.exit(0);
          }

          throw error;
        }

        console.log('✅');
        successCount++;
      } catch (error) {
        console.log('❌');
        console.error('   Error:', error.message);
        errorCount++;

        // Continue with other statements
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('   ✅ Successful: ' + successCount);
    console.log('   ❌ Failed: ' + errorCount);
    console.log('='.repeat(60));

    if (errorCount > 0) {
      console.log('\n⚠️  Some statements failed. Please review the errors above.');
      console.log('   You may need to apply the migration manually via Supabase Dashboard.');
      process.exit(1);
    } else {
      console.log('\n✅ Migration applied successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Run verification: node scripts/test-complaint-triggers.js');
      console.log('   2. Check Supabase logs for any trigger errors');
      console.log('   3. Proceed to test search functionality (Task 1.4 step 4)');
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);

    console.log('\n\n⚠️  MANUAL MIGRATION REQUIRED');
    console.log('='.repeat(60));
    console.log('\nPlease apply this migration manually:');
    console.log('\n1. Go to: ' + supabaseUrl + '/project/_/sql');
    console.log('2. Copy the contents of: supabase/migrations/017_create_complaint_triggers.sql');
    console.log('3. Paste into the SQL Editor');
    console.log('4. Click "Run" to execute');
    console.log('\nSee APPLY_TRIGGERS_MIGRATION.md for detailed instructions.');
    console.log('\n' + '='.repeat(60));

    process.exit(1);
  }
}

// Run the migration
applyMigration();
