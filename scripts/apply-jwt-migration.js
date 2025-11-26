#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  const sql = fs.readFileSync('supabase/migrations/018_add_role_to_jwt_claims.sql', 'utf8');

  const { error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('✅ Migration applied successfully');
}

applyMigration();
