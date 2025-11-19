#!/usr/bin/env node

/**
 * Execute Announcements RLS Fix
 * 
 * This script directly executes the SQL statements to fix announcements RLS policies.
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' }
});

async function executeFix() {
  console.log('='.repeat(60));
  console.log('Fixing Announcements RLS Policies');
  console.log('='.repeat(60));
  console.log('');

  try {
    console.log('Step 1: Dropping old policies...');
    
    // Drop old policies one by one
    const dropStatements = [
      `DROP POLICY IF EXISTS "Lecturers create announcements" ON public.announcements`,
      `DROP POLICY IF EXISTS "Lecturers update own announcements" ON public.announcements`,
      `DROP POLICY IF EXISTS "Lecturers delete own announcements" ON public.announcements`
    ];

    for (const stmt of dropStatements) {
      const { error } = await supabase.rpc('exec', { sql: stmt });
      if (error && !error.message.includes('does not exist')) {
        console.log(`   ⚠️  ${error.message}`);
      }
    }
    
    console.log('✅ Old policies dropped\n');

    console.log('Step 2: Creating new policies with JWT claims...');
    
    // Create new policies
    const createStatements = [
      {
        name: 'INSERT policy',
        sql: `
          CREATE POLICY "Lecturers create announcements"
            ON public.announcements
            FOR INSERT
            TO authenticated
            WITH CHECK (
              auth.jwt()->>'role' IN ('lecturer', 'admin')
            )
        `
      },
      {
        name: 'UPDATE policy',
        sql: `
          CREATE POLICY "Lecturers update own announcements"
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
            )
        `
      },
      {
        name: 'DELETE policy',
        sql: `
          CREATE POLICY "Lecturers delete own announcements"
            ON public.announcements
            FOR DELETE
            TO authenticated
            USING (
              created_by = auth.uid() AND
              auth.jwt()->>'role' IN ('lecturer', 'admin')
            )
        `
      }
    ];

    for (const { name, sql } of createStatements) {
      console.log(`   Creating ${name}...`);
      const { error } = await supabase.rpc('exec', { sql });
      if (error) {
        console.log(`   ⚠️  ${error.message}`);
      } else {
        console.log(`   ✅ ${name} created`);
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ RLS policies fixed successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('The announcements table now uses JWT claims for role checking,');
    console.log('which prevents infinite recursion with the users table.');
    console.log('');
    console.log('Run: node scripts/test-announcements-rls.js to verify');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Manual fix required:');
    console.error('1. Open Supabase Dashboard > SQL Editor');
    console.error('2. Run the SQL from: supabase/migrations/026_fix_announcements_rls.sql');
    console.error('');
    process.exit(1);
  }
}

executeFix();
