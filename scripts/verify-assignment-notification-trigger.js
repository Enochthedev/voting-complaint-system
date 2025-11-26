/**
 * Verification script for assignment notification trigger
 * Tests that notifications are created when a complaint is assigned to a lecturer
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAssignmentNotificationTrigger() {
  console.log('🔍 Verifying Assignment Notification Trigger...\n');

  try {
    // Step 1: Get a test lecturer
    console.log('Step 1: Finding a lecturer...');
    const { data: lecturers, error: lecturerError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('role', 'lecturer')
      .limit(1);

    if (lecturerError) throw lecturerError;
    if (!lecturers || lecturers.length === 0) {
      console.log('❌ No lecturers found in database');
      return;
    }

    const lecturer = lecturers[0];
    console.log(`✅ Found lecturer: ${lecturer.full_name} (${lecturer.email})`);

    // Step 2: Get a test student
    console.log('\nStep 2: Finding a student...');
    const { data: students, error: studentError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('role', 'student')
      .limit(1);

    if (studentError) throw studentError;
    if (!students || students.length === 0) {
      console.log('❌ No students found in database');
      return;
    }

    const student = students[0];
    console.log(`✅ Found student: ${student.full_name} (${student.email})`);

    // Step 3: Create a test complaint
    console.log('\nStep 3: Creating a test complaint...');
    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .insert({
        title: 'Test Complaint for Assignment Notification',
        description: 'This is a test complaint to verify assignment notifications',
        category: 'academic',
        priority: 'medium',
        status: 'new',
        student_id: student.id,
        is_anonymous: false,
        is_draft: false,
      })
      .select()
      .single();

    if (complaintError) throw complaintError;
    console.log(`✅ Created complaint: ${complaint.title} (ID: ${complaint.id})`);

    // Step 4: Count notifications before assignment
    console.log('\nStep 4: Checking notifications before assignment...');
    const { data: notificationsBefore, error: notifBeforeError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', lecturer.id)
      .eq('type', 'assignment')
      .eq('related_id', complaint.id);

    if (notifBeforeError) throw notifBeforeError;
    console.log(`📊 Notifications before assignment: ${notificationsBefore.length}`);

    // Step 5: Assign the complaint to the lecturer
    console.log('\nStep 5: Assigning complaint to lecturer...');
    const { error: assignError } = await supabase
      .from('complaints')
      .update({ assigned_to: lecturer.id })
      .eq('id', complaint.id);

    if (assignError) throw assignError;
    console.log(`✅ Assigned complaint to ${lecturer.full_name}`);

    // Step 6: Wait a moment for trigger to execute
    console.log('\nStep 6: Waiting for trigger to execute...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 7: Check if notification was created
    console.log('\nStep 7: Checking for assignment notification...');
    const { data: notificationsAfter, error: notifAfterError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', lecturer.id)
      .eq('type', 'assignment')
      .eq('related_id', complaint.id);

    if (notifAfterError) throw notifAfterError;

    console.log(`📊 Notifications after assignment: ${notificationsAfter.length}`);

    if (notificationsAfter.length > notificationsBefore.length) {
      const newNotification = notificationsAfter[notificationsAfter.length - 1];
      console.log('\n✅ SUCCESS: Assignment notification was created!');
      console.log('\nNotification Details:');
      console.log(`  - ID: ${newNotification.id}`);
      console.log(`  - Type: ${newNotification.type}`);
      console.log(`  - Title: ${newNotification.title}`);
      console.log(`  - Message: ${newNotification.message}`);
      console.log(`  - Related ID: ${newNotification.related_id}`);
      console.log(`  - Is Read: ${newNotification.is_read}`);
      console.log(`  - Created At: ${newNotification.created_at}`);
    } else {
      console.log('\n❌ FAILURE: No assignment notification was created');
    }

    // Step 8: Check complaint history for assignment log
    console.log('\nStep 8: Checking complaint history...');
    const { data: history, error: historyError } = await supabase
      .from('complaint_history')
      .select('*')
      .eq('complaint_id', complaint.id)
      .eq('action', 'assigned');

    if (historyError) throw historyError;

    if (history && history.length > 0) {
      console.log('✅ Assignment was logged in complaint history');
      console.log(`  - Action: ${history[0].action}`);
      console.log(`  - New Value: ${history[0].new_value}`);
    } else {
      console.log('⚠️  No assignment history entry found');
    }

    // Step 9: Test reassignment
    console.log('\nStep 9: Testing reassignment notification...');
    const { data: anotherLecturer, error: anotherLecturerError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('role', 'lecturer')
      .neq('id', lecturer.id)
      .limit(1)
      .single();

    if (!anotherLecturerError && anotherLecturer) {
      console.log(`Found another lecturer: ${anotherLecturer.full_name}`);

      const { error: reassignError } = await supabase
        .from('complaints')
        .update({ assigned_to: anotherLecturer.id })
        .eq('id', complaint.id);

      if (reassignError) throw reassignError;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { data: reassignNotif, error: reassignNotifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', anotherLecturer.id)
        .eq('type', 'assignment')
        .eq('related_id', complaint.id);

      if (reassignNotifError) throw reassignNotifError;

      if (reassignNotif && reassignNotif.length > 0) {
        console.log('✅ Reassignment notification created successfully');
      } else {
        console.log('❌ Reassignment notification was not created');
      }
    } else {
      console.log('⚠️  Only one lecturer available, skipping reassignment test');
    }

    // Cleanup
    console.log('\nStep 10: Cleaning up test data...');
    await supabase.from('notifications').delete().eq('related_id', complaint.id);
    await supabase.from('complaint_history').delete().eq('complaint_id', complaint.id);
    await supabase.from('complaints').delete().eq('id', complaint.id);
    console.log('✅ Test data cleaned up');

    console.log('\n' + '='.repeat(60));
    console.log('✅ Assignment Notification Trigger Verification Complete!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Error during verification:', error.message);
    console.error(error);
  }
}

verifyAssignmentNotificationTrigger();
