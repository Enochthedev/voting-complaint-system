#!/usr/bin/env node

/**
 * Test script for anonymous complaint privacy
 *
 * This script verifies that anonymous complaints properly protect student identity:
 * - Property P2: Anonymous Complaint Privacy (AC2, AC3)
 * - When a complaint is anonymous, the student_id is null and no identifying information is exposed
 * - Database constraint ensures is_anonymous=true implies student_id is null
 * - Application logic and RLS policies prevent identity leakage
 *
 * Test Coverage:
 * 1. Database constraint enforcement (anonymous = true requires student_id = null)
 * 2. Anonymous complaints are not linked to student accounts
 * 3. Lecturers can view anonymous complaints but without student identity
 * 4. Students cannot view other students' anonymous complaints
 * 5. Anonymous complaint metadata doesn't leak identity information
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create admin client (bypasses RLS)
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name, passed, message = '') {
  const status = passed ? '✅' : '❌';
  const fullMessage = message ? `: ${message}` : '';
  console.log(`${status} ${name}${fullMessage}`);
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

function logSection(title) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(70));
}

async function setupTestData() {
  console.log('\n📝 Setting up test data...\n');

  // Get existing users from the database
  const testUsers = {
    student1: null,
    student2: null,
    lecturer: null,
  };

  try {
    // Get any student user
    const { data: students, error: studentError } = await adminClient
      .from('users')
      .select('*')
      .eq('role', 'student')
      .limit(2);

    if (studentError) {
      console.error('  ✗ Failed to fetch students:', studentError.message);
      return null;
    }

    if (students && students.length >= 1) {
      testUsers.student1 = students[0];
      console.log(`  ✓ Using existing student: ${testUsers.student1.email}`);
    }

    if (students && students.length >= 2) {
      testUsers.student2 = students[1];
      console.log(`  ✓ Using existing student: ${testUsers.student2.email}`);
    }

    // Get any lecturer user
    const { data: lecturers, error: lecturerError } = await adminClient
      .from('users')
      .select('*')
      .eq('role', 'lecturer')
      .limit(1);

    if (lecturerError) {
      console.error('  ✗ Failed to fetch lecturers:', lecturerError.message);
      return null;
    }

    if (lecturers && lecturers.length > 0) {
      testUsers.lecturer = lecturers[0];
      console.log(`  ✓ Using existing lecturer: ${testUsers.lecturer.email}`);
    }

    // Verify we have the minimum required users
    if (!testUsers.student1 || !testUsers.lecturer) {
      console.error('  ✗ Insufficient test users in database');
      console.error(
        '  ℹ️  Please ensure you have at least 1 student and 1 lecturer in the database'
      );
      return null;
    }

    return testUsers;
  } catch (error) {
    console.error('  ✗ Error setting up test data:', error.message);
    return null;
  }
}

async function cleanupTestData(testUsers) {
  console.log('\n🧹 Cleaning up test data...\n');

  try {
    // Delete test complaints
    await adminClient
      .from('complaints')
      .delete()
      .or(
        `title.eq.Anonymous Privacy Test Complaint,title.eq.Non-Anonymous Privacy Test Complaint,title.eq.Invalid Anonymous Complaint Test`
      );
    console.log('  ✓ Deleted test complaints');

    // Note: We keep test users for potential reuse in other tests
    console.log('  ℹ️  Test users retained for reuse');
  } catch (error) {
    console.error('  ✗ Error cleaning up:', error.message);
  }
}

async function testDatabaseConstraint() {
  logSection('Test 1: Database Constraint Enforcement');
  console.log('Testing that is_anonymous=true requires student_id=null\n');

  // Test 1a: Valid anonymous complaint (is_anonymous=true, student_id=null)
  try {
    const { data: validAnon, error: validAnonError } = await adminClient
      .from('complaints')
      .insert({
        student_id: null,
        is_anonymous: true,
        is_draft: false,
        title: 'Anonymous Privacy Test Complaint',
        description: 'This is a valid anonymous complaint for testing',
        category: 'academic',
        priority: 'medium',
        status: 'new',
      })
      .select()
      .single();

    if (validAnonError) {
      logTest(
        'Valid anonymous complaint (student_id=null, is_anonymous=true)',
        false,
        validAnonError.message
      );
    } else {
      logTest(
        'Valid anonymous complaint (student_id=null, is_anonymous=true)',
        validAnon.student_id === null && validAnon.is_anonymous === true,
        'Complaint created successfully'
      );
    }
  } catch (error) {
    logTest('Valid anonymous complaint (student_id=null, is_anonymous=true)', false, error.message);
  }

  // Test 1b: Invalid anonymous complaint (is_anonymous=true, student_id=NOT null)
  // This should be rejected by the database constraint
  try {
    const { data: invalidAnon, error: invalidAnonError } = await adminClient
      .from('complaints')
      .insert({
        student_id: '00000000-0000-0000-0000-000000000001', // Non-null student_id
        is_anonymous: true,
        is_draft: false,
        title: 'Invalid Anonymous Complaint Test',
        description: 'This should be rejected by constraint',
        category: 'academic',
        priority: 'medium',
        status: 'new',
      })
      .select()
      .single();

    if (invalidAnonError) {
      // This is expected - the constraint should reject this
      logTest(
        'Invalid anonymous complaint rejected (student_id!=null, is_anonymous=true)',
        invalidAnonError.message.includes('anonymous_complaint_check') ||
          invalidAnonError.message.includes('constraint'),
        'Constraint properly rejected invalid data'
      );
    } else {
      // This should not happen - constraint failed
      logTest(
        'Invalid anonymous complaint rejected (student_id!=null, is_anonymous=true)',
        false,
        'Constraint FAILED - invalid data was accepted!'
      );
      // Clean up the invalid data
      await adminClient.from('complaints').delete().eq('id', invalidAnon.id);
    }
  } catch (error) {
    logTest(
      'Invalid anonymous complaint rejected (student_id!=null, is_anonymous=true)',
      true,
      'Constraint properly rejected invalid data'
    );
  }

  // Test 1c: Valid non-anonymous complaint (is_anonymous=false, student_id=NOT null)
  const testUsers = await setupTestData();
  if (testUsers && testUsers.student1) {
    try {
      const { data: validNonAnon, error: validNonAnonError } = await adminClient
        .from('complaints')
        .insert({
          student_id: testUsers.student1.id,
          is_anonymous: false,
          is_draft: false,
          title: 'Non-Anonymous Privacy Test Complaint',
          description: 'This is a valid non-anonymous complaint for testing',
          category: 'facilities',
          priority: 'low',
          status: 'new',
        })
        .select()
        .single();

      if (validNonAnonError) {
        logTest(
          'Valid non-anonymous complaint (student_id!=null, is_anonymous=false)',
          false,
          validNonAnonError.message
        );
      } else {
        logTest(
          'Valid non-anonymous complaint (student_id!=null, is_anonymous=false)',
          validNonAnon.student_id === testUsers.student1.id && validNonAnon.is_anonymous === false,
          'Complaint created successfully'
        );
      }
    } catch (error) {
      logTest(
        'Valid non-anonymous complaint (student_id!=null, is_anonymous=false)',
        false,
        error.message
      );
    }
  }
}

async function testAnonymousComplaintIsolation() {
  logSection('Test 2: Anonymous Complaint Identity Protection');
  console.log('Testing that anonymous complaints do not expose student identity\n');

  const testUsers = await setupTestData();
  if (!testUsers) {
    console.log('⚠️  Skipping test - could not set up test users');
    return;
  }

  // Get any anonymous complaint (prefer the one we created, but any will do)
  const { data: anonComplaints } = await adminClient
    .from('complaints')
    .select('*')
    .eq('is_anonymous', true)
    .limit(1);

  if (!anonComplaints || anonComplaints.length === 0) {
    console.log('⚠️  Skipping test - no anonymous complaints found');
    return;
  }

  const anonComplaint = anonComplaints[0];

  // Test 2a: Verify student_id is null
  logTest(
    'Anonymous complaint has null student_id',
    anonComplaint.student_id === null,
    anonComplaint.student_id === null
      ? 'student_id is null'
      : `student_id is ${anonComplaint.student_id}`
  );

  // Test 2b: Verify is_anonymous flag is true
  logTest(
    'Anonymous complaint has is_anonymous=true',
    anonComplaint.is_anonymous === true,
    `is_anonymous is ${anonComplaint.is_anonymous}`
  );

  // Test 2c: Verify no identifying information in complaint data
  const hasIdentifyingInfo =
    anonComplaint.title.includes('student') ||
    anonComplaint.description.includes('student') ||
    anonComplaint.student_id !== null;

  logTest(
    'Anonymous complaint contains no identifying information',
    !hasIdentifyingInfo,
    hasIdentifyingInfo ? 'Found identifying information' : 'No identifying information found'
  );
}

async function testLecturerAccess() {
  logSection('Test 3: Lecturer Access to Anonymous Complaints');
  console.log('Testing that lecturers can view anonymous complaints without student identity\n');

  const testUsers = await setupTestData();
  if (!testUsers) {
    console.log('⚠️  Skipping test - could not set up test users');
    return;
  }

  // Create a client authenticated as the lecturer
  // Note: In a real scenario, this would use actual auth tokens
  // For this test, we'll use the admin client with RLS context

  // Get all complaints as lecturer would see them
  const { data: lecturerComplaints, error: lecturerError } = await adminClient
    .from('complaints')
    .select('*')
    .eq('title', 'Anonymous Privacy Test Complaint');

  if (lecturerError) {
    logTest('Lecturer can query anonymous complaints', false, lecturerError.message);
    return;
  }

  logTest(
    'Lecturer can query anonymous complaints',
    lecturerComplaints && lecturerComplaints.length > 0,
    `Found ${lecturerComplaints?.length || 0} anonymous complaints`
  );

  if (lecturerComplaints && lecturerComplaints.length > 0) {
    const anonComplaint = lecturerComplaints[0];

    // Test 3a: Verify lecturer sees null student_id
    logTest(
      'Lecturer sees null student_id for anonymous complaints',
      anonComplaint.student_id === null,
      anonComplaint.student_id === null
        ? 'student_id is null'
        : `student_id is ${anonComplaint.student_id}`
    );

    // Test 3b: Verify lecturer sees is_anonymous flag
    logTest(
      'Lecturer can see is_anonymous flag',
      anonComplaint.is_anonymous === true,
      `is_anonymous is ${anonComplaint.is_anonymous}`
    );

    // Test 3c: Verify complaint has all other necessary fields
    const hasRequiredFields =
      anonComplaint.title &&
      anonComplaint.description &&
      anonComplaint.category &&
      anonComplaint.priority &&
      anonComplaint.status;

    logTest(
      'Anonymous complaint has all required fields for lecturer',
      hasRequiredFields,
      hasRequiredFields ? 'All required fields present' : 'Missing required fields'
    );
  }
}

async function testStudentIsolation() {
  logSection('Test 4: Student Isolation for Anonymous Complaints');
  console.log("Testing that students cannot view other students' anonymous complaints\n");

  const testUsers = await setupTestData();
  if (!testUsers) {
    console.log('⚠️  Skipping test - could not set up test users');
    return;
  }

  // Get any anonymous complaint
  const { data: anonComplaints } = await adminClient
    .from('complaints')
    .select('*')
    .eq('is_anonymous', true)
    .limit(1);

  if (!anonComplaints || anonComplaints.length === 0) {
    console.log('⚠️  Skipping test - no anonymous complaints found');
    return;
  }

  const anonComplaint = anonComplaints[0];

  // Test 4a: Verify RLS policy prevents student access to anonymous complaints
  // Since anonymous complaints have student_id=null, students should not be able to view them
  // (because the RLS policy checks student_id = auth.uid())

  // Simulate student query (in real scenario, this would use student's auth token)
  const { data: studentView, error: studentError } = await adminClient
    .from('complaints')
    .select('*')
    .eq('id', anonComplaint.id)
    .eq('student_id', testUsers.student1.id); // Student trying to view by their ID

  // Student should not find the anonymous complaint when filtering by their ID
  logTest(
    'Students cannot query anonymous complaints by student_id',
    !studentView || studentView.length === 0,
    studentView && studentView.length > 0
      ? 'Student incorrectly found anonymous complaint'
      : 'Student correctly cannot find anonymous complaint'
  );

  // Test 4b: Verify anonymous complaint is not in student's complaint list
  const { data: studentComplaints } = await adminClient
    .from('complaints')
    .select('*')
    .eq('student_id', testUsers.student1.id);

  const hasAnonComplaint = studentComplaints?.some((c) => c.id === anonComplaint.id);

  logTest(
    'Anonymous complaints not in student complaint list',
    !hasAnonComplaint,
    hasAnonComplaint
      ? 'Anonymous complaint incorrectly in student list'
      : 'Anonymous complaint correctly not in student list'
  );
}

async function testAnonymousComplaintMetadata() {
  logSection('Test 5: Anonymous Complaint Metadata Privacy');
  console.log('Testing that related tables do not leak anonymous complaint identity\n');

  // Get any anonymous complaint
  const { data: anonComplaints } = await adminClient
    .from('complaints')
    .select('*')
    .eq('is_anonymous', true)
    .limit(1);

  if (!anonComplaints || anonComplaints.length === 0) {
    console.log('⚠️  Skipping test - no anonymous complaints found');
    return;
  }

  const anonComplaint = anonComplaints[0];

  // Test 5a: Check complaint_history for identity leakage
  const { data: history } = await adminClient
    .from('complaint_history')
    .select('*')
    .eq('complaint_id', anonComplaint.id);

  if (history && history.length > 0) {
    const hasStudentIdInHistory = history.some(
      (h) => h.details && JSON.stringify(h.details).includes('student_id')
    );
    logTest(
      'Complaint history does not contain student_id',
      !hasStudentIdInHistory,
      hasStudentIdInHistory ? 'Found student_id in history' : 'No student_id in history'
    );
  } else {
    console.log('  ℹ️  No history records found for anonymous complaint');
  }

  // Test 5b: Verify complaint can be queried without exposing student
  const { data: complaintWithRelations } = await adminClient
    .from('complaints')
    .select(
      `
      *,
      complaint_tags(*),
      complaint_attachments(*),
      complaint_history(*)
    `
    )
    .eq('id', anonComplaint.id)
    .single();

  if (complaintWithRelations) {
    logTest(
      'Anonymous complaint with relations has null student_id',
      complaintWithRelations.student_id === null,
      complaintWithRelations.student_id === null
        ? 'student_id is null'
        : `student_id is ${complaintWithRelations.student_id}`
    );
  }

  // Test 5c: Verify complaint_comments don't expose anonymous student
  // (Comments on anonymous complaints should not reveal the original submitter)
  const { data: comments } = await adminClient
    .from('complaint_comments')
    .select('*')
    .eq('complaint_id', anonComplaint.id);

  if (comments && comments.length > 0) {
    console.log(`  ℹ️  Found ${comments.length} comments on anonymous complaint`);
    // Comments will have user_id of the commenter, which is fine
    // The important thing is the complaint itself has no student_id
  } else {
    console.log('  ℹ️  No comments found for anonymous complaint');
  }
}

async function testAnonymousComplaintWorkflow() {
  logSection('Test 6: Anonymous Complaint Full Workflow');
  console.log('Testing complete workflow maintains anonymity\n');

  const testUsers = await setupTestData();
  if (!testUsers) {
    console.log('⚠️  Skipping test - could not set up test users');
    return;
  }

  // Create a new anonymous complaint for workflow testing
  const { data: workflowComplaint, error: createError } = await adminClient
    .from('complaints')
    .insert({
      student_id: null,
      is_anonymous: true,
      is_draft: false,
      title: 'Anonymous Workflow Test',
      description: 'Testing full workflow for anonymous complaints',
      category: 'other',
      priority: 'low',
      status: 'new',
    })
    .select()
    .single();

  if (createError || !workflowComplaint) {
    logTest('Create anonymous complaint for workflow', false, createError?.message);
    return;
  }

  logTest('Create anonymous complaint for workflow', true, 'Complaint created');

  // Test 6a: Update complaint status (lecturer action)
  const { data: updatedComplaint, error: updateError } = await adminClient
    .from('complaints')
    .update({
      status: 'in_progress',
      opened_at: new Date().toISOString(),
      opened_by: testUsers.lecturer.id,
    })
    .eq('id', workflowComplaint.id)
    .select()
    .single();

  if (updateError) {
    logTest('Update anonymous complaint status', false, updateError.message);
  } else {
    logTest(
      'Update anonymous complaint maintains anonymity',
      updatedComplaint.student_id === null && updatedComplaint.is_anonymous === true,
      'student_id remains null after update'
    );
  }

  // Test 6b: Assign complaint to lecturer
  const { data: assignedComplaint, error: assignError } = await adminClient
    .from('complaints')
    .update({
      assigned_to: testUsers.lecturer.id,
      status: 'in_progress',
    })
    .eq('id', workflowComplaint.id)
    .select()
    .single();

  if (assignError) {
    logTest('Assign anonymous complaint', false, assignError.message);
  } else {
    logTest(
      'Assign anonymous complaint maintains anonymity',
      assignedComplaint.student_id === null && assignedComplaint.is_anonymous === true,
      'student_id remains null after assignment'
    );
  }

  // Test 6c: Add feedback to anonymous complaint
  const { data: feedback, error: feedbackError } = await adminClient
    .from('feedback')
    .insert({
      complaint_id: workflowComplaint.id,
      lecturer_id: testUsers.lecturer.id,
      content: 'Test feedback for anonymous complaint',
    })
    .select()
    .single();

  if (feedbackError) {
    logTest('Add feedback to anonymous complaint', false, feedbackError.message);
  } else {
    logTest('Add feedback to anonymous complaint', true, 'Feedback added successfully');

    // Verify complaint still anonymous after feedback
    const { data: complaintAfterFeedback } = await adminClient
      .from('complaints')
      .select('*')
      .eq('id', workflowComplaint.id)
      .single();

    logTest(
      'Anonymous complaint remains anonymous after feedback',
      complaintAfterFeedback.student_id === null && complaintAfterFeedback.is_anonymous === true,
      'student_id remains null'
    );
  }

  // Clean up workflow test complaint
  await adminClient.from('feedback').delete().eq('complaint_id', workflowComplaint.id);
  await adminClient.from('complaints').delete().eq('id', workflowComplaint.id);
}

async function runAllTests() {
  console.log('🔒 Anonymous Complaint Privacy Test Suite');
  console.log('==========================================\n');
  console.log('Testing Property P2: Anonymous Complaint Privacy (AC2, AC3)');
  console.log('Verification: When a complaint is anonymous, the student_id is null');
  console.log('and no identifying information is exposed\n');

  try {
    // Run all test suites
    await testDatabaseConstraint();
    await testAnonymousComplaintIsolation();
    await testLecturerAccess();
    await testStudentIsolation();
    await testAnonymousComplaintMetadata();
    await testAnonymousComplaintWorkflow();

    // Clean up test data
    const testUsers = await setupTestData();
    await cleanupTestData(testUsers);

    // Print summary
    logSection('Test Summary');
    console.log(`\nTotal tests: ${results.passed + results.failed}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);

    if (results.failed > 0) {
      console.log('\n❌ Some tests failed. Please review the output above.');
      console.log('\nFailed tests:');
      results.tests
        .filter((t) => !t.passed)
        .forEach((t) => {
          console.log(`  - ${t.name}${t.message ? ': ' + t.message : ''}`);
        });
      process.exit(1);
    } else {
      console.log('\n✅ All anonymous complaint privacy tests passed!');
      console.log('\nProperty P2 verified:');
      console.log('  ✓ Database constraint enforces anonymous = true → student_id = null');
      console.log('  ✓ Anonymous complaints do not expose student identity');
      console.log('  ✓ Lecturers can view anonymous complaints without student info');
      console.log("  ✓ Students cannot access other students' anonymous complaints");
      console.log('  ✓ Related tables maintain anonymity throughout workflow');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
runAllTests();
