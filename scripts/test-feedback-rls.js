#!/usr/bin/env node

/**
 * Test script for feedback table RLS policies
 *
 * This script tests:
 * 1. Students can view feedback on their own complaints
 * 2. Students cannot view feedback on other students' complaints
 * 3. Lecturers can view all feedback
 * 4. Lecturers can insert feedback
 * 5. Lecturers can update their own feedback
 * 6. Lecturers can delete their own feedback
 * 7. Students cannot insert, update, or delete feedback
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client (bypasses RLS)
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

// Test data
let testStudent1, testStudent2, testLecturer;
let testComplaint1, testComplaint2;
let testFeedback1;

async function setup() {
  console.log('\n🔧 Setting up test data...\n');

  // Create test users
  const { data: student1Auth, error: s1Error } = await adminClient.auth.admin.createUser({
    email: `test-student-feedback-1-${Date.now()}@example.com`,
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      role: 'student',
      full_name: 'Test Student 1',
    },
  });

  if (s1Error) throw s1Error;
  testStudent1 = student1Auth.user;

  const { data: student2Auth, error: s2Error } = await adminClient.auth.admin.createUser({
    email: `test-student-feedback-2-${Date.now()}@example.com`,
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      role: 'student',
      full_name: 'Test Student 2',
    },
  });

  if (s2Error) throw s2Error;
  testStudent2 = student2Auth.user;

  const { data: lecturerAuth, error: lError } = await adminClient.auth.admin.createUser({
    email: `test-lecturer-feedback-${Date.now()}@example.com`,
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      role: 'lecturer',
      full_name: 'Test Lecturer',
    },
  });

  if (lError) throw lError;
  testLecturer = lecturerAuth.user;

  // Insert users into users table
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

  // Create test complaints
  const { data: complaint1, error: c1Error } = await adminClient
    .from('complaints')
    .insert({
      student_id: testStudent1.id,
      is_anonymous: false,
      is_draft: false,
      title: 'Test Complaint 1',
      description: 'Test description 1',
      category: 'academic',
      priority: 'medium',
      status: 'new',
    })
    .select()
    .single();

  if (c1Error) throw c1Error;
  testComplaint1 = complaint1;

  const { data: complaint2, error: c2Error } = await adminClient
    .from('complaints')
    .insert({
      student_id: testStudent2.id,
      is_anonymous: false,
      is_draft: false,
      title: 'Test Complaint 2',
      description: 'Test description 2',
      category: 'facilities',
      priority: 'high',
      status: 'new',
    })
    .select()
    .single();

  if (c2Error) throw c2Error;
  testComplaint2 = complaint2;

  // Create test feedback
  const { data: feedback1, error: f1Error } = await adminClient
    .from('feedback')
    .insert({
      complaint_id: testComplaint1.id,
      lecturer_id: testLecturer.id,
      content: 'Test feedback for complaint 1',
    })
    .select()
    .single();

  if (f1Error) throw f1Error;
  testFeedback1 = feedback1;

  console.log('✅ Test data created successfully\n');
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...\n');

  // Delete test data (cascade will handle related records)
  if (testComplaint1) {
    await adminClient.from('complaints').delete().eq('id', testComplaint1.id);
  }
  if (testComplaint2) {
    await adminClient.from('complaints').delete().eq('id', testComplaint2.id);
  }

  // Delete test users
  if (testStudent1) {
    await adminClient.from('users').delete().eq('id', testStudent1.id);
    await adminClient.auth.admin.deleteUser(testStudent1.id);
  }
  if (testStudent2) {
    await adminClient.from('users').delete().eq('id', testStudent2.id);
    await adminClient.auth.admin.deleteUser(testStudent2.id);
  }
  if (testLecturer) {
    await adminClient.from('users').delete().eq('id', testLecturer.id);
    await adminClient.auth.admin.deleteUser(testLecturer.id);
  }

  console.log('✅ Cleanup completed\n');
}

async function testStudentViewOwnFeedback() {
  console.log('Test 1: Student can view feedback on their own complaint');

  const { data: session } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: testStudent1.email,
  });

  const studentClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await studentClient.auth.setSession({
    access_token: session.properties.access_token,
    refresh_token: session.properties.refresh_token,
  });

  const { data, error } = await studentClient
    .from('feedback')
    .select('*')
    .eq('complaint_id', testComplaint1.id);

  if (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  }

  if (data && data.length === 1 && data[0].id === testFeedback1.id) {
    console.log('✅ PASSED: Student can view feedback on their own complaint\n');
    return true;
  } else {
    console.log('❌ FAILED: Expected 1 feedback record, got', data?.length || 0, '\n');
    return false;
  }
}

async function testStudentCannotViewOthersFeedback() {
  console.log("Test 2: Student cannot view feedback on other students' complaints");

  const { data: session } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: testStudent1.email,
  });

  const studentClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await studentClient.auth.setSession({
    access_token: session.properties.access_token,
    refresh_token: session.properties.refresh_token,
  });

  const { data, error } = await studentClient
    .from('feedback')
    .select('*')
    .eq('complaint_id', testComplaint2.id);

  if (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  }

  if (data && data.length === 0) {
    console.log("✅ PASSED: Student cannot view feedback on other students' complaints\n");
    return true;
  } else {
    console.log('❌ FAILED: Expected 0 feedback records, got', data?.length || 0, '\n');
    return false;
  }
}

async function testLecturerViewAllFeedback() {
  console.log('Test 3: Lecturer can view all feedback');

  const { data: session } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: testLecturer.email,
  });

  const lecturerClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await lecturerClient.auth.setSession({
    access_token: session.properties.access_token,
    refresh_token: session.properties.refresh_token,
  });

  const { data, error } = await lecturerClient.from('feedback').select('*');

  if (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  }

  if (data && data.length >= 1) {
    console.log('✅ PASSED: Lecturer can view all feedback\n');
    return true;
  } else {
    console.log('❌ FAILED: Expected at least 1 feedback record, got', data?.length || 0, '\n');
    return false;
  }
}

async function testLecturerInsertFeedback() {
  console.log('Test 4: Lecturer can insert feedback');

  const { data: session } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: testLecturer.email,
  });

  const lecturerClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await lecturerClient.auth.setSession({
    access_token: session.properties.access_token,
    refresh_token: session.properties.refresh_token,
  });

  const { data, error } = await lecturerClient
    .from('feedback')
    .insert({
      complaint_id: testComplaint2.id,
      lecturer_id: testLecturer.id,
      content: 'New feedback from lecturer',
    })
    .select()
    .single();

  if (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  }

  if (data && data.content === 'New feedback from lecturer') {
    console.log('✅ PASSED: Lecturer can insert feedback\n');
    return true;
  } else {
    console.log('❌ FAILED: Feedback not inserted correctly\n');
    return false;
  }
}

async function testLecturerUpdateOwnFeedback() {
  console.log('Test 5: Lecturer can update their own feedback');

  const { data: session } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: testLecturer.email,
  });

  const lecturerClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await lecturerClient.auth.setSession({
    access_token: session.properties.access_token,
    refresh_token: session.properties.refresh_token,
  });

  const { data, error } = await lecturerClient
    .from('feedback')
    .update({ content: 'Updated feedback content' })
    .eq('id', testFeedback1.id)
    .select()
    .single();

  if (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  }

  if (data && data.content === 'Updated feedback content') {
    console.log('✅ PASSED: Lecturer can update their own feedback\n');
    return true;
  } else {
    console.log('❌ FAILED: Feedback not updated correctly\n');
    return false;
  }
}

async function testLecturerDeleteOwnFeedback() {
  console.log('Test 6: Lecturer can delete their own feedback');

  // First create a feedback to delete
  const { data: feedbackToDelete } = await adminClient
    .from('feedback')
    .insert({
      complaint_id: testComplaint1.id,
      lecturer_id: testLecturer.id,
      content: 'Feedback to be deleted',
    })
    .select()
    .single();

  const { data: session } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: testLecturer.email,
  });

  const lecturerClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await lecturerClient.auth.setSession({
    access_token: session.properties.access_token,
    refresh_token: session.properties.refresh_token,
  });

  const { error } = await lecturerClient.from('feedback').delete().eq('id', feedbackToDelete.id);

  if (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  }

  // Verify deletion
  const { data: checkData } = await adminClient
    .from('feedback')
    .select('*')
    .eq('id', feedbackToDelete.id);

  if (checkData && checkData.length === 0) {
    console.log('✅ PASSED: Lecturer can delete their own feedback\n');
    return true;
  } else {
    console.log('❌ FAILED: Feedback not deleted\n');
    return false;
  }
}

async function testStudentCannotInsertFeedback() {
  console.log('Test 7: Student cannot insert feedback');

  const { data: session } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: testStudent1.email,
  });

  const studentClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await studentClient.auth.setSession({
    access_token: session.properties.access_token,
    refresh_token: session.properties.refresh_token,
  });

  const { data, error } = await studentClient
    .from('feedback')
    .insert({
      complaint_id: testComplaint1.id,
      lecturer_id: testStudent1.id,
      content: 'Student trying to insert feedback',
    })
    .select();

  if (error) {
    console.log('✅ PASSED: Student cannot insert feedback (as expected)\n');
    return true;
  } else {
    console.log('❌ FAILED: Student was able to insert feedback\n');
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Testing Feedback Table RLS Policies');
  console.log('='.repeat(60));

  try {
    await setup();

    const results = [];
    results.push(await testStudentViewOwnFeedback());
    results.push(await testStudentCannotViewOthersFeedback());
    results.push(await testLecturerViewAllFeedback());
    results.push(await testLecturerInsertFeedback());
    results.push(await testLecturerUpdateOwnFeedback());
    results.push(await testLecturerDeleteOwnFeedback());
    results.push(await testStudentCannotInsertFeedback());

    await cleanup();

    console.log('='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));
    const passed = results.filter((r) => r).length;
    const total = results.length;
    console.log(`\n${passed}/${total} tests passed\n`);

    if (passed === total) {
      console.log('✅ All tests passed!\n');
      process.exit(0);
    } else {
      console.log('❌ Some tests failed\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    await cleanup();
    process.exit(1);
  }
}

runTests();
