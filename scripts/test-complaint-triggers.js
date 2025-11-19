/**
 * Test script for complaint triggers
 * This script tests that the triggers on the complaints table work correctly
 * 
 * Run with: node scripts/test-complaint-triggers.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testTriggers() {
  console.log('🧪 Testing Complaint Triggers\n');
  console.log('=' .repeat(50));

  try {
    // Step 1: Check if trigger functions exist
    console.log('\n📋 Step 1: Checking trigger functions...');
    const { data: functions, error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT proname as function_name
        FROM pg_proc
        WHERE proname IN (
          'log_complaint_status_change',
          'notify_student_on_status_change',
          'notify_lecturers_on_new_complaint',
          'log_complaint_creation',
          'log_complaint_assignment',
          'update_complaint_search_vector'
        )
        ORDER BY proname;
      `
    });

    if (funcError) {
      console.log('⚠️  Could not query functions directly. Checking via triggers...');
    } else {
      console.log('✅ Found trigger functions:', functions?.map(f => f.function_name).join(', '));
    }

    // Step 2: Check if triggers exist on complaints table
    console.log('\n📋 Step 2: Checking triggers on complaints table...');
    const { data: triggers, error: trigError } = await supabase
      .from('pg_trigger')
      .select('tgname')
      .eq('tgrelid', 'public.complaints'::regclass);

    if (trigError) {
      console.log('⚠️  Could not query triggers directly. Will test functionality instead.');
    }

    // Step 3: Create a test student user
    console.log('\n📋 Step 3: Creating test student user...');
    const testEmail = `test-student-${Date.now()}@example.com`;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        role: 'student',
        full_name: 'Test Student'
      }
    });

    if (authError) {
      console.error('❌ Failed to create test user:', authError.message);
      return;
    }

    const studentId = authData.user.id;
    console.log('✅ Created test student:', studentId);

    // Insert user into public.users table
    const { error: userInsertError } = await supabase
      .from('users')
      .insert({
        id: studentId,
        email: testEmail,
        role: 'student',
        full_name: 'Test Student'
      });

    if (userInsertError) {
      console.log('⚠️  User may already exist in users table');
    }

    // Step 4: Create a test lecturer user
    console.log('\n📋 Step 4: Creating test lecturer user...');
    const lecturerEmail = `test-lecturer-${Date.now()}@example.com`;
    const { data: lecturerAuthData, error: lecturerAuthError } = await supabase.auth.admin.createUser({
      email: lecturerEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        role: 'lecturer',
        full_name: 'Test Lecturer'
      }
    });

    if (lecturerAuthError) {
      console.error('❌ Failed to create test lecturer:', lecturerAuthError.message);
      return;
    }

    const lecturerId = lecturerAuthData.user.id;
    console.log('✅ Created test lecturer:', lecturerId);

    // Insert lecturer into public.users table
    const { error: lecturerInsertError } = await supabase
      .from('users')
      .insert({
        id: lecturerId,
        email: lecturerEmail,
        role: 'lecturer',
        full_name: 'Test Lecturer'
      });

    if (lecturerInsertError) {
      console.log('⚠️  Lecturer may already exist in users table');
    }

    // Step 5: Create a test complaint
    console.log('\n📋 Step 5: Creating test complaint...');
    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .insert({
        student_id: studentId,
        is_anonymous: false,
        is_draft: false,
        title: 'Test Complaint for Trigger Testing',
        description: 'This is a test complaint to verify triggers work correctly.',
        category: 'academic',
        priority: 'medium',
        status: 'new'
      })
      .select()
      .single();

    if (complaintError) {
      console.error('❌ Failed to create complaint:', complaintError.message);
      return;
    }

    console.log('✅ Created complaint:', complaint.id);

    // Wait a moment for triggers to fire
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 6: Check if history entry was created (log_complaint_creation trigger)
    console.log('\n📋 Step 6: Checking complaint history (creation log)...');
    const { data: historyEntries, error: historyError } = await supabase
      .from('complaint_history')
      .select('*')
      .eq('complaint_id', complaint.id)
      .eq('action', 'created');

    if (historyError) {
      console.error('❌ Failed to query history:', historyError.message);
    } else if (historyEntries && historyEntries.length > 0) {
      console.log('✅ History entry created:', historyEntries[0].action);
    } else {
      console.log('⚠️  No history entry found for complaint creation');
    }

    // Step 7: Check if lecturers were notified (notify_lecturers_on_new_complaint trigger)
    console.log('\n📋 Step 7: Checking lecturer notifications...');
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('related_id', complaint.id)
      .eq('type', 'new_complaint');

    if (notifError) {
      console.error('❌ Failed to query notifications:', notifError.message);
    } else if (notifications && notifications.length > 0) {
      console.log('✅ Lecturer notifications created:', notifications.length);
    } else {
      console.log('⚠️  No lecturer notifications found');
    }

    // Step 8: Update complaint status to test status change trigger
    console.log('\n📋 Step 8: Updating complaint status to "opened"...');
    const { error: updateError } = await supabase
      .from('complaints')
      .update({
        status: 'opened',
        opened_at: new Date().toISOString(),
        opened_by: lecturerId
      })
      .eq('id', complaint.id);

    if (updateError) {
      console.error('❌ Failed to update complaint:', updateError.message);
      return;
    }

    console.log('✅ Updated complaint status to "opened"');

    // Wait for triggers
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 9: Check if status change was logged
    console.log('\n📋 Step 9: Checking status change history...');
    const { data: statusHistory, error: statusHistoryError } = await supabase
      .from('complaint_history')
      .select('*')
      .eq('complaint_id', complaint.id)
      .eq('action', 'status_changed');

    if (statusHistoryError) {
      console.error('❌ Failed to query status history:', statusHistoryError.message);
    } else if (statusHistory && statusHistory.length > 0) {
      console.log('✅ Status change logged:', statusHistory[0].old_value, '->', statusHistory[0].new_value);
    } else {
      console.log('⚠️  No status change history found');
    }

    // Step 10: Check if student was notified of status change
    console.log('\n📋 Step 10: Checking student notification for status change...');
    const { data: studentNotifs, error: studentNotifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', studentId)
      .eq('related_id', complaint.id)
      .eq('type', 'complaint_opened');

    if (studentNotifError) {
      console.error('❌ Failed to query student notifications:', studentNotifError.message);
    } else if (studentNotifs && studentNotifs.length > 0) {
      console.log('✅ Student notified of complaint being opened');
    } else {
      console.log('⚠️  No student notification found');
    }

    // Step 11: Test assignment trigger
    console.log('\n📋 Step 11: Assigning complaint to lecturer...');
    const { error: assignError } = await supabase
      .from('complaints')
      .update({ assigned_to: lecturerId })
      .eq('id', complaint.id);

    if (assignError) {
      console.error('❌ Failed to assign complaint:', assignError.message);
    } else {
      console.log('✅ Assigned complaint to lecturer');
    }

    // Wait for triggers
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 12: Check assignment history
    console.log('\n📋 Step 12: Checking assignment history...');
    const { data: assignHistory, error: assignHistoryError } = await supabase
      .from('complaint_history')
      .select('*')
      .eq('complaint_id', complaint.id)
      .eq('action', 'assigned');

    if (assignHistoryError) {
      console.error('❌ Failed to query assignment history:', assignHistoryError.message);
    } else if (assignHistory && assignHistory.length > 0) {
      console.log('✅ Assignment logged in history');
    } else {
      console.log('⚠️  No assignment history found');
    }

    // Step 13: Check assignment notification
    console.log('\n📋 Step 13: Checking assignment notification...');
    const { data: assignNotifs, error: assignNotifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', lecturerId)
      .eq('related_id', complaint.id)
      .eq('type', 'complaint_assigned');

    if (assignNotifError) {
      console.error('❌ Failed to query assignment notifications:', assignNotifError.message);
    } else if (assignNotifs && assignNotifs.length > 0) {
      console.log('✅ Lecturer notified of assignment');
    } else {
      console.log('⚠️  No assignment notification found');
    }

    // Cleanup
    console.log('\n📋 Cleaning up test data...');
    await supabase.from('notifications').delete().eq('related_id', complaint.id);
    await supabase.from('complaint_history').delete().eq('complaint_id', complaint.id);
    await supabase.from('complaints').delete().eq('id', complaint.id);
    await supabase.auth.admin.deleteUser(studentId);
    await supabase.auth.admin.deleteUser(lecturerId);
    await supabase.from('users').delete().eq('id', studentId);
    await supabase.from('users').delete().eq('id', lecturerId);
    console.log('✅ Cleanup complete');

    console.log('\n' + '='.repeat(50));
    console.log('✅ Trigger testing complete!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error);
  }
}

// Run the tests
testTriggers().then(() => {
  console.log('\n✅ All tests completed');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
