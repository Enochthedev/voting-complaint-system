#!/usr/bin/env node

/**
 * Verification script for bulk action history logging
 *
 * This script demonstrates and verifies that bulk actions are properly
 * logged to the complaint_history table.
 *
 * Usage: node scripts/verify-bulk-action-history.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyBulkActionHistory() {
  console.log('🔍 Verifying Bulk Action History Logging\n');
  console.log('='.repeat(60));

  try {
    // Check for bulk status changes
    console.log('\n📊 Checking Bulk Status Changes...');
    const { data: statusChanges, error: statusError } = await supabase
      .from('complaint_history')
      .select('*')
      .eq('action', 'status_changed')
      .contains('details', { bulk_action: true })
      .order('created_at', { ascending: false })
      .limit(5);

    if (statusError) {
      console.error('❌ Error fetching status changes:', statusError.message);
    } else if (statusChanges && statusChanges.length > 0) {
      console.log(`✅ Found ${statusChanges.length} bulk status change(s)`);
      statusChanges.forEach((entry, index) => {
        console.log(`\n   ${index + 1}. Complaint: ${entry.complaint_id}`);
        console.log(`      Old Status: ${entry.old_value}`);
        console.log(`      New Status: ${entry.new_value}`);
        console.log(`      Performed By: ${entry.performed_by}`);
        console.log(`      Date: ${new Date(entry.created_at).toLocaleString()}`);
      });
    } else {
      console.log('ℹ️  No bulk status changes found yet');
    }

    // Check for bulk assignments
    console.log('\n\n👥 Checking Bulk Assignments...');
    const { data: assignments, error: assignError } = await supabase
      .from('complaint_history')
      .select('*')
      .eq('action', 'assigned')
      .contains('details', { bulk_action: true })
      .order('created_at', { ascending: false })
      .limit(5);

    if (assignError) {
      console.error('❌ Error fetching assignments:', assignError.message);
    } else if (assignments && assignments.length > 0) {
      console.log(`✅ Found ${assignments.length} bulk assignment(s)`);
      assignments.forEach((entry, index) => {
        console.log(`\n   ${index + 1}. Complaint: ${entry.complaint_id}`);
        console.log(`      Old Assignment: ${entry.old_value}`);
        console.log(`      New Assignment: ${entry.new_value}`);
        console.log(`      Lecturer: ${entry.details?.lecturer_name || 'N/A'}`);
        console.log(`      Performed By: ${entry.performed_by}`);
        console.log(`      Date: ${new Date(entry.created_at).toLocaleString()}`);
      });
    } else {
      console.log('ℹ️  No bulk assignments found yet');
    }

    // Check for bulk tag additions
    console.log('\n\n🏷️  Checking Bulk Tag Additions...');
    const { data: tagAdditions, error: tagError } = await supabase
      .from('complaint_history')
      .select('*')
      .eq('action', 'tags_added')
      .contains('details', { bulk_action: true })
      .order('created_at', { ascending: false })
      .limit(5);

    if (tagError) {
      console.error('❌ Error fetching tag additions:', tagError.message);
    } else if (tagAdditions && tagAdditions.length > 0) {
      console.log(`✅ Found ${tagAdditions.length} bulk tag addition(s)`);
      tagAdditions.forEach((entry, index) => {
        console.log(`\n   ${index + 1}. Complaint: ${entry.complaint_id}`);
        console.log(`      Old Tags: ${entry.old_value}`);
        console.log(`      New Tags: ${entry.new_value}`);
        console.log(`      Added Tags: ${entry.details?.added_tags?.join(', ') || 'N/A'}`);
        console.log(`      Performed By: ${entry.performed_by}`);
        console.log(`      Date: ${new Date(entry.created_at).toLocaleString()}`);
      });
    } else {
      console.log('ℹ️  No bulk tag additions found yet');
    }

    // Summary of all bulk actions
    console.log('\n\n📈 Summary of All Bulk Actions...');
    const { data: allBulkActions, error: summaryError } = await supabase
      .from('complaint_history')
      .select('action, created_at')
      .contains('details', { bulk_action: true })
      .order('created_at', { ascending: false });

    if (summaryError) {
      console.error('❌ Error fetching summary:', summaryError.message);
    } else if (allBulkActions && allBulkActions.length > 0) {
      console.log(`✅ Total bulk actions logged: ${allBulkActions.length}`);

      const actionCounts = allBulkActions.reduce((acc, entry) => {
        acc[entry.action] = (acc[entry.action] || 0) + 1;
        return acc;
      }, {});

      console.log('\n   Breakdown by action type:');
      Object.entries(actionCounts).forEach(([action, count]) => {
        console.log(`   - ${action}: ${count}`);
      });
    } else {
      console.log('ℹ️  No bulk actions found in history yet');
      console.log('\n   💡 Tip: Perform some bulk actions in the UI to see them logged here');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Verification complete!\n');
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run verification
verifyBulkActionHistory();
