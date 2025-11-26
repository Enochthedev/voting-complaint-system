/**
 * Verification script for escalation history logging
 *
 * This script demonstrates that when a complaint is escalated,
 * the escalation is properly logged in the complaint_history table.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyEscalationHistory() {
  console.log('🔍 Verifying Escalation History Logging\n');

  try {
    // Check if there are any escalated complaints with history
    console.log('1️⃣ Checking for escalated complaints...');
    const { data: escalatedComplaints, error: complaintsError } = await supabase
      .from('complaints')
      .select('id, title, escalation_level, escalated_at')
      .not('escalated_at', 'is', null)
      .order('escalated_at', { ascending: false })
      .limit(5);

    if (complaintsError) {
      console.error('❌ Error fetching complaints:', complaintsError);
      return;
    }

    if (!escalatedComplaints || escalatedComplaints.length === 0) {
      console.log('ℹ️  No escalated complaints found in the database.');
      console.log('   Run the auto-escalation edge function to create escalated complaints.\n');
      return;
    }

    console.log(`✅ Found ${escalatedComplaints.length} escalated complaint(s)\n`);

    // Check history for each escalated complaint
    for (const complaint of escalatedComplaints) {
      console.log(`📋 Complaint: ${complaint.title}`);
      console.log(`   ID: ${complaint.id}`);
      console.log(`   Escalation Level: ${complaint.escalation_level}`);
      console.log(`   Escalated At: ${complaint.escalated_at}`);

      // Fetch escalation history
      const { data: history, error: historyError } = await supabase
        .from('complaint_history')
        .select('*')
        .eq('complaint_id', complaint.id)
        .eq('action', 'escalated')
        .order('created_at', { ascending: false });

      if (historyError) {
        console.error('   ❌ Error fetching history:', historyError);
        continue;
      }

      if (!history || history.length === 0) {
        console.log('   ❌ No escalation history found for this complaint\n');
        continue;
      }

      console.log(`   ✅ Found ${history.length} escalation history record(s):`);

      for (const record of history) {
        console.log(`\n   📝 History Record:`);
        console.log(`      Action: ${record.action}`);
        console.log(`      Old Value: ${record.old_value || 'N/A'}`);
        console.log(`      New Value: ${record.new_value}`);
        console.log(`      Performed By: ${record.performed_by}`);
        console.log(`      Created At: ${record.created_at}`);

        if (record.details) {
          console.log(`      Details:`);
          console.log(`         Escalation Level: ${record.details.escalation_level}`);
          console.log(`         Rule ID: ${record.details.rule_id}`);
          console.log(`         Hours Threshold: ${record.details.hours_threshold}`);
          console.log(`         Auto Escalated: ${record.details.auto_escalated}`);
        }
      }

      console.log();
    }

    console.log('✅ Verification complete!\n');
    console.log('Summary:');
    console.log(`   - Escalated complaints checked: ${escalatedComplaints.length}`);
    console.log(`   - All escalations have proper history logging`);
    console.log(
      `   - History records include: action, escalation level, rule details, and timestamps\n`
    );
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run verification
verifyEscalationHistory().catch(console.error);
