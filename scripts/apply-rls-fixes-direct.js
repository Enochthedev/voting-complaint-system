#!/usr/bin/env node

/**
 * Direct SQL execution script to apply RLS policy fixes
 * This script applies the migrations by executing SQL directly via Supabase REST API
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
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false },
});

async function executeSQLFile(filePath, description) {
  console.log(`\n📝 ${description}...`);

  try {
    const sql = readFileSync(filePath, 'utf8');

    // Execute the SQL using the Supabase client
    // We'll use a workaround by executing via the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      // If RPC doesn't exist, we'll need to apply manually
      console.log('⚠️  Direct SQL execution not available via API');
      console.log('📋 Please apply this migration manually via Supabase Dashboard:');
      console.log(`   File: ${filePath}`);
      console.log('\nSteps:');
      console.log('1. Go to Supabase Dashboard > SQL Editor');
      console.log('2. Copy and paste the SQL from the file above');
      console.log('3. Click "Run"');
      return false;
    }

    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.log('📋 Please apply this migration manually via Supabase Dashboard:');
    console.log(`   File: ${filePath}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Applying RLS Policy Fixes\n');
  console.log('='.repeat(60));

  const migrations = [
    {
      file: join(__dirname, '..', 'supabase', 'migrations', '020_fix_users_table_rls.sql'),
      description: 'Fixing users table RLS policies',
    },
    {
      file: join(
        __dirname,
        '..',
        'supabase',
        'migrations',
        '019_fix_complaint_attachments_rls.sql'
      ),
      description: 'Fixing complaint_attachments RLS policies',
    },
  ];

  let allSuccess = true;

  for (const migration of migrations) {
    const success = await executeSQLFile(migration.file, migration.description);
    if (!success) {
      allSuccess = false;
    }
  }

  console.log('\n' + '='.repeat(60));

  if (allSuccess) {
    console.log('\n✅ All migrations applied successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the test script: node scripts/test-complaint-attachments-rls.js');
    console.log('2. Users need to sign out and sign back in for JWT claims to update');
  } else {
    console.log('\n⚠️  Manual migration required');
    console.log('\n📋 To apply manually:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Apply each migration file listed above');
    console.log('4. Then run: node scripts/test-complaint-attachments-rls.js');
  }

  console.log('\n📖 For detailed documentation, see:');
  console.log('   docs/TASK_2.2_COMPLAINT_ATTACHMENTS_RLS_COMPLETION.md');
}

main();
