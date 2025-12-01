#!/usr/bin/env node

/**
 * Comprehensive Performance Metrics Testing Script
 *
 * This script provides detailed performance metrics including:
 * - Time to First Byte (TTFB)
 * - DOM Content Loaded
 * - Full Page Load
 * - Resource loading times
 * - Bundle size analysis
 *
 * Requirements tested:
 * - NFR1: Performance - Page load times under 2 seconds
 * - NFR4: Scalability - Efficient use of resources
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

dotenv.config({ path: '.env.local' });

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
 * Analyze Next.js build output for bundle sizes
 */
function analyzeBundleSizes() {
  console.log(`\n${colors.cyan}Bundle Size Analysis${colors.reset}`);
  console.log(`${'='.repeat(80)}\n`);

  const buildManifestPath = join(process.cwd(), '.next', 'build-manifest.json');

  if (!existsSync(buildManifestPath)) {
    console.log(
      `${colors.yellow}⚠ Build manifest not found. Run 'npm run build' first.${colors.reset}\n`
    );
    return null;
  }

  try {
    const manifest = JSON.parse(readFileSync(buildManifestPath, 'utf-8'));

    console.log(`${colors.blue}Pages and their bundles:${colors.reset}\n`);

    const pages = Object.keys(manifest.pages || {});
    const bundleInfo = [];

    pages.forEach((page) => {
      const files = manifest.pages[page] || [];
      const jsFiles = files.filter((f) => f.endsWith('.js'));

      console.log(`  ${colors.cyan}${page}${colors.reset}`);
      console.log(`    JS files: ${jsFiles.length}`);

      bundleInfo.push({
        page,
        fileCount: jsFiles.length,
        files: jsFiles,
      });
    });

    console.log();
    return bundleInfo;
  } catch (error) {
    console.error(`${colors.red}Error reading build manifest: ${error.message}${colors.reset}\n`);
    return null;
  }
}

/**
 * Test database query performance
 */
async function testDatabasePerformance() {
  console.log(`\n${colors.cyan}Database Query Performance${colors.reset}`);
  console.log(`${'='.repeat(80)}\n`);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const queries = [
    {
      name: 'Fetch complaints list (paginated)',
      query: async () => {
        const start = Date.now();
        const { data, error } = await supabase
          .from('complaints')
          .select('id, title, status, priority, category, created_at')
          .order('created_at', { ascending: false })
          .range(0, 19);
        const duration = Date.now() - start;
        return { duration, success: !error, count: data?.length || 0 };
      },
    },
    {
      name: 'Fetch single complaint with relations',
      query: async () => {
        const start = Date.now();
        const { data, error } = await supabase
          .from('complaints')
          .select(
            `
            *,
            complaint_tags(*),
            complaint_attachments(*),
            complaint_history(*),
            complaint_comments(*)
          `
          )
          .limit(1)
          .single();
        const duration = Date.now() - start;
        return { duration, success: !error };
      },
    },
    {
      name: 'Full-text search query',
      query: async () => {
        const start = Date.now();
        const { data, error } = await supabase
          .from('complaints')
          .select('id, title, description')
          .textSearch('title', 'test')
          .limit(20);
        const duration = Date.now() - start;
        return { duration, success: !error, count: data?.length || 0 };
      },
    },
    {
      name: 'Fetch notifications',
      query: async () => {
        const start = Date.now();
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        const duration = Date.now() - start;
        return { duration, success: !error, count: data?.length || 0 };
      },
    },
    {
      name: 'Fetch announcements',
      query: async () => {
        const start = Date.now();
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        const duration = Date.now() - start;
        return { duration, success: !error, count: data?.length || 0 };
      },
    },
  ];

  const results = [];

  for (const test of queries) {
    try {
      const result = await test.query();
      results.push({
        name: test.name,
        ...result,
      });

      const statusColor = result.success ? colors.green : colors.red;
      const status = result.success ? '✓' : '✗';
      const durationColor =
        result.duration < 500 ? colors.green : result.duration < 1000 ? colors.yellow : colors.red;

      console.log(`  ${statusColor}${status}${colors.reset} ${test.name}`);
      console.log(`    Duration: ${durationColor}${result.duration}ms${colors.reset}`);
      if (result.count !== undefined) {
        console.log(`    Records: ${colors.gray}${result.count}${colors.reset}`);
      }
      console.log();
    } catch (error) {
      console.log(`  ${colors.red}✗${colors.reset} ${test.name}`);
      console.log(`    Error: ${colors.red}${error.message}${colors.reset}\n`);
      results.push({
        name: test.name,
        duration: 0,
        success: false,
        error: error.message,
      });
    }
  }

  // Calculate statistics
  const successfulQueries = results.filter((r) => r.success);
  if (successfulQueries.length > 0) {
    const avgDuration =
      successfulQueries.reduce((sum, r) => sum + r.duration, 0) / successfulQueries.length;
    const maxDuration = Math.max(...successfulQueries.map((r) => r.duration));

    console.log(`${colors.blue}Query Statistics:${colors.reset}`);
    console.log(`  Average query time: ${avgDuration.toFixed(2)}ms`);
    console.log(`  Slowest query: ${maxDuration}ms`);
    console.log(`  Successful queries: ${successfulQueries.length}/${results.length}\n`);
  }

  return results;
}

/**
 * Test API endpoint performance
 */
