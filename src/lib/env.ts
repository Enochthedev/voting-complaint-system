/**
 * Environment Variables Configuration
 *
 * This file provides type-safe access to environment variables
 * and validates that required variables are set.
 */

// Validate required environment variables
const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Validate required variables (only on server-side during build)
if (!isBrowser) {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

/**
 * Public environment variables (accessible on client and server)
 */
export const env = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },

  // Application Configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760', 10),
    maxFilesPerComplaint: parseInt(process.env.NEXT_PUBLIC_MAX_FILES_PER_COMPLAINT || '5', 10),
  },

  // Feature Flags
  features: {
    anonymousComplaints: process.env.NEXT_PUBLIC_ENABLE_ANONYMOUS_COMPLAINTS !== 'false',
    voting: process.env.NEXT_PUBLIC_ENABLE_VOTING !== 'false',
    announcements: process.env.NEXT_PUBLIC_ENABLE_ANNOUNCEMENTS !== 'false',
    realTimeNotifications: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME_NOTIFICATIONS !== 'false',
  },

  // Pagination Configuration
  pagination: {
    defaultPageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || '100', 10),
  },

  // Analytics Configuration
  analytics: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },

  // Development/Debug Settings
  debug: {
    enabled: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  },
} as const;

/**
 * Server-only environment variables
 * These should NEVER be exposed to the client
 */
export const serverEnv = {
  supabase: {
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  session: {
    timeout: parseInt(process.env.SESSION_TIMEOUT || '3600', 10),
  },

  rateLimit: {
    complaintsPerHour: parseInt(process.env.RATE_LIMIT_COMPLAINTS_PER_HOUR || '10', 10),
  },
} as const;

/**
 * Validate that server-only variables are not accessed on the client
 */
if (isBrowser && process.env.NODE_ENV === 'development') {
  // Create a proxy to warn if server-only env vars are accessed on client
  const handler: ProxyHandler<typeof serverEnv> = {
    get(target, prop) {
      console.warn(
        `Attempted to access server-only environment variable "${String(prop)}" on the client. ` +
          'This will be undefined in production.'
      );
      return undefined;
    },
  };

  // Only apply proxy in development to catch mistakes
  Object.assign(serverEnv, new Proxy(serverEnv, handler));
}

/**
 * Helper function to format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Helper function to check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof env.features): boolean {
  return env.features[feature];
}

/**
 * Type-safe environment variable access
 */
export type Environment = typeof env;
export type ServerEnvironment = typeof serverEnv;
