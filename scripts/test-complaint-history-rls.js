#!/usr/bin/env node

/**
 * Test script for complaint_history RLS policies
 *
 * This script verifies:
 * 1. Students can view history on their own complaints
 * 2. Lecturers can view history on all complaints
 * 3. History records can be inserted
 * 4. History records cannot be updated (immutability - Property P13)
 * 5. History records cannot be deleted (immutability - Property P13)
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

// Test users
let studentUser = null;
let lecturerUser = null;
let testComplaint = null;
let testHistory = null;

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');

  if (testHistory) {
    await adminClient.from('complaint_history').delete().eq('id', testHistory.id);
  }

  if (testComplaint) {
    await adminClient.from('complaints').delete().eq('id', testComplaint.id);
  }

  if (studentUser) {
    await adminClient.auth.admin.deleteUser(studentUser.id);
  }

  if (lecturerUser) {
    await adminClient.auth.admin.deleteUser(lecturerUser.id);
  }

  console.log('✅ Cleanup complete');
}

async function createTestUsers() {
  console.log('\n📝 Creating test users...');

  // Create student user
  const studentEmail = `student-${Date.now()}@test.com`;
  const { data: student, error: studentError } = await adminClient.auth.admin.createUser({
    email: studentEmail,
    password: 'testpassword123',
    email_confirm: true,
    user_metadata: {
      role: 'student',
      full_name: 'Test Student',
    },
  });

  if (studentError) {
    console.error('❌ Failed to create student user:', studentError);
    throw studentError;
  }

  studentUser = student.user;
  console.log(`✅ Created student user: ${studentEmail}`);

  // Create lecturer user
  const lecturerEmail = `lecturer-${Date.now()}@test.com`;
  const { data: lecturer, error: lecturerError } = await adminClient.auth.admin.createUser({
    email: lecturerEmail,
    password: 'testpassword123',
    email_confirm: true,
    user_metadata: {
      role: 'lecturer',
      full_name: 'Test Lecturer',
    },
  });

  if (lecturerError) {
    console.error('❌ Failed to create lecturer user:', lecturerError);
    throw lecturerError;
  }

  lecturerUser = lecturer.user;
  console.log(`✅ Created lecturer user: ${lecturerEmail}`);
}

async function createTestComplaint() {
  console.log('\n📝 Creating test complaint...');

  const { data, error } = await adminClient
    .from('complaints')
    .insert({
      student_id: studentUser.id,
      is_anonymous: false,
      is_draft: false,
      title: 'Test Complaint for History RLS',
      description: 'This is a test complaint to verify history RLS policies',
      category: 'academic',
      priority: 'medium',
      status: 'new',
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to create test complaint:', error);
    throw error;
  }

  testComplaint = data;
  console.log(`✅ Created test complaint: ${testComplaint.id}`);
}

async function createTestHistory() {
  console.log('\n📝 Creating test history record...');

  const { data, error } = await adminClient
    .from('complaint_history')
    .insert({
      complaint_id: testComplaint.id,
      action: 'created',
      new_value: 'new',
      performed_by: studentUser.id,
      details: { test: true },
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to create test history:', error);
    throw error;
  }

  testHistory = data;
  console.log(`✅ Created test history record: ${testHistory.id}`);
}

async function testStudentCanViewOwnHistory() {
  console.log('\n🧪 Test: Student can view history on their own complaint');

  // Create client for student
  const { data: session } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: studentUser.email,
  });

  const studentClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await studentClient.auth.setSession({
    access_token: session.properties.access_token,
    refresh_token: session.properties.refresh_token,
  });

  const { data, error } = await studentClient
    .from('complaint_history')
    .select('*')
    .eq('complaint_id', testComplaint.id);

  if (error) {
    console.error('❌ FAIL: Student cannot view their own complaint history:', error);
    return false;
  }

  if (data && data.length > 0) {
    console.log('✅ PASS: Student can view their own complaint history');
    return true;
  } else {
    console.error('❌ FAIL: No history records returned for student');
    return false;
  }
}

async function testLecturerCanViewAllHistory() {
  console.log('\n🧪 Test: Lecturer can view history on all complaints');

  // Create client for lecturer
  const { data: session } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: lecturerUser.email,
  });

  const lecturerClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await lecturerClient.auth.setSession({
    access_token: session.properties.access_token,
    refresh_token: session.properties.refresh_token,
  });

  const { data, error } = await lecturerClient
    .from('complaint_history')
    .select('*')
    .eq('complaint_id', testComplaint.id);

  if (error) {
    console.error('❌ FAIL: Lecturer cannot view complaint history:', error);
    return false;
  }

  if (data && data.length > 0) {
    console.log('✅ PASS: Lecturer can view all complaint history');
    return true;
  } else {
    console.error('❌ FAIL: No history records returned for lecturer');
    return false;
  }
}

async function testCannotUpdateHistory() {
  console.log('\n🧪 Test: History records cannot be updated (Property P13)');

  // Try to update as admin (should still fail due to RLS)
  const { data: session } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: lecturerUser.email,
  });

  const lecturerClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await lecturerClient.auth.setSession({
    access_token: session.properties.access_token,
    refresh_token: session.properties.refresh_token,
  });

  const { data, error } = await lecturerClient
    .from('complaint_history')
    .update({ new_value: 'modified' })
    .eq('id', testHistory.id);

  if (error) {
    console.log('✅ PASS: History records cannot be updated (immutability enforced)');
    console.log(`   Error message: ${error.message}`);
    return true;
  } else {
    console.error('❌ FAIL: History record was updated (immutability violated!)');
    return false;
  }
}

async function testCannotDeleteHistory() {
  console.log('\n🧪 Test: History records cannot be deleted (Property P13)');

  // Try to delete as admin (should still fail due to RLS)
  const { data: session } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: lecturerUser.email,
  });

  const lecturerClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await lecturerClient.auth.setSession({
    access_token: session.properties.access_token,
    refresh_token: session.properties.refresh_token,
  });

  const { data, error } = await lecturerClient
    .from('complaint_history')
    .delete()
    .eq('id', testHistory.id);

  if (error) {
    console.log('✅ PASS: History records cannot be deleted (immutability enforced)');
    console.log(`   Error message: ${error.message}`);
    return true;
  } else {
    console.error('❌ FAIL: History record was deleted (immutability violated!)');
    return false;
  }
}

async function testCanInsertHistory() {
  console.log('\n🧪 Test: Authenticated users can insert history records');

  // Create client for lecturer
  const { data: session } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: lecturerUser.email,
  });

  const lecturerClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await lecturerClient.auth.setSession({
    access_token: session.properties.access_token,
    refresh_token: session.properties.refresh_token,
  });

  const { data, error } = await lecturerClient
    .from('complaint_history')
    .insert({
      complaint_id: testComplaint.id,
      action: 'status_changed',
      old_value: 'new',
      new_value: 'opened',
      performed_by: lecturerUser.id,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ FAIL: Cannot insert history record:', error);
    return false;
  }

  if (data) {
    console.log('✅ PASS: Authenticated users can insert history records');
    // Clean up the inserted record
    await adminClient.from('complaint_history').delete().eq('id', data.id);
    return true;
  } else {
    console.error('❌ FAIL: No data returned after insert');
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting complaint_history RLS policy tests...');
  console.log('================================================');

  try {
    await createTestUsers();
    await createTestComplaint();
    await createTestHistory();

    const results = {
      studentView: await testStudentCanViewOwnHistory(),
      lecturerView: await testLecturerCanViewAllHistory(),
      canInsert: await testCanInsertHistory(),
      cannotUpdate: await testCannotUpdateHistory(),
      cannotDelete: await testCannotDeleteHistory(),
    };

    console.log('\n================================================');
    console.log('📊 Test Results Summary:');
    console.log('================================================');
    console.log(`Student can view own history: ${results.studentView ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Lecturer can view all history: ${results.lecturerView ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Can insert history records: ${results.canInsert ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Cannot update history (P13): ${results.cannotUpdate ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Cannot delete history (P13): ${results.cannotDelete ? '✅ PASS' : '❌ FAIL'}`);

    const allPassed = Object.values(results).every((result) => result === true);

    if (allPassed) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the output above.');
    }

    await cleanup();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Test execution failed:', error);
    await cleanup();
    process.exit(1);
  }
}

runTests();
