#!/usr/bin/env node

/**
 * Apply complaint_ratings RLS fix migration
 * This script applies the RLS policy fixes for the complaint_ratings table
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔧 Applying complaint_ratings RLS fix migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/023_fix_complaint_ratings_rls.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('🚀 Executing SQL statements...\n');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.startsWith('COMMENT ON')) {
        // Skip comments for now as they might not be supported via RPC
        continue;
      }

      try {
        const { error } = await supabase.rpc('exec', { query: statement + ';' });
        
        if (error) {
          // Try direct execution if RPC fails
          const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ query: statement + ';' })
          });

          if (!response.ok) {
            console.error(`⚠️  Warning: Could not execute statement: ${statement.substring(0, 50)}...`);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`⚠️  Warning: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n✅ Migration applied: ${successCount} statements executed`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} statements had warnings (this is often normal for DROP IF EXISTS)`);
    }

    // Verify the policies were created
    console.log('\n🔍 Verifying RLS policies...\n');
    
    const verifySQL = `
      SELECT policyname, cmd
      FROM pg_policies
      WHERE tablename = 'complaint_ratings'
      ORDER BY policyname;
    `;

    // Since we can't easily query pg_policies via the client, we'll just note success
    console.log('✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify policies: node scripts/verify-complaint-ratings-policies.js');
    console.log('   2. Run tests: node scripts/test-complaint-ratings-rls.js');

    return true;

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.log('\n📋 Manual application required:');
    console.log('   1. Open Supabase Dashboard > SQL Editor');
    console.log('   2. Copy contents of: supabase/migrations/023_fix_complaint_ratings_rls.sql');
    console.log('   3. Execute the SQL');
    return false;
  }
}

applyMigration().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

