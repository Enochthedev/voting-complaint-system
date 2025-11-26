#!/usr/bin/env node

/**
 * Test Announcements Table RLS Policies
 *
 * This script tests the RLS policies for the announcements table by:
 * 1. Creating test users (student and lecturer)
 * 2. Testing SELECT permissions (all users can view)
 * 3. Testing INSERT permissions (only lecturers can create)
 * 4. Testing UPDATE permissions (lecturers can update own)
 * 5. Testing DELETE permissions (lecturers can delete own)
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Admin client (bypasses RLS)
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

// Test credentials
const testStudent = {
  email: `test-student-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  role: 'student',
  full_name: 'Test Student',
};

const testLecturer = {
  email: `test-lecturer-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  role: 'lecturer',
  full_name: 'Test Lecturer',
};

let studentUserId, lecturerUserId, announcementId;

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');

  try {
    // Delete test announcement
    if (announcementId) {
      await adminClient.from('announcements').delete().eq('id', announcementId);
    }

    // Delete test users
    if (studentUserId) {
      await adminClient.auth.admin.deleteUser(studentUserId);
    }
    if (lecturerUserId) {
      await adminClient.auth.admin.deleteUser(lecturerUserId);
    }

    console.log('✅ Cleanup complete');
  } catch (error) {
    console.log('⚠️  Cleanup error:', error.message);
  }
}

async function createTestUsers() {
  console.log('\n📝 Creating test users...');

  // Create student
  const { data: studentData, error: studentError } = await adminClient.auth.admin.createUser({
    email: testStudent.email,
    password: testStudent.password,
    email_confirm: true,
    user_metadata: {
      role: testStudent.role,
      full_name: testStudent.full_name,
    },
  });

  if (studentError) {
    throw new Error(`Failed to create student: ${studentError.message}`);
  }

  studentUserId = studentData.user.id;

  // Insert into users table
  await adminClient.from('users').insert({
    id: studentUserId,
    email: testStudent.email,
    role: testStudent.role,
    full_name: testStudent.full_name,
  });

  console.log(`✅ Created student: ${testStudent.email}`);

  // Create lecturer
  const { data: lecturerData, error: lecturerError } = await adminClient.auth.admin.createUser({
    email: testLecturer.email,
    password: testLecturer.password,
    email_confirm: true,
    user_metadata: {
      role: testLecturer.role,
      full_name: testLecturer.full_name,
    },
  });

  if (lecturerError) {
    throw new Error(`Failed to create lecturer: ${lecturerError.message}`);
  }

  lecturerUserId = lecturerData.user.id;

  // Insert into users table
  await adminClient.from('users').insert({
    id: lecturerUserId,
    email: testLecturer.email,
    role: testLecturer.role,
    full_name: testLecturer.full_name,
  });

  console.log(`✅ Created lecturer: ${testLecturer.email}`);
}

async function testSelectPermissions() {
  console.log('\n🔍 Testing SELECT permissions...');

  // Create an announcement as admin
  const { data: announcement, error: createError } = await adminClient
    .from('announcements')
    .insert({
      created_by: lecturerUserId,
      title: 'Test Announcement',
      content: 'This is a test announcement for RLS verification',
    })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create test announcement: ${createError.message}`);
  }

  announcementId = announcement.id;
  console.log('✅ Created test announcement');

  // Test student can view
  const studentClient = createClient(supabaseUrl, supabaseAnonKey);
  const { error: studentSignInError } = await studentClient.auth.signInWithPassword({
    email: testStudent.email,
    password: testStudent.password,
  });

  if (studentSignInError) {
    throw new Error(`Student sign in failed: ${studentSignInError.message}`);
  }

  const { data: studentView, error: studentViewError } = await studentClient
    .from('announcements')
    .select('*')
    .eq('id', announcementId)
    .single();

  if (studentViewError) {
    console.log('❌ Student cannot view announcements:', studentViewError.message);
    return false;
  }

  console.log('✅ Student can view announcements');
  await studentClient.auth.signOut();

  // Test lecturer can view
  const lecturerClient = createClient(supabaseUrl, supabaseAnonKey);
  const { error: lecturerSignInError } = await lecturerClient.auth.signInWithPassword({
    email: testLecturer.email,
    password: testLecturer.password,
  });

  if (lecturerSignInError) {
    throw new Error(`Lecturer sign in failed: ${lecturerSignInError.message}`);
  }

  const { data: lecturerView, error: lecturerViewError } = await lecturerClient
    .from('announcements')
    .select('*')
    .eq('id', announcementId)
    .single();

  if (lecturerViewError) {
    console.log('❌ Lecturer cannot view announcements:', lecturerViewError.message);
    return false;
  }

  console.log('✅ Lecturer can view announcements');
  await lecturerClient.auth.signOut();

  return true;
}

async function testInsertPermissions() {
  console.log('\n➕ Testing INSERT permissions...');

  // Test student cannot create
  const studentClient = createClient(supabaseUrl, supabaseAnonKey);
  await studentClient.auth.signInWithPassword({
    email: testStudent.email,
    password: testStudent.password,
  });

  const { data: studentInsert, error: studentInsertError } = await studentClient
    .from('announcements')
    .insert({
      created_by: studentUserId,
      title: 'Student Announcement',
      content: 'This should fail',
    })
    .select();

  if (studentInsertError) {
    console.log('✅ Student correctly blocked from creating announcements');
  } else {
    console.log('❌ Student should NOT be able to create announcements');
    // Clean up
    await adminClient.from('announcements').delete().eq('id', studentInsert[0].id);
    await studentClient.auth.signOut();
    return false;
  }

  await studentClient.auth.signOut();

  // Test lecturer can create
  const lecturerClient = createClient(supabaseUrl, supabaseAnonKey);
  await lecturerClient.auth.signInWithPassword({
    email: testLecturer.email,
    password: testLecturer.password,
  });

  const { data: lecturerInsert, error: lecturerInsertError } = await lecturerClient
    .from('announcements')
    .insert({
      created_by: lecturerUserId,
      title: 'Lecturer Announcement',
      content: 'This should succeed',
    })
    .select()
    .single();

  if (lecturerInsertError) {
    console.log('❌ Lecturer cannot create announcements:', lecturerInsertError.message);
    await lecturerClient.auth.signOut();
    return false;
  }

  console.log('✅ Lecturer can create announcements');

  // Clean up
  await adminClient.from('announcements').delete().eq('id', lecturerInsert.id);
  await lecturerClient.auth.signOut();

  return true;
}

async function testUpdatePermissions() {
  console.log('\n✏️  Testing UPDATE permissions...');

  // Create announcement as lecturer
  const { data: announcement, error: createError } = await adminClient
    .from('announcements')
    .insert({
      created_by: lecturerUserId,
      title: 'Original Title',
      content: 'Original content',
    })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create announcement: ${createError.message}`);
  }

  const testAnnouncementId = announcement.id;

  // Test lecturer can update own announcement
  const lecturerClient = createClient(supabaseUrl, supabaseAnonKey);
  await lecturerClient.auth.signInWithPassword({
    email: testLecturer.email,
    password: testLecturer.password,
  });

  const { error: updateError } = await lecturerClient
    .from('announcements')
    .update({ title: 'Updated Title' })
    .eq('id', testAnnouncementId);

  if (updateError) {
    console.log('❌ Lecturer cannot update own announcement:', updateError.message);
    await adminClient.from('announcements').delete().eq('id', testAnnouncementId);
    await lecturerClient.auth.signOut();
    return false;
  }

  console.log('✅ Lecturer can update own announcements');
  await lecturerClient.auth.signOut();

  // Test student cannot update
  const studentClient = createClient(supabaseUrl, supabaseAnonKey);
  await studentClient.auth.signInWithPassword({
    email: testStudent.email,
    password: testStudent.password,
  });

  const { error: studentUpdateError } = await studentClient
    .from('announcements')
    .update({ title: 'Student Update' })
    .eq('id', testAnnouncementId);

  if (studentUpdateError) {
    console.log('✅ Student correctly blocked from updating announcements');
  } else {
    console.log('❌ Student should NOT be able to update announcements');
    await adminClient.from('announcements').delete().eq('id', testAnnouncementId);
    await studentClient.auth.signOut();
    return false;
  }

  await studentClient.auth.signOut();

  // Clean up
  await adminClient.from('announcements').delete().eq('id', testAnnouncementId);

  return true;
}

async function testDeletePermissions() {
  console.log('\n🗑️  Testing DELETE permissions...');

  // Create announcement as lecturer
  const { data: announcement, error: createError } = await adminClient
    .from('announcements')
    .insert({
      created_by: lecturerUserId,
      title: 'To Be Deleted',
      content: 'This will be deleted',
    })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create announcement: ${createError.message}`);
  }

  const testAnnouncementId = announcement.id;

  // Test student cannot delete
  const studentClient = createClient(supabaseUrl, supabaseAnonKey);
  await studentClient.auth.signInWithPassword({
    email: testStudent.email,
    password: testStudent.password,
  });

  const { error: studentDeleteError } = await studentClient
    .from('announcements')
    .delete()
    .eq('id', testAnnouncementId);

  if (studentDeleteError) {
    console.log('✅ Student correctly blocked from deleting announcements');
  } else {
    console.log('❌ Student should NOT be able to delete announcements');
    await studentClient.auth.signOut();
    return false;
  }

  await studentClient.auth.signOut();

  // Test lecturer can delete own announcement
  const lecturerClient = createClient(supabaseUrl, supabaseAnonKey);
  await lecturerClient.auth.signInWithPassword({
    email: testLecturer.email,
    password: testLecturer.password,
  });

  const { error: deleteError } = await lecturerClient
    .from('announcements')
    .delete()
    .eq('id', testAnnouncementId);

  if (deleteError) {
    console.log('❌ Lecturer cannot delete own announcement:', deleteError.message);
    await adminClient.from('announcements').delete().eq('id', testAnnouncementId);
    await lecturerClient.auth.signOut();
    return false;
  }

  console.log('✅ Lecturer can delete own announcements');
  await lecturerClient.auth.signOut();

  return true;
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Testing Announcements Table RLS Policies');
  console.log('='.repeat(60));

  try {
    await createTestUsers();

    const selectPass = await testSelectPermissions();
    const insertPass = await testInsertPermissions();
    const updatePass = await testUpdatePermissions();
    const deletePass = await testDeletePermissions();

    console.log('\n' + '='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));
    console.log(`SELECT permissions: ${selectPass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`INSERT permissions: ${insertPass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`UPDATE permissions: ${updatePass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`DELETE permissions: ${deletePass ? '✅ PASS' : '❌ FAIL'}`);
    console.log('='.repeat(60));

    if (selectPass && insertPass && updatePass && deletePass) {
      console.log('\n✅ All RLS policies are working correctly!');
    } else {
      console.log('\n❌ Some RLS policies are not working as expected');
    }
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.error(error.stack);
  } finally {
    await cleanup();
  }
}

runTests();
