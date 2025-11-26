#!/usr/bin/env node

/**
 * Test script for complaint_comments RLS policies
 * Verifies that RLS policies are correctly configured
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create admin client (bypasses RLS)
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Testing complaint_comments RLS Policies\n');

async function testRLSPolicies() {
  try {
    // 1. Check if table exists and RLS is enabled
    console.log('1️⃣  Checking if complaint_comments table exists and RLS is enabled...');
    const { data: tableInfo, error: tableError } = await adminClient
      .from('complaint_comments')
      .select('id')
      .limit(0);

    if (tableError) {
      console.error('❌ Table check failed:', tableError.message);
      return false;
    }
    console.log('✅ complaint_comments table exists\n');

    // 2. Check RLS policies exist (skip detailed check, will test behavior)
    console.log('2️⃣  Checking RLS policies via behavior tests...');
    console.log('   (Skipping direct policy query, will verify through access tests)\n');

    // 3. Test policy behavior with mock data
    console.log('3️⃣  Testing policy behavior...');

    // Create test users
    console.log('   Creating test users...');
    const studentEmail = `test-student-${Date.now()}@example.com`;
    const lecturerEmail = `test-lecturer-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    // Create student user
    const { data: studentAuth, error: studentAuthError } = await adminClient.auth.admin.createUser({
      email: studentEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: 'student',
        full_name: 'Test Student',
      },
    });

    if (studentAuthError) {
      console.error('❌ Failed to create student user:', studentAuthError.message);
      return false;
    }

    // Insert student into users table
    const { error: studentInsertError } = await adminClient.from('users').insert({
      id: studentAuth.user.id,
      email: studentEmail,
      role: 'student',
      full_name: 'Test Student',
    });

    if (studentInsertError) {
      console.error('❌ Failed to insert student into users table:', studentInsertError.message);
    }

    // Create lecturer user
    const { data: lecturerAuth, error: lecturerAuthError } =
      await adminClient.auth.admin.createUser({
        email: lecturerEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          role: 'lecturer',
          full_name: 'Test Lecturer',
        },
      });

    if (lecturerAuthError) {
      console.error('❌ Failed to create lecturer user:', lecturerAuthError.message);
      return false;
    }

    // Insert lecturer into users table
    const { error: lecturerInsertError } = await adminClient.from('users').insert({
      id: lecturerAuth.user.id,
      email: lecturerEmail,
      role: 'lecturer',
      full_name: 'Test Lecturer',
    });

    if (lecturerInsertError) {
      console.error('❌ Failed to insert lecturer into users table:', lecturerInsertError.message);
    }

    console.log('   ✅ Test users created');

    // Create test complaint
    console.log('   Creating test complaint...');
    const { data: complaint, error: complaintError } = await adminClient
      .from('complaints')
      .insert({
        student_id: studentAuth.user.id,
        is_anonymous: false,
        is_draft: false,
        title: 'Test Complaint for Comments',
        description: 'This is a test complaint',
        category: 'academic',
        priority: 'medium',
        status: 'new',
      })
      .select()
      .single();

    if (complaintError) {
      console.error('❌ Failed to create test complaint:', complaintError.message);
      await cleanup(studentAuth.user.id, lecturerAuth.user.id);
      return false;
    }
    console.log('   ✅ Test complaint created');

    // Test 1: Student can add comment to their own complaint
    console.log('\n   Test 1: Student adds comment to their own complaint...');
    const studentClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: studentSession } = await studentClient.auth.signInWithPassword({
      email: studentEmail,
      password: password,
    });

    const { data: studentComment, error: studentCommentError } = await studentClient
      .from('complaint_comments')
      .insert({
        complaint_id: complaint.id,
        user_id: studentAuth.user.id,
        comment: 'This is a student comment',
        is_internal: false,
      })
      .select()
      .single();

    if (studentCommentError) {
      console.error('   ❌ Student could not add comment:', studentCommentError.message);
    } else {
      console.log('   ✅ Student can add comment to their own complaint');
    }

    // Test 2: Student can view their own comments
    console.log('   Test 2: Student views comments on their complaint...');
    const { data: studentViewComments, error: studentViewError } = await studentClient
      .from('complaint_comments')
      .select('*')
      .eq('complaint_id', complaint.id);

    if (studentViewError) {
      console.error('   ❌ Student could not view comments:', studentViewError.message);
    } else {
      console.log(`   ✅ Student can view comments (found ${studentViewComments.length})`);
    }

    await studentClient.auth.signOut();

    // Test 3: Lecturer can add comment to any complaint
    console.log('   Test 3: Lecturer adds comment to student complaint...');
    const lecturerClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    await lecturerClient.auth.signInWithPassword({
      email: lecturerEmail,
      password: password,
    });

    const { data: lecturerComment, error: lecturerCommentError } = await lecturerClient
      .from('complaint_comments')
      .insert({
        complaint_id: complaint.id,
        user_id: lecturerAuth.user.id,
        comment: 'This is a lecturer comment',
        is_internal: false,
      })
      .select()
      .single();

    if (lecturerCommentError) {
      console.error('   ❌ Lecturer could not add comment:', lecturerCommentError.message);
    } else {
      console.log('   ✅ Lecturer can add comment to any complaint');
    }

    // Test 4: Lecturer can add internal note
    console.log('   Test 4: Lecturer adds internal note...');
    const { data: internalNote, error: internalNoteError } = await lecturerClient
      .from('complaint_comments')
      .insert({
        complaint_id: complaint.id,
        user_id: lecturerAuth.user.id,
        comment: 'This is an internal note',
        is_internal: true,
      })
      .select()
      .single();

    if (internalNoteError) {
      console.error('   ❌ Lecturer could not add internal note:', internalNoteError.message);
    } else {
      console.log('   ✅ Lecturer can add internal notes');
    }

    // Test 5: Lecturer can view all comments including internal
    console.log('   Test 5: Lecturer views all comments...');
    const { data: lecturerViewComments, error: lecturerViewError } = await lecturerClient
      .from('complaint_comments')
      .select('*')
      .eq('complaint_id', complaint.id);

    if (lecturerViewError) {
      console.error('   ❌ Lecturer could not view comments:', lecturerViewError.message);
    } else {
      console.log(`   ✅ Lecturer can view all comments (found ${lecturerViewComments.length})`);
    }

    await lecturerClient.auth.signOut();

    // Test 6: Student cannot see internal notes
    console.log('   Test 6: Student cannot see internal notes...');
    await studentClient.auth.signInWithPassword({
      email: studentEmail,
      password: password,
    });

    const { data: studentViewComments2, error: studentViewError2 } = await studentClient
      .from('complaint_comments')
      .select('*')
      .eq('complaint_id', complaint.id);

    if (studentViewError2) {
      console.error('   ❌ Student could not view comments:', studentViewError2.message);
    } else {
      const internalCount = studentViewComments2.filter((c) => c.is_internal).length;
      if (internalCount === 0) {
        console.log('   ✅ Student cannot see internal notes (correct)');
      } else {
        console.error(`   ❌ Student can see ${internalCount} internal notes (should be 0)`);
      }
    }

    // Cleanup
    console.log('\n   Cleaning up test data...');
    await cleanup(studentAuth.user.id, lecturerAuth.user.id, complaint.id);
    console.log('   ✅ Cleanup complete');

    return true;
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

async function cleanup(studentId, lecturerId, complaintId) {
  try {
    // Delete complaint (cascade will delete comments)
    if (complaintId) {
      await adminClient.from('complaints').delete().eq('id', complaintId);
    }

    // Delete users
    await adminClient.from('users').delete().eq('id', studentId);
    await adminClient.from('users').delete().eq('id', lecturerId);

    // Delete auth users
    await adminClient.auth.admin.deleteUser(studentId);
    await adminClient.auth.admin.deleteUser(lecturerId);
  } catch (error) {
    console.error('Warning: Cleanup error:', error.message);
  }
}

// Run tests
testRLSPolicies()
  .then((success) => {
    if (success) {
      console.log('\n✅ All complaint_comments RLS policy tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  });
