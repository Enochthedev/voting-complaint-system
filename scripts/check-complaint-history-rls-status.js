#!/usr/bin/env node

/**
 * Script to check the current state of complaint_history RLS policies
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSStatus() {
  console.log('🔍 Checking complaint_history RLS status...\n');

  // Check if table exists
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'complaint_history');

  if (tablesError) {
    console.error('❌ Error checking table:', tablesError);
    return;
  }

  if (!tables || tables.length === 0) {
    console.log('❌ complaint_history table does not exist');
    return;
  }

  console.log('✅ complaint_history table exists\n');

  // Check RLS status using raw SQL
  const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        schemaname,
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'complaint_history';
    `,
  });

  if (!rlsError && rlsData) {
    console.log('📊 RLS Status:', rlsData);
  }

  // Try to query policies directly
  console.log('\n📋 Attempting to list policies...\n');

  const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        policyname,
        cmd,
        permissive,
        roles
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'complaint_history'
      ORDER BY policyname;
    `,
  });

  if (policiesError) {
    console.log('⚠️  Could not query policies via RPC:', policiesError.message);
    console.log('This is expected if exec_sql function is not available\n');
  } else if (policies) {
    console.log('Policies found:', policies);
  }

  // Check permissions
  console.log('\n🔐 Checking table permissions...\n');

  const { data: perms, error: permsError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        grantee,
        privilege_type
      FROM information_schema.table_privileges
      WHERE table_schema = 'public' 
        AND table_name = 'complaint_history'
        AND grantee = 'authenticated'
      ORDER BY privilege_type;
    `,
  });

  if (!permsError && perms) {
    console.log('Permissions:', perms);
  }

  console.log('\n✅ Status check complete');
}

checkRLSStatus().catch((error) => {
  console.error('💥 Error:', error);
  process.exit(1);
});
