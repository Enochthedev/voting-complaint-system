#!/usr/bin/env node

/**
 * Test script for comment notification trigger
 *
 * This script tests that notifications are created when:
 * 1. A comment is added to a complaint (student gets notified)
 * 2. A comment is added to a complaint (assigned lecturer gets notified)
 * 3. A comment is added to a complaint (other participants get notified)
 * 4. Internal notes do NOT trigger notifications
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

async function testCommentNotificationTrigger() {
  console.log('🧪 Testing Comment Notification Trigger\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Get test users
    console.log('\n📋 Step 1: Getting test users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .in('role', ['student', 'lecturer'])
      .limit(5);

    if (usersError) throw usersError;

    console.log(`Found ${users?.length || 0} users`);

    if (!users || users.length < 2) {
      throw new Error('Need at least 2 users (1 student, 1 lecturer) for testing');
    }

    const student = users.find((u) => u.role === 'student');
    const lecturers = users.filter((u) => u.role === 'lecturer');
    const lecturer1 = lecturers[0];
    const lecturer2 = lecturers[1];

    if (!student || !lecturer1) {
      console.log('Available users:', users);
      throw new Error('Need at least 1 student and 1 lecturer for testing');
    }

    console.log(`✅ Found student: ${student.email}`);
    console.log(`✅ Found lecturer 1: ${lecturer1.email}`);
    if (lecturer2) console.log(`✅ Found lecturer 2: ${lecturer2.email}`);

    // Step 2: Create a test complaint
    console.log('\n📋 Step 2: Creating test complaint...');
    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .insert({
        title: 'Test Complaint for Comment Notifications',
        description: 'Testing comment notification trigger',
        category: 'academic',
        priority: 'medium',
        status: 'new',
        student_id: student.id,
        assigned_to: lecturer1.id,
        is_draft: false,
        is_anonymous: false,
      })
      .select()
      .single();

    if (complaintError) throw complaintError;
    console.log(`✅ Created complaint: ${complaint.id}`);

    // Step 3: Clear existing notifications for test users
    console.log('\n📋 Step 3: Clearing existing notifications...');
    await supabase
      .from('notifications')
      .delete()
      .in('user_id', [student.id, lecturer1.id, lecturer2?.id].filter(Boolean));
    console.log('✅ Cleared notifications');

    // Test Case 1: Lecturer comments - student should be notified
    console.log('\n📋 Test Case 1: Lecturer comments on complaint...');
    const { data: comment1, error: comment1Error } = await supabase
      .from('complaint_comments')
      .insert({
        complaint_id: complaint.id,
        user_id: lecturer1.id,
        comment: 'This is a test comment from lecturer',
        is_internal: false,
      })
      .select()
      .single();

    if (comment1Error) throw comment1Error;
    console.log(`✅ Created comment: ${comment1.id}`);

    // Wait a moment for trigger to execute
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if student received notification
    const { data: studentNotifications1, error: notif1Error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', student.id)
      .eq('type', 'comment_added')
      .eq('related_id', complaint.id);

    if (notif1Error) throw notif1Error;

    if (studentNotifications1 && studentNotifications1.length > 0) {
      console.log('✅ Student received notification');
      console.log(`   Title: ${studentNotifications1[0].title}`);
      console.log(`   Message: ${studentNotifications1[0].message}`);
    } else {
      console.log('❌ Student did NOT receive notification');
    }

    // Test Case 2: Student comments - assigned lecturer should be notified
    console.log('\n📋 Test Case 2: Student comments on complaint...');
    const { data: comment2, error: comment2Error } = await supabase
      .from('complaint_comments')
      .insert({
        complaint_id: complaint.id,
        user_id: student.id,
        comment: 'This is a test comment from student',
        is_internal: false,
      })
      .select()
      .single();

    if (comment2Error) throw comment2Error;
    console.log(`✅ Created comment: ${comment2.id}`);

    // Wait a moment for trigger to execute
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if lecturer received notification
    const { data: lecturerNotifications, error: notif2Error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', lecturer1.id)
      .eq('type', 'comment_added')
      .eq('related_id', complaint.id);

    if (notif2Error) throw notif2Error;

    if (lecturerNotifications && lecturerNotifications.length > 0) {
      console.log('✅ Assigned lecturer received notification');
      console.log(`   Title: ${lecturerNotifications[0].title}`);
      console.log(`   Message: ${lecturerNotifications[0].message}`);
    } else {
      console.log('❌ Assigned lecturer did NOT receive notification');
    }

    // Test Case 3: Another lecturer comments - both student and first lecturer should be notified
    if (lecturer2) {
      console.log('\n📋 Test Case 3: Another lecturer comments...');

      // Clear previous notifications
      await supabase.from('notifications').delete().in('user_id', [student.id, lecturer1.id]);

      const { data: comment3, error: comment3Error } = await supabase
        .from('complaint_comments')
        .insert({
          complaint_id: complaint.id,
          user_id: lecturer2.id,
          comment: 'This is a test comment from another lecturer',
          is_internal: false,
        })
        .select()
        .single();

      if (comment3Error) throw comment3Error;
      console.log(`✅ Created comment: ${comment3.id}`);

      // Wait a moment for trigger to execute
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check notifications
      const { data: allNotifications, error: notif3Error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'comment_added')
        .eq('related_id', complaint.id)
        .in('user_id', [student.id, lecturer1.id]);

      if (notif3Error) throw notif3Error;

      const studentNotified = allNotifications?.some((n) => n.user_id === student.id);
      const lecturer1Notified = allNotifications?.some((n) => n.user_id === lecturer1.id);

      console.log(`${studentNotified ? '✅' : '❌'} Student received notification`);
      console.log(`${lecturer1Notified ? '✅' : '❌'} First lecturer received notification`);
    }

    // Test Case 4: Internal note should NOT trigger notifications
    console.log('\n📋 Test Case 4: Internal note (should NOT notify)...');

    // Clear previous notifications
    await supabase.from('notifications').delete().in('user_id', [student.id, lecturer1.id]);

    const { data: internalNote, error: internalError } = await supabase
      .from('complaint_comments')
      .insert({
        complaint_id: complaint.id,
        user_id: lecturer1.id,
        comment: 'This is an internal note',
        is_internal: true,
      })
      .select()
      .single();

    if (internalError) throw internalError;
    console.log(`✅ Created internal note: ${internalNote.id}`);

    // Wait a moment for trigger to execute
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check that NO notifications were created
    const { data: internalNotifications, error: notif4Error } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'comment_added')
      .eq('related_id', complaint.id);

    if (notif4Error) throw notif4Error;

    if (!internalNotifications || internalNotifications.length === 0) {
      console.log('✅ No notifications created for internal note (correct behavior)');
    } else {
      console.log('❌ Notifications were created for internal note (incorrect behavior)');
    }

    // Cleanup
    console.log('\n📋 Cleanup: Removing test data...');
    await supabase.from('complaint_comments').delete().eq('complaint_id', complaint.id);
    await supabase.from('notifications').delete().eq('related_id', complaint.id);
    await supabase.from('complaints').delete().eq('id', complaint.id);
    console.log('✅ Cleanup complete');

    console.log('\n' + '='.repeat(60));
    console.log('✅ Comment notification trigger test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCommentNotificationTrigger();
