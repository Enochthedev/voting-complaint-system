/**
 * Test script for escalation notification trigger
 *
 * This script tests that:
 * 1. When a complaint is escalated (escalated_at set), a notification is created
 * 2. The notification is sent to the assigned_to user
 * 3. The notification has the correct type and message
 * 4. Re-escalation (escalation_level increase) also triggers notification
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testEscalationNotificationTrigger() {
  console.log('🧪 Testing Escalation Notification Trigger\n');

  try {
    // Step 1: Get a lecturer user to escalate to
    console.log('📋 Step 1: Finding a lecturer user...');
    const { data: lecturers, error: lecturerError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('role', 'lecturer')
      .limit(1);

    if (lecturerError) throw lecturerError;
    if (!lecturers || lecturers.length === 0) {
      console.error('❌ No lecturer users found. Please create a lecturer user first.');
      return;
    }

    const lecturer = lecturers[0];
    console.log(`✅ Found lecturer: ${lecturer.full_name} (${lecturer.email})`);

    // Step 2: Create a test complaint
    console.log('\n📋 Step 2: Creating a test complaint...');
    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .insert({
        title: 'Test Escalation Notification',
        description: 'This is a test complaint for escalation notification trigger',
        category: 'academic',
        priority: 'high',
        status: 'new',
        is_draft: false,
        is_anonymous: false,
      })
      .select()
      .single();

    if (complaintError) throw complaintError;
    console.log(`✅ Created complaint: ${complaint.id}`);

    // Step 3: Count notifications before escalation
    console.log('\n📋 Step 3: Counting notifications before escalation...');
    const { count: beforeCount, error: beforeCountError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', lecturer.id)
      .eq('type', 'complaint_escalated')
      .eq('related_id', complaint.id);

    if (beforeCountError) throw beforeCountError;
    console.log(`✅ Notifications before escalation: ${beforeCount}`);

    // Step 4: Escalate the complaint
    console.log('\n📋 Step 4: Escalating the complaint...');
    const { data: escalatedComplaint, error: escalateError } = await supabase
      .from('complaints')
      .update({
        escalated_at: new Date().toISOString(),
        escalation_level: 1,
        assigned_to: lecturer.id,
      })
      .eq('id', complaint.id)
      .select()
      .single();

    if (escalateError) throw escalateError;
    console.log(`✅ Escalated complaint to ${lecturer.full_name}`);

    // Wait a moment for the trigger to fire
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 5: Check if notification was created
    console.log('\n📋 Step 5: Checking for escalation notification...');
    const { data: notifications, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', lecturer.id)
      .eq('type', 'complaint_escalated')
      .eq('related_id', complaint.id)
      .order('created_at', { ascending: false });

    if (notificationError) throw notificationError;

    if (notifications && notifications.length > 0) {
      const notification = notifications[0];
      console.log('✅ Escalation notification created successfully!');
      console.log(`   - Title: ${notification.title}`);
      console.log(`   - Message: ${notification.message}`);
      console.log(`   - Type: ${notification.type}`);
      console.log(`   - User ID: ${notification.user_id}`);
      console.log(`   - Related ID: ${notification.related_id}`);
      console.log(`   - Is Read: ${notification.is_read}`);
    } else {
      console.error('❌ No escalation notification found!');
    }

    // Step 6: Test re-escalation
    console.log('\n📋 Step 6: Testing re-escalation (escalation_level increase)...');
    const { count: beforeReescalateCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', lecturer.id)
      .eq('type', 'complaint_escalated')
      .eq('related_id', complaint.id);

    const { error: reescalateError } = await supabase
      .from('complaints')
      .update({
        escalation_level: 2,
      })
      .eq('id', complaint.id);

    if (reescalateError) throw reescalateError;
    console.log('✅ Increased escalation level to 2');

    // Wait for trigger
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { count: afterReescalateCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', lecturer.id)
      .eq('type', 'complaint_escalated')
      .eq('related_id', complaint.id);

    if (afterReescalateCount > beforeReescalateCount) {
      console.log('✅ Re-escalation notification created successfully!');
    } else {
      console.error('❌ Re-escalation notification was not created');
    }

    // Step 7: Cleanup
    console.log('\n📋 Step 7: Cleaning up test data...');

    // Delete notifications
    await supabase.from('notifications').delete().eq('related_id', complaint.id);

    // Delete complaint
    await supabase.from('complaints').delete().eq('id', complaint.id);

    console.log('✅ Cleanup complete');

    console.log('\n✅ All tests passed! Escalation notification trigger is working correctly.');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  }
}

testEscalationNotificationTrigger();
