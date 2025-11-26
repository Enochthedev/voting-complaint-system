/**
 * Test script for feedback notification trigger
 * This script verifies that notifications are created when feedback is added to complaints
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFeedbackNotificationTrigger() {
  console.log('🧪 Testing Feedback Notification Trigger\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Get a test student and lecturer
    console.log('\n📋 Step 1: Finding test users...');

    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('role', 'student')
      .limit(1)
      .single();

    if (studentError || !student) {
      console.error('❌ No student found:', studentError?.message);
      return;
    }

    const { data: lecturer, error: lecturerError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('role', 'lecturer')
      .limit(1)
      .single();

    if (lecturerError || !lecturer) {
      console.error('❌ No lecturer found:', lecturerError?.message);
      return;
    }

    console.log(`✅ Found student: ${student.full_name} (${student.email})`);
    console.log(`✅ Found lecturer: ${lecturer.full_name} (${lecturer.email})`);

    // Step 2: Create a test complaint
    console.log('\n📋 Step 2: Creating test complaint...');

    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .insert({
        student_id: student.id,
        title: 'Test Complaint for Feedback Notification',
        description: 'This is a test complaint to verify feedback notifications',
        category: 'academic',
        priority: 'medium',
        status: 'new',
        is_draft: false,
        is_anonymous: false,
      })
      .select()
      .single();

    if (complaintError || !complaint) {
      console.error('❌ Failed to create complaint:', complaintError?.message);
      return;
    }

    console.log(`✅ Created complaint: ${complaint.title} (ID: ${complaint.id})`);

    // Step 3: Count notifications before adding feedback
    console.log('\n📋 Step 3: Counting notifications before feedback...');

    const { count: beforeCount, error: beforeCountError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', student.id)
      .eq('type', 'feedback_received');

    if (beforeCountError) {
      console.error('❌ Failed to count notifications:', beforeCountError.message);
      return;
    }

    console.log(`✅ Notifications before: ${beforeCount}`);

    // Step 4: Add feedback to the complaint
    console.log('\n📋 Step 4: Adding feedback to complaint...');

    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        complaint_id: complaint.id,
        lecturer_id: lecturer.id,
        content: 'This is test feedback to verify the notification trigger works correctly.',
      })
      .select()
      .single();

    if (feedbackError || !feedback) {
      console.error('❌ Failed to add feedback:', feedbackError?.message);
      return;
    }

    console.log(`✅ Added feedback (ID: ${feedback.id})`);

    // Step 5: Wait a moment for trigger to execute
    console.log('\n📋 Step 5: Waiting for trigger to execute...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 6: Check if notification was created
    console.log('\n📋 Step 6: Checking for new notification...');

    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', student.id)
      .eq('type', 'feedback_received')
      .eq('related_id', complaint.id)
      .order('created_at', { ascending: false });

    if (notificationsError) {
      console.error('❌ Failed to fetch notifications:', notificationsError.message);
      return;
    }

    const { count: afterCount, error: afterCountError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', student.id)
      .eq('type', 'feedback_received');

    if (afterCountError) {
      console.error('❌ Failed to count notifications:', afterCountError.message);
      return;
    }

    console.log(`✅ Notifications after: ${afterCount}`);

    // Step 7: Verify notification details
    if (notifications && notifications.length > 0) {
      const notification = notifications[0];
      console.log('\n📋 Step 7: Verifying notification details...');
      console.log(`✅ Notification ID: ${notification.id}`);
      console.log(`✅ Type: ${notification.type}`);
      console.log(`✅ Title: ${notification.title}`);
      console.log(`✅ Message: ${notification.message}`);
      console.log(`✅ Related ID: ${notification.related_id}`);
      console.log(`✅ Is Read: ${notification.is_read}`);
      console.log(`✅ Created At: ${notification.created_at}`);

      // Verify notification content
      const expectedTitle = 'You received feedback on your complaint';
      const expectedMessageStart = 'A lecturer has provided feedback on your complaint:';

      if (notification.title === expectedTitle) {
        console.log('✅ Notification title is correct');
      } else {
        console.log(
          `❌ Notification title mismatch. Expected: "${expectedTitle}", Got: "${notification.title}"`
        );
      }

      if (notification.message.startsWith(expectedMessageStart)) {
        console.log('✅ Notification message format is correct');
      } else {
        console.log(
          `❌ Notification message format incorrect. Expected to start with: "${expectedMessageStart}"`
        );
      }

      if (notification.related_id === complaint.id) {
        console.log('✅ Notification related_id matches complaint ID');
      } else {
        console.log(`❌ Notification related_id mismatch`);
      }

      if (notification.is_read === false) {
        console.log('✅ Notification is marked as unread');
      } else {
        console.log(`❌ Notification should be unread by default`);
      }
    } else {
      console.log('❌ No notification was created by the trigger!');
    }

    // Step 8: Cleanup test data
    console.log('\n📋 Step 8: Cleaning up test data...');

    await supabase.from('feedback').delete().eq('id', feedback.id);
    await supabase.from('notifications').delete().eq('related_id', complaint.id);
    await supabase.from('complaints').delete().eq('id', complaint.id);

    console.log('✅ Test data cleaned up');

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));

    if (afterCount > beforeCount && notifications && notifications.length > 0) {
      console.log('✅ SUCCESS: Feedback notification trigger is working correctly!');
      console.log(`   - Notification count increased from ${beforeCount} to ${afterCount}`);
      console.log(`   - Notification was created with correct details`);
    } else {
      console.log('❌ FAILURE: Feedback notification trigger did not work as expected');
      console.log(`   - Notification count: before=${beforeCount}, after=${afterCount}`);
    }
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error);
  }
}

// Run the test
testFeedbackNotificationTrigger()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
