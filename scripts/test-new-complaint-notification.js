/**
 * Test script for new complaint notification trigger
 *
 * This script tests that lecturers and admins receive notifications
 * when a new complaint is submitted (not a draft).
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testNewComplaintNotification() {
  console.log('🧪 Testing New Complaint Notification Trigger\n');

  try {
    // Step 1: Get all lecturers and admins
    console.log('📋 Step 1: Fetching lecturers and admins...');
    const { data: lecturers, error: lecturersError } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .in('role', ['lecturer', 'admin']);

    if (lecturersError) {
      console.error('❌ Error fetching lecturers:', lecturersError);
      return;
    }

    console.log(`✅ Found ${lecturers.length} lecturers/admins:`);
    lecturers.forEach((l) => console.log(`   - ${l.full_name} (${l.role}): ${l.email}`));
    console.log();

    // Step 2: Get a test student
    console.log('📋 Step 2: Fetching a test student...');
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('role', 'student')
      .limit(1);

    if (studentsError || !students || students.length === 0) {
      console.error('❌ Error fetching student or no students found:', studentsError);
      return;
    }

    const testStudent = students[0];
    console.log(`✅ Using test student: ${testStudent.full_name} (${testStudent.email})`);
    console.log();

    // Step 3: Count notifications before
    console.log('📋 Step 3: Counting notifications before complaint submission...');
    const { count: beforeCount, error: beforeCountError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'new_complaint');

    if (beforeCountError) {
      console.error('❌ Error counting notifications:', beforeCountError);
      return;
    }

    console.log(`✅ Current notification count: ${beforeCount}`);
    console.log();

    // Step 4: Create a new complaint (not draft)
    console.log('📋 Step 4: Creating a new complaint...');
    const testComplaint = {
      title: `Test Complaint - ${new Date().toISOString()}`,
      description: 'This is a test complaint to verify the notification trigger works correctly.',
      category: 'facilities',
      priority: 'medium',
      status: 'new',
      is_draft: false,
      is_anonymous: false,
      student_id: testStudent.id,
    };

    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .insert(testComplaint)
      .select()
      .single();

    if (complaintError) {
      console.error('❌ Error creating complaint:', complaintError);
      return;
    }

    console.log(`✅ Created complaint: ${complaint.title} (ID: ${complaint.id})`);
    console.log();

    // Step 5: Wait a moment for trigger to execute
    console.log('⏳ Waiting for trigger to execute...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log();

    // Step 6: Check for new notifications
    console.log('📋 Step 5: Checking for new notifications...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'new_complaint')
      .eq('related_id', complaint.id);

    if (notificationsError) {
      console.error('❌ Error fetching notifications:', notificationsError);
      return;
    }

    console.log(`✅ Found ${notifications.length} notifications for this complaint`);
    console.log();

    // Step 7: Verify notifications were created for all lecturers/admins
    console.log('📋 Step 6: Verifying notifications...');
    const lecturerIds = lecturers.map((l) => l.id);
    const notifiedUserIds = notifications.map((n) => n.user_id);

    const allNotified = lecturerIds.every((id) => notifiedUserIds.includes(id));

    if (allNotified && notifications.length === lecturers.length) {
      console.log('✅ SUCCESS: All lecturers and admins received notifications!');
      console.log();
      console.log('Notification details:');
      notifications.forEach((n) => {
        const user = lecturers.find((l) => l.id === n.user_id);
        console.log(`   - ${user.full_name} (${user.role})`);
        console.log(`     Title: ${n.title}`);
        console.log(`     Message: ${n.message}`);
        console.log(`     Read: ${n.is_read}`);
        console.log();
      });
    } else {
      console.log('❌ FAILURE: Not all lecturers/admins received notifications');
      console.log(`   Expected: ${lecturers.length} notifications`);
      console.log(`   Received: ${notifications.length} notifications`);

      const missingIds = lecturerIds.filter((id) => !notifiedUserIds.includes(id));
      if (missingIds.length > 0) {
        console.log('   Missing notifications for:');
        missingIds.forEach((id) => {
          const user = lecturers.find((l) => l.id === id);
          console.log(`     - ${user.full_name} (${user.role})`);
        });
      }
    }
    console.log();

    // Step 8: Verify complaint history was logged
    console.log('📋 Step 7: Checking complaint history...');
    const { data: history, error: historyError } = await supabase
      .from('complaint_history')
      .select('*')
      .eq('complaint_id', complaint.id)
      .eq('action', 'created');

    if (historyError) {
      console.error('❌ Error fetching history:', historyError);
      return;
    }

    if (history && history.length > 0) {
      console.log('✅ Complaint creation was logged in history');
      console.log(`   Action: ${history[0].action}`);
      console.log(`   Details: ${JSON.stringify(history[0].details, null, 2)}`);
    } else {
      console.log('❌ Complaint creation was NOT logged in history');
    }
    console.log();

    // Step 9: Test that draft complaints don't trigger notifications
    console.log('📋 Step 8: Testing draft complaint (should NOT trigger notification)...');
    const draftComplaint = {
      title: `Draft Test - ${new Date().toISOString()}`,
      description: 'This is a draft complaint that should not trigger notifications.',
      category: 'academic',
      priority: 'low',
      status: 'new', // Status is 'new' but is_draft is true
      is_draft: true,
      is_anonymous: false,
      student_id: testStudent.id,
    };

    const { data: draft, error: draftError } = await supabase
      .from('complaints')
      .insert(draftComplaint)
      .select()
      .single();

    if (draftError) {
      console.error('❌ Error creating draft:', draftError);
      return;
    }

    console.log(`✅ Created draft complaint: ${draft.title} (ID: ${draft.id})`);

    // Wait for potential trigger
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { data: draftNotifications, error: draftNotifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'new_complaint')
      .eq('related_id', draft.id);

    if (draftNotifError) {
      console.error('❌ Error checking draft notifications:', draftNotifError);
      return;
    }

    if (draftNotifications.length === 0) {
      console.log('✅ SUCCESS: Draft complaint did NOT trigger notifications (as expected)');
    } else {
      console.log('❌ FAILURE: Draft complaint triggered notifications (should not happen)');
      console.log(`   Found ${draftNotifications.length} unexpected notifications`);
    }
    console.log();

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await supabase.from('notifications').delete().eq('related_id', complaint.id);
    await supabase.from('complaint_history').delete().eq('complaint_id', complaint.id);
    await supabase.from('complaints').delete().eq('id', complaint.id);
    await supabase.from('complaint_history').delete().eq('complaint_id', draft.id);
    await supabase.from('complaints').delete().eq('id', draft.id);
    console.log('✅ Cleanup complete');
    console.log();

    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testNewComplaintNotification();
