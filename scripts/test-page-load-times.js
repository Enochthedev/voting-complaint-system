#!/usr/bin/env node

/**
 * Page Load Time Performance Testing Script
 *
 * This script tests the load times of all major pages in the Student Complaint System
 * to ensure they meet the NFR1 requirement: Page load times under 2 seconds
 *
 * Requirements tested:
 * - NFR1: Performance - Page load times under 2 seconds
 *
 * Usage:
 *   node scripts/test-page-load-times.js [--url=http://localhost:3000] [--threshold=2000]
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Parse command line arguments
const args = process.argv.slice(2);
const BASE_URL =
  args.find((arg) => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000';
const THRESHOLD_MS = parseInt(
  args.find((arg) => arg.startsWith('--threshold='))?.split('=')[1] || '2000'
);

// Test configuration
const TEST_CONFIG = {
  baseUrl: BASE_URL,
  thresholdMs: THRESHOLD_MS,
  warmupRequests: 1, // Number of warmup requests before actual test
  testIterations: 3, // Number of test iterations per page
};

// Pages to test
const PAGES_TO_TEST = [
  // Public pages
  { name: 'Login Page', path: '/login', requiresAuth: false },
  { name: 'Register Page', path: '/register', requiresAuth: false },

  // Student pages
  { name: 'Student Dashboard', path: '/dashboard', requiresAuth: true, role: 'student' },
  { name: 'Complaints List', path: '/complaints', requiresAuth: true, role: 'student' },
  { name: 'New Complaint Form', path: '/complaints/new', requiresAuth: true, role: 'student' },
  { name: 'Draft Complaints', path: '/complaints/drafts', requiresAuth: true, role: 'student' },
  { name: 'Votes List', path: '/votes', requiresAuth: true, role: 'student' },
  { name: 'Announcements', path: '/announcements', requiresAuth: true, role: 'student' },
  { name: 'Notifications', path: '/notifications', requiresAuth: true, role: 'student' },

  // Lecturer pages
  { name: 'Lecturer Dashboard', path: '/dashboard', requiresAuth: true, role: 'lecturer' },
  { name: 'Admin Complaints', path: '/admin/complaints', requiresAuth: true, role: 'lecturer' },
  { name: 'Analytics Dashboard', path: '/admin/dashboard', requiresAuth: true, role: 'lecturer' },
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Measure page load time using fetch
 */
async function measurePageLoadTime(url, headers = {}) {
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Performance-Test-Script',
        ...headers,
      },
    });

    // Read the response body to ensure full page load
    await response.text();

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    return {
      success: true,
      loadTime,
      status: response.status,
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      success: false,
      loadTime: endTime - startTime,
      error: error.message,
    };
  }
}

/**
 * Get authentication token for testing
 */
async function getAuthToken(role) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Test credentials (these should exist in your test database)
  const credentials = {
    student: {
      email: 'student@test.com',
      password: 'Test123!@#',
    },
    lecturer: {
      email: 'lecturer@test.com',
      password: 'Test123!@#',
    },
  };

  const creds = credentials[role];
  if (!creds) {
    throw new Error(`Unknown role: ${role}`);
  }

  const { data, error } = await supabase.auth.signInWithPassword(creds);

  if (error) {
    console.error(
      `${colors.red}Failed to authenticate as ${role}: ${error.message}${colors.reset}`
    );
    return null;
  }

  return data.session?.access_token;
}

/**
 * Test a single page
 */
