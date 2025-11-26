/**
 * Test script for announcement notification trigger
 *
 * This script tests that:
 * 1. When a lecturer creates an announcement, all students receive notifications
 * 2. The notification has the correct type, title, and message
 * 3. The notification is linked to the announcement via related_id
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

async function testAnnouncementNotificationTrigger() {
  console.log('🧪 Testing Announcement Notification Trigger\n');

  try {
    // Step 1: Get a lecturer user
    console.log('📋 Step 1: Finding a lecturer user...');
    const { data: lecturers, error: lecturerError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('role', 'lecturer')
      .limit(1);

    if (lecturerError) throw lecturerError;
    if (!lecturers || lecturers.length === 0) {
      console.error('❌ No lecturer found. Please create a lecturer user first.');
      return;
    }

    const lecturer = lecturers[0];
    console.log(`✅ Found lecturer: ${lecturer.full_name} (${lecturer.email})`);

    // Step 2: Get all student users
    console.log('\n📋 Step 2: Finding student users...');
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('role', 'student');

    if (studentsError) throw studentsError;
    if (!students || students.length === 0) {
      console.error('❌ No students found. Please create student users first.');
      return;
    }

    console.log(`✅ Found ${students.length} student(s)`);
    students.forEach((s) => console.log(`   - ${s.full_name} (${s.email})`));

    // Step 3: Count existing notifications for students
    console.log('\n📋 Step 3: Counting existing notifications...');
    const { count: beforeCount, error: beforeCountError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'new_announcement')
      .in(
        'user_id',
        students.map((s) => s.id)
      );

    if (beforeCountError) throw beforeCountError;
    console.log(`✅ Students have ${beforeCount} existing announcement notifications`);

    // Step 4: Create a new announcement
    console.log('\n📋 Step 4: Creating a new announcement...');
    const announcementTitle = `Test Announcement ${Date.now()}`;
    const announcementContent =
      'This is a test announcement to verify the notification trigger works correctly.';

    const { data: announcement, error: announcementError } = await supabase
      .from('announcements')
      .insert({
        created_by: lecturer.id,
        title: announcementTitle,
        content: announcementContent,
      })
      .select()
      .single();

    if (announcementError) throw announcementError;
    console.log(`✅ Created announcement: "${announcement.title}" (ID: ${announcement.id})`);

    // Step 5: Wait a moment for the trigger to execute
    console.log('\n⏳ Waiting for trigger to execute...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 6: Check if notifications were created for all students
    console.log('\n📋 Step 5: Checking for new notifications...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'new_announcement')
      .eq('related_id', announcement.id)
      .order('created_at', { ascending: false });

    if (notificationsError) throw notificationsError;

    console.log(`✅ Found ${notifications.length} notification(s) for the new announcement`);

    // Step 7: Verify notifications
    console.log('\n📋 Step 6: Verifying notifications...');

    let allCorrect = true;

    // Check if all students received a notification
    if (notifications.length !== students.length) {
      console.error(
        `❌ Expected ${students.length} notifications, but found ${notifications.length}`
      );
      allCorrect = false;
    } else {
      console.log(`✅ All ${students.length} students received a notification`);
    }

    // Check each notification
    for (const notification of notifications) {
      const student = students.find((s) => s.id === notification.user_id);

      if (!student) {
        console.error(`❌ Notification sent to non-student user: ${notification.user_id}`);
        allCorrect = false;
        continue;
      }

      console.log(`\n   Notification for ${student.full_name}:`);
      console.log(`   - Type: ${notification.type}`);
      console.log(`   - Title: ${notification.title}`);
      console.log(`   - Message: ${notification.message}`);
      console.log(`   - Related ID: ${notification.related_id}`);
      console.log(`   - Is Read: ${notification.is_read}`);

      // Verify notification properties
      if (notification.type !== 'new_announcement') {
        console.error(`   ❌ Wrong type: expected 'new_announcement', got '${notification.type}'`);
        allCorrect = false;
      }

      if (notification.related_id !== announcement.id) {
        console.error(
          `   ❌ Wrong related_id: expected '${announcement.id}', got '${notification.related_id}'`
        );
        allCorrect = false;
      }

      if (!notification.message.includes(announcementTitle)) {
        console.error(`   ❌ Message doesn't include announcement title`);
        allCorrect = false;
      }

      if (notification.is_read !== false) {
        console.error(`   ❌ Notification should be unread by default`);
        allCorrect = false;
      }

      if (allCorrect) {
        console.log(`   ✅ Notification is correct`);
      }
    }

    // Step 8: Clean up - delete the test announcement and notifications
    console.log('\n📋 Step 7: Cleaning up test data...');

    const { error: deleteNotificationsError } = await supabase
      .from('notifications')
      .delete()
      .eq('related_id', announcement.id);

    if (deleteNotificationsError) {
      console.error('⚠️  Failed to delete test notifications:', deleteNotificationsError.message);
    } else {
      console.log('✅ Deleted test notifications');
    }

    const { error: deleteAnnouncementError } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcement.id);

    if (deleteAnnouncementError) {
      console.error('⚠️  Failed to delete test announcement:', deleteAnnouncementError.message);
    } else {
      console.log('✅ Deleted test announcement');
    }

    // Final result
    console.log('\n' + '='.repeat(60));
    if (allCorrect) {
      console.log('✅ ALL TESTS PASSED');
      console.log('The announcement notification trigger is working correctly!');
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('Please review the errors above.');
    }
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error);
  }
}

// Run the test
testAnnouncementNotificationTrigger();
