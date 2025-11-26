/**
 * Comprehensive Test Suite for Auto-Escalation System
 *
 * This script tests multiple escalation scenarios:
 * 1. Basic escalation - single complaint matching a rule
 * 2. Multiple rules - different categories and priorities
 * 3. Multiple complaints - batch escalation
 * 4. Exclusion cases - complaints that should NOT be escalated
 * 5. Edge cases - no rules, no complaints, invalid data
 * 6. Re-escalation - complaints escalated multiple times
 * 7. Status filtering - only 'new' and 'opened' complaints
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test data tracking for cleanup
const testData = {
  complaints: [],
  rules: [],
  notifications: [],
  history: [],
};

// Helper function to create a complaint with a specific age
async function createComplaint(studentId, hoursOld, overrides = {}) {
  const createdAt = new Date();
  createdAt.setHours(createdAt.getHours() - hoursOld);

  const { data: complaint, error } = await supabase
    .from('complaints')
    .insert({
      student_id: studentId,
      title: `Test Complaint (${hoursOld}h old)`,
      description: 'Test complaint for escalation scenarios',
      category: 'academic',
      priority: 'high',
      status: 'new',
      is_draft: false,
      is_anonymous: false,
      ...overrides,
    })
    .select()
    .single();

  if (error) throw error;

  // Backdate the created_at timestamp
  await supabase
    .from('complaints')
    .update({
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    })
    .eq('id', complaint.id);

  testData.complaints.push(complaint.id);
  return complaint.id;
}

// Helper function to create an escalation rule
async function createRule(escalateToId, overrides = {}) {
  const { data: rule, error } = await supabase
    .from('escalation_rules')
    .insert({
      category: 'academic',
      priority: 'high',
      hours_threshold: 2,
      escalate_to: escalateToId,
      is_active: true,
      ...overrides,
    })
    .select()
    .single();

  if (error) throw error;
  testData.rules.push(rule.id);
  return rule;
}

// Helper function to invoke the edge function
async function invokeEscalationFunction() {
  const functionUrl = `${supabaseUrl}/functions/v1/auto-escalate-complaints`;

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Edge function failed: ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

// Helper function to verify complaint escalation
async function verifyComplaintEscalated(complaintId, expectedAssignedTo) {
  const { data: complaint } = await supabase
    .from('complaints')
    .select('*')
    .eq('id', complaintId)
    .single();

  return {
    isEscalated: complaint.escalated_at !== null,
    escalationLevel: complaint.escalation_level,
    assignedTo: complaint.assigned_to,
    matchesExpected: complaint.assigned_to === expectedAssignedTo,
  };
}

// Test Scenario 1: Basic Escalation
async function testBasicEscalation(adminId, studentId) {
  console.log('\n📋 Test 1: Basic Escalation');
  console.log('─'.repeat(50));

  // Create a rule: escalate academic/high after 2 hours
  const rule = await createRule(adminId, {
    category: 'academic',
    priority: 'high',
    hours_threshold: 2,
  });
  console.log(`✓ Created rule: academic/high, 2h threshold`);

  // Create a complaint that's 3 hours old (should be escalated)
  const complaintId = await createComplaint(studentId, 3, {
    category: 'academic',
    priority: 'high',
  });
  console.log(`✓ Created complaint (3h old)`);

  // Invoke escalation
  const result = await invokeEscalationFunction();
  console.log(`✓ Escalation function executed`);

  // Verify
  const verification = await verifyComplaintEscalated(complaintId, adminId);

  if (verification.isEscalated && verification.matchesExpected) {
    console.log(`✅ PASS: Complaint escalated correctly`);
    console.log(`   Escalation Level: ${verification.escalationLevel}`);
    console.log(`   Assigned To: ${verification.assignedTo}`);
    return true;
  } else {
    console.log(`❌ FAIL: Complaint not escalated as expected`);
    return false;
  }
}

// Test Scenario 2: Multiple Rules
async function testMultipleRules(adminId, lecturerId, studentId) {
  console.log('\n📋 Test 2: Multiple Rules with Different Criteria');
  console.log('─'.repeat(50));

  // Create multiple rules
  const rule1 = await createRule(adminId, {
    category: 'academic',
    priority: 'high',
    hours_threshold: 2,
  });
  console.log(`✓ Rule 1: academic/high → admin (2h)`);

  const rule2 = await createRule(lecturerId, {
    category: 'facilities',
    priority: 'medium',
    hours_threshold: 4,
  });
  console.log(`✓ Rule 2: facilities/medium → lecturer (4h)`);

  // Create complaints matching each rule
  const complaint1 = await createComplaint(studentId, 3, {
    category: 'academic',
    priority: 'high',
  });
  console.log(`✓ Complaint 1: academic/high (3h old)`);

  const complaint2 = await createComplaint(studentId, 5, {
    category: 'facilities',
    priority: 'medium',
  });
  console.log(`✓ Complaint 2: facilities/medium (5h old)`);

  // Invoke escalation
  await invokeEscalationFunction();
  console.log(`✓ Escalation function executed`);

  // Verify both complaints
  const verify1 = await verifyComplaintEscalated(complaint1, adminId);
  const verify2 = await verifyComplaintEscalated(complaint2, lecturerId);

  const passed =
    verify1.isEscalated &&
    verify1.matchesExpected &&
    verify2.isEscalated &&
    verify2.matchesExpected;

  if (passed) {
    console.log(`✅ PASS: Both complaints escalated to correct users`);
    return true;
  } else {
    console.log(`❌ FAIL: One or more complaints not escalated correctly`);
    return false;
  }
}

// Test Scenario 3: Multiple Complaints for Same Rule
async function testBatchEscalation(adminId, studentId) {
  console.log('\n📋 Test 3: Batch Escalation (Multiple Complaints)');
  console.log('─'.repeat(50));

  // Create one rule
  const rule = await createRule(adminId, {
    category: 'academic',
    priority: 'urgent',
    hours_threshold: 1,
  });
  console.log(`✓ Created rule: academic/urgent, 1h threshold`);

  // Create 5 complaints that should all be escalated
  const complaintIds = [];
  for (let i = 0; i < 5; i++) {
    const id = await createComplaint(studentId, 2 + i, {
      category: 'academic',
      priority: 'urgent',
      title: `Batch Test Complaint ${i + 1}`,
    });
    complaintIds.push(id);
  }
  console.log(`✓ Created 5 complaints (2-6h old)`);

  // Invoke escalation
  const result = await invokeEscalationFunction();
  console.log(`✓ Escalation function executed`);

  // Verify all complaints
  let allEscalated = true;
  for (const id of complaintIds) {
    const verify = await verifyComplaintEscalated(id, adminId);
    if (!verify.isEscalated || !verify.matchesExpected) {
      allEscalated = false;
      break;
    }
  }

  if (allEscalated) {
    console.log(`✅ PASS: All 5 complaints escalated correctly`);
    return true;
  } else {
    console.log(`❌ FAIL: Not all complaints were escalated`);
    return false;
  }
}

// Test Scenario 4: Exclusion Cases
async function testExclusionCases(adminId, studentId) {
  console.log('\n📋 Test 4: Exclusion Cases (Should NOT Escalate)');
  console.log('─'.repeat(50));

  // Create a rule
  const rule = await createRule(adminId, {
    category: 'academic',
    priority: 'high',
    hours_threshold: 2,
  });
  console.log(`✓ Created rule: academic/high, 2h threshold`);

  // Case 1: Too recent (1 hour old, threshold is 2)
  const tooRecent = await createComplaint(studentId, 1, {
    category: 'academic',
    priority: 'high',
  });
  console.log(`✓ Case 1: Complaint too recent (1h old)`);

  // Case 2: Wrong status (resolved)
  const wrongStatus = await createComplaint(studentId, 3, {
    category: 'academic',
    priority: 'high',
    status: 'resolved',
  });
  console.log(`✓ Case 2: Complaint with wrong status (resolved)`);

  // Case 3: Already escalated
  const alreadyEscalated = await createComplaint(studentId, 3, {
    category: 'academic',
    priority: 'high',
  });
  await supabase
    .from('complaints')
    .update({
      escalated_at: new Date().toISOString(),
      escalation_level: 1,
    })
    .eq('id', alreadyEscalated);
  console.log(`✓ Case 3: Already escalated complaint`);

  // Case 4: Wrong category
  const wrongCategory = await createComplaint(studentId, 3, {
    category: 'facilities',
    priority: 'high',
  });
  console.log(`✓ Case 4: Wrong category (facilities vs academic)`);

  // Case 5: Wrong priority
  const wrongPriority = await createComplaint(studentId, 3, {
    category: 'academic',
    priority: 'low',
  });
  console.log(`✓ Case 5: Wrong priority (low vs high)`);

  // Invoke escalation
  await invokeEscalationFunction();
  console.log(`✓ Escalation function executed`);

  // Verify none of these were escalated
  const checks = await Promise.all([
    verifyComplaintEscalated(tooRecent, adminId),
    verifyComplaintEscalated(wrongStatus, adminId),
    verifyComplaintEscalated(wrongCategory, adminId),
    verifyComplaintEscalated(wrongPriority, adminId),
  ]);

  // Note: alreadyEscalated should still be escalated (from before)
  const alreadyCheck = await verifyComplaintEscalated(alreadyEscalated, adminId);

  const noneEscalated = checks.every((c) => !c.isEscalated);
  const alreadyStillEscalated = alreadyCheck.isEscalated && alreadyCheck.escalationLevel === 1;

  if (noneEscalated && alreadyStillEscalated) {
    console.log(`✅ PASS: Exclusion cases handled correctly`);
    console.log(`   - Too recent: not escalated ✓`);
    console.log(`   - Wrong status: not escalated ✓`);
    console.log(`   - Already escalated: unchanged ✓`);
    console.log(`   - Wrong category: not escalated ✓`);
    console.log(`   - Wrong priority: not escalated ✓`);
    return true;
  } else {
    console.log(`❌ FAIL: Some exclusion cases failed`);
    return false;
  }
}

// Test Scenario 5: No Active Rules
async function testNoActiveRules(studentId) {
  console.log('\n📋 Test 5: No Active Rules');
  console.log('─'.repeat(50));

  // Ensure all rules are disabled (including any from previous tests)
  await supabase.from('escalation_rules').update({ is_active: false }).eq('is_active', true);

  // Create a complaint but no active rules
  const complaintId = await createComplaint(studentId, 5, {
    category: 'academic',
    priority: 'high',
  });
  console.log(`✓ Created complaint (5h old)`);
  console.log(`✓ No active escalation rules`);

  // Invoke escalation
  const result = await invokeEscalationFunction();
  console.log(`✓ Escalation function executed`);

  // Verify complaint was not escalated
  const verification = await verifyComplaintEscalated(complaintId, null);

  if (!verification.isEscalated && result.message.includes('No active escalation rules')) {
    console.log(`✅ PASS: No escalation occurred (as expected)`);
    console.log(`   Message: ${result.message}`);
    return true;
  } else {
    console.log(`❌ FAIL: Complaint was escalated despite no rules`);
    console.log(`   Escalated: ${verification.isEscalated}`);
    console.log(`   Message: ${result.message}`);
    return false;
  }
}

// Test Scenario 6: Re-escalation
async function testReEscalation(adminId, lecturerId, studentId) {
  console.log('\n📋 Test 6: Re-escalation (Multiple Levels)');
  console.log('─'.repeat(50));

  // Create a rule
  const rule = await createRule(adminId, {
    category: 'academic',
    priority: 'high',
    hours_threshold: 2,
  });
  console.log(`✓ Created rule: academic/high, 2h threshold`);

  // Create a complaint
  const complaintId = await createComplaint(studentId, 3, {
    category: 'academic',
    priority: 'high',
  });
  console.log(`✓ Created complaint (3h old)`);

  // First escalation
  await invokeEscalationFunction();
  const verify1 = await verifyComplaintEscalated(complaintId, adminId);
  console.log(`✓ First escalation: Level ${verify1.escalationLevel}`);

  // Simulate time passing and reset escalated_at to allow re-escalation
  await supabase
    .from('complaints')
    .update({
      escalated_at: null,
      status: 'open', // Still in a valid status for escalation
    })
    .eq('id', complaintId);

  // Second escalation
  await invokeEscalationFunction();
  const verify2 = await verifyComplaintEscalated(complaintId, adminId);
  console.log(`✓ Second escalation: Level ${verify2.escalationLevel}`);

  if (verify2.escalationLevel === 2) {
    console.log(`✅ PASS: Re-escalation incremented level correctly`);
    return true;
  } else {
    console.log(
      `❌ FAIL: Escalation level not incremented (expected 2, got ${verify2.escalationLevel})`
    );
    return false;
  }
}

// Test Scenario 7: Status Filtering
async function testStatusFiltering(adminId, studentId) {
  console.log('\n📋 Test 7: Status Filtering (Only new/opened)');
  console.log('─'.repeat(50));

  // Create a rule
  const rule = await createRule(adminId, {
    category: 'academic',
    priority: 'high',
    hours_threshold: 2,
  });
  console.log(`✓ Created rule: academic/high, 2h threshold`);

  // Create complaints with different statuses
  const newComplaint = await createComplaint(studentId, 3, {
    category: 'academic',
    priority: 'high',
    status: 'new',
  });
  console.log(`✓ Created 'new' complaint`);

  const openComplaint = await createComplaint(studentId, 3, {
    category: 'academic',
    priority: 'high',
    status: 'open',
  });
  console.log(`✓ Created 'open' complaint`);

  const inProgressComplaint = await createComplaint(studentId, 3, {
    category: 'academic',
    priority: 'high',
    status: 'in_progress',
  });
  console.log(`✓ Created 'in_progress' complaint (should not escalate)`);

  const resolvedComplaint = await createComplaint(studentId, 3, {
    category: 'academic',
    priority: 'high',
    status: 'resolved',
  });
  console.log(`✓ Created 'resolved' complaint (should not escalate)`);

  // Invoke escalation
  await invokeEscalationFunction();
  console.log(`✓ Escalation function executed`);

  // Verify
  const verifyNew = await verifyComplaintEscalated(newComplaint, adminId);
  const verifyOpen = await verifyComplaintEscalated(openComplaint, adminId);
  const verifyInProgress = await verifyComplaintEscalated(inProgressComplaint, adminId);
  const verifyResolved = await verifyComplaintEscalated(resolvedComplaint, adminId);

  const passed =
    verifyNew.isEscalated &&
    verifyOpen.isEscalated &&
    !verifyInProgress.isEscalated &&
    !verifyResolved.isEscalated;

  if (passed) {
    console.log(`✅ PASS: Status filtering works correctly`);
    console.log(`   - 'new' status: escalated ✓`);
    console.log(`   - 'open' status: escalated ✓`);
    console.log(`   - 'in_progress' status: not escalated ✓`);
    console.log(`   - 'resolved' status: not escalated ✓`);
    return true;
  } else {
    console.log(`❌ FAIL: Status filtering not working correctly`);
    return false;
  }
}

// Cleanup function
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');

  // Delete complaints (this will cascade to related records)
  if (testData.complaints.length > 0) {
    await supabase.from('complaint_history').delete().in('complaint_id', testData.complaints);
    await supabase.from('notifications').delete().in('related_id', testData.complaints);
    await supabase.from('complaints').delete().in('id', testData.complaints);
    console.log(`✓ Deleted ${testData.complaints.length} test complaints`);
  }

  // Delete rules
  if (testData.rules.length > 0) {
    await supabase.from('escalation_rules').delete().in('id', testData.rules);
    console.log(`✓ Deleted ${testData.rules.length} test rules`);
  }

  console.log('✓ Cleanup complete');
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Auto-Escalation Comprehensive Test Suite');
  console.log('='.repeat(50));

  try {
    // Get test users
    console.log('\n📋 Setting up test users...');
    const { data: adminUser } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'admin')
      .limit(1)
      .single();

    const { data: lecturerUser } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'lecturer')
      .limit(1)
      .single();

    const { data: studentUser } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'student')
      .limit(1)
      .single();

    if (!adminUser || !lecturerUser || !studentUser) {
      console.error('❌ Missing required test users (admin, lecturer, student)');
      return;
    }

    console.log(`✓ Admin: ${adminUser.full_name}`);
    console.log(`✓ Lecturer: ${lecturerUser.full_name}`);
    console.log(`✓ Student: ${studentUser.full_name}`);

    // Disable existing rules to avoid interference
    console.log('\n📋 Disabling existing escalation rules...');
    await supabase.from('escalation_rules').update({ is_active: false }).eq('is_active', true);
    console.log('✓ Existing rules disabled');

    // Run all test scenarios
    const results = [];

    results.push(await testBasicEscalation(adminUser.id, studentUser.id));
    results.push(await testMultipleRules(adminUser.id, lecturerUser.id, studentUser.id));
    results.push(await testBatchEscalation(adminUser.id, studentUser.id));
    results.push(await testExclusionCases(adminUser.id, studentUser.id));
    results.push(await testNoActiveRules(studentUser.id));
    results.push(await testReEscalation(adminUser.id, lecturerUser.id, studentUser.id));
    results.push(await testStatusFiltering(adminUser.id, studentUser.id));

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary');
    console.log('='.repeat(50));

    const passed = results.filter((r) => r).length;
    const total = results.length;
    const failed = total - passed;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the output above.');
    }
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
  } finally {
    await cleanup();

    // Re-enable original rules
    console.log('\n📋 Re-enabling original escalation rules...');
    await supabase.from('escalation_rules').update({ is_active: true }).eq('is_active', false);
    console.log('✓ Original rules re-enabled');

    console.log('\n✨ Test suite complete!');
  }
}

// Run the test suite
runAllTests().catch(console.error);
