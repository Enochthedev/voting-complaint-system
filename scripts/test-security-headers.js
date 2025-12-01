#!/usr/bin/env node

/**
 * Security Headers Testing Script
 *
 * This script tests that all required security headers are present
 * and properly configured in the application.
 *
 * Usage:
 *   node scripts/test-security-headers.js [url]
 *
 * Examples:
 *   node scripts/test-security-headers.js http://localhost:3000
 *   node scripts/test-security-headers.js https://your-app.vercel.app
 */

const https = require('https');
const http = require('http');

// Default to localhost if no URL provided
const testUrl = process.argv[2] || 'http://localhost:3000';

// Required security headers and their expected values/patterns
const REQUIRED_HEADERS = {
  'x-frame-options': {
    expected: 'DENY',
    description: 'Prevents clickjacking attacks',
  },
  'x-content-type-options': {
    expected: 'nosniff',
    description: 'Prevents MIME type sniffing',
  },
  'x-xss-protection': {
    expected: '1; mode=block',
    description: 'Enables browser XSS protection',
  },
  'referrer-policy': {
    expected: 'strict-origin-when-cross-origin',
    description: 'Controls referrer information',
  },
  'permissions-policy': {
    pattern: /camera=\(\).*microphone=\(\).*geolocation=\(\)/,
    description: 'Restricts browser features',
  },
  'strict-transport-security': {
    pattern: /max-age=\d+/,
    description: 'Forces HTTPS connections',
  },
  'content-security-policy': {
    pattern: /default-src.*script-src.*style-src/,
    description: 'Defines trusted content sources',
  },
};

console.log('🔒 Security Headers Test\n');
console.log(`Testing URL: ${testUrl}\n`);

// Parse URL
const url = new URL(testUrl);
const protocol = url.protocol === 'https:' ? https : http;

// Make request
const request = protocol.get(testUrl, (response) => {
  console.log(`Status Code: ${response.statusCode}\n`);

  if (response.statusCode !== 200) {
    console.error('❌ Error: Non-200 status code received');
    console.error('Make sure the application is running and accessible\n');
    process.exit(1);
  }

  const headers = response.headers;
  let allPassed = true;
  let passedCount = 0;
  let failedCount = 0;

  console.log('Security Headers Check:\n');
  console.log('─'.repeat(80));

  // Check each required header
  for (const [headerName, config] of Object.entries(REQUIRED_HEADERS)) {
    const headerValue = headers[headerName];
    let passed = false;
    let message = '';

    if (!headerValue) {
      message = '❌ MISSING';
      failedCount++;
    } else if (config.expected) {
      // Check exact match
      if (headerValue.toLowerCase() === config.expected.toLowerCase()) {
        message = '✅ PASS';
        passed = true;
        passedCount++;
      } else {
        message = `❌ FAIL (expected: ${config.expected}, got: ${headerValue})`;
        failedCount++;
      }
    } else if (config.pattern) {
      // Check pattern match
      if (config.pattern.test(headerValue)) {
        message = '✅ PASS';
        passed = true;
        passedCount++;
      } else {
        message = `❌ FAIL (pattern not matched)`;
        failedCount++;
      }
    }

    if (!passed) {
      allPassed = false;
    }

    console.log(`${message} | ${headerName}`);
    console.log(`         ${config.description}`);
    if (headerValue) {
      // Truncate long values for readability
      const displayValue =
        headerValue.length > 100 ? headerValue.substring(0, 100) + '...' : headerValue;
      console.log(`         Value: ${displayValue}`);
    }
    console.log('─'.repeat(80));
  }

  // Summary
  console.log('\n📊 Summary:\n');
  console.log(`Total Headers Checked: ${Object.keys(REQUIRED_HEADERS).length}`);
  console.log(`✅ Passed: ${passedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log();

  if (allPassed) {
    console.log('🎉 All security headers are properly configured!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some security headers are missing or misconfigured.\n');
    console.log('Please check next.config.ts and ensure all headers are defined.\n');
    process.exit(1);
  }
});

request.on('error', (error) => {
  console.error('❌ Error making request:', error.message);
  console.error('\nMake sure:');
  console.error('1. The application is running (npm run dev or npm run build && npm start)');
  console.error('2. The URL is correct');
  console.error('3. There are no network issues\n');
  process.exit(1);
});

request.setTimeout(10000, () => {
  console.error('❌ Request timed out after 10 seconds\n');
  process.exit(1);
});