async function testPage(page, authToken = null) {
  const url = `${TEST_CONFIG.baseUrl}${page.path}`;
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  // Warmup requests
  for (let i = 0; i < TEST_CONFIG.warmupRequests; i++) {
    await measurePageLoadTime(url, headers);
  }

  // Actual test iterations
  const results = [];
  for (let i = 0; i < TEST_CONFIG.testIterations; i++) {
    const result = await measurePageLoadTime(url, headers);
    results.push(result);

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Calculate statistics
  const successfulResults = results.filter((r) => r.success);
  const loadTimes = successfulResults.map((r) => r.loadTime);

  if (loadTimes.length === 0) {
    return {
      page: page.name,
      path: page.path,
      success: false,
      error: results[0]?.error || 'All requests failed',
    };
  }

  const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
  const minLoadTime = Math.min(...loadTimes);
  const maxLoadTime = Math.max(...loadTimes);
  const passed = avgLoadTime < TEST_CONFIG.thresholdMs;

  return {
    page: page.name,
    path: page.path,
    success: true,
    passed,
    avgLoadTime: Math.round(avgLoadTime),
    minLoadTime,
    maxLoadTime,
    threshold: TEST_CONFIG.thresholdMs,
    iterations: loadTimes.length,
  };
}

/**
 * Format load time with color
 */
function formatLoadTime(loadTime, threshold) {
  const color =
    loadTime < threshold ? colors.green : loadTime < threshold * 1.5 ? colors.yellow : colors.red;
  return `${color}${loadTime}ms${colors.reset}`;
}

/**
 * Print test results
 */
function printResults(results) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${colors.cyan}Page Load Time Test Results${colors.reset}`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`${colors.blue}Configuration:${colors.reset}`);
  console.log(`  Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`  Threshold: ${TEST_CONFIG.thresholdMs}ms`);
  console.log(`  Iterations per page: ${TEST_CONFIG.testIterations}`);
  console.log(`  Warmup requests: ${TEST_CONFIG.warmupRequests}\n`);

  const passed = results.filter((r) => r.success && r.passed).length;
  const failed = results.filter((r) => !r.success || !r.passed).length;
  const total = results.length;

  console.log(`${colors.blue}Summary:${colors.reset}`);
  console.log(`  Total pages tested: ${total}`);
  console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${failed}${colors.reset}\n`);

  console.log(`${colors.blue}Detailed Results:${colors.reset}\n`);

  // Group results by status
  const successfulTests = results.filter((r) => r.success);
  const failedTests = results.filter((r) => !r.success);

  // Print successful tests
  if (successfulTests.length > 0) {
    console.log(`${colors.cyan}Successful Tests:${colors.reset}\n`);

    successfulTests.forEach((result) => {
      const status = result.passed
        ? `${colors.green}✓ PASS${colors.reset}`
        : `${colors.red}✗ FAIL${colors.reset}`;
      console.log(`  ${status} ${result.page}`);
      console.log(`    Path: ${colors.gray}${result.path}${colors.reset}`);
      console.log(`    Average: ${formatLoadTime(result.avgLoadTime, result.threshold)}`);
      console.log(`    Min: ${colors.gray}${result.minLoadTime}ms${colors.reset}`);
      console.log(`    Max: ${colors.gray}${result.maxLoadTime}ms${colors.reset}`);
      console.log(`    Threshold: ${colors.gray}${result.threshold}ms${colors.reset}`);
      console.log();
    });
  }

  // Print failed tests
  if (failedTests.length > 0) {
    console.log(`${colors.red}Failed Tests:${colors.reset}\n`);

    failedTests.forEach((result) => {
      console.log(`  ${colors.red}✗ ERROR${colors.reset} ${result.page}`);
      console.log(`    Path: ${colors.gray}${result.path}${colors.reset}`);
      console.log(`    Error: ${colors.red}${result.error}${colors.reset}`);
      console.log();
    });
  }

  console.log(`${'='.repeat(80)}\n`);

  // Overall result
  if (failed === 0) {
    console.log(`${colors.green}✓ All pages passed the performance test!${colors.reset}\n`);
    return true;
  } else {
    console.log(`${colors.red}✗ ${failed} page(s) failed the performance test${colors.reset}\n`);
    return false;
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log(`${colors.cyan}Starting Page Load Time Performance Tests...${colors.reset}\n`);

  // Check if server is running
  try {
    const response = await fetch(TEST_CONFIG.baseUrl);
    if (!response.ok && response.status !== 404) {
      throw new Error(`Server returned status ${response.status}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error: Cannot connect to ${TEST_CONFIG.baseUrl}${colors.reset}`);
    console.error(
      `${colors.red}Please ensure the development server is running with: npm run dev${colors.reset}\n`
    );
    process.exit(1);
  }

  // Get authentication tokens
  console.log(`${colors.blue}Authenticating test users...${colors.reset}`);
  const studentToken = await getAuthToken('student');
  const lecturerToken = await getAuthToken('lecturer');

  if (!studentToken || !lecturerToken) {
    console.error(
      `${colors.red}Failed to authenticate test users. Please ensure test users exist.${colors.reset}\n`
    );
    process.exit(1);
  }

  console.log(`${colors.green}✓ Authentication successful${colors.reset}\n`);

  // Run tests
  const results = [];

  for (const page of PAGES_TO_TEST) {
    console.log(`${colors.gray}Testing: ${page.name}...${colors.reset}`);

    let authToken = null;
    if (page.requiresAuth) {
      authToken = page.role === 'lecturer' ? lecturerToken : studentToken;
    }

    const result = await testPage(page, authToken);
    results.push(result);
  }

  // Print results
  const allPassed = printResults(results);

  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
});
