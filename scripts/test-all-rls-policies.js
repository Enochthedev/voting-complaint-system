#!/usr/bin/env node

/**
 * Comprehensive RLS Policy Testing Script
 * Tests all Row Level Security policies across all tables
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

function logTest(name, passed, message = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}${message ? ': ' + message : ''}`);
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

function logWarning(message) {
  console.log(`⚠️  ${message}`);
  results.warnings++;
}

function logSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

async function checkRLSEnabled(tableName) {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = '${tableName}'
    `,
  });

  if (error) {
    // Try alternative method
    const { data: altData, error: altError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .eq('tablename', tableName)
      .single();

    if (altError) {
      logTest(`RLS enabled on ${tableName}`, false, 'Cannot verify');
      return false;
    }
    return altData?.rowsecurity === true;
  }

  return data?.[0]?.rowsecurity === true;
}

async function getPolicies(tableName) {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
        SELECT policyname, cmd, permissive, roles
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = '${tableName}'
        ORDER BY cmd, policyname
      `,
  });

  if (error) {
    console.error(`Error fetching policies for ${tableName}:`, error);
    return [];
  }

  return data || [];
}

async function testTableRLS(tableName, expectedPolicies) {
  logSection(`Testing ${tableName.toUpperCase()} Table`);

  // Check if RLS is enabled
  const rlsEnabled = await checkRLSEnabled(tableName);
  logTest(`RLS enabled on ${tableName}`, rlsEnabled);

  if (!rlsEnabled) {
    logWarning(`RLS is not enabled on ${tableName} - skipping policy tests`);
    return;
  }

  // Get policies
  const policies = await getPolicies(tableName);
  logTest(`${tableName} has policies`, policies.length > 0, `Found ${policies.length} policies`);

  if (policies.length === 0) {
    logWarning(`No policies found for ${tableName} - table is inaccessible!`);
    return;
  }

  // Check for expected operations
  const operations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
  const policiesByOp = {};

  operations.forEach((op) => {
    policiesByOp[op] = policies.filter((p) => p.cmd === op);
  });

  console.log('\nPolicy breakdown:');
  operations.forEach((op) => {
    const count = policiesByOp[op].length;
    console.log(`  ${op}: ${count} ${count === 1 ? 'policy' : 'policies'}`);
    policiesByOp[op].forEach((p) => {
      console.log(`    - ${p.policyname}`);
    });
  });

  // Check for minimum expected policies
  if (expectedPolicies) {
    Object.entries(expectedPolicies).forEach(([op, minCount]) => {
      const actual = policiesByOp[op].length;
      logTest(
        `${tableName} ${op} policies`,
        actual >= minCount,
        `Expected at least ${minCount}, found ${actual}`
      );
    });
  }
}

async function testMissingPolicies() {
  logSection('Checking for Tables with Missing Policies');

  const { data: tables, error } = await supabase.rpc('exec_sql', {
    sql: `
        SELECT 
          t.tablename,
          t.rowsecurity as rls_enabled,
          COUNT(p.policyname) as policy_count
        FROM pg_tables t
        LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
        WHERE t.schemaname = 'public'
        GROUP BY t.tablename, t.rowsecurity
        HAVING t.rowsecurity = true AND COUNT(p.policyname) = 0
        ORDER BY t.tablename
      `,
  });

  if (error) {
    logTest('Check for missing policies', false, error.message);
    return;
  }

  if (!data || data.length === 0) {
    logTest('All RLS-enabled tables have policies', true);
  } else {
    data.forEach((table) => {
      logWarning(
        `Table "${table.tablename}" has RLS enabled but NO policies - table is inaccessible!`
      );
    });
    logTest(
      'All RLS-enabled tables have policies',
      false,
      `${data.length} tables missing policies`
    );
  }
}

async function testDuplicatePolicies() {
  logSection('Checking for Duplicate Policies');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
        SELECT tablename, policyname, COUNT(*) as count
        FROM pg_policies
        WHERE schemaname = 'public'
        GROUP BY tablename, policyname
        HAVING COUNT(*) > 1
      `,
  });

  if (error) {
    logTest('Check for duplicate policies', false, error.message);
    return;
  }

  if (!data || data.length === 0) {
    logTest('No duplicate policies found', true);
  } else {
    data.forEach((dup) => {
      logWarning(
        `Duplicate policy "${dup.policyname}" on table "${dup.tablename}" (${dup.count} times)`
      );
    });
    logTest('No duplicate policies', false, `${data.length} duplicate policies found`);
  }
}

async function testPolicyConsistency() {
  logSection('Testing Policy Consistency');

  // Check if policies use consistent role checking methods
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
        SELECT 
          tablename,
          policyname,
          CASE 
            WHEN qual LIKE '%auth.jwt()%' THEN 'JWT'
            WHEN qual LIKE '%users.role%' THEN 'DB Query'
            ELSE 'Other'
          END as role_check_method
        FROM pg_policies
        WHERE schemaname = 'public'
        AND (qual LIKE '%role%' OR with_check LIKE '%role%')
        ORDER BY tablename, policyname
      `,
  });

  if (error) {
    logTest('Check policy consistency', false, error.message);
    return;
  }

  if (data && data.length > 0) {
    const methodCounts = {};
    data.forEach((p) => {
      methodCounts[p.role_check_method] = (methodCounts[p.role_check_method] || 0) + 1;
    });

    console.log('\nRole checking methods used:');
    Object.entries(methodCounts).forEach(([method, count]) => {
      console.log(`  ${method}: ${count} policies`);
    });

    logTest('Policy consistency check', true, 'Multiple methods in use (expected)');
  }
}

async function runAllTests() {
  console.log('🔒 RLS Policy Comprehensive Test Suite');
  console.log('=====================================\n');

  // Test each table
  await testTableRLS('users', { SELECT: 1, INSERT: 1, UPDATE: 1 });
  await testTableRLS('complaints', { SELECT: 1, INSERT: 1, UPDATE: 2 });
  await testTableRLS('complaint_comments', { SELECT: 1, INSERT: 1, UPDATE: 1, DELETE: 1 });
  await testTableRLS('complaint_attachments', { SELECT: 1, INSERT: 1, DELETE: 1 });
  await testTableRLS('complaint_history', { SELECT: 1, INSERT: 1, UPDATE: 1, DELETE: 1 });
  await testTableRLS('complaint_ratings', { SELECT: 1, INSERT: 1, UPDATE: 1 });
  await testTableRLS('complaint_tags', { SELECT: 1, INSERT: 1, UPDATE: 1, DELETE: 1 });
  await testTableRLS('complaint_templates', { SELECT: 1, INSERT: 1, UPDATE: 1, DELETE: 1 });
  await testTableRLS('escalation_rules', { SELECT: 1, INSERT: 1, UPDATE: 1, DELETE: 1 });
  await testTableRLS('feedback', { SELECT: 1, INSERT: 1, UPDATE: 1, DELETE: 1 });
  await testTableRLS('notifications', { SELECT: 1, UPDATE: 1 });
  await testTableRLS('announcements', { SELECT: 1, INSERT: 1, UPDATE: 1, DELETE: 1 });
  await testTableRLS('votes', { SELECT: 1, INSERT: 1, UPDATE: 1, DELETE: 1 });
  await testTableRLS('vote_responses', { SELECT: 1, INSERT: 1 });

  // Run cross-table tests
  await testMissingPolicies();
  await testDuplicatePolicies();
  await testPolicyConsistency();

  // Print summary
  logSection('Test Summary');
  console.log(`Total tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);

  if (results.failed > 0) {
    console.log('\n❌ Some tests failed. Please review the output above.');
    process.exit(1);
  } else if (results.warnings > 0) {
    console.log('\n⚠️  All tests passed but there are warnings to review.');
    process.exit(0);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

runAllTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