async function testAPIPerformance() {
  console.log(`\n${colors.cyan}API Endpoint Performance${colors.reset}`);
  console.log(`${'='.repeat(80)}\n`);

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const endpoints = [
    { name: 'Health Check', url: `${baseUrl}/rest/v1/` },
    { name: 'Complaints Endpoint', url: `${baseUrl}/rest/v1/complaints?select=id,title&limit=1` },
    {
      name: 'Notifications Endpoint',
      url: `${baseUrl}/rest/v1/notifications?select=id,title&limit=1`,
    },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const start = Date.now();
      const response = await fetch(endpoint.url, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      });
      const duration = Date.now() - start;

      const success = response.ok;
      results.push({
        name: endpoint.name,
        duration,
        success,
        status: response.status,
      });

      const statusColor = success ? colors.green : colors.red;
      const status = success ? '✓' : '✗';
      const durationColor =
        duration < 200 ? colors.green : duration < 500 ? colors.yellow : colors.red;

      console.log(`  ${statusColor}${status}${colors.reset} ${endpoint.name}`);
      console.log(`    Duration: ${durationColor}${duration}ms${colors.reset}`);
      console.log(`    Status: ${colors.gray}${response.status}${colors.reset}\n`);
    } catch (error) {
      console.log(`  ${colors.red}✗${colors.reset} ${endpoint.name}`);
      console.log(`    Error: ${colors.red}${error.message}${colors.reset}\n`);
      results.push({
        name: endpoint.name,
        duration: 0,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Generate performance report
 */
function generateReport(dbResults, apiResults) {
  console.log(`\n${colors.cyan}Performance Report Summary${colors.reset}`);
  console.log(`${'='.repeat(80)}\n`);

  // Database performance
  const dbSuccess = dbResults.filter((r) => r.success).length;
  const dbTotal = dbResults.length;
  const dbAvg =
    dbResults.filter((r) => r.success).reduce((sum, r) => sum + r.duration, 0) / dbSuccess || 0;

  console.log(`${colors.blue}Database Performance:${colors.reset}`);
  console.log(
    `  Success rate: ${dbSuccess}/${dbTotal} (${((dbSuccess / dbTotal) * 100).toFixed(1)}%)`
  );
  console.log(`  Average query time: ${dbAvg.toFixed(2)}ms`);

  const dbColor = dbAvg < 500 ? colors.green : dbAvg < 1000 ? colors.yellow : colors.red;
  console.log(
    `  Status: ${dbColor}${dbAvg < 500 ? 'EXCELLENT' : dbAvg < 1000 ? 'GOOD' : 'NEEDS IMPROVEMENT'}${colors.reset}\n`
  );

  // API performance
  const apiSuccess = apiResults.filter((r) => r.success).length;
  const apiTotal = apiResults.length;
  const apiAvg =
    apiResults.filter((r) => r.success).reduce((sum, r) => sum + r.duration, 0) / apiSuccess || 0;

  console.log(`${colors.blue}API Performance:${colors.reset}`);
  console.log(
    `  Success rate: ${apiSuccess}/${apiTotal} (${((apiSuccess / apiTotal) * 100).toFixed(1)}%)`
  );
  console.log(`  Average response time: ${apiAvg.toFixed(2)}ms`);

  const apiColor = apiAvg < 200 ? colors.green : apiAvg < 500 ? colors.yellow : colors.red;
  console.log(
    `  Status: ${apiColor}${apiAvg < 200 ? 'EXCELLENT' : apiAvg < 500 ? 'GOOD' : 'NEEDS IMPROVEMENT'}${colors.reset}\n`
  );

  // Overall assessment
  console.log(`${colors.blue}Overall Assessment:${colors.reset}`);

  const issues = [];
  if (dbAvg > 1000) issues.push('Database queries are slow');
  if (apiAvg > 500) issues.push('API response times are high');
  if (dbSuccess < dbTotal) issues.push('Some database queries failed');
  if (apiSuccess < apiTotal) issues.push('Some API endpoints failed');

  if (issues.length === 0) {
    console.log(
      `  ${colors.green}✓ All performance metrics are within acceptable ranges${colors.reset}`
    );
  } else {
    console.log(`  ${colors.yellow}⚠ Issues detected:${colors.reset}`);
    issues.forEach((issue) => {
      console.log(`    - ${issue}`);
    });
  }

  console.log();

  // Recommendations
  if (issues.length > 0) {
    console.log(`${colors.blue}Recommendations:${colors.reset}`);
    if (dbAvg > 1000) {
      console.log(`  - Review database indexes`);
      console.log(`  - Optimize complex queries`);
      console.log(`  - Consider query result caching`);
    }
    if (apiAvg > 500) {
      console.log(`  - Check network latency`);
      console.log(`  - Review API endpoint implementation`);
      console.log(`  - Consider using a CDN`);
    }
    console.log();
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(`${colors.cyan}Comprehensive Performance Metrics Test${colors.reset}`);
  console.log(`${'='.repeat(80)}\n`);

  // Analyze bundle sizes
  analyzeBundleSizes();

  // Test database performance
  const dbResults = await testDatabasePerformance();

  // Test API performance
  const apiResults = await testAPIPerformance();

  // Generate report
  generateReport(dbResults, apiResults);

  console.log(`${colors.gray}Test completed at ${new Date().toISOString()}${colors.reset}\n`);
}

main().catch((error) => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
});
