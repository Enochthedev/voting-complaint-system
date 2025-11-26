/**
 * Test script for new vote notification trigger
 *
 * This script tests that:
 * 1. When a new active vote is created, all students receive a notification
 * 2. The notification has the correct type, title, message, and related_id
 * 3. Inactive votes do not trigger notifications
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testNewVoteNotificationTrigger() {
  console.log('🧪 Testing New Vote Notification Trigger\n');

  try {
    // Step 1: Get all students
    console.log('📋 Step 1: Getting all students...');
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('role', 'student');

    if (studentsError) throw studentsError;
    console.log(`✅ Found ${students.length} students\n`);

    if (students.length === 0) {
      console.log('⚠️  No students found in database. Please create test students first.');
      return;
    }

    // Step 2: Get a lecturer to create the vote
    console.log('📋 Step 2: Getting a lecturer...');
    const { data: lecturers, error: lecturersError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('role', 'lecturer')
      .limit(1);

    if (lecturersError) throw lecturersError;

    if (!lecturers || lecturers.length === 0) {
      console.log('⚠️  No lecturers found. Creating a test lecturer...');
      // Create a test lecturer
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'test-lecturer-vote@test.com',
        password: 'TestPassword123!',
        email_confirm: true,
        user_metadata: {
          role: 'lecturer',
          full_name: 'Test Lecturer for Vote',
        },
      });

      if (authError) throw authError;

      const lecturer = {
        id: authData.user.id,
        email: 'test-lecturer-vote@test.com',
        full_name: 'Test Lecturer for Vote',
      };

      console.log(`✅ Created test lecturer: ${lecturer.email}\n`);
      lecturers.push(lecturer);
    } else {
      console.log(`✅ Using lecturer: ${lecturers[0].email}\n`);
    }

    const lecturer = lecturers[0];

    // Step 3: Count notifications before creating vote
    console.log('📋 Step 3: Counting notifications before vote creation...');
    const { count: beforeCount, error: beforeCountError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'new_vote');

    if (beforeCountError) throw beforeCountError;
    console.log(`✅ Current new_vote notifications: ${beforeCount}\n`);

    // Step 4: Create a new active vote
    console.log('📋 Step 4: Creating a new active vote...');
    const testVote = {
      created_by: lecturer.id,
      title: 'Test Vote - Should Library Hours Be Extended?',
      description: 'This is a test vote to verify notification triggers work correctly.',
      options: ['Yes, extend hours', 'No, keep current hours', 'I have no preference'],
      is_active: true,
      closes_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    };

    const { data: newVote, error: voteError } = await supabase
      .from('votes')
      .insert(testVote)
      .select()
      .single();

    if (voteError) throw voteError;
    console.log(`✅ Created vote: ${newVote.title}`);
    console.log(`   Vote ID: ${newVote.id}\n`);

    // Step 5: Wait a moment for trigger to execute
    console.log('⏳ Waiting for trigger to execute...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 6: Check if notifications were created
    console.log('📋 Step 5: Checking for new notifications...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'new_vote')
      .eq('related_id', newVote.id);

    if (notificationsError) throw notificationsError;

    console.log(`✅ Found ${notifications.length} notifications for the new vote\n`);

    // Step 7: Verify notifications
    console.log('📋 Step 6: Verifying notifications...');

    if (notifications.length !== students.length) {
      console.log(
        `❌ Expected ${students.length} notifications (one per student), but found ${notifications.length}`
      );
    } else {
      console.log(`✅ Correct number of notifications created (${notifications.length})`);
    }

    // Check that all students received a notification
    const notifiedStudentIds = new Set(notifications.map((n) => n.user_id));
    const allStudentsNotified = students.every((s) => notifiedStudentIds.has(s.id));

    if (allStudentsNotified) {
      console.log('✅ All students received a notification');
    } else {
      console.log('❌ Not all students received a notification');
      const missingStudents = students.filter((s) => !notifiedStudentIds.has(s.id));
      console.log(
        '   Missing notifications for:',
        missingStudents.map((s) => s.email)
      );
    }

    // Verify notification content
    const sampleNotification = notifications[0];
    console.log('\n📋 Sample notification:');
    console.log(`   Type: ${sampleNotification.type}`);
    console.log(`   Title: ${sampleNotification.title}`);
    console.log(`   Message: ${sampleNotification.message}`);
    console.log(`   Related ID: ${sampleNotification.related_id}`);
    console.log(`   Is Read: ${sampleNotification.is_read}`);

    const contentCorrect =
      sampleNotification.type === 'new_vote' &&
      sampleNotification.title === 'New vote available' &&
      sampleNotification.message.includes(newVote.title) &&
      sampleNotification.related_id === newVote.id &&
      sampleNotification.is_read === false;

    if (contentCorrect) {
      console.log('✅ Notification content is correct\n');
    } else {
      console.log('❌ Notification content is incorrect\n');
    }

    // Step 8: Test that inactive votes don't trigger notifications
    console.log('📋 Step 7: Testing inactive vote (should NOT create notifications)...');
    const inactiveVote = {
      created_by: lecturer.id,
      title: 'Test Inactive Vote - Should Not Notify',
      description: 'This inactive vote should not trigger notifications.',
      options: ['Option 1', 'Option 2'],
      is_active: false,
    };

    const { data: inactiveVoteData, error: inactiveVoteError } = await supabase
      .from('votes')
      .insert(inactiveVote)
      .select()
      .single();

    if (inactiveVoteError) throw inactiveVoteError;

    // Wait for potential trigger
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check for notifications
    const { data: inactiveNotifications, error: inactiveNotifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'new_vote')
      .eq('related_id', inactiveVoteData.id);

    if (inactiveNotifError) throw inactiveNotifError;

    if (inactiveNotifications.length === 0) {
      console.log('✅ Inactive vote correctly did NOT trigger notifications\n');
    } else {
      console.log(
        `❌ Inactive vote incorrectly created ${inactiveNotifications.length} notifications\n`
      );
    }

    // Step 9: Cleanup
    console.log('🧹 Cleaning up test data...');

    // Delete notifications
    await supabase.from('notifications').delete().eq('related_id', newVote.id);

    await supabase.from('notifications').delete().eq('related_id', inactiveVoteData.id);

    // Delete votes
    await supabase.from('votes').delete().eq('id', newVote.id);
    await supabase.from('votes').delete().eq('id', inactiveVoteData.id);

    console.log('✅ Cleanup complete\n');

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(
      `✅ Trigger creates notifications for active votes: ${notifications.length === students.length ? 'PASS' : 'FAIL'}`
    );
    console.log(`✅ All students receive notifications: ${allStudentsNotified ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Notification content is correct: ${contentCorrect ? 'PASS' : 'FAIL'}`);
    console.log(
      `✅ Inactive votes don't trigger notifications: ${inactiveNotifications.length === 0 ? 'PASS' : 'FAIL'}`
    );
    console.log('═══════════════════════════════════════════════════════════\n');

    const allTestsPassed =
      notifications.length === students.length &&
      allStudentsNotified &&
      contentCorrect &&
      inactiveNotifications.length === 0;

    if (allTestsPassed) {
      console.log('🎉 All tests passed! The new vote notification trigger is working correctly.\n');
    } else {
      console.log('⚠️  Some tests failed. Please review the trigger implementation.\n');
    }
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error(error);
  }
}

// Run the test
testNewVoteNotificationTrigger();
