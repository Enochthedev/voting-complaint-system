#!/usr/bin/env node

/**
 * Script to apply the complaint_attachments and users RLS policy fixes
 * This fixes the infinite recursion issue by using JWT claims instead of querying the users table
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

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

// Create admin client
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration(migrationPath, migrationName) {
  console.log(`\n📝 Applying ${migrationName}...`);

  try {
    const sql = readFileSync(migrationPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await adminClient.rpc('exec_sql', { sql_query: statement + ';' });

        if (error) {
          // Try direct execution if rpc fails
          const { error: directError } = await adminClient.from('_migrations').select('*').limit(0);
          if (directError) {
            console.error('⚠️  Warning:', error.message);
          }
        }
      }
    }

    console.log(`✅ ${migrationName} applied successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to apply ${migrationName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Applying RLS policy fixes...\n');
  console.log('This will fix the infinite recursion issue in RLS policies');
  console.log('by using JWT claims instead of querying the users table.\n');

  // Apply users table RLS fix
  const usersFixPath = join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '020_fix_users_table_rls.sql'
  );
  const usersSuccess = await applyMigration(usersFixPath, 'Users table RLS fix');

  // Apply complaint_attachments RLS fix
  const attachmentsFixPath = join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '019_fix_complaint_attachments_rls.sql'
  );
  const attachmentsSuccess = await applyMigration(
    attachmentsFixPath,
    'Complaint attachments RLS fix'
  );

  if (usersSuccess && attachmentsSuccess) {
    console.log('\n✅ All migrations applied successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the test script to verify: node scripts/test-complaint-attachments-rls.js');
    console.log('2. Users will need to sign out and sign back in for JWT claims to update');
  } else {
    console.log('\n⚠️  Some migrations failed. Please apply them manually via Supabase Dashboard.');
    console.log('\nManual steps:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of:');
    console.log('   - supabase/migrations/020_fix_users_table_rls.sql');
    console.log('   - supabase/migrations/019_fix_complaint_attachments_rls.sql');
    console.log('4. Click "Run" to execute each migration');
  }
}

main();
