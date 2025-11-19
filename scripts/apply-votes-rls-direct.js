#!/usr/bin/env node

/**
 * Apply votes and vote_responses RLS fix migration directly
 */

const { createClient } = require('@supabase/supabase-js');
const { readFileSync } = require('fs');
const { join } = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function executeSQLStatements() {
  console.log('🔧 Applying votes and vote_responses RLS Policy Fix\n');

  try {
    // Execute each statement separately
    const statements = [
      'DROP POLICY IF EXISTS "Lecturers create votes" ON public.votes',
      'DROP POLICY IF EXISTS "Lecturers update own votes" ON public.votes',
      'DROP POLICY IF EXISTS "Lecturers delete own votes" ON public.votes',
      `CREATE POLICY "Lecturers create votes"
        ON public.votes
        FOR INSERT
        TO authenticated
        WITH CHECK (created_by = auth.uid())`,
      `CREATE POLICY "Lecturers update own votes"
        ON public.votes
        FOR UPDATE
        TO authenticated
        USING (created_by = auth.uid())
        WITH CHECK (created_by = auth.uid())`,
      `CREATE POLICY "Lecturers delete own votes"
        ON public.votes
        FOR DELETE
        TO authenticated
        USING (created_by = auth.uid())`,
      'DROP POLICY IF EXISTS "Students view own responses" ON public.vote_responses',
      'DROP POLICY IF EXISTS "Students insert responses" ON public.vote_responses',
      `CREATE POLICY "Students view own responses"
        ON public.vote_responses
        FOR SELECT
        TO authenticated
        USING (student_id = auth.uid())`,
      `CREATE POLICY "Lecturers view all responses"
        ON public.vote_responses
        FOR SELECT
        TO authenticated
        USING (
          student_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.votes
            WHERE votes.id = vote_responses.vote_id
            AND votes.created_by = auth.uid()
          )
        )`,
      `CREATE POLICY "Students insert responses"
        ON public.vote_responses
        FOR INSERT
        TO authenticated
        WITH CHECK (student_id = auth.uid())`
    ];

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await adminClient.rpc('exec_sql', { sql: stmt });
      
      if (error) {
        console.error(`❌ Error on statement ${i + 1}:`, error.message);
        console.log('Statement:', stmt);
        throw error;
      }
    }

    console.log('\n✅ All statements executed successfully!\n');
    console.log('📋 Changes made:');
    console.log('  - Fixed votes table RLS policies to avoid infinite recursion');
    console.log('  - Fixed vote_responses table RLS policies');
    console.log('  - Lecturers can now create, update, and delete their own votes');
    console.log('  - Students can view and manage their own vote responses');
    console.log('  - Lecturers can view responses to their own votes\n');
    console.log('🧪 Run test script to verify:');
    console.log('   node scripts/test-votes-rls.js\n');

    return true;

  } catch (error) {
    console.error('\n❌ Failed to apply migration:', error.message);
    console.log('\n📋 SQL statements to apply manually:');
    const migrationPath = join(__dirname, '../supabase/migrations/025_fix_votes_rls.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    console.log(migrationSQL);
    return false;
  }
}

// Apply migration
executeSQLStatements()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
