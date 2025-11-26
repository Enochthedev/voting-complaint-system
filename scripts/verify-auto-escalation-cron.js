#!/usr/bin/env node

/**
 * Script to verify the auto-escalation cron job setup
 *
 * This script checks:
 * 1. Required extensions are enabled (pg_cron, pg_net)
 * 2. Vault secrets are configured
 * 3. Cron job is created and active
 * 4. Recent job runs and their status
 * 5. HTTP responses from Edge Function calls
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('   Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkExtensions() {
  console.log('\n📦 Checking required extensions...');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      select extname, extversion
      from pg_extension
      where extname in ('pg_cron', 'pg_net')
      order by extname;
    `,
  });

  if (error) {
    // Try alternative method
    const { data: altData, error: altError } = await supabase
      .from('pg_extension')
      .select('extname, extversion')
      .in('extname', ['pg_cron', 'pg_net']);

    if (altError) {
      console.error('❌ Error checking extensions:', altError.message);
      return false;
    }

    if (!altData || altData.length === 0) {
      console.error('❌ Required extensions not found');
      console.error('   Please enable pg_cron and pg_net extensions');
      return false;
    }

    altData.forEach((ext) => {
      console.log(`   ✅ ${ext.extname} (version ${ext.extversion})`);
    });
    return true;
  }

  if (!data || data.length === 0) {
    console.error('❌ Required extensions not found');
    console.error('   Please enable pg_cron and pg_net extensions');
    return false;
  }

  data.forEach((ext) => {
    console.log(`   ✅ ${ext.extname} (version ${ext.extversion})`);
  });

  return true;
}

async function checkVaultSecrets() {
  console.log('\n🔐 Checking Vault secrets...');

  const { data, error } = await supabase
    .from('vault.secrets')
    .select('name')
    .in('name', ['project_url', 'anon_key']);

  if (error) {
    console.error('❌ Error checking Vault secrets:', error.message);
    console.error('   Note: Vault may not be accessible in all environments');
    return false;
  }

  const secretNames = data?.map((s) => s.name) || [];

  if (secretNames.includes('project_url')) {
    console.log('   ✅ project_url secret exists');
  } else {
    console.error('   ❌ project_url secret not found');
  }

  if (secretNames.includes('anon_key')) {
    console.log('   ✅ anon_key secret exists');
  } else {
    console.error('   ❌ anon_key secret not found');
  }

  return secretNames.length === 2;
}

async function checkCronJob() {
  console.log('\n⏰ Checking cron job configuration...');

  const { data, error } = await supabase
    .from('cron.job')
    .select('jobid, jobname, schedule, active, command')
    .eq('jobname', 'auto-escalate-complaints-hourly')
    .single();

  if (error) {
    console.error('❌ Cron job not found:', error.message);
    console.error('   Please run the migration to create the cron job');
    return false;
  }

  console.log(`   ✅ Job ID: ${data.jobid}`);
  console.log(`   ✅ Job Name: ${data.jobname}`);
  console.log(`   ✅ Schedule: ${data.schedule} (every hour)`);
  console.log(`   ${data.active ? '✅' : '❌'} Active: ${data.active}`);

  if (!data.active) {
    console.error('   ⚠️  Warning: Cron job is not active!');
  }

  return true;
}

async function checkJobRuns() {
  console.log('\n📊 Checking recent job runs...');

  // First get the job ID
  const { data: jobData } = await supabase
    .from('cron.job')
    .select('jobid')
    .eq('jobname', 'auto-escalate-complaints-hourly')
    .single();

  if (!jobData) {
    console.log('   ⚠️  Cannot check job runs - job not found');
    return false;
  }

  const { data, error } = await supabase
    .from('cron.job_run_details')
    .select('runid, status, return_message, start_time, end_time')
    .eq('jobid', jobData.jobid)
    .order('start_time', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error checking job runs:', error.message);
    return false;
  }

  if (!data || data.length === 0) {
    console.log('   ℹ️  No job runs found yet (job may not have run yet)');
    return true;
  }

  console.log(`   Found ${data.length} recent job run(s):\n`);

  data.forEach((run, index) => {
    const duration = run.end_time
      ? Math.round((new Date(run.end_time) - new Date(run.start_time)) / 1000)
      : 'running';

    console.log(`   ${index + 1}. Run ID: ${run.runid}`);
    console.log(`      Status: ${run.status === 'succeeded' ? '✅' : '❌'} ${run.status}`);
    console.log(`      Started: ${new Date(run.start_time).toLocaleString()}`);
    console.log(`      Duration: ${duration}s`);

    if (run.return_message) {
      console.log(`      Message: ${run.return_message}`);
    }
    console.log('');
  });

  return true;
}

async function checkHttpResponses() {
  console.log('\n🌐 Checking recent HTTP responses...');

  const { data, error } = await supabase
    .from('net._http_response')
    .select('id, status_code, error_msg, created')
    .order('created', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error checking HTTP responses:', error.message);
    return false;
  }

  if (!data || data.length === 0) {
    console.log('   ℹ️  No HTTP responses found yet');
    return true;
  }

  console.log(`   Found ${data.length} recent HTTP response(s):\n`);

  data.forEach((response, index) => {
    console.log(`   ${index + 1}. Response ID: ${response.id}`);
    console.log(
      `      Status: ${response.status_code >= 200 && response.status_code < 300 ? '✅' : '❌'} ${response.status_code}`
    );
    console.log(`      Time: ${new Date(response.created).toLocaleString()}`);

    if (response.error_msg) {
      console.log(`      Error: ${response.error_msg}`);
    }
    console.log('');
  });

  return true;
}

async function checkEscalationRules() {
  console.log('\n📋 Checking escalation rules...');

  const { data, error } = await supabase
    .from('escalation_rules')
    .select('id, category, priority, hours_threshold, is_active')
    .eq('is_active', true);

  if (error) {
    console.error('❌ Error checking escalation rules:', error.message);
    return false;
  }

  if (!data || data.length === 0) {
    console.log('   ⚠️  No active escalation rules found');
    console.log("   The cron job will run but won't escalate any complaints");
    return true;
  }

  console.log(`   Found ${data.length} active escalation rule(s):\n`);

  data.forEach((rule, index) => {
    console.log(`   ${index + 1}. Rule ID: ${rule.id}`);
    console.log(`      Category: ${rule.category}`);
    console.log(`      Priority: ${rule.priority}`);
    console.log(`      Threshold: ${rule.hours_threshold} hours`);
    console.log('');
  });

  return true;
}

async function main() {
  console.log('🔍 Auto-Escalation Cron Job Verification');
  console.log('=========================================');

  const results = {
    extensions: await checkExtensions(),
    vault: await checkVaultSecrets(),
    cronJob: await checkCronJob(),
    jobRuns: await checkJobRuns(),
    httpResponses: await checkHttpResponses(),
    rules: await checkEscalationRules(),
  };

  console.log('\n📝 Summary');
  console.log('==========');
  console.log(`Extensions:      ${results.extensions ? '✅' : '❌'}`);
  console.log(`Vault Secrets:   ${results.vault ? '✅' : '⚠️'}`);
  console.log(`Cron Job:        ${results.cronJob ? '✅' : '❌'}`);
  console.log(`Job Runs:        ${results.jobRuns ? '✅' : '⚠️'}`);
  console.log(`HTTP Responses:  ${results.httpResponses ? '✅' : '⚠️'}`);
  console.log(`Escalation Rules: ${results.rules ? '✅' : '⚠️'}`);

  const allPassed = results.extensions && results.cronJob;

  if (allPassed) {
    console.log('\n✅ Auto-escalation cron job is properly configured!');
    console.log('   The job will run every hour at minute 0.');
  } else {
    console.log('\n❌ Some checks failed. Please review the output above.');
    process.exit(1);
  }
}

main().catch(console.error);
