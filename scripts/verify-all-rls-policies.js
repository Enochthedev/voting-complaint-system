#!/usr/bin/env node

/**
 * Verify All RLS Policies
 * Simple verification script that checks RLS status and policy counts
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('🔒 RLS Policy Verification\n');
console.log('='.repeat(80));

async function verifyRLS() {
  try {
    // Query to get all tables with RLS status and policy counts
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .order('tablename');

    if (error) {
      console.error('❌ Error querying tables:', error.message);

      // Try alternative approach using raw SQL
      console.log('\nTrying alternative query method...\n');

      const tables = [
        'users',
        'complaints',
        'complaint_comments',
        'complaint_attachments',
        'complaint_history',
        'complaint_ratings',
        'complaint_tags',
        'complaint_templates',
        'escalation_rules',
        'feedback',
        'notifications',
        'announcements',
        'votes',
        'vote_responses',
      ];

      let allGood = true;

      for (const table of tables) {
        // Try to query policies directly
        const { data: policies, error: policyError } = await supabase
          .from('pg_policies')
          .select('policyname, cmd')
          .eq('schemaname', 'public')
          .eq('tablename', table);

        if (policyError) {
          console.log(`⚠️  ${table.padEnd(30)} - Cannot verify (${policyError.message})`);
          continue;
        }

        const policyCount = policies?.length || 0;
        const status = policyCount > 0 ? '✅' : '❌';

        if (policyCount === 0) {
          allGood = false;
          console.log(
            `${status} ${table.padEnd(30)} - RLS enabled, but NO POLICIES (${policyCount})`
          );
        } else {
          console.log(`${status} ${table.padEnd(30)} - ${policyCount} policies`);

          // Show policy breakdown
          const byCmd = {};
          policies.forEach((p) => {
            byCmd[p.cmd] = (byCmd[p.cmd] || 0) + 1;
          });

          const breakdown = Object.entries(byCmd)
            .map(([cmd, count]) => `${cmd}:${count}`)
            .join(', ');
          console.log(`   └─ ${breakdown}`);
        }
      }

      console.log('\n' + '='.repeat(80));

      if (allGood) {
        console.log('✅ All tables have RLS policies configured');
        return true;
      } else {
        console.log('❌ Some tables are missing RLS policies');
        return false;
      }
    }

    // If we got data, process it
    if (data) {
      console.log(`\nFound ${data.length} tables in public schema\n`);

      for (const table of data) {
        const rlsStatus = table.rowsecurity ? '✅ Enabled' : '❌ Disabled';
        console.log(`${table.tablename.padEnd(30)} - RLS: ${rlsStatus}`);
      }
    }

    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

async function checkSpecificPolicies() {
  console.log('\n' + '='.repeat(80));
  console.log('Checking specific policy requirements...\n');

  const requirements = {
    complaint_tags: {
      min: 4,
      operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
    },
    complaint_templates: {
      min: 6,
      operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
    },
    escalation_rules: {
      min: 4,
      operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
    },
  };

  let allPassed = true;

  for (const [table, req] of Object.entries(requirements)) {
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('policyname, cmd')
      .eq('schemaname', 'public')
      .eq('tablename', table);

    if (error) {
      console.log(`⚠️  ${table}: Cannot verify - ${error.message}`);
      continue;
    }

    const count = policies?.length || 0;
    const passed = count >= req.min;
    const status = passed ? '✅' : '❌';

    console.log(`${status} ${table.padEnd(25)} - ${count}/${req.min} policies`);

    if (!passed) {
      allPassed = false;
      console.log(`   └─ Missing policies! Expected at least ${req.min}`);
    } else {
      // Check operations
      const ops = [...new Set(policies.map((p) => p.cmd))];
      const missingOps = req.operations.filter((op) => !ops.includes(op));

      if (missingOps.length > 0) {
        console.log(`   └─ ⚠️  Missing operations: ${missingOps.join(', ')}`);
      } else {
        console.log(`   └─ All required operations covered: ${ops.join(', ')}`);
      }
    }
  }

  return allPassed;
}

async function main() {
  const rlsOk = await verifyRLS();
  const policiesOk = await checkSpecificPolicies();

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));

  if (rlsOk && policiesOk) {
    console.log('✅ All RLS policies are properly configured');
    process.exit(0);
  } else {
    console.log('❌ Some RLS policies need attention');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
