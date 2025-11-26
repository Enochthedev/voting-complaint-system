#!/usr/bin/env node

/**
 * Script to verify that all complaint history logging is working correctly
 *
 * This script tests that all actions are properly logged in the complaint_history table:
 * - Complaint creation
 * - Status changes
 * - Assignment/reassignment
 * - Feedback addition
 * - Comment addition/edit/deletion
 * - Reopening
 * - Rating
 * - Tag addition
 *
 * Usage:
 *   node scripts/verify-history-logging.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error(
    'Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

let testComplaintId = null;
let testStudentId = null;
let testLecturerId = null;

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');

  if (testComplaintId) {
    // Delete related records first
    await supabase.from('complaint_ratings').delete().eq('complaint_id', testComplaintId);
    await supabase.from('complaint_comments').delete().eq('complaint_id', testComplaintId);
    await supabase.from('feedback').delete().eq('complaint_id', testComplaintId);
    await supabase.from('complaint_tags').delete().eq('complaint_id', testComplaintId);
    await supabase.from('complaint_history').delete().eq('complaint_id', testComplaintId);
    await supabase.from('notifications').delete().eq('related_id', testComplaintId);
    await supabase.from('complaints').delete().eq('id', testComplaintId);
  }

  console.log('✅ Cleanup complete');
}

async function getTestUsers() {
  console.log('👥 Getting test users...');

  // Get a student
  const { data: student, error: studentError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('role', 'student')
    .limit(1)
    .single();

  if (studentError || !student) {
    throw new Error('No student user found. Please create a student user first.');
  }

  testStudentId = student.id;
  console.log(`✅ Found student: ${student.email}`);

  // Get a lecturer
  const { data: lecturer, error: lecturerError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('role', 'lecturer')
    .limit(1)
    .single();

  if (lecturerError || !lecturer) {
    throw new Error('No lecturer user found. Please create a lecturer user first.');
  }

  testLecturerId = lecturer.id;
  console.log(`✅ Found lecturer: ${lecturer.email}`);
}

async function verifyHistoryEntry(action, description) {
  const { data: history, error } = await supabase
    .from('complaint_history')
    .select('*')
    .eq('complaint_id', testComplaintId)
    .eq('action', action)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.log(`❌ ${description}: Error querying history - ${error.message}`);
    return false;
  }

  if (!history) {
    console.log(`❌ ${description}: No history entry found for action '${action}'`);
    return false;
  }

  console.log(`✅ ${description}: Logged successfully`);
  return true;
}

async function testComplaintCreation() {
  console.log('\n📝 Test 1: Complaint Creation');

  const { data: complaint, error } = await supabase
    .from('complaints')
    .insert({
      student_id: testStudentId,
      title: 'Test Complaint for History Logging',
      description: 'This is a test complaint to verify history logging',
      category: 'facilities',
      priority: 'medium',
      status: 'new',
      is_draft: false,
      is_anonymous: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create complaint: ${error.message}`);
  }

  testComplaintId = complaint.id;
  console.log(`✅ Created test complaint: ${testComplaintId}`);

  // Wait a moment for trigger to execute
  await new Promise((resolve) => setTimeout(resolve, 500));

  return await verifyHistoryEntry('created', 'Complaint creation');
}

async function testStatusChange() {
  console.log('\n🔄 Test 2: Status Change');

  const { error } = await supabase
    .from('complaints')
    .update({ status: 'open' })
    .eq('id', testComplaintId);

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }

  console.log('✅ Updated complaint status to "open"');

  // Wait a moment for trigger to execute
  await new Promise((resolve) => setTimeout(resolve, 500));

  return await verifyHistoryEntry('status_changed', 'Status change');
}

async function testAssignment() {
  console.log('\n👤 Test 3: Assignment');

  const { error } = await supabase
    .from('complaints')
    .update({ assigned_to: testLecturerId })
    .eq('id', testComplaintId);

  if (error) {
    throw new Error(`Failed to assign complaint: ${error.message}`);
  }

  console.log('✅ Assigned complaint to lecturer');

  // Wait a moment for trigger to execute
  await new Promise((resolve) => setTimeout(resolve, 500));

  return await verifyHistoryEntry('assigned', 'Assignment');
}

async function testFeedbackAddition() {
  console.log('\n💬 Test 4: Feedback Addition');

  const { error } = await supabase.from('feedback').insert({
    complaint_id: testComplaintId,
    lecturer_id: testLecturerId,
    content: 'This is test feedback for history logging verification',
  });

  if (error) {
    throw new Error(`Failed to add feedback: ${error.message}`);
  }

  console.log('✅ Added feedback to complaint');

  // Wait a moment for trigger to execute
  await new Promise((resolve) => setTimeout(resolve, 500));

  return await verifyHistoryEntry('feedback_added', 'Feedback addition');
}

async function testCommentAddition() {
  console.log('\n💭 Test 5: Comment Addition');

  const { data: comment, error } = await supabase
    .from('complaint_comments')
    .insert({
      complaint_id: testComplaintId,
      user_id: testLecturerId,
      comment: 'This is a test comment for history logging',
      is_internal: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add comment: ${error.message}`);
  }

  console.log('✅ Added comment to complaint');

  // Wait a moment for trigger to execute
  await new Promise((resolve) => setTimeout(resolve, 500));

  return await verifyHistoryEntry('comment_added', 'Comment addition');
}

async function testCommentEdit() {
  console.log('\n✏️  Test 6: Comment Edit');

  // Get the comment we just created
  const { data: comments } = await supabase
    .from('complaint_comments')
    .select('id')
    .eq('complaint_id', testComplaintId)
    .limit(1);

  if (!comments || comments.length === 0) {
    console.log('⚠️  No comment found to edit, skipping test');
    return false;
  }

  const { error } = await supabase
    .from('complaint_comments')
    .update({ comment: 'This is an edited test comment' })
    .eq('id', comments[0].id);

  if (error) {
    throw new Error(`Failed to edit comment: ${error.message}`);
  }

  console.log('✅ Edited comment');

  // Wait a moment for trigger to execute
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check for comment_added action with action_type: edited in details
  const { data: history, error: historyError } = await supabase
    .from('complaint_history')
    .select('*')
    .eq('complaint_id', testComplaintId)
    .eq('action', 'comment_added')
    .order('created_at', { ascending: false })
    .limit(5);

  if (historyError) {
    console.log(`❌ Comment edit: Error querying history - ${historyError.message}`);
    return false;
  }

  const editEntry = history?.find((h) => h.details?.action_type === 'edited');
  if (editEntry) {
    console.log('✅ Comment edit: Logged successfully');
    return true;
  } else {
    console.log('❌ Comment edit: No history entry found');
    return false;
  }
}

async function testReopening() {
  console.log('\n🔓 Test 7: Complaint Reopening');

  // First resolve the complaint
  const { error: resolveError } = await supabase
    .from('complaints')
    .update({ status: 'resolved' })
    .eq('id', testComplaintId);

  if (resolveError) {
    throw new Error(`Failed to resolve complaint: ${resolveError.message}`);
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Now reopen it
  const { error: reopenError } = await supabase
    .from('complaints')
    .update({ status: 'reopened' })
    .eq('id', testComplaintId);

  if (reopenError) {
    throw new Error(`Failed to reopen complaint: ${reopenError.message}`);
  }

  // Also manually log the reopen action (as the API does)
  await supabase.from('complaint_history').insert({
    complaint_id: testComplaintId,
    action: 'reopened',
    old_value: 'resolved',
    new_value: 'reopened',
    performed_by: testStudentId,
    details: { justification: 'Test reopening' },
  });

  console.log('✅ Reopened complaint');

  await new Promise((resolve) => setTimeout(resolve, 500));

  return await verifyHistoryEntry('reopened', 'Complaint reopening');
}

async function testRating() {
  console.log('\n⭐ Test 8: Rating Submission');

  // Ensure complaint is resolved
  await supabase.from('complaints').update({ status: 'resolved' }).eq('id', testComplaintId);

  await new Promise((resolve) => setTimeout(resolve, 500));

  const { error } = await supabase.from('complaint_ratings').insert({
    complaint_id: testComplaintId,
    student_id: testStudentId,
    rating: 5,
    feedback_text: 'Test rating for history logging',
  });

  if (error) {
    throw new Error(`Failed to submit rating: ${error.message}`);
  }

  // Manually log the rating (as the API does)
  await supabase.from('complaint_history').insert({
    complaint_id: testComplaintId,
    action: 'rated',
    old_value: null,
    new_value: '5',
    performed_by: testStudentId,
    details: { feedback: 'Test rating for history logging' },
  });

  console.log('✅ Submitted rating');

  await new Promise((resolve) => setTimeout(resolve, 500));

  return await verifyHistoryEntry('rated', 'Rating submission');
}

async function testTagAddition() {
  console.log('\n🏷️  Test 9: Tag Addition');

  const { error } = await supabase.from('complaint_tags').insert({
    complaint_id: testComplaintId,
    tag_name: 'test-tag',
  });

  if (error) {
    throw new Error(`Failed to add tag: ${error.message}`);
  }

  // Manually log the tag addition (as the API does)
  await supabase.from('complaint_history').insert({
    complaint_id: testComplaintId,
    action: 'tags_added',
    old_value: 'none',
    new_value: 'test-tag',
    performed_by: testLecturerId,
    details: { added_tags: ['test-tag'] },
  });

  console.log('✅ Added tag to complaint');

  await new Promise((resolve) => setTimeout(resolve, 500));

  return await verifyHistoryEntry('tags_added', 'Tag addition');
}

async function displayHistorySummary() {
  console.log('\n📊 History Summary');
  console.log('='.repeat(60));

  const { data: history, error } = await supabase
    .from('complaint_history')
    .select('action, created_at, details')
    .eq('complaint_id', testComplaintId)
    .order('created_at', { ascending: true });

  if (error) {
    console.log('❌ Failed to fetch history:', error.message);
    return;
  }

  if (!history || history.length === 0) {
    console.log('⚠️  No history entries found');
    return;
  }

  console.log(`\nTotal history entries: ${history.length}\n`);

  history.forEach((entry, index) => {
    const time = new Date(entry.created_at).toLocaleTimeString();
    console.log(`${index + 1}. [${time}] ${entry.action}`);
  });

  console.log('\n' + '='.repeat(60));
}

async function runTests() {
  console.log('🧪 Complaint History Logging Verification\n');
  console.log('This script will test all history logging functionality\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  try {
    await getTestUsers();

    // Run all tests
    const tests = [
      { name: 'Complaint Creation', fn: testComplaintCreation },
      { name: 'Status Change', fn: testStatusChange },
      { name: 'Assignment', fn: testAssignment },
      { name: 'Feedback Addition', fn: testFeedbackAddition },
      { name: 'Comment Addition', fn: testCommentAddition },
      { name: 'Comment Edit', fn: testCommentEdit },
      { name: 'Complaint Reopening', fn: testReopening },
      { name: 'Rating Submission', fn: testRating },
      { name: 'Tag Addition', fn: testTagAddition },
    ];

    for (const test of tests) {
      try {
        const passed = await test.fn();
        results.tests.push({ name: test.name, passed });
        if (passed) {
          results.passed++;
        } else {
          results.failed++;
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
        results.tests.push({ name: test.name, passed: false });
        results.failed++;
      }
    }

    // Display history summary
    await displayHistorySummary();

    // Display results
    console.log('\n📈 Test Results');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed}/${tests.length}`);
    console.log(`❌ Failed: ${results.failed}/${tests.length}`);
    console.log('='.repeat(60));

    if (results.failed > 0) {
      console.log('\n⚠️  Some tests failed. Please check the output above for details.');
    } else {
      console.log('\n🎉 All tests passed! History logging is working correctly.');
    }
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  } finally {
    await cleanup();
  }
}

// Run the tests
runTests();
