#!/usr/bin/env node

/**
 * Verify Announcements Table RLS Policies
 * 
 * This script verifies that all RLS policies for the announcements table
 * are correctly configured according to the design specifications.
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAnnouncementsRLS() {
  console.log('='.repeat(60));
  console.log('Verifying Announcements Table RLS Policies');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Check if RLS is enabled
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity as rls_enabled
          FROM pg_tables
          WHERE schemaname = 'public' AND tablename = 'announcements';
        `
      });

    if (tableError) {
      console.log('❌ Error checking table:', tableError.message);
      console.log('Attempting alternative verification method...\n');
    } else if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Table found:', tableInfo[0].tablename);
      console.log('✅ RLS enabled:', tableInfo[0].rls_enabled);
      console.log('');
    }

    // Check policies
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            policyname,
            cmd,
            roles::text[],
            qual,
            with_check
          FROM pg_policies
          WHERE schemaname = 'public' AND tablename = 'announcements'
          ORDER BY policyname;
        `
      });

    if (policiesError) {
      console.log('❌ Error fetching policies:', policiesError.message);
      console.log('');
      console.log('Please run the following SQL query manually:');
      console.log('');
      console.log('SELECT * FROM pg_policies WHERE tablename = \'announcements\';');
      console.log('');
      return;
    }

    if (!policies || policies.length === 0) {
      console.log('❌ No RLS policies found for announcements table!');
      console.log('');
      console.log('Expected policies:');
      console.log('  1. All users view announcements (SELECT)');
      console.log('  2. Lecturers create announcements (INSERT)');
      console.log('  3. Lecturers update own announcements (UPDATE)');
      console.log('  4. Lecturers delete own announcements (DELETE)');
      console.log('');
      return;
    }

    console.log(`✅ Found ${policies.length} RLS policies:\n`);
    
    const expectedPolicies = [
      { name: 'All users view announcements', cmd: 'SELECT' },
      { name: 'Lecturers create announcements', cmd: 'INSERT' },
      { name: 'Lecturers update own announcements', cmd: 'UPDATE' },
      { name: 'Lecturers delete own announcements', cmd: 'DELETE' }
    ];

    policies.forEach((policy, index) => {
      console.log(`${index + 1}. Policy: ${policy.policyname}`);
      console.log(`   Command: ${policy.cmd}`);
      console.log(`   Roles: ${policy.roles}`);
      console.log('');
    });

    // Verify expected policies exist
    console.log('Verification Summary:');
    console.log('-'.repeat(60));
    
    let allPoliciesFound = true;
    expectedPolicies.forEach(expected => {
      const found = policies.some(p => 
        p.policyname.toLowerCase().includes(expected.name.toLowerCase().split(' ')[0]) &&
        p.cmd === expected.cmd
      );
      
      if (found) {
        console.log(`✅ ${expected.name} (${expected.cmd})`);
      } else {
        console.log(`❌ ${expected.name} (${expected.cmd}) - NOT FOUND`);
        allPoliciesFound = false;
      }
    });

    console.log('');
    if (allPoliciesFound) {
      console.log('✅ All required RLS policies are in place!');
    } else {
      console.log('❌ Some required RLS policies are missing!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('');
  console.log('='.repeat(60));
}

verifyAnnouncementsRLS();
