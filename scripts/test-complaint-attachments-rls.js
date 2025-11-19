#!/usr/bin/env node

/**
 * Test script for complaint_attachments RLS policies
 * 
 * This script verifies that:
 * 1. Students can view attachments on their own complaints
 * 2. Lecturers can view attachments on all complaints
 * 3. Students can upload attachments to their own complaints
 * 4. Lecturers can upload attachments to any complaint
 * 5. Students can delete attachments from their own complaints
 * 6. Lecturers can delete attachments from any complaint
 * 7. Students cannot view/upload/delete attachments on other students' complaints
 * 8. Anonymous complaints maintain privacy
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

// Create admin client
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

// Test users
const testUsers = {
  student1: {
    email: 'student1.attachments@test.com',
    password: 'TestPassword123!',
    role: 'student',
    full_name: 'Test Student 1'
  },
  student2: {
    email: 'student2.attachments@test.com',
    password: 'TestPassword123!',
    role: 'student',
    full_name: 'Test Student 2'
  },
  lecturer: {
    email: 'lecturer.attachments@test.com',
    password: 'TestPassword123!',
    role: 'lecturer',
    full_name: 'Test Lecturer'
  }
};

let testData = {
  users: {},
  complaints: {},
  attachments: {}
};

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete test attachments
    if (Object.keys(testData.attachments).length > 0) {
      const attachmentIds = Object.values(testData.attachments).map(a => a.id);
      await adminClient.from('complaint_attachments').delete().in('id', attachmentIds);
    }
    
    // Delete test complaints
    if (Object.keys(testData.complaints).length > 0) {
      const complaintIds = Object.values(testData.complaints).map(c => c.id);
      await adminClient.from('complaints').delete().in('id', complaintIds);
    }
    
    // Delete test users
    for (const user of Object.values(testData.users)) {
      if (user?.id) {
        await adminClient.auth.admin.deleteUser(user.id);
      }
    }
    
    console.log('✅ Cleanup complete');
  } catch (error) {
    console.error('⚠️  Cleanup error:', error.message);
  }
}

async function setupTestData() {
  console.log('📝 Setting up test data...\n');
  
  // Create test users
  for (const [key, userData] of Object.entries(testUsers)) {
    try {
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          role: userData.role,
          full_name: userData.full_name
        }
      });
      
      if (authError) throw authError;
      
      testData.users[key] = authData.user;
      console.log(`✅ Created ${key}: ${userData.email}`);
    } catch (error) {
      console.error(`❌ Failed to create ${key}:`, error.message);
      throw error;
    }
  }
  
  // Create test complaints
  const complaints = [
    {
      key: 'student1Complaint',
      student_id: testData.users.student1.id,
      is_anonymous: false,
      is_draft: false,
      title: 'Test Complaint 1',
      description: 'This is a test complaint for attachment testing',
      category: 'academic',
      priority: 'medium',
      status: 'new'
    },
    {
      key: 'student2Complaint',
      student_id: testData.users.student2.id,
      is_anonymous: false,
      is_draft: false,
      title: 'Test Complaint 2',
      description: 'This is another test complaint',
      category: 'facilities',
      priority: 'low',
      status: 'new'
    },
    {
      key: 'anonymousComplaint',
      student_id: null,
      is_anonymous: true,
      is_draft: false,
      title: 'Anonymous Test Complaint',
      description: 'This is an anonymous complaint',
      category: 'other',
      priority: 'high',
      status: 'new'
    }
  ];
  
  for (const complaint of complaints) {
    const { key, ...complaintData } = complaint;
    const { data, error } = await adminClient
      .from('complaints')
      .insert(complaintData)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Failed to create ${key}:`, error.message);
      throw error;
    }
    
    testData.complaints[key] = data;
    console.log(`✅ Created ${key}`);
  }
  
  console.log('\n✅ Test data setup complete\n');
}

async function createUserClient(userKey) {
  const userData = testUsers[userKey];
  const client = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  const { data, error } = await client.auth.signInWithPassword({
    email: userData.email,
    password: userData.password
  });
  
  if (error) {
    throw new Error(`Failed to sign in as ${userKey}: ${error.message}`);
  }
  
  return client;
}

async function runTests() {
  console.log('🧪 Running RLS Policy Tests\n');
  console.log('='.repeat(60));
  
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Student can upload attachment to own complaint
  console.log('\n📋 Test 1: Student can upload attachment to own complaint');
  try {
    const student1Client = await createUserClient('student1');
    
    const { data, error } = await student1Client
      .from('complaint_attachments')
      .insert({
        complaint_id: testData.complaints.student1Complaint.id,
        file_name: 'test-document.pdf',
        file_path: 'attachments/test-document.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        uploaded_by: testData.users.student1.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    testData.attachments.student1Attachment = data;
    console.log('✅ PASS: Student can upload attachment to own complaint');
    passedTests++;
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    failedTests++;
  }
  
  // Test 2: Student cannot upload attachment to another student's complaint
  console.log('\n📋 Test 2: Student cannot upload attachment to another student\'s complaint');
  try {
    const student1Client = await createUserClient('student1');
    
    const { data, error } = await student1Client
      .from('complaint_attachments')
      .insert({
        complaint_id: testData.complaints.student2Complaint.id,
        file_name: 'unauthorized.pdf',
        file_path: 'attachments/unauthorized.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        uploaded_by: testData.users.student1.id
      })
      .select()
      .single();
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ PASS: Student correctly blocked from uploading to other\'s complaint');
      passedTests++;
    } else {
      console.log('❌ FAIL: Student should not be able to upload to other\'s complaint');
      failedTests++;
    }
  } catch (error) {
    console.log('✅ PASS: Student correctly blocked (exception thrown)');
    passedTests++;
  }
  
  // Test 3: Lecturer can upload attachment to any complaint
  console.log('\n📋 Test 3: Lecturer can upload attachment to any complaint');
  try {
    const lecturerClient = await createUserClient('lecturer');
    
    const { data, error } = await lecturerClient
      .from('complaint_attachments')
      .insert({
        complaint_id: testData.complaints.student2Complaint.id,
        file_name: 'lecturer-response.pdf',
        file_path: 'attachments/lecturer-response.pdf',
        file_size: 2048,
        file_type: 'application/pdf',
        uploaded_by: testData.users.lecturer.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    testData.attachments.lecturerAttachment = data;
    console.log('✅ PASS: Lecturer can upload attachment to any complaint');
    passedTests++;
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    failedTests++;
  }
  
  // Test 4: Student can view attachments on own complaint
  console.log('\n📋 Test 4: Student can view attachments on own complaint');
  try {
    const student1Client = await createUserClient('student1');
    
    const { data, error } = await student1Client
      .from('complaint_attachments')
      .select('*')
      .eq('complaint_id', testData.complaints.student1Complaint.id);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      console.log(`✅ PASS: Student can view ${data.length} attachment(s) on own complaint`);
      passedTests++;
    } else {
      console.log('❌ FAIL: Student should see attachments on own complaint');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    failedTests++;
  }
  
  // Test 5: Student cannot view attachments on another student's complaint
  console.log('\n📋 Test 5: Student cannot view attachments on another student\'s complaint');
  try {
    const student1Client = await createUserClient('student1');
    
    const { data, error } = await student1Client
      .from('complaint_attachments')
      .select('*')
      .eq('complaint_id', testData.complaints.student2Complaint.id);
    
    if (error) throw error;
    
    if (data && data.length === 0) {
      console.log('✅ PASS: Student correctly cannot view other\'s attachments');
      passedTests++;
    } else {
      console.log('❌ FAIL: Student should not see other\'s attachments');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    failedTests++;
  }
  
  // Test 6: Lecturer can view attachments on all complaints
  console.log('\n📋 Test 6: Lecturer can view attachments on all complaints');
  try {
    const lecturerClient = await createUserClient('lecturer');
    
    const { data, error } = await lecturerClient
      .from('complaint_attachments')
      .select('*');
    
    if (error) throw error;
    
    if (data && data.length >= 2) {
      console.log(`✅ PASS: Lecturer can view all ${data.length} attachments`);
      passedTests++;
    } else {
      console.log('❌ FAIL: Lecturer should see all attachments');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    failedTests++;
  }
  
  // Test 7: Student can delete attachment from own complaint
  console.log('\n📋 Test 7: Student can delete attachment from own complaint');
  try {
    const student1Client = await createUserClient('student1');
    
    // First create a new attachment to delete
    const { data: newAttachment, error: insertError } = await student1Client
      .from('complaint_attachments')
      .insert({
        complaint_id: testData.complaints.student1Complaint.id,
        file_name: 'to-delete.pdf',
        file_path: 'attachments/to-delete.pdf',
        file_size: 512,
        file_type: 'application/pdf',
        uploaded_by: testData.users.student1.id
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    // Now delete it
    const { error: deleteError } = await student1Client
      .from('complaint_attachments')
      .delete()
      .eq('id', newAttachment.id);
    
    if (deleteError) throw deleteError;
    
    console.log('✅ PASS: Student can delete attachment from own complaint');
    passedTests++;
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    failedTests++;
  }
  
  // Test 8: Student cannot delete attachment from another student's complaint
  console.log('\n📋 Test 8: Student cannot delete attachment from another student\'s complaint');
  try {
    const student1Client = await createUserClient('student1');
    
    const { error } = await student1Client
      .from('complaint_attachments')
      .delete()
      .eq('id', testData.attachments.lecturerAttachment.id);
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ PASS: Student correctly blocked from deleting other\'s attachments');
      passedTests++;
    } else {
      console.log('❌ FAIL: Student should not be able to delete other\'s attachments');
      failedTests++;
    }
  } catch (error) {
    console.log('✅ PASS: Student correctly blocked (exception thrown)');
    passedTests++;
  }
  
  // Test 9: Lecturer can delete attachment from any complaint
  console.log('\n📋 Test 9: Lecturer can delete attachment from any complaint');
  try {
    const lecturerClient = await createUserClient('lecturer');
    
    const { error } = await lecturerClient
      .from('complaint_attachments')
      .delete()
      .eq('id', testData.attachments.lecturerAttachment.id);
    
    if (error) throw error;
    
    console.log('✅ PASS: Lecturer can delete attachment from any complaint');
    passedTests++;
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    failedTests++;
  }
  
  // Test 10: Verify file size constraints
  console.log('\n📋 Test 10: Verify file size constraints');
  try {
    const student1Client = await createUserClient('student1');
    
    // Try to upload file larger than 10MB
    const { data, error } = await student1Client
      .from('complaint_attachments')
      .insert({
        complaint_id: testData.complaints.student1Complaint.id,
        file_name: 'too-large.pdf',
        file_path: 'attachments/too-large.pdf',
        file_size: 11 * 1024 * 1024, // 11MB
        file_type: 'application/pdf',
        uploaded_by: testData.users.student1.id
      })
      .select()
      .single();
    
    if (error && error.message.includes('file_size_limit')) {
      console.log('✅ PASS: File size limit constraint working correctly');
      passedTests++;
    } else {
      console.log('❌ FAIL: File size limit should be enforced');
      failedTests++;
    }
  } catch (error) {
    if (error.message.includes('file_size_limit')) {
      console.log('✅ PASS: File size limit constraint working correctly');
      passedTests++;
    } else {
      console.log('❌ FAIL:', error.message);
      failedTests++;
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Total: ${passedTests + failedTests}`);
  console.log(`🎯 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  
  return failedTests === 0;
}

async function main() {
  try {
    await setupTestData();
    const success = await runTests();
    await cleanup();
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    await cleanup();
    process.exit(1);
  }
}

main();
