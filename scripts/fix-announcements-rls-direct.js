#!/usr/bin/env node

/**
 * Fix Announcements RLS Policies Directly
 * 
 * This script uses the Supabase admin client to directly execute
 * SQL statements to fix the announcements RLS policies.
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(description, sql) {
  console.log(`\n${description}...`);
  
  // Use the REST API directly to execute SQL
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed: ${response.statusText} - ${text}`);
  }

  console.log('✅ Success');
  return true;
}

async function fixAnnouncementsRLS() {
  console.log('='.repeat(70));
  console.log('Fixing Announcements RLS Policies');
  console.log('='.repeat(70));

  try {
    // Step 1: Drop old policies
    console.log('\n📝 Step 1: Dropping old policies');
    
    await executeSQL(
      '  Dropping INSERT policy',
      `DROP POLICY IF EXISTS "Lecturers create announcements" ON public.announcements;`
    );
    
    await executeSQL(
      '  Dropping UPDATE policy',
      `DROP POLICY IF EXISTS "Lecturers update own announcements" ON public.announcements;`
    );
    
    await executeSQL(
      '  Dropping DELETE policy',
      `DROP POLICY IF EXISTS "Lecturers delete own announcements" ON public.announcements;`
    );

    // Step 2: Create new policies with JWT claims
    console.log('\n📝 Step 2: Creating new policies with JWT claims');
    
    await executeSQL(
      '  Creating INSERT policy',
      `CREATE POLICY "Lecturers create announcements"
        ON public.announcements
        FOR INSERT
        TO authenticated
        WITH CHECK (
          auth.jwt()->>'role' IN ('lecturer', 'admin')
        );`
    );
    
    await executeSQL(
      '  Creating UPDATE policy',
      `CREATE POLICY "Lecturers update own announcements"
        ON public.announcements
        FOR UPDATE
        TO authenticated
        USING (
          created_by = auth.uid() AND
          auth.jwt()->>'role' IN ('lecturer', 'admin')
        )
        WITH CHECK (
          created_by = auth.uid() AND
          auth.jwt()->>'role' IN ('lecturer', 'admin')
        );`
    );
    
    await executeSQL(
      '  Creating DELETE policy',
      `CREATE POLICY "Lecturers delete own announcements"
        ON public.announcements
        FOR DELETE
        TO authenticated
        USING (
          created_by = auth.uid() AND
          auth.jwt()->>'role' IN ('lecturer', 'admin')
        );`
    );

    console.log('\n' + '='.repeat(70));
    console.log('✅ Announcements RLS policies fixed successfully!');
    console.log('='.repeat(70));
    console.log('\nThe policies now use JWT claims instead of querying the users table.');
    console.log('This prevents infinite recursion errors.');
    console.log('\nNext step: Run test script to verify');
    console.log('  node scripts/test-announcements-rls.js');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPlease apply the fix manually:');
    console.error('1. Open Supabase Dashboard > SQL Editor');
    console.error('2. Copy contents of: supabase/migrations/026_fix_announcements_rls.sql');
    console.error('3. Execute the SQL');
    console.error('\nSee APPLY_ANNOUNCEMENTS_RLS_FIX.md for detailed instructions');
    process.exit(1);
  }
}

fixAnnouncementsRLS();
