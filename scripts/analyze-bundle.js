#!/usr/bin/env node

/**
 * Bundle Analysis Script
 *
 * Analyzes the Next.js build output to identify large dependencies
 * and optimization opportunities.
 */

const fs = require('fs');
const path = require('path');

console.log('📊 Analyzing Bundle Size...\n');

// Check if build exists
const buildPath = path.join(process.cwd(), '.next');
if (!fs.existsSync(buildPath)) {
  console.error('❌ No build found. Run `npm run build` first.');
  process.exit(1);
}

// Get build stats
const staticPath = path.join(buildPath, 'static');
const chunksPath = path.join(staticPath, 'chunks');

function getDirectorySize(dirPath) {
  let totalSize = 0;

  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  });

  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getLargestFiles(dirPath, limit = 10) {
  const files = [];

  if (!fs.existsSync(dirPath)) {
    return files;
  }

  function traverse(dir) {
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        traverse(itemPath);
      } else if (item.endsWith('.js')) {
        files.push({
          name: path.relative(buildPath, itemPath),
          size: stats.size,
        });
      }
    });
  }

  traverse(dirPath);

  return files.sort((a, b) => b.size - a.size).slice(0, limit);
}

// Calculate sizes
const totalSize = getDirectorySize(buildPath);
const staticSize = getDirectorySize(staticPath);
const chunksSize = getDirectorySize(chunksPath);

console.log('📦 Total Build Size:');
console.log(`   ${formatBytes(totalSize)}\n`);

console.log('📁 Directory Breakdown:');
console.log(`   Static:  ${formatBytes(staticSize)}`);
console.log(`   Chunks:  ${formatBytes(chunksSize)}\n`);

console.log('🔍 Largest JavaScript Files:');
const largestFiles = getLargestFiles(buildPath, 15);
largestFiles.forEach((file, index) => {
  console.log(`   ${index + 1}. ${file.name}`);
  console.log(`      ${formatBytes(file.size)}`);
});

console.log('\n💡 Optimization Tips:');
console.log('   1. Use dynamic imports for large components');
console.log('   2. Enable tree-shaking for unused exports');
console.log('   3. Consider code splitting for routes');
console.log('   4. Optimize images with next/image');
console.log('   5. Remove unused dependencies');
console.log('   6. Use production builds for deployment\n');

// Check for common issues
console.log('⚠️  Potential Issues:');
let hasIssues = false;

largestFiles.forEach((file) => {
  if (file.size > 500 * 1024) {
    // > 500KB
    console.log(`   - Large chunk detected: ${file.name} (${formatBytes(file.size)})`);
    hasIssues = true;
  }
});

if (!hasIssues) {
  console.log('   ✓ No major issues detected\n');
} else {
  console.log('');
}

console.log('✅ Analysis Complete!\n');
