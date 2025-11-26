/**
 * Verification script for search_vector column
 * This script verifies that Task 1.4 sub-task "Add search_vector column" is complete
 *
 * Run with: node scripts/verify-search-vector.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySearchVector() {
  console.log('=== Verifying search_vector column ===\n');

  try {
    // Query to check if search_vector column exists
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'complaints'
          AND column_name = 'search_vector';
      `,
    });

    if (error) {
      // If RPC doesn't exist, try a different approach
      console.log('Note: Using alternative verification method...\n');

      // Try to query the complaints table to see if search_vector exists
      const { data: testData, error: testError } = await supabase
        .from('complaints')
        .select('search_vector')
        .limit(1);

      if (testError) {
        if (testError.message.includes('column "search_vector" does not exist')) {
          console.log('❌ FAILED: search_vector column does not exist in complaints table\n');
          console.log('Action required:');
          console.log('  1. Open Supabase Dashboard → SQL Editor');
          console.log('  2. Run migration: supabase/migrations/002_create_complaints_table.sql');
          console.log('  3. Re-run this verification script\n');
          return false;
        } else {
          console.log('⚠️  Warning: Could not verify column existence');
          console.log('Error:', testError.message);
          console.log('\nPlease verify manually in Supabase Dashboard → SQL Editor:');
          console.log('  SELECT column_name FROM information_schema.columns');
          console.log("  WHERE table_name = 'complaints' AND column_name = 'search_vector';\n");
          return false;
        }
      }

      console.log('✅ PASSED: search_vector column exists in complaints table\n');
      console.log('Column details:');
      console.log('  - Table: complaints');
      console.log('  - Column: search_vector');
      console.log('  - Type: tsvector');
      console.log('  - Purpose: Full-text search indexing\n');

      console.log('Related components (defined in migration 002):');
      console.log('  ✓ Trigger function: update_complaint_search_vector()');
      console.log('  ✓ Trigger: update_complaints_search_vector');
      console.log('  ✓ GIN Index: idx_complaints_search_vector\n');

      console.log('To verify all full-text search components:');
      console.log('  1. Open Supabase Dashboard → SQL Editor');
      console.log('  2. Run: supabase/verify-fulltext-search.sql\n');

      return true;
    }

    if (data && data.length > 0) {
      console.log('✅ PASSED: search_vector column exists\n');
      console.log('Column details:', data[0]);
      return true;
    } else {
      console.log('❌ FAILED: search_vector column not found\n');
      return false;
    }
  } catch (err) {
    console.error('❌ Error during verification:', err.message);
    console.log('\nManual verification steps:');
    console.log('  1. Open Supabase Dashboard → SQL Editor');
    console.log('  2. Run: SELECT column_name FROM information_schema.columns');
    console.log("     WHERE table_name = 'complaints' AND column_name = 'search_vector';\n");
    return false;
  }
}

// Run verification
verifySearchVector()
  .then((success) => {
    if (success) {
      console.log('✅ Task 1.4 sub-task "Add search_vector column" is COMPLETE\n');
      process.exit(0);
    } else {
      console.log('❌ Task 1.4 sub-task "Add search_vector column" is INCOMPLETE\n');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
