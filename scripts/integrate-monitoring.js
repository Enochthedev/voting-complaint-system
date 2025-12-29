#!/usr/bin/env node

/**
 * Script to integrate monitoring with existing API functions
 *
 * This script demonstrates how to wrap existing API functions with monitoring
 * without breaking existing functionality.
 */

const fs = require('fs');
const path = require('path');

// API files to integrate monitoring with
const API_FILES = [
  'src/lib/api/complaints.ts',
  'src/lib/api/notifications.ts',
  'src/lib/api/users.ts',
  'src/lib/api/votes.ts',
  'src/lib/api/announcements.ts',
  'src/lib/api/analytics.ts',
  'src/lib/api/templates.ts',
  'src/lib/api/escalation-rules.ts',
];

// Mapping of function names to their endpoints and methods
const FUNCTION_MAPPINGS = {
  // Complaints API
  getUserComplaints: { endpoint: '/api/complaints/user', method: 'GET' },
  getUserDrafts: { endpoint: '/api/complaints/drafts', method: 'GET' },
  getUserComplaintStats: { endpoint: '/api/complaints/stats', method: 'GET' },
  getAllComplaints: { endpoint: '/api/complaints', method: 'GET' },
  getComplaintById: { endpoint: '/api/complaints/[id]', method: 'GET' },
  createComplaint: { endpoint: '/api/complaints', method: 'POST' },
  updateComplaint: { endpoint: '/api/complaints/[id]', method: 'PUT' },
  deleteComplaint: { endpoint: '/api/complaints/[id]', method: 'DELETE' },
  reopenComplaint: { endpoint: '/api/complaints/[id]/reopen', method: 'POST' },
  submitRating: { endpoint: '/api/complaints/[id]/rating', method: 'POST' },
  hasRatedComplaint: { endpoint: '/api/complaints/[id]/rating/check', method: 'GET' },
  getUserAverageRating: { endpoint: '/api/complaints/rating/average', method: 'GET' },
  bulkAssignComplaints: { endpoint: '/api/complaints/bulk/assign', method: 'POST' },
  bulkChangeStatus: { endpoint: '/api/complaints/bulk/status', method: 'POST' },
  bulkAddTags: { endpoint: '/api/complaints/bulk/tags', method: 'POST' },

  // Notifications API
  getNotifications: { endpoint: '/api/notifications', method: 'GET' },
  markAsRead: { endpoint: '/api/notifications/[id]/read', method: 'POST' },
  markAllAsRead: { endpoint: '/api/notifications/read-all', method: 'POST' },
  getUnreadCount: { endpoint: '/api/notifications/unread-count', method: 'GET' },

  // Users API
  getUsers: { endpoint: '/api/users', method: 'GET' },
  getUserById: { endpoint: '/api/users/[id]', method: 'GET' },
  updateUser: { endpoint: '/api/users/[id]', method: 'PUT' },

  // Votes API
  getVotes: { endpoint: '/api/votes', method: 'GET' },
  createVote: { endpoint: '/api/votes', method: 'POST' },
  castVote: { endpoint: '/api/votes/[id]/cast', method: 'POST' },

  // Announcements API
  getAnnouncements: { endpoint: '/api/announcements', method: 'GET' },
  createAnnouncement: { endpoint: '/api/announcements', method: 'POST' },
  updateAnnouncement: { endpoint: '/api/announcements/[id]', method: 'PUT' },
  deleteAnnouncement: { endpoint: '/api/announcements/[id]', method: 'DELETE' },

  // Analytics API
  getAnalytics: { endpoint: '/api/analytics', method: 'GET' },
  exportAnalytics: { endpoint: '/api/analytics/export', method: 'POST' },

  // Templates API
  getTemplates: { endpoint: '/api/templates', method: 'GET' },
  createTemplate: { endpoint: '/api/templates', method: 'POST' },
  updateTemplate: { endpoint: '/api/templates/[id]', method: 'PUT' },
  deleteTemplate: { endpoint: '/api/templates/[id]', method: 'DELETE' },

  // Escalation Rules API
  getEscalationRules: { endpoint: '/api/escalation-rules', method: 'GET' },
  createEscalationRule: { endpoint: '/api/escalation-rules', method: 'POST' },
  updateEscalationRule: { endpoint: '/api/escalation-rules/[id]', method: 'PUT' },
  deleteEscalationRule: { endpoint: '/api/escalation-rules/[id]', method: 'DELETE' },
};

function addMonitoringImport(content) {
  // Check if monitoring import already exists
  if (content.includes('withMonitoring')) {
    return content;
  }

  // Find the import section and add monitoring import
  const importRegex = /import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?\s*$/gm;
  const imports = content.match(importRegex) || [];

  if (imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertIndex = lastImportIndex + lastImport.length;

    const monitoringImport =
      "\nimport { withMonitoring } from '@/lib/api/standardization/monitoring-wrapper';";

    return content.slice(0, insertIndex) + monitoringImport + content.slice(insertIndex);
  }

  return content;
}

function wrapExportWithMonitoring(content, functionName, mapping) {
  // Pattern to match export statements
  const exportPattern = new RegExp(
    `export\\s+const\\s+${functionName}\\s*=\\s*withRateLimit\\(([^,]+),\\s*['"][^'"]+['"]\\);`,
    'g'
  );

  const replacement = `export const ${functionName} = withRateLimit(
  withMonitoring(
    $1,
    { endpoint: '${mapping.endpoint}', method: '${mapping.method}' }
  ),
  'read'
);`;

  return content.replace(exportPattern, replacement);
}

function integrateMonitoringInFile(filePath) {
  console.log(`Processing ${filePath}...`);

  if (!fs.existsSync(filePath)) {
    console.log(`  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Add monitoring import
  content = addMonitoringImport(content);

  // Wrap exports with monitoring
  let modified = false;
  for (const [functionName, mapping] of Object.entries(FUNCTION_MAPPINGS)) {
    const originalContent = content;
    content = wrapExportWithMonitoring(content, functionName, mapping);
    if (content !== originalContent) {
      console.log(`  Wrapped ${functionName} with monitoring`);
      modified = true;
    }
  }

  if (modified) {
    // Create backup
    const backupPath = `${filePath}.backup`;
    fs.writeFileSync(backupPath, fs.readFileSync(filePath));
    console.log(`  Created backup: ${backupPath}`);

    // Write updated content
    fs.writeFileSync(filePath, content);
    console.log(`  Updated ${filePath}`);
  } else {
    console.log(`  No changes needed for ${filePath}`);
  }
}

function main() {
  console.log('Integrating monitoring with API functions...\n');

  for (const filePath of API_FILES) {
    try {
      integrateMonitoringInFile(filePath);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
    console.log('');
  }

  console.log('Monitoring integration complete!');
  console.log('\nNext steps:');
  console.log('1. Review the changes in each file');
  console.log('2. Test the API functions to ensure they work correctly');
  console.log('3. Check the monitoring dashboard at /api/monitoring/stats');
  console.log("4. Remove backup files once you're satisfied with the changes");
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  integrateMonitoringInFile,
  addMonitoringImport,
  wrapExportWithMonitoring,
  FUNCTION_MAPPINGS,
};
