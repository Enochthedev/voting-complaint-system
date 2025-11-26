#!/usr/bin/env node

/**
 * Test script for complaint_ratings RLS policies
 *
 * This script tests:
 * 1. Students can rate their own resolved complaints
 * 2. Students cannot rate complaints that aren't resolved
 * 3. Students cannot rate other students' complaints
 * 4. Students can view their own ratings
 * 5. Lecturers can view all ratings
 * 6. Students can update their own ratings
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

// Create admin client (bypasses RLS)
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to create a client for a specific user
function createUserClient(accessToken) {
  return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

// Test data
let testStudent1, testStudent2, testLecturer;
let testComplaint1, testComplaint2;
let student1Token, student2Token, lecturerToken;

async function setup() {
  console.log('🔧 Setting up test data...\n');

  // Create test users
  const { data: student1Data, error: s1Error } = await adminClient.auth.admin.createUser({
    email: `test-student-ratings-1-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: {
      role: 'student',
      full_name: 'Test Student 1',
    },
  });

  if (s1Error) {
    console.error('❌ Error creating student 1:', s1Error);
    throw s1Error;
  }
  testStudent1 = student1Data.user;

  const { data: student2Data, error: s2Error } = await adminClient.auth.admin.createUser({
    email: `test-student-ratings-2-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: {
      role: 'student',
      full_name: 'Test Student 2',
    },
  });

  if (s2Error) {
    console.error('❌ Error creating student 2:', s2Error);
    throw s2Error;
  }
  testStudent2 = student2Data.user;

  const { data: lecturerData, error: lError } = await adminClient.auth.admin.createUser({
    email: `test-lecturer-ratings-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: {
      role: 'lecturer',
      full_name: 'Test Lecturer',
    },
  });

  if (lError) {
    console.error('❌ Error creating lecturer:', lError);
    throw lError;
  }
  testLecturer = lecturerData.user;

  // Insert users into public.users table
  await adminClient.from('users').insert([
    {
      id: testStudent1.id,
      email: testStudent1.email,
      role: 'student',
      full_name: 'Test Student 1',
    },
    {
      id: testStudent2.id,
      email: testStudent2.email,
      role: 'student',
      full_name: 'Test Student 2',
    },
    {
      id: testLecturer.id,
      email: testLecturer.email,
      role: 'lecturer',
      full_name: 'Test Lecturer',
    },
  ]);

  // Get access tokens
  const { data: s1Session } = await adminClient.auth.signInWithPassword({
    email: testStudent1.email,
    password: 'TestPassword123!',
  });
  student1Token = s1Session.session.access_token;

  const { data: s2Session } = await adminClient.auth.signInWithPassword({
    email: testStudent2.email,
    password: 'TestPassword123!',
  });
  student2Token = s2Session.session.access_token;

  const { data: lSession } = await adminClient.auth.signInWithPassword({
    email: testLecturer.email,
    password: 'TestPassword123!',
  });
  lecturerToken = lSession.session.access_token;

  // Create test complaints
  const { data: complaint1, error: c1Error } = await adminClient
    .from('complaints')
    .insert({
      student_id: testStudent1.id,
      is_anonymous: false,
      is_draft: false,
      title: 'Test Complaint 1 - Resolved',
      description: 'This is a resolved test complaint',
      category: 'academic',
      priority: 'medium',
      status: 'resolved',
    })
    .select()
    .single();

  if (c1Error) {
    console.error('❌ Error creating complaint 1:', c1Error);
    throw c1Error;
  }
  testComplaint1 = complaint1;

  const { data: complaint2, error: c2Error } = await adminClient
    .from('complaints')
    .insert({
      student_id: testStudent2.id,
      is_anonymous: false,
      is_draft: false,
      title: 'Test Complaint 2 - In Progress',
      description: 'This is an in-progress test complaint',
      category: 'facilities',
      priority: 'high',
      status: 'in_progress',
    })
    .select()
    .single();

  if (c2Error) {
    console.error('❌ Error creating complaint 2:', c2Error);
    throw c2Error;
  }
  testComplaint2 = complaint2;

  console.log('✅ Test data created successfully\n');
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...\n');

  // Delete test data (cascade will handle related records)
  await adminClient.from('complaints').delete().in('id', [testComplaint1.id, testComplaint2.id]);
  await adminClient
    .from('users')
    .delete()
    .in('id', [testStudent1.id, testStudent2.id, testLecturer.id]);

  // Delete auth users
  await adminClient.auth.admin.deleteUser(testStudent1.id);
  await adminClient.auth.admin.deleteUser(testStudent2.id);
  await adminClient.auth.admin.deleteUser(testLecturer.id);

  console.log('✅ Cleanup completed\n');
}

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  console.log('🧪 Running RLS Policy Tests for complaint_ratings\n');
  console.log('='.repeat(60) + '\n');

  // Test 1: Student can rate their own resolved complaint
  console.log('Test 1: Student can rate their own resolved complaint');
  try {
    const student1Client = createUserClient(student1Token);
    const { data, error } = await student1Client
      .from('complaint_ratings')
      .insert({
        complaint_id: testComplaint1.id,
        student_id: testStudent1.id,
        rating: 5,
        feedback_text: 'Great resolution!',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ FAILED:', error.message);
      failedTests++;
    } else {
      console.log('✅ PASSED: Student successfully rated their resolved complaint');
      passedTests++;
    }
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 2: Student cannot rate a complaint that isn't resolved
  console.log('Test 2: Student cannot rate a complaint that is not resolved');
  try {
    const student2Client = createUserClient(student2Token);
    const { data, error } = await student2Client
      .from('complaint_ratings')
      .insert({
        complaint_id: testComplaint2.id,
        student_id: testStudent2.id,
        rating: 4,
        feedback_text: 'Good so far',
      })
      .select()
      .single();

    if (error) {
      console.log('✅ PASSED: Student correctly prevented from rating non-resolved complaint');
      passedTests++;
    } else {
      console.error('❌ FAILED: Student should not be able to rate non-resolved complaint');
      failedTests++;
    }
  } catch (error) {
    console.log('✅ PASSED: Student correctly prevented from rating non-resolved complaint');
    passedTests++;
  }
  console.log('');

  // Test 3: Student cannot rate another student's complaint
  console.log("Test 3: Student cannot rate another student's complaint");
  try {
    const student2Client = createUserClient(student2Token);
    const { data, error } = await student2Client
      .from('complaint_ratings')
      .insert({
        complaint_id: testComplaint1.id,
        student_id: testStudent2.id,
        rating: 3,
        feedback_text: 'Not my complaint',
      })
      .select()
      .single();

    if (error) {
      console.log("✅ PASSED: Student correctly prevented from rating another student's complaint");
      passedTests++;
    } else {
      console.error("❌ FAILED: Student should not be able to rate another student's complaint");
      failedTests++;
    }
  } catch (error) {
    console.log("✅ PASSED: Student correctly prevented from rating another student's complaint");
    passedTests++;
  }
  console.log('');

  // Test 4: Student can view their own ratings
  console.log('Test 4: Student can view their own ratings');
  try {
    const student1Client = createUserClient(student1Token);
    const { data, error } = await student1Client
      .from('complaint_ratings')
      .select('*')
      .eq('student_id', testStudent1.id);

    if (error) {
      console.error('❌ FAILED:', error.message);
      failedTests++;
    } else if (data && data.length > 0) {
      console.log('✅ PASSED: Student can view their own ratings');
      passedTests++;
    } else {
      console.error('❌ FAILED: Student should be able to view their own ratings');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 5: Student cannot view other students' ratings
  console.log("Test 5: Student cannot view other students' ratings");
  try {
    const student2Client = createUserClient(student2Token);
    const { data, error } = await student2Client
      .from('complaint_ratings')
      .select('*')
      .eq('student_id', testStudent1.id);

    if (error || (data && data.length === 0)) {
      console.log("✅ PASSED: Student correctly prevented from viewing other students' ratings");
      passedTests++;
    } else {
      console.error("❌ FAILED: Student should not be able to view other students' ratings");
      failedTests++;
    }
  } catch (error) {
    console.log("✅ PASSED: Student correctly prevented from viewing other students' ratings");
    passedTests++;
  }
  console.log('');

  // Test 6: Lecturer can view all ratings
  console.log('Test 6: Lecturer can view all ratings');
  try {
    const lecturerClient = createUserClient(lecturerToken);
    const { data, error } = await lecturerClient.from('complaint_ratings').select('*');

    if (error) {
      console.error('❌ FAILED:', error.message);
      failedTests++;
    } else if (data && data.length > 0) {
      console.log('✅ PASSED: Lecturer can view all ratings');
      passedTests++;
    } else {
      console.error('❌ FAILED: Lecturer should be able to view all ratings');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 7: Student can update their own rating
  console.log('Test 7: Student can update their own rating');
  try {
    const student1Client = createUserClient(student1Token);

    // First get the rating ID
    const { data: ratingData } = await student1Client
      .from('complaint_ratings')
      .select('id')
      .eq('complaint_id', testComplaint1.id)
      .single();

    if (ratingData) {
      const { data, error } = await student1Client
        .from('complaint_ratings')
        .update({
          rating: 4,
          feedback_text: 'Updated: Good resolution',
        })
        .eq('id', ratingData.id)
        .select()
        .single();

      if (error) {
        console.error('❌ FAILED:', error.message);
        failedTests++;
      } else {
        console.log('✅ PASSED: Student can update their own rating');
        passedTests++;
      }
    } else {
      console.error('❌ FAILED: Could not find rating to update');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 8: Verify unique constraint (one rating per complaint)
  console.log('Test 8: Verify unique constraint (one rating per complaint)');
  try {
    const student1Client = createUserClient(student1Token);
    const { data, error } = await student1Client
      .from('complaint_ratings')
      .insert({
        complaint_id: testComplaint1.id,
        student_id: testStudent1.id,
        rating: 3,
        feedback_text: 'Duplicate rating attempt',
      })
      .select()
      .single();

    if (error && error.message.includes('unique')) {
      console.log('✅ PASSED: Unique constraint correctly prevents duplicate ratings');
      passedTests++;
    } else {
      console.error('❌ FAILED: Should not allow duplicate ratings for same complaint');
      failedTests++;
    }
  } catch (error) {
    if (error.message.includes('unique')) {
      console.log('✅ PASSED: Unique constraint correctly prevents duplicate ratings');
      passedTests++;
    } else {
      console.error('❌ FAILED:', error.message);
      failedTests++;
    }
  }
  console.log('');

  // Print summary
  console.log('='.repeat(60));
  console.log('\n📊 Test Summary\n');
  console.log(`Total Tests: ${passedTests + failedTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log('');

  return failedTests === 0;
}

async function main() {
  try {
    await setup();
    const success = await runTests();
    await cleanup();

    if (success) {
      console.log('🎉 All tests passed!\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Please review the output above.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    await cleanup();
    process.exit(1);
  }
}

main();
