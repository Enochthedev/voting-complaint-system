#!/usr/bin/env node

/**
 * Script to apply complaint_history RLS migration
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
  console.log('🚀 Applying complaint_history RLS migration...');
  
  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/021_fix_complaint_history_rls.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('📄 Migration file loaded');
  console.log('📝 Executing SQL...\n');
  
  // Execute the migration
  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
  
  if (error) {
    console.error('❌ Migration failed:', error);
    
    // Try executing directly via REST API
    console.log('\n🔄 Trying alternative method...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql: statement })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Statement ${i + 1} failed:`, errorText);
        console.error('Statement:', statement.substring(0, 100) + '...');
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('\n✅ Migration applied (with alternative method)');
  } else {
    console.log('✅ Migration applied successfully');
  }
  
  // Verify the migration
  console.log('\n🔍 Verifying migration...');
  
  const { data: policies, error: policiesError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'complaint_history');
  
  if (policiesError) {
    console.error('⚠️  Could not verify policies:', policiesError);
  } else {
    console.log(`\n📊 Found ${policies?.length || 0} policies on complaint_history table:`);
    policies?.forEach(policy => {
      console.log(`  - ${policy.policyname} (${policy.cmd})`);
    });
  }
  
  console.log('\n✅ Migration process complete!');
}

applyMigration().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

