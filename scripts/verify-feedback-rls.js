#!/usr/bin/env node

/**
 * Verify feedback table RLS policies
 * This script checks if the RLS policies are correctly configured
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyRLSPolicies() {
  console.log('🔍 Verifying feedback table RLS policies...\n');

  try {
    // Query to check RLS policies
    const { data, error } = await supabase.rpc('exec', {
      query: `
        SELECT 
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'feedback'
        ORDER BY policyname;
      `
    });

    if (error) {
      console.error('❌ Error querying policies:', error.message);
      console.log('\nTrying alternative method...\n');
      
      // Alternative: Direct SQL query
      const { data: altData, error: altError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('schemaname', 'public')
        .eq('tablename', 'feedback');
      
      if (altError) {
        console.error('❌ Alternative method also failed:', altError.message);
        console.log('\n⚠️  Unable to verify policies programmatically.');
        console.log('Please verify manually in Supabase Dashboard:\n');
        console.log('1. Go to: Database > Policies');
        console.log('2. Find the "feedback" table');
        console.log('3. Verify these policies exist:');
        console.log('   - Students view feedback');
        console.log('   - Lecturers insert feedback');
        console.log('   - Lecturers update own feedback');
        console.log('   - Lecturers delete own feedback\n');
        return;
      }
      
      displayPolicies(altData);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No RLS policies found for feedback table');
      console.log('Please apply the migration: node scripts/apply-feedback-rls-fix.js\n');
      return;
    }

    displayPolicies(data);

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('\nPlease verify manually in Supabase Dashboard\n');
  }
}

function displayPolicies(policies) {
  console.log('✅ Found', policies.length, 'RLS policies for feedback table:\n');
  
  const expectedPolicies = [
    'Students view feedback',
    'Lecturers insert feedback',
    'Lecturers update own feedback',
    'Lecturers delete own feedback'
  ];

  policies.forEach((policy, index) => {
    console.log(`${index + 1}. ${policy.policyname}`);
    console.log(`   Command: ${policy.cmd}`);
    console.log(`   Roles: ${policy.roles}`);
    console.log('');
  });

  // Check if all expected policies exist
  const policyNames = policies.map(p => p.policyname);
  const missingPolicies = expectedPolicies.filter(name => !policyNames.includes(name));

  if (missingPolicies.length === 0) {
    console.log('✅ All expected policies are present!\n');
  } else {
    console.log('⚠️  Missing policies:');
    missingPolicies.forEach(name => console.log(`   - ${name}`));
    console.log('\nPlease apply the migration: node scripts/apply-feedback-rls-fix.js\n');
  }
}

verifyRLSPolicies();
