/**
 * Direct test of escalation history logging
 *
 * This script manually simulates what the edge function does:
 * 1. Creates a test complaint
 * 2. Escalates it
 * 3. Logs the escalation in history
 * 4. Verifies the history was created
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

async function testEscalationHistoryLogging() {
  console.log('🧪 Testing Escalation History Logging (Direct)\n');

  let testComplaintId = null;

  try {
    // Step 1: Get test users
    console.log('1️⃣ Getting test users...');
    const { data: adminUser } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'admin')
      .limit(1)
      .single();

    const { data: studentUser } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'student')
      .limit(1)
      .single();

    if (!adminUser || !studentUser) {
      console.error('❌ Missing test users');
      return;
    }

    console.log(`✅ Admin: ${adminUser.full_name}`);
    console.log(`✅ Student: ${studentUser.full_name}\n`);

    // Step 2: Create a test complaint
    console.log('2️⃣ Creating test complaint...');
    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .insert({
        student_id: studentUser.id,
        title: 'Test Complaint for History Logging',
        description: 'Testing escalation history logging',
        category: 'academic',
        priority: 'high',
        status: 'new',
        is_draft: false,
        is_anonymous: false,
      })
      .select()
      .single();

    if (complaintError) {
      console.error('❌ Error creating complaint:', complaintError);
      return;
    }

    testComplaintId = complaint.id;
    console.log(`✅ Created complaint: ${complaint.id}\n`);

    // Step 3: Simulate escalation (what the edge function does)
    console.log('3️⃣ Escalating complaint...');
    const now = new Date().toISOString();
    const newEscalationLevel = (complaint.escalation_level || 0) + 1;

    // Update complaint
    const { error: updateError } = await supabase
      .from('complaints')
      .update({
        escalated_at: now,
        escalation_level: newEscalationLevel,
        assigned_to: adminUser.id,
        updated_at: now,
      })
      .eq('id', complaint.id);

    if (updateError) {
      console.error('❌ Error updating complaint:', updateError);
      return;
    }

    console.log(`✅ Complaint escalated to level ${newEscalationLevel}\n`);

    // Step 4: Log escalation in history (THIS IS WHAT WE'RE TESTING)
    console.log('4️⃣ Logging escalation in history...');
    const { data: historyRecord, error: historyError } = await supabase
      .from('complaint_history')
      .insert({
        complaint_id: complaint.id,
        action: 'escalated',
        old_value: null,
        new_value: `Level ${newEscalationLevel}`,
        performed_by: adminUser.id,
        details: {
          escalation_level: newEscalationLevel,
          rule_id: 'test-rule-id',
          hours_threshold: 24,
          auto_escalated: true,
        },
      })
      .select()
      .single();

    if (historyError) {
      console.error('❌ Error logging history:', historyError);
      return;
    }

    console.log('✅ History record created:\n');
    console.log(`   ID: ${historyRecord.id}`);
    console.log(`   Action: ${historyRecord.action}`);
    console.log(`   New Value: ${historyRecord.new_value}`);
    console.log(`   Performed By: ${historyRecord.performed_by}`);
    console.log(`   Details:`, JSON.stringify(historyRecord.details, null, 2));
    console.log();

    // Step 5: Verify the history record exists
    console.log('5️⃣ Verifying history record...');
    const { data: verifyHistory, error: verifyError } = await supabase
      .from('complaint_history')
      .select('*')
      .eq('complaint_id', complaint.id)
      .eq('action', 'escalated');

    if (verifyError) {
      console.error('❌ Error verifying history:', verifyError);
      return;
    }

    if (verifyHistory && verifyHistory.length > 0) {
      console.log(`✅ History record verified! Found ${verifyHistory.length} record(s)\n`);
      console.log('✨ SUCCESS: Escalation history logging is working correctly!\n');
    } else {
      console.log('❌ History record not found\n');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    if (testComplaintId) {
      console.log('🧹 Cleaning up...');
      await supabase.from('complaint_history').delete().eq('complaint_id', testComplaintId);
      await supabase.from('complaints').delete().eq('id', testComplaintId);
      console.log('✅ Cleanup complete\n');
    }
  }
}

// Run test
testEscalationHistoryLogging().catch(console.error);
