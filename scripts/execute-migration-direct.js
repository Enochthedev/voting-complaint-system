#!/usr/bin/env node

/**
 * Execute migration directly using Supabase Management API
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project ref from URL');
  process.exit(1);
}

console.log(`🔧 Executing migration for project: ${projectRef}\n`);

async function executeMigration() {
  try {
    // Read the migration file
    const migrationPath = join(
      __dirname,
      '../supabase/migrations/022_fix_complaint_comments_rls.sql'
    );
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('🚀 Executing SQL via PostgREST...\n');

    // Try to execute via PostgREST query endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ query: migrationSQL }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to execute migration via API');
      console.error('Response:', error);
      console.log('\n📋 Please apply the migration manually via Supabase Dashboard');
      console.log('Run: node scripts/apply-complaint-comments-rls-fix.js');
      return false;
    }

    console.log('✅ Migration executed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Please apply the migration manually via Supabase Dashboard');
    console.log('Run: node scripts/apply-complaint-comments-rls-fix.js');
    return false;
  }
}

executeMigration()
  .then((success) => {
    if (success) {
      console.log('\n📝 Next step: Run test script');
      console.log('   node scripts/test-complaint-comments-rls.js');
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Execution failed:', error);
    process.exit(1);
  });
