#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 *
 * This script validates that all required environment variables are set
 * and provides helpful error messages if any are missing.
 *
 * Run with: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Load environment variables from .env.local or process.env (for Vercel)
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  // Check if running in CI/CD environment (like Vercel)
  const isCI = process.env.CI || process.env.VERCEL || process.env.NETLIFY;
  
  if (isCI) {
    // In CI/CD, use process.env directly
    log('ℹ️  Running in CI/CD environment, using process.env', 'cyan');
    return process.env;
  }

  if (!fs.existsSync(envPath)) {
    log('❌ Error: .env.local file not found!', 'red');
    log('\nPlease create a .env.local file by copying .env.example:', 'yellow');
    log('  cp .env.example .env.local', 'cyan');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};

  envContent.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

// Required environment variables
const requiredVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    example: 'https://xxxxx.supabase.co',
    location: 'Supabase Dashboard > Project Settings > API',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous/public key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    location: 'Supabase Dashboard > Project Settings > API',
  },
];

// Optional but recommended variables
const recommendedVars = [
  {
    name: 'NEXT_PUBLIC_APP_URL',
    description: 'Application base URL',
    example: 'http://localhost:3000',
    default: 'http://localhost:3000',
  },
];

// Server-only variables (not required for frontend-only deployments)
const serverOnlyVars = [
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key (ONLY for server-side admin operations)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    location: 'Supabase Dashboard > Project Settings > API',
    warning: '⚠️  NEVER expose this to the client! Only use in server-side code.',
  },
];

function validateEnvironment() {
  log('\n🔍 Validating Environment Variables...\n', 'blue');

  const envVars = loadEnvFile();
  let hasErrors = false;
  let hasWarnings = false;

  // Check required variables
  log('Required Variables:', 'cyan');
  requiredVars.forEach((varInfo) => {
    const value = envVars[varInfo.name];
    const isSet = value && value !== 'your-project-url' && value !== 'your-anon-key';

    if (isSet) {
      log(`  ✓ ${varInfo.name}`, 'green');
    } else {
      log(`  ✗ ${varInfo.name} - MISSING OR NOT CONFIGURED`, 'red');
      log(`    Description: ${varInfo.description}`, 'yellow');
      log(`    Example: ${varInfo.example}`, 'yellow');
      if (varInfo.location) {
        log(`    Location: ${varInfo.location}`, 'yellow');
      }
      hasErrors = true;
    }
  });

  // Check recommended variables
  log('\nRecommended Variables:', 'cyan');
  recommendedVars.forEach((varInfo) => {
    const value = envVars[varInfo.name];
    const isSet = value && value !== 'your-project-url';

    if (isSet) {
      log(`  ✓ ${varInfo.name}`, 'green');
    } else {
      log(`  ⚠ ${varInfo.name} - NOT SET`, 'yellow');
      log(`    Description: ${varInfo.description}`, 'yellow');
      if (varInfo.default) {
        log(`    Default: ${varInfo.default}`, 'yellow');
      }
      hasWarnings = true;
    }
  });

  // Check server-only variables (informational only)
  log('\nServer-Only Variables (Optional):', 'cyan');
  serverOnlyVars.forEach((varInfo) => {
    const value = envVars[varInfo.name];
    const isSet = value && value !== 'your-service-role-key';

    if (isSet) {
      log(`  ✓ ${varInfo.name}`, 'green');
      if (varInfo.warning) {
        log(`    ${varInfo.warning}`, 'yellow');
      }
    } else {
      log(`  ℹ ${varInfo.name} - NOT SET (OK for frontend-only deployments)`, 'cyan');
      log(`    Description: ${varInfo.description}`, 'cyan');
    }
  });

  // Validate URL format
  log('\nValidation Checks:', 'cyan');
  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  if (supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')) {
    log('  ✓ Supabase URL format is valid', 'green');
  } else if (supabaseUrl && supabaseUrl !== 'your-project-url') {
    log('  ⚠ Supabase URL format may be invalid', 'yellow');
    log('    Expected format: https://xxxxx.supabase.co', 'yellow');
    hasWarnings = true;
  }

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  if (hasErrors) {
    log('\n❌ Validation Failed!', 'red');
    log('\nPlease configure the missing required variables in .env.local', 'yellow');
    log('Refer to .env.example for the complete list of variables.\n', 'yellow');
    process.exit(1);
  } else if (hasWarnings) {
    log('\n⚠️  Validation Passed with Warnings', 'yellow');
    log('\nSome recommended variables are not set.', 'yellow');
    log('The application will use default values, but you may want to configure them.\n', 'yellow');
    process.exit(0);
  } else {
    log('\n✅ All Environment Variables Validated Successfully!', 'green');
    log('\nYour environment is properly configured.\n', 'green');
    process.exit(0);
  }
}

// Run validation
try {
  validateEnvironment();
} catch (error) {
  log(`\n❌ Error during validation: ${error.message}`, 'red');
  process.exit(1);
}
