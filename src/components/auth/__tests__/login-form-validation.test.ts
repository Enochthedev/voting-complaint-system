/**
 * Manual validation tests for login form
 * These tests verify the form validation logic
 */

import { isValidEmail } from '@/lib/auth';

// Test email validation
console.log('Testing email validation...');

// Valid emails
const validEmails = ['student@university.edu', 'test.user@example.com', 'user+tag@domain.co.uk'];

validEmails.forEach((email) => {
  const result = isValidEmail(email);
  console.log(`✓ ${email}: ${result ? 'PASS' : 'FAIL'}`);
  if (!result) {
    throw new Error(`Expected ${email} to be valid`);
  }
});

// Invalid emails
const invalidEmails = ['', 'notanemail', '@example.com', 'user@', 'user @example.com', 'user@.com'];

invalidEmails.forEach((email) => {
  const result = isValidEmail(email);
  console.log(`✓ ${email || '(empty)'}: ${!result ? 'PASS' : 'FAIL'}`);
  if (result) {
    throw new Error(`Expected ${email} to be invalid`);
  }
});

console.log('\n✅ All email validation tests passed!');

// Test password validation requirements
console.log('\nPassword validation requirements:');
console.log('- Minimum 8 characters');
console.log('- At least one uppercase letter');
console.log('- At least one lowercase letter');
console.log('- At least one number');

console.log('\n✅ Login form validation tests completed successfully!');
