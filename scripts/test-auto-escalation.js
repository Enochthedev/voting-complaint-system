/**
 * Test script for auto-escalation edge function
 *
 * This script:
 * 1. Creates test data (escalation rule and old complaint)
 * 2. Invokes the edge function
 * 3. Verifies the complaint was escalated
 * 4. Cleans up test data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAutoEscalation() {
  console.log('🧪 Testing Auto-Escalation Edge Function\n');

  let testComplaintId = null;
  let testRuleId = null;

  try {
    // Step 1: Get a test admin user to escalate to
    console.log('1️⃣ Finding admin user...');
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminError || !adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      return;
    }

    console.log(`✅ Found admin: ${adminUser.full_name} (${adminUser.id})\n`);

    // Step 2: Get a test student user
    console.log('2️⃣ Finding student user...');
    const { data: studentUser, error: studentError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'student')
      .limit(1)
      .single();

    if (studentError || !studentUser) {
      console.error('❌ No student user found. Please create a student user first.');
      return;
    }

    console.log(`✅ Found student: ${studentUser.full_name} (${studentUser.id})\n`);

    // Step 3: Create a test escalation rule
    console.log('3️⃣ Creating test escalation rule...');
    const { data: rule, error: ruleError } = await supabase
      .from('escalation_rules')
      .insert({
        category: 'academic',
        priority: 'high',
        hours_threshold: 2, // 2 hours
        escalate_to: adminUser.id,
        is_active: true,
      })
      .select()
      .single();

    if (ruleError) {
      console.error('❌ Error creating escalation rule:', ruleError);
      return;
    }

    testRuleId = rule.id;
    console.log(`✅ Created escalation rule: ${rule.id}`);
    console.log(`   Category: ${rule.category}, Priority: ${rule.priority}`);
    console.log(`   Threshold: ${rule.hours_threshold} hours\n`);

    // Step 4: Create a test complaint that should be escalated
    console.log('4️⃣ Creating test complaint (3 hours old)...');
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

    // Create complaint first
    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .insert({
        student_id: studentUser.id,
        title: 'Test Complaint for Auto-Escalation',
        description: 'This complaint should be automatically escalated after 2 hours',
        category: 'academic',
        priority: 'high',
        status: 'new',
        is_draft: false,
        is_anonymous: false,
      })
      .select()
      .single();

    if (complaintError) {
      console.error('❌ Error creating test complaint:', complaintError);
      return;
    }

    testComplaintId = complaint.id;

    // Backdate the created_at using UPDATE (this bypasses the default)
    await supabase
      .from('complaints')
      .update({
        created_at: threeHoursAgo.toISOString(),
        updated_at: threeHoursAgo.toISOString(),
      })
      .eq('id', complaint.id);

    // Fetch the updated complaint
    const { data: updatedComplaint } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', complaint.id)
      .single();

    console.log(`✅ Created test complaint: ${updatedComplaint.id}`);
    console.log(`   Title: ${updatedComplaint.title}`);
    console.log(`   Created: ${updatedComplaint.created_at}`);
    console.log(`   Status: ${updatedComplaint.status}`);
    console.log(`   Escalated: ${updatedComplaint.escalated_at || 'Not yet'}\n`);

    // Step 5: Invoke the edge function
    console.log('5️⃣ Invoking auto-escalation edge function...');

    // Note: In a real scenario, you would call the deployed edge function
    // For local testing, you can use: supabase functions serve auto-escalate-complaints
    // Then call: http://localhost:54321/functions/v1/auto-escalate-complaints

    const functionUrl = `${supabaseUrl}/functions/v1/auto-escalate-complaints`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Edge function call failed:', response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Edge function executed successfully');
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log();

    // Step 6: Verify the complaint was escalated
    console.log('6️⃣ Verifying complaint escalation...');
    const { data: escalatedComplaint, error: verifyError } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', testComplaintId)
      .single();

    if (verifyError) {
      console.error('❌ Error fetching complaint:', verifyError);
      return;
    }

    console.log('Complaint after escalation:');
    console.log(`   Status: ${escalatedComplaint.status}`);
    console.log(`   Escalated At: ${escalatedComplaint.escalated_at || 'Not escalated'}`);
    console.log(`   Escalation Level: ${escalatedComplaint.escalation_level}`);
    console.log(`   Assigned To: ${escalatedComplaint.assigned_to || 'Not assigned'}`);

    if (escalatedComplaint.escalated_at && escalatedComplaint.assigned_to === adminUser.id) {
      console.log('✅ Complaint was successfully escalated!\n');
    } else {
      console.log('❌ Complaint was NOT escalated as expected\n');
    }

    // Step 7: Check notification was created
    console.log('7️⃣ Checking notification...');
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', adminUser.id)
      .eq('related_id', testComplaintId)
      .eq('type', 'complaint_escalated');

    if (notifError) {
      console.error('❌ Error fetching notifications:', notifError);
    } else if (notifications && notifications.length > 0) {
      console.log('✅ Notification created:');
      console.log(`   Title: ${notifications[0].title}`);
      console.log(`   Message: ${notifications[0].message}\n`);
    } else {
      console.log('❌ No notification found\n');
    }

    // Step 8: Check history was logged
    console.log('8️⃣ Checking complaint history...');
    const { data: history, error: historyError } = await supabase
      .from('complaint_history')
      .select('*')
      .eq('complaint_id', testComplaintId)
      .eq('action', 'escalated');

    if (historyError) {
      console.error('❌ Error fetching history:', historyError);
    } else if (history && history.length > 0) {
      console.log('✅ History entry created:');
      console.log(`   Action: ${history[0].action}`);
      console.log(`   New Value: ${history[0].new_value}`);
      console.log(`   Details: ${JSON.stringify(history[0].details, null, 2)}\n`);
    } else {
      console.log('❌ No history entry found\n');
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    // Cleanup: Delete test data
    console.log('🧹 Cleaning up test data...');

    if (testComplaintId) {
      // Delete related records first
      await supabase.from('complaint_history').delete().eq('complaint_id', testComplaintId);
      await supabase.from('notifications').delete().eq('related_id', testComplaintId);
      await supabase.from('complaints').delete().eq('id', testComplaintId);
      console.log('✅ Deleted test complaint and related records');
    }

    if (testRuleId) {
      await supabase.from('escalation_rules').delete().eq('id', testRuleId);
      console.log('✅ Deleted test escalation rule');
    }

    console.log('\n✨ Test complete!');
  }
}

// Run the test
testAutoEscalation().catch(console.error);
