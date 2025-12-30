/**
 * Monitored API Example
 *
 * Demonstrates how to integrate monitoring with existing API functions
 * This shows the pattern for wrapping all API calls with monitoring
 */

import { withMonitoring, monitorApiCall } from './monitoring-wrapper';
import { withTokenRefresh } from '@/lib/api-wrapper';
import { withRateLimit } from '@/lib/rate-limiter';

// Example: Wrapping an existing API function with monitoring
export function wrapExistingApiWithMonitoring() {
  // Original function (example)
  async function originalApiFunction(userId: string) {
    // ... existing API logic
    return { success: true, data: [] };
  }

  // Wrapped with monitoring
  const monitoredFunction = withMonitoring(originalApiFunction, {
    endpoint: '/api/example',
    method: 'GET',
    metadata: { functionName: 'originalApiFunction' },
  });

  // Combined with rate limiting and token refresh
  return withRateLimit(
    (userId: string) => withTokenRefresh(() => monitoredFunction(userId)),
    'read'
  );
}

// Example: Using the simplified wrapper
export function createMonitoredApiCall() {
  async function apiLogic(data: any) {
    // ... API implementation
    return { result: 'success' };
  }

  return monitorApiCall(
    '/api/create-something',
    'POST',
    apiLogic,
    'user-123', // userId
    { feature: 'creation' } // metadata
  );
}

// Example: Monitoring integration pattern for existing complaints API
export function integrateComplaintsMonitoring() {
  // This is how you would update existing API functions:
  /*
  // Before:
  export const getUserComplaints = withRateLimit(getUserComplaintsImpl, 'read');
  
  // After:
  export const getUserComplaints = withRateLimit(
    withMonitoring(
      getUserComplaintsImpl,
      { endpoint: '/api/complaints/user', method: 'GET' }
    ),
    'read'
  );
  */
  /*
  // Before:
  export const createComplaint = withRateLimit(createComplaintImpl, 'write');
  
  // After:
  export const createComplaint = withRateLimit(
    withMonitoring(
      createComplaintImpl,
      { endpoint: '/api/complaints', method: 'POST' }
    ),
    'write'
  );
  */
}

/**
 * Utility function to automatically wrap all API functions in a module
 */
export function wrapApiModule(apiModule: Record<string, Function>, basePath: string) {
  const wrappedModule: Record<string, Function> = {};

  for (const [functionName, apiFunction] of Object.entries(apiModule)) {
    if (typeof apiFunction === 'function') {
      // Determine method based on function name patterns
      const method =
        functionName.includes('create') ||
        functionName.includes('update') ||
        functionName.includes('delete') ||
        functionName.includes('bulk')
          ? 'POST'
          : 'GET';

      wrappedModule[functionName] = withMonitoring(apiFunction as any, {
        endpoint: `${basePath}/${functionName}`,
        method,
        metadata: { originalFunction: functionName },
      });
    } else {
      wrappedModule[functionName] = apiFunction;
    }
  }

  return wrappedModule;
}

/**
 * Example of how to monitor batch operations
 */
export async function monitoredBatchOperation() {
  const operations = [
    {
      name: 'fetchUsers',
      operation: async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { users: [] };
      },
      context: { endpoint: '/api/users', method: 'GET' },
    },
    {
      name: 'fetchComplaints',
      operation: async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 200));
        return { complaints: [] };
      },
      context: { endpoint: '/api/complaints', method: 'GET' },
    },
  ];

  // This will monitor each operation individually
  const results = await Promise.all(
    operations.map(async ({ name, operation, context }) => {
      const monitoredOp = withMonitoring(operation as any, context as any);
      try {
        const result = await monitoredOp();
        return { name, success: true, result };
      } catch (error) {
        return { name, success: false, error };
      }
    })
  );

  return results;
}
